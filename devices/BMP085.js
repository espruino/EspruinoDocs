/* Copyright (c) 2014 Lars Toft Jacobsen. See the file LICENSE for copying permission. */
/*
Module to talk to the Bosch BMP085 or BMP180 digital pressure sensors using I2C.

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

*/
function BMP085(/*=I2C*/_i2c, _mode) {
  this.i2c = _i2c;
  _mode = typeof _mode !== 'undefined' ? _mode : 3;
  this.oss = _mode;

  if (this.oss > 3 || this.oss < 0) {
    this.oss = 3;
  }

  var id = this.read8(0xD0);
  if(id != 0x55) {
    console.log("Bad ID of: " + id);
    return null;
  }
    this.readCoefficients();
}

/* Read 2 bytes from register reg
and combine to unsigned integer */
BMP085.prototype.read16 = function(reg) {
  this.i2c.writeTo(0x77, reg);
  var d = this.i2c.readFrom(0x77, 2);
  return (d[0] << 8) | d[1];
};

/* Read 2 bytes from register reg
and combine to signed integer */
BMP085.prototype.readS16 = function(reg) {
  this.i2c.writeTo(0x77, reg);
  var d = this.i2c.readFrom(0x77, 2);
  var i = (d[0] << 8) | d[1];
  return (i>=32767) ? i - 65536 : i;
};

/* Read single byte from register reg*/
BMP085.prototype.read8 = function(reg) {
  this.i2c.writeTo(0x77, reg);
  return this.i2c.readFrom(0x77, 1)[0];
};

/* Read and store all coefficients stored in the sensor */
BMP085.prototype.readCoefficients = function() {
  this.ac1 = this.readS16(0xAA);
  this.ac2 = this.readS16(0xAC);
  this.ac3 = this.readS16(0xAE);
  this.ac4 = this.read16(0xB0);
  this.ac5 = this.read16(0xB2);
  this.ac6 = this.read16(0xB4);
  this.b1 = this.readS16(0xB6);
  this.b2 = this.readS16(0xB8);
  this.mb = this.readS16(0xBA);
  this.mc = this.readS16(0xBC);
  this.md = this.readS16(0xBE);
};

/* Get the raw temperature value. Conversion takes approx. 4.5ms
so we must wait 5ms before the value can be read */
BMP085.prototype.readRawTemperature = function(convert) {
  this.i2c.writeTo(0x77, [0xF4, 0x2E]);
  var bmp = this;
  setTimeout(function() {
    convert(bmp.read16(0xF6));
  }, 5);
};

/* Get the raw pressure value. Conversion time depends on oversampling
setting. We must wait a specified amount of ms before it the value can be read */
BMP085.prototype.readRawPressure = function(convert) {
  this.i2c.writeTo(0x77, [0xF4, (0x34 + (this.oss << 6))]);
  var delay;
  var bmp = this;
  switch(this.oss) {
    case 0:
      delay = 5;
      break;
    case 1:
      delay = 8;
      break;
    case 2:
      delay = 14;
      break;
    case 3:
      delay = 26;
      break;
  }
  setTimeout(function() {
    var msb = bmp.read8(0xF6);
    var lsb = bmp.read8(0xF7);
    var xlsb = bmp.read8(0xF8);
    convert(((msb << 16) + (lsb << 8) + xlsb) >> (8 - bmp.oss));
  }, delay);
};

/* Get the converted temperature in degrees Celsius.
The temperature is passed as parameter to the callback */
BMP085.prototype.getTemperature = function(callback) {
  var bmp = this;
  this.readRawTemperature(function(UT) {
    var X1 = Math.round((UT - bmp.ac6) * bmp.ac5 / 32768);
    var X2 = Math.round((bmp.mc * 2048) / (X1 + bmp.md));
    var B5 = X1 + X2;
    var t = (B5 + 8) / 160;
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
      var X1 = Math.round((UT - bmp.ac6) * bmp.ac5 / 32768);
      var B5 = X1 + Math.round((bmp.mc * 2048) / (X1 + bmp.md));
      var B6 = B5 - 4000;
      var B3 = (((bmp.ac1 * 4 + ((bmp.b2 * (B6 * B6 >> 12)) >> 11) + (bmp.ac2 * B6 >> 11)) << bmp.oss) + 2) >> 2;
      var B4 = (bmp.ac4 * ((((bmp.ac3 * B6 >> 13) + ((bmp.b1 * (B6 * B6 >> 12)) >> 16) + 2) >> 2) + 32768)) >> 15;
      var B7 = ((UP - B3) / B4) * (50000 >> bmp.oss);
      var p=Math.round(B7) << 1;
      var compp = p + (((((p >> 8)*(p >> 8)*3038) >> 16) + ((-7357 * p) >> 16) + 3791) >> 4);
      callback({pressure: compp, temperature: (B5 + 8) / 160});
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
