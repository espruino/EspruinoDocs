/** Espruino driver for Renesas FS3000 Air velocity sensor module
 * This sensor comes in two variants: FS3000-1005 (measuring up to 7.23 m/s) and FS3000-1015 (measuring up to 15 m/s).
 * By default, this module assumes the FS3000-1005 variant. If you have the FS3000-1015 variant, pass in true as the second parameter to the connect function.
 * The return value of the read function is the air velocity in m/s, if the checksum is correct. If the checksum calculation fails, the function returns -1.
 * Copyright (c) 2024 https://github.com/AkosLukacs/
 */

/** The I2C address of the FS3000 */
const A = 0x28;

/** lookup table for FS3000-1005 */
const v1005 = [
  [409, 0],
  [915, 1.07],
  [1522, 2.01],
  [2066, 3.00],
  [2523, 3.97],
  [2908, 4.96],
  [3256, 5.98],
  [3572, 6.99],
  [3686, 7.23]
]

/** lookup table for FS3000-1015 */
const v1015 = [
  [409, 0],
  [1203, 2],
  [1597, 3],
  [1908, 4],
  [2187, 5],
  [2400, 6],
  [2629, 7],
  [2801, 8],
  [3006, 9],
  [3178, 10],
  [3309, 11],
  [3563, 13],
  [3686, 15]
]

class FS3000 {


  /**
   * @param {I2C} i2c an I2C interface
   * @param {boolean} is1015 If the IC is the -1015 variant, measuring up to 15m/s, pass in true. Leave empty, or pass in false, if it's the -1005 variant, measuring up to 7.23 m/s
   */
  constructor(i2c, is1015) {
    this._i2c = i2c;
    is1015 = !!is1015;
    // maximum air velocity in m/s
    this._max = is1015 ? 15 : 7.23;
    this._lookup = is1015 ? v1015 : v1005;
  }

  /**
   * Calculate air velocity from the raw sensor value.
   * @param {number} s raw sensor value
   */
  _calc(s) {
    // min and max values
    if (s <= 409) return 0;
    if (s >= 3686) return this._max;

    var l = this._lookup;
    // let's binary search the lookup table instead of linear search
    let left = 0, right = l.length - 1;
    while (left <= right) {
      let mid = Math.floor((left + right) / 2);
      if (l[mid][0] === s) return l[mid][1];
      if (l[mid][0] < s) left = mid + 1;
      else right = mid - 1;
    }

    // If s is not found, interpolate between the two closest pairs
    let raw1 = l[right][0], velocity1 = l[right][1];
    let raw2 = l[left][0], velocity2 = l[left][1];
    let slope = (velocity2 - velocity1) / (raw2 - raw1);
    return velocity1 + slope * (s - raw1);
  }

  _checksumOk(d) {
    var sum = d[1] + d[2] + d[3] + d[4];
    return ((sum + d[0]) % 256) === 0;
  }

  /**
   * Read the air velocity from the sensor.
   * Returns velocity in m/s, if the checksum is correct.
   * Return -1, if checksum calculation fails.
   * The reading from the sensors is not really linear, especially for FS3000-1015 variant. If you need more accuracy, check the datasheet for a better algorithm!
   */
  read() {
    var d = this._i2c.readFrom(A, 5);

    if (this._checksumOk(d)) {
      var s = ((d[1] & 0x0F) << 8) + d[2];
      return this._calc(s)
    } else {
      return -1;
    }
  }
}


/**
 * Creates a new instance of the FS3000 module.
 * @param {I2C} i2c an I2C interface
 * @param {boolean} is1015 If the IC is the -1015 variant, measuring up to 15m/s, pass in true. Leave empty, or pass in false, if it's the -1005 variant, measuring up to 7.23 m/s
 */
exports.connect = function (i2c, is1015) {
  return new FS3000(i2c, is1015);
};