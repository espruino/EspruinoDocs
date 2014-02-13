/* Copyright (c) 2014 Lars Toft Jacobsen. See the file LICENSE for copying permission. */
/*
Quick description of my module...
*/

var C = {
  BMP085_ADDRESS                     : 0x77,
  BMP085_REGISTER_CAL_AC1            : 0xAA,
  BMP085_REGISTER_CAL_AC2            : 0xAC,
  BMP085_REGISTER_CAL_AC3            : 0xAE,
  BMP085_REGISTER_CAL_AC4            : 0xB0,
  BMP085_REGISTER_CAL_AC5            : 0xB2,
  BMP085_REGISTER_CAL_AC6            : 0xB4,
  BMP085_REGISTER_CAL_B1             : 0xB6,
  BMP085_REGISTER_CAL_B2             : 0xB8,
  BMP085_REGISTER_CAL_MB             : 0xBA,
  BMP085_REGISTER_CAL_MC             : 0xBC,
  BMP085_REGISTER_CAL_MD             : 0xBE,
  BMP085_REGISTER_CHIPID             : 0xD0,
  BMP085_REGISTER_SOFTRESET          : 0xE0,
  BMP085_REGISTER_CONTROL            : 0xF4,
  BMP085_REGISTER_TEMPDATA           : 0xF6,
  BMP085_REGISTER_PRESSUREDATA       : 0xF6,
  BMP085_REGISTER_READTEMPCMD        : 0x2E,
  BMP085_REGISTER_READPRESSURECMD    : 0x34,
  BMP085_MODE_ULTRALOWPOWER          : 0,
  BMP085_MODE_STANDARD               : 1,
  BMP085_MODE_HIGHRES                : 2,
  BMP085_MODE_ULTRAHIGHRES           : 3
};

function BMP085(/*=I2C*/_i2c, _mode) {
  this.i2c = _i2c;
  this.mode = _mode === undefined ? 3 : _mode;

  if (mode > C.BMP085_MODE_ULTRAHIGHRES || mode < 0) {
    mode = C.BMP085_MODE_ULTRAHIGHRES;
  }

  var id = this.read8(C.BMP085_REGISTER_CHIPID);
  if(id != 0x55) {
    console.log("Bad ID");
  }

  this.readCoefficients();

}

// BMP085.prototype.Coefficients = {
//   ac1 : 408,
//   ac2 : -72,
//   ac3 : -14383,
//   ac4 : 32741,
//   ac5 : 32757,
//   ac6 : 23153,
//   b1  : 6190,
//   b2  : 4,
//   mb  : -32768,
//   mc  : -8711,
//   md  : 2868
// };

BMP085.prototype.C = {
  MY : 0x013,         // description
  PUBLIC : 0x0541,    // description
  CONSTANTS : 0x023   // description
};

BMP085.prototype.read16 = function(reg) {
  this.i2c.writeTo(C.BMP085_ADDRESS, reg);
  var d = this.i2c.readFrom(C.BMP085_ADDRESS, 2);
  return (d[0] << 8) | d[1];
};

BMP085.prototype.readS16 = function(reg) {
  this.i2c.writeTo(C.BMP085_ADDRESS, reg);
  var d = this.i2c.readFrom(C.BMP085_ADDRESS, 2);
  var i = (d[0] << 8) | d[1];
  return (i>=32767) ? i - 65536 : i;
};

BMP085.prototype.read8 = function(reg) {
  this.i2c.writeTo(C.BMP085_ADDRESS, reg);
  return this.i2c.readFrom(C.BMP085_ADDRESS, 1)[0];
};

