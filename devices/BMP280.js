/* Copyright (c) 2015 Masafumi Okada. See the file LICENSE for copying permission. */
// @compilation_level ADVANCED_OPTIMIZATIONS
/* modified Moray McConnachie 2015 for Closure's advanced optimisation level and to remove cruft */
/* Read Temperature and Pressure from Bosch Sensortec's BMP280 sensor module. */

var C = {BMP280_ADDRESS: 0x76};

/**
 * @constructor
 */
function BMP280(_i2c, options) {
  this.i2c = _i2c; 
  var options = options || {};
  this.debug = options['debug'];

  var osrs_t = 1;  //Temperature oversampling x 1
  var osrs_p = 1;  //Pressure oversampling x 1
  var mode = 3;    //Normal mode
  var t_sb = 5;    //Tstandby 1000ms
  var filter = 0;  //Filter off
  var spi3w_en = 0;//3-wire SPI Disable

  var ctrl_meas_reg = (osrs_t << 5) | (osrs_p << 2) | mode;
  var config_reg = (t_sb << 5) | (filter << 2) | spi3w_en;

/* enable this if you want debugging  
  if (this.read8(0xD0) == 0x0x58 && this.debug) {
    console.log("This chip is BMp280");
  }
*/
  this.writeReg(0xF4, ctrl_meas_reg);
  this.writeReg(0xF5, config_reg);
  this.readCoefficients();
}

/* Concatinate two Uint8Arrays */
BMP280.prototype.concatU8 = function(a, b) {
  var c = new Uint8Array(a.length + b.length);
  c.set(a);
  c.set(b, a.length);
  return (c);
};

/* Convert two UInt8 value into one "signed" number */
BMP280.prototype.convS16 = function(ub1, ub2) {
  var value = (ub1 << 8) + ub2;
  if (value & 0x8000) {
    value = -((value - 1) ^ 0xffff);
  }
  return (value);
};

/* Write single byte to register reg_address */
BMP280.prototype.writeReg = function(reg_address, data) {
  this.i2c.writeTo(C.BMP280_ADDRESS, [reg_address, data]);
};

/* Read single byte from register reg*/
BMP280.prototype.read8 = function(reg) {
  this.i2c.writeTo(C.BMP280_ADDRESS, reg);
  return this.i2c.readFrom(C.BMP280_ADDRESS, 1)[0];
};

/* Read and store all coefficients stored in the sensor */
BMP280.prototype.readCoefficients = function() {
  this.i2c.writeTo(C.BMP280_ADDRESS, 0x88);
  var data = this.i2c.readFrom(C.BMP280_ADDRESS, 24);
  this.i2c.writeTo(C.BMP280_ADDRESS, 0xA1);
  data = this.concatU8(data, this.i2c.readFrom(C.BMP280_ADDRESS, 1));

  this.dig_T1 = (data[1] << 8) | data[0];
  this.dig_T2 = this.convS16(data[3], data[2]);
  this.dig_T3 = this.convS16(data[5], data[4]);

  this.dig_P1 = (data[7] << 8) | data[6];
  this.dig_P2 = this.convS16(data[9], data[8]);
  this.dig_P3 = this.convS16(data[11], data[10]);
  this.dig_P4 = this.convS16(data[13], data[12]);
  this.dig_P5 = this.convS16(data[15], data[14]);
  this.dig_P6 = this.convS16(data[17], data[16]);
  this.dig_P7 = this.convS16(data[19], data[18]);
  this.dig_P8 = this.convS16(data[21], data[20]);
  this.dig_P9 = this.convS16(data[23], data[22]);

};

/*public methods*/
/* Read Raw data from the sensor */
BMP280.prototype.readRawData = function() {
  this.i2c.writeTo(C.BMP280_ADDRESS, 0xF7);
  var data = this.i2c.readFrom(C.BMP280_ADDRESS, 6);
  /* enable this if you want to be able to debug data values and calibration 

  if (this.debug) {
    console.log("d0: " + data[0]);
    console.log("d1: " + data[1]);
    console.log("d2: " + data[2]);
    console.log("d3: " + data[3]);
    console.log("d4: " + data[4]);
    console.log("d5: " + data[5]);
  }
  */
  this.pres_raw = (data[0] << 12) | (data[1] << 4) | (data[2] >> 4);
  this.temp_raw = (data[3] << 12) | (data[4] << 4) | (data[5] >> 4);
};

/* Calibration of Temperature, algorithm is taken from the datasheet */
BMP280.prototype.calibration_T = function(adc_T) {
  var var1, var2, T;
  var1 = ((adc_T) / 16384.0 - (this.dig_T1) / 1024.0) * (this.dig_T2);
  var2 = (((adc_T) / 131072.0 - (this.dig_T1) / 8192.0) * ((adc_T) / 131072.0 - (this.dig_T1) / 8192.0)) * (this.dig_T3);
  this.t_fine = (var1 + var2);
  T = (var1 + var2) / 5120.0;
  return T * 100;
};

/* Calibration of Pressure, algorithm is taken from the datasheet */
BMP280.prototype.calibration_P = function(adc_P) {
/* enable this if you want to be able to debug data values and calibration
  if (this.debug) {
    console.log("T1: " + this.dig_T1);
    console.log("T2: " + this.dig_T2);
    console.log("T3: " + this.dig_T3);
    console.log("P1: " + this.dig_P1);
    console.log("P2: " + this.dig_P2);
    console.log("P3: " + this.dig_P3);
    console.log("P4: " + this.dig_P4);
    console.log("P5: " + this.dig_P5);
    console.log("P6: " + this.dig_P6);
    console.log("P7: " + this.dig_P7);
    console.log("P8: " + this.dig_P8);
    console.log("P9: " + this.dig_P9);
  }*/
  var var1, var2, p;
  var1 = (this.t_fine / 2.0) - 64000.0;
  var2 = var1 * var1 * (this.dig_P6) / 32768.0;
  var2 = var2 + var1 * (this.dig_P5) * 2.0;
  var2 = (var2 / 4.0) + ((this.dig_P4) * 65536.0);
  var1 = ((this.dig_P3) * var1 * var1 / 524288.0 + (this.dig_P2) * var1) / 524288.0;
  var1 = (1.0 + var1 / 32768.0) * (this.dig_P1);
  if (var1 === 0.0) {
    return 0; // avoid exception caused by division by zero
  }
  p = 1048576.0 - adc_P;
  p = (p - (var2 / 4096.0)) * 6250.0 / var1;
  var1 = (this.dig_P9) * p * p / 2147483648.0;
  var2 = p * (this.dig_P8) / 32768.0;
  p = p + (var1 + var2 + (this.dig_P7)) / 16.0;
  return p;
};

exports.connect = function(_i2c, options) {
  return (new BMP280(_i2c, options));
};
