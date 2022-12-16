/* Copyright (c) 2022 Gerrit Niezen. See the file LICENSE for copying permission. */
/*
Module for the MAX1704x Battery Fuel Gauge ICs
*/

function MAX1704X(_i2c) {
  this.i2c = _i2c;
}

MAX1704X.prototype.reset = function() {
  try {
    this.i2c.writeTo(0x36, [0xFE, 0x54, 0x00]);
  } catch (err) {
    if (err.message.indexOf('33282')>=0) {
      // we got a NACK, which is what we want
      return;
    } else {
      throw new Error('Something went wrong during reset()');
    }
  }
};

MAX1704X.prototype.readRegister = function(register) {
  this.i2c.writeTo({address: 0x36, stop: false}, [register]);
  return new DataView(this.i2c.readFrom(0x36, 3).buffer);
};

MAX1704X.prototype.readICVersion = function() {
  return this.readRegister(0x08).getUint16().toString(16);
};

MAX1704X.prototype.readPercent = function() {
  return this.readRegister(0x04).getUint16() / 256.0;
};

MAX1704X.prototype.readVoltage = function(callback) {
  return this.readRegister(0x02).getUint16() * 78.125 / 1000000;
};

MAX1704X.prototype.readChargeRate = function(callback) {
  return this.readRegister(0x16).getInt16() * 0.208;
};

exports.connect = function (_i2c) {
  return new MAX1704X(_i2c);
};
