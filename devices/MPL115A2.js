/* Copyright (c) 2014 Per Ejeklint. See the file LICENSE for copying permission. */
/*
 Module to talk to the MPL115A2 pressure sensors using I2C.
 
 Usage:

```
 I2C1.setup({scl:B6,sda:B7});
 var device = require('MPL115A2.connect(I2C1);

 device.getData(function(obj) {
   console.log(obj); // Example {t:22.51, p: 101.68}, t is in Celsius and p is in kPa
 });
```

*/

var C = {
  MPL115A2_ADDRESS                       : 0x60,
  MPL115A2_CONVERT                       : 0x12,
  MPL115A2_REGISTER_P_ADC_MSB            : 0x00,
  MPL115A2_REGISTER_P_ADC_LSB            : 0x01,
  MPL115A2_REGISTER_T_ADC_MSB            : 0x02,
  MPL115A2_REGISTER_T_ADC_LSB            : 0x03,
  MPL115A2_REGISTER_CAL_A0_MSB           : 0x04,
  MPL115A2_REGISTER_CAL_A0_LSB           : 0x05,
  MPL115A2_REGISTER_CAL_B1_MSB           : 0x06,
  MPL115A2_REGISTER_CAL_B1_LSB           : 0x07,
  MPL115A2_REGISTER_CAL_B2_MSB           : 0x08,
  MPL115A2_REGISTER_CAL_B2_LSB           : 0x09,
  MPL115A2_REGISTER_CAL_C12_MSB          : 0x0A,
  MPL115A2_REGISTER_CAL_C12_LSB          : 0x0B
};

function MPL115A2(_i2c) {
  this.i2c = _i2c;

  // Calibration coefficients needs to be read on startup
  this.a0 = this.readS16(C.MPL115A2_REGISTER_CAL_A0_MSB) / 8;
  this.b1 = this.readS16(C.MPL115A2_REGISTER_CAL_B1_MSB) / 8192;
  this.b2 = this.readS16(C.MPL115A2_REGISTER_CAL_B2_MSB) / 16384;
  this.c12 = (this.readS16(C.MPL115A2_REGISTER_CAL_C12_MSB) >> 2) / 4194304;
}

/* Read 2 bytes from register reg
and combine to unsigned integer */
MPL115A2.prototype.read16 = function(reg) {
  this.i2c.writeTo(C.MPL115A2_ADDRESS, reg);
  
  var d = this.i2c.readFrom(C.MPL115A2_ADDRESS, 2);
  
  return (d[0] << 8) | d[1];
};

/* Read 2 bytes from register reg
and combine to signed integer */
MPL115A2.prototype.readS16 = function(reg) {
  this.i2c.writeTo(C.MPL115A2_ADDRESS, reg);
  
  var d = this.i2c.readFrom(C.MPL115A2_ADDRESS, 2);
  var i = (d[0] << 8) | d[1];
  
  return (i >= 32767) ? i - 65536 : i;
};

/* Get the raw temperature value. Conversion takes approx. 4.5ms
so we must wait 5ms before the value can be read */
MPL115A2.prototype.readRawData = function(convert) {
  var self = this;

  self.i2c.writeTo(C.MPL115A2_ADDRESS, [C.MPL115A2_CONVERT, C.MPL115A2_REGISTER_P_ADC_MSB]);

  setTimeout(function() {
    self.i2c.writeTo(C.MPL115A2_ADDRESS, C.MPL115A2_REGISTER_P_ADC_MSB);
    var raw_p = self.read16(C.MPL115A2_REGISTER_P_ADC_MSB) >> 6;
    var raw_t = self.read16(C.MPL115A2_REGISTER_T_ADC_MSB) >> 6;
	convert(raw_t, raw_p);
  }, 5);
};

/* Get the converted temperature in degrees Celsius and pressure in Pascal
The calculated values are passed to callback wrapped in an object */
MPL115A2.prototype.getData = function(callback) {
  var self = this;
  
  self.readRawData(function(UT, UP) {
	var p = self.a0 + (self.b1 + self.c12 * UT) * UP + self.b2 * UT;
	p = ((65 / 1023) * p) + 50;
	var t = (UT - 498) / -5.35 + 25;
	callback({t:t.toFixed(2), p:p.toFixed(2)});
  });
};

exports.connect = function (_i2c) {
  return new MPL115A2(_i2c);
};
