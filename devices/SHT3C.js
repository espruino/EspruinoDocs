/* Copyright (c) 2020 Gordon Williams. See the file LICENSE for copying permission. */

function SHT3C(_i2c) {
  this.i2c = _i2c;
  w(0xB098); // sleep - needed after power on
}

/// Write a 16 bit command to the SHT3C
SHT3C.prototype.w = function(d) {
  this.i2c.writeTo(0x70,[d>>8,d&255]);
}

/// Read with callback({humidity,temp})
SHT3C.prototype.read = function(callback) {
  w(0x3517); // wakeup
  w(0x5C24); // read RH first, normal power, clock stretch
  setTimeout(function() {
    var d = new DataView(i2c.readFrom(0x70,6).buffer);
    w(0xB098); // sleep
    callback({ humidity : d.getUint16(0)/655.36,
               temp : d.getUint16(3)*175/65536 - 45 });
  }, 20);
}

exports.connectI2C = function (_i2c) {
  return new SHT3C(_i2c);
};
