/* Copyright (c) 2019 Chris Hinze. See the file LICENSE for copying permission. */
/*
  MAX44009 is a low power I2C ambient light sensor

  The sensor is by default configured to do non-continuous readings with
  automatic autoranging and 100ms integration time.
*/

function MAX44009(i2c, address) {
  this.i2c = i2c;
  this.address = address;
}

MAX44009.prototype.getLux = function () {
  this.i2c.writeTo(this.address, 0x03);
  return calculateLux(this.i2c.readFrom(this.address, 2));
};

function calculateLux(data) {
  let exponent = (data[0] & 0xF0) >> 4;
  let mantissa = ((data[0] & 0x0F) << 4) | (data[1] & 0x0F);
  return Math.pow(2, exponent) * mantissa * 0.045;
}

exports.connect = function (i2c, address) {
  return new MAX44009(i2c, address || 0x4A);
};
