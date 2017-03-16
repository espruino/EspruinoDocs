/* Copyright (c) 2015 Masafumi Okada. See the file LICENSE for copying permission. */
/* modified Moray McConnachie, Gordon Williams */
/* Read Temperature, Pressure, and Humidity from Bosch Sensortec's BMP280 sensor module. */

var C = {BMP280_ADDRESS: 0x76}

/**
 * @constructor
 */
function BMP280(options, read, write) {
  options = options||{};
  var osrs_t = 1;  //Temperature oversampling x 1
  var osrs_p = 1;  //Pressure oversampling x 1
  var mode = 3;    //Normal mode
  var t_sb = 5;    //Tstandby 1000ms
  var filter = 0;  //Filter off
  var spi3w_en = 0;//3-wire SPI Disable

  var ctrl_meas_reg = (osrs_t << 5) | (osrs_p << 2) | mode;
  var config_reg = (t_sb << 5) | (filter << 2) | spi3w_en;

  this.read = read;        
  this.write = write;

/* 
  if (this.read(0xD0,1)[0] == 0x60 && this.debug) {
    console.log("This chip is BMP280");
  }
*/
  this.write(0xF4, ctrl_meas_reg);
  this.write(0xF5, config_reg);

  this.readCoefficients();
}

BMP280.prototype.setPower = function(on) {
  var r = this.read(0xF4,1)[0]; // ctrl_meas_reg
  if (on) r |= 3; // normal mode
  else r &= ~3; // sleep mode
};

/* Convert two UInt8 value into one "signed" number */
function convS16(data, offs) {
  var value = (data[offs+1] << 8) + data[offs];
  if (value & 0x8000) value -= 65536;
  return value;
};

/* Read and store all coefficients stored in the sensor */
BMP280.prototype.readCoefficients = function() {
  var data = new Uint8Array(24+1+7);
  data.set(this.read(0x88, 24), 0);
  data.set(this.read(0xA1, 1), 24);
  data.set(this.read(0xE1, 7), 25);
  this.dT = [/*empty element*/,(data[1] << 8) | data[0],
              convS16(data,2),
              convS16(data,4)];
  this.dP = [/*empty element*/,(data[7] << 8) | data[6],
              convS16(data,8),
              convS16(data,10),
              convS16(data,12),
              convS16(data,14),
              convS16(data,16),
              convS16(data,18),
              convS16(data,20),
              convS16(data,22)];
};

/* Read Raw data from the sensor */
BMP280.prototype.readRawData = function() {
  var data = this.read(0xF7, 8);
  this.pres_raw = (data[0] << 12) | (data[1] << 4) | (data[2] >> 4);
  this.temp_raw = (data[3] << 12) | (data[4] << 4) | (data[5] >> 4);
  this.hum_raw = (data[6] << 8) | data[7];
};

/* Calibration of Temperature, algorithm is taken from the datasheet */
BMP280.prototype.calibration_T = function(adc_T) {
  var var1, var2, T;
  var dT = this.dT;
  var1 = ((adc_T) / 16384.0 - (dT[1]) / 1024.0) * (dT[2]);
  var2 = (((adc_T) / 131072.0 - (dT[1]) / 8192.0) * ((adc_T) / 131072.0 - (dT[1]) / 8192.0)) * (dT[3]);
  this.t_fine = (var1 + var2);
  T = (var1 + var2) / 5120.0;
  return T * 100;
};

/* Calibration of Pressure, algorithm is taken from the datasheet */
BMP280.prototype.calibration_P = function(adc_P) {
  var var1, var2, p;
  var dP = this.dP;
  var1 = (this.t_fine / 2.0) - 64000.0;
  var2 = var1 * var1 * (dP[6]) / 32768.0;
  var2 = var2 + var1 * (dP[5]) * 2.0;
  var2 = (var2 / 4.0) + ((dP[4]) * 65536.0);
  var1 = ((dP[3]) * var1 * var1 / 524288.0 + (dP[2]) * var1) / 524288.0;
  var1 = (1.0 + var1 / 32768.0) * (dP[1]);
  if (var1 === 0.0) {
    return 0; // avoid exception caused by division by zero
  }
  p = 1048576.0 - adc_P;
  p = (p - (var2 / 4096.0)) * 6250.0 / var1;
  var1 = (dP[9]) * p * p / 2147483648.0;
  var2 = p * (dP[8]) / 32768.0;
  p = p + (var1 + var2 + (dP[7])) / 16.0;
  return p;
};

/* Get all Data in a nice, readable object */
BMP280.prototype.getData = function(adc_H) {
  this.readRawData();
  return {
     temp : this.calibration_T(this.temp_raw) / 100.0,
     pressure : this.calibration_P(this.pres_raw) / 100.0
  };
};

exports.connect = function(i2c, options) {
  return (new BMP280(options, function(reg, len) { // read
    i2c.writeTo(C.BMP280_ADDRESS, reg);
    return i2c.readFrom(C.BMP280_ADDRESS, len);
  }, function(reg, data) { // write
    i2c.writeTo(C.BMP280_ADDRESS, [reg, data]);
  }));
};

exports.connectSPI = function(spi, cs, options) {
  return (new BMP280(options, function(reg, len) { // read
    var d = new Uint8Array(len+1);
    return spi.send([reg|0x80,new Uint8Array(len)], cs).slice(1);
  }, function(reg, data) { // write
    spi.write(reg&0x7f, data, cs);
  }));
};