BMP085.prototype.readCoefficients = function() {
  this.ac1 = this.readS16(C.BMP085_REGISTER_CAL_AC1);
  this.ac2 = this.readS16(C.BMP085_REGISTER_CAL_AC2);
  this.ac3 = this.readS16(C.BMP085_REGISTER_CAL_AC3);
  this.ac4 = this.read16(C.BMP085_REGISTER_CAL_AC4);
  this.ac5 = this.read16(C.BMP085_REGISTER_CAL_AC5);
  this.ac6 = this.read16(C.BMP085_REGISTER_CAL_AC6);
  this.b1 = this.readS16(C.BMP085_REGISTER_CAL_B1);
  this.b2 = this.readS16(C.BMP085_REGISTER_CAL_B2);
  this.mb = this.readS16(C.BMP085_REGISTER_CAL_MB);
  this.mc = this.readS16(C.BMP085_REGISTER_CAL_MC);
  this.md = this.readS16(C.BMP085_REGISTER_CAL_MD);
};

BMP085.prototype.readRawTemperature = function() {
  this.i2c.writeTo(C.BMP085_ADDRESS, [C.BMP085_REGISTER_CONTROL, C.BMP085_REGISTER_READTEMPCMD]);
  var bmp = this;
  setTimeout(function() {
    bmp.temperature = bmp.read16(C.BMP085_REGISTER_TEMPDATA);
  }, 5);
};

BMP085.prototype.readRawPressure = function() {
  this.i2c.writeTo(C.BMP085_ADDRESS, [C.BMP085_REGISTER_CONTROL, (C.BMP085_REGISTER_READPRESSURECMD + (this.mode << 6))]);
  var delay;
  switch(this.mode) {
    case C.BMP085_MODE_ULTRALOWPOWER:
      delay = 5;
      break;
    case C.BMP085_MODE_STANDARD:
      delay = 8;
      break;
    case C.BMP085_MODE_HIGHRES:
      delay = 14;
      break;
    case C.BMP085_MODE_ULTRAHIGHRES:
      delay = 26;
      break;
  }
  var bmp = this;
  setTimeout(function() {
    var msb = bmp.read8(C.BMP085_REGISTER_PRESSUREDATA);
    var lsb = bmp.read8(C.BMP085_REGISTER_PRESSUREDATA + 1);
    var xlsb = bmp.read8(C.BMP085_REGISTER_PRESSUREDATA + 2);
    bmp.pressure = ((msb << 16) + (lsb << 8) + xlsb) >> (8 - bmp.mode);
  }, delay);
};

BMP085.prototype.getTemperature = function() {
  var X1 = Math.round((this.temperature - this.Coefficients.ac6) * this.Coefficients.ac5 / Math.pow(2, 15));
  var X2 = Math.round((this.Coefficients.mc * Math.pow(2, 11)) / (X1 + this.Coefficients.md));
  var B5 = X1 + X2;
  var t = (B5 + 8) / Math.pow(2, 4);
  t /= 10;

  return t;
};

BMP085.prototype.getPressure = function() {
  // Temperature compensation
  var X1 = Math.round((this.temperature - this.Coefficients.ac6) * this.Coefficients.ac5 / Math.pow(2, 15));
  var X2 = Math.round((this.Coefficients.mc * Math.pow(2, 11)) / (X1 + this.Coefficients.md));
  var B5 = X1 + X2;

  // Pressure calculation
  var B6 = B5 - 4000;
  X1 = (this.Coefficients.b2 * (B6 * B6 >> 12)) >> 11;
  X2 = this.Coefficients.ac2 * B6 >> 11;
  X3 = X1 + X2;
  var B3 = (((this.Coefficients.ac1 * 4 + X3) << this.mode) + 2) >> 2;
  X1 = this.Coefficients.ac3 * B6 >> 13;
  X2 = (this.Coefficients.b1 * (B6 * B6 >> 12)) >> 16;
  X3 = ((X1 + X2) + 2) >> 2;
  var B4 = (this.Coefficients.ac4 * (X3 + 32768)) >> 15;
  var B7 = (this.pressure - B3) * (50000 >> this.mode);
  var p = Math.round(B7 < 0x80000000 ? (B7 << 1) / B4 : (B7 / B4) << 1);

  X1 = (p >> 8) * (p >> 8);
  X1 = (X1 * 3038) >> 16;
  X2 = (-7357 * p) >> 16;
  var compp = p + ((X1 + X2 + 3791) >> 4);

  return compp;
};

exports.connect = function (_i2c, _mode) {
  return new BMP085(_i2c, _mode);
};
