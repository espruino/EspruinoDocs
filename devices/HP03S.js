/* Copyright (c) 2016 Luwar. See the file LICENSE for copying permission. */

/**
 * HP03S pressure sensor module from HOPERF
 */

exports.connect = function (option, onReady) { return new HP03S(option, onReady); };

/**
 * Creates a new HP03S sensor instance
 * @constructor
 */
function HP03S(option, onReady) {

    // Datasheet says "delay for 40ms minimum", but results are unstable
    // with 50ms → stable results
    this.WAIT_FOR_RESULT_MILLISECONDS = 50;

    // Check wiring parameters
    if (!option.i2c || !option.mclk || !option.xclr) {
        throw new Error("Missing i2c, mclk oder xclr configuration");
    }

    this.i2c = option.i2c;
    this.xclr = option.xclr;

    // 32 kHz output → MCLK; allowed frequency ：30K---35K
    analogWrite(option.mclk, 0.5, { freq: 32768 });

    digitalWrite(option.xclr, 0); // XCLR = 0

    // Read compensation coefficients - like 24C02
    var i2cAddress = 0x50;
    this.i2c.writeTo(i2cAddress, 16); // 16..EEPROM ADDRESS
    var d = this.i2c.readFrom(i2cAddress, 18); // 18 - count of bytes

    var C1 = d[0] << 8 | d[1]; // Sensitivity coefficient
    var C2 = d[2] << 8 | d[3]; // // Offset coefficient
    var C3 = d[4] << 8 | d[5]; // Temperature Coefficient of Sensitivity
    var C4 = d[6] << 8 | d[7]; // Temperature Coefficient of Offset
    this.C5 = d[8] << 8 | d[9]; // Reference Temperature
    var C6 = d[10] << 8 | d[11]; // Temperature Coefficient of Temperature
    var C7 = d[12] << 8 | d[13]; // Offset Fine Tuning

    // Precalculate coefficients
    this.m1 = (C6 / (1 << 16) - 1 / (1 << d[17])) / 10;
    var cTemp = 1 << (14 + d[16]);
    this.m2 = d[14] / cTemp;
    this.m3 = d[15] / cTemp;
    this.m4 = 25 / (1 << 17) * C1;
    this.m5 = 25 / (1 << 27) * C3;
    this.m6 = -175 / (1 << 17) * C3 - 25 / 32768 * C4 + 25 / 32;
    this.m7 = 10 * C7 - 12.5 * C2 - 175 / 128 * C1;

    // After first power on, the first read data should be disregarded, and only the second value
    // should be used. This can assure that any unstable data after reset can be filtered out.
    this.getPressure(function () { return onReady && onReady(); });
}

/**
 * Read the pressure in Pa and the temperature in °C from the sensor
 * @param callback with parameters pressure {number} and temperature {number}
 */
HP03S.prototype.getPressure = function (callback) {
    var _this = this;

    this.measure(0xf0, function (D1) {
        _this.measure(0xe8, function (D2) {

            var h = D2 - _this.C5;
            var dUT = h - h * h * (h > 0 ? _this.m2 : _this.m3);

            var P = D1 * (_this.m4 + _this.m5 * dUT) + dUT * _this.m6 + _this.m7;
            var T = 25 + _this.m1 * dUT;

            callback && callback(P, T);
        });
    });
};

/**
 * Trigger one measurement (either pressure or temperature)
 * @param pressureOrTemperatureCommand select pressure or temperature measurement: 0xf0 → measure pressure, 0xe8 → measure temperature
 * @param completed called when result is available
 */
HP03S.prototype.measure = function (pressureOrTemperatureCommand, completed) {
    var _this = this;
    // Start AD converter, XCLR = 1
    digitalWrite(this.xclr, 1);

    // Start pressure measuring
    this.i2c.writeTo(0x77, [0xff, pressureOrTemperatureCommand]);

    setTimeout(function () {
        // Read out measurement
        _this.i2c.writeTo(0x77, [0xfd, 0xef]);
        var d = _this.i2c.readFrom(0x77, 2);

        // Stop AD converter, XCLR = 0
        digitalWrite(_this.xclr, 0);

        // Deliver the measured result
        completed((d[0] << 8) | d[1]);
    }, this.WAIT_FOR_RESULT_MILLISECONDS);
};
