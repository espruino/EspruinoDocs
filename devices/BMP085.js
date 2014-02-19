/* Copyright (c) 2014 Lars Toft Jacobsen. See the file LICENSE for copying permission. */
/*
Module to talk to the Bosch BMP085 or BMP180 digital pressure sensors using I2C.
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
  _mode = typeof _mode !== 'undefined' ? _mode : 3;
  this.oss = _mode;

  if (this.oss > C.BMP085_MODE_ULTRAHIGHRES || this.oss < 0) {
    this.oss = C.BMP085_MODE_ULTRAHIGHRES;
  }

  var id = this.read8(C.BMP085_REGISTER_CHIPID);
  if(id != 0x55) {
    console.log("Bad ID");
  }

  // Calibration coefficients needs to be read
  this.readCoefficients();
}

/* Read 2 bytes from register reg
and combine to unsigned integer */
BMP085.prototype.read16 = function(reg) {
  this.i2c.writeTo(C.BMP085_ADDRESS, reg);
  var d = this.i2c.readFrom(C.BMP085_ADDRESS, 2);
  return (d[0] << 8) | d[1];
};

/* Read 2 bytes from register reg
and combine to signed integer */
BMP085.prototype.readS16 = function(reg) {
  this.i2c.writeTo(C.BMP085_ADDRESS, reg);
  var d = this.i2c.readFrom(C.BMP085_ADDRESS, 2);
  var i = (d[0] << 8) | d[1];
  return (i>=32767) ? i - 65536 : i;
};

/* Read single byte from register reg*/
BMP085.prototype.read8 = function(reg) {
  this.i2c.writeTo(C.BMP085_ADDRESS, reg);
  return this.i2c.readFrom(C.BMP085_ADDRESS, 1)[0];
};

/* Read and store all coefficients stored in the sensor */
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

/* Get the raw temperature value. Conversion takes approx. 4.5ms
so we must wait 5ms before the value can be read */
BMP085.prototype.readRawTemperature = function(convert) {
  this.i2c.writeTo(C.BMP085_ADDRESS, [C.BMP085_REGISTER_CONTROL, C.BMP085_REGISTER_READTEMPCMD]);
  var bmp = this;
  setTimeout(function() {
    //bmp.UT = bmp.read16(C.BMP085_REGISTER_TEMPDATA);
    convert(bmp.read16(C.BMP085_REGISTER_TEMPDATA));
  }, 5);
};

/* Get the raw pressure value. Conversion time depends on oversampling
setting. We must wait a specified amount of ms before it the value can be read */
BMP085.prototype.readRawPressure = function(convert) {
  this.i2c.writeTo(C.BMP085_ADDRESS, [C.BMP085_REGISTER_CONTROL, (C.BMP085_REGISTER_READPRESSURECMD + (this.oss << 6))]);
  var delay;
  var bmp = this;
  switch(this.oss) {
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
  setTimeout(function() {
    var msb = bmp.read8(C.BMP085_REGISTER_PRESSUREDATA);
    var lsb = bmp.read8(C.BMP085_REGISTER_PRESSUREDATA + 1);
    var xlsb = bmp.read8(C.BMP085_REGISTER_PRESSUREDATA + 2);
    convert(((msb << 16) + (lsb << 8) + xlsb) >> (8 - bmp.oss));
  }, delay);
};

/* Get the converted temperature in degrees Celsius.
The temperature is passed as parameter to the callback */
BMP085.prototype.getTemperature = function(callback) {
  var bmp = this;
  this.readRawTemperature(function(UT) {
    var X1 = Math.round((UT - bmp.ac6) * bmp.ac5 / Math.pow(2, 15));
    var X2 = Math.round((bmp.mc * Math.pow(2, 11)) / (X1 + bmp.md));
    var B5 = X1 + X2;
    var t = (B5 + 8) / Math.pow(2, 4);
    t /= 10;
    callback(t);
  });
};

/* Get the converted pressure and temperature in Pascal and
degrees Celsius respectively. The calculated values are passed
to callback wrapped in an object */
BMP085.prototype.getPressure = function(callback) {
  var bmp = this;
  this.readRawTemperature(function(UT) {
    bmp.readRawPressure(function(UP) {
      // Temperature compensation
      var X1 = Math.round((UT - bmp.ac6) * bmp.ac5 / Math.pow(2, 15));
      var X2 = Math.round((bmp.mc * Math.pow(2, 11)) / (X1 + bmp.md));
      var B5 = X1 + X2;
      var compt = (B5 + 8) / Math.pow(2, 4);
      compt /= 10;

      // Pressure calculation
      var B6 = B5 - 4000;
      X1 = (bmp.b2 * (B6 * B6 >> 12)) >> 11;
      X2 = bmp.ac2 * B6 >> 11;
      X3 = X1 + X2;
      var B3 = (((bmp.ac1 * 4 + X3) << bmp.oss) + 2) >> 2;
      X1 = bmp.ac3 * B6 >> 13;
      X2 = (bmp.b1 * (B6 * B6 >> 12)) >> 16;
      X3 = ((X1 + X2) + 2) >> 2;
      var B4 = (bmp.ac4 * (X3 + 32768)) >> 15;
      var B7 = (UP - B3) * (50000 >> bmp.oss);
      var p = Math.round(B7 < 0x80000000 ? (B7 << 1) / B4 : (B7 / B4) << 1);

      X1 = (p >> 8) * (p >> 8);
      X1 = (X1 * 3038) >> 16;
      X2 = (-7357 * p) >> 16;
      var compp = p + ((X1 + X2 + 3791) >> 4);
      callback({pressure: compp, temperature: compt});
    });
  });
};

/* Returns the absolute altitude from current atmospheric
pressure and sea level pressure. */
BMP085.prototype.getAltitude = function(pressure, sealevel) {
  return 44330 * (1 - Math.pow(pressure/sealevel, 1/5.255));
};

/* Returns the sea level pressure from current atmospheric
pressure and altitude. */
BMP085.prototype.getSeaLevel = function(pressure, altitude) {
  return pressure / Math.pow(1-(altitude/44330), 5.255);
};

exports.connect = function (_i2c, _mode) {
  return new BMP085(_i2c, _mode);
};
