/* Copyright (c) 2021 Gerrit Niezen. See the file LICENSE for copying permission. */
/*
Module for the SHT4x Humidity and Temperature Sensor ICs
*/

function SHT4x(_i2c) {
  this.i2c = _i2c;
}

// read with callback({humidity,temp})
SHT4x.prototype.read = function(callback) {
  this.i2c.writeTo(0x44, [0xFD]);
  var sht = this;
  setTimeout(function() {
    var d = new DataView(sht.i2c.readFrom(0x44, 6).buffer);
    callback({
      temp : d.getUint16(0)*175/65536 - 45,
      humidity : d.getUint16(3)*125/65536 - 6
    });
  }, 20);
};

exports.connect = function (_i2c) {
  return new SHT4x(_i2c);
};
