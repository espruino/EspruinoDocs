/* Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
var REG = {
  WHO_AM_I: 0xF,
  OUTX_L: 0x28,
  CTRL1: 0x20,
  CTRL3: 0x22,
  CTRL4: 0x23,
  TEMPCFG: 0x1F
};
function LIS3DH(options,r,w) {
  this.r = r;
  this.w = w;
  if (this.r(REG.WHO_AM_I,1)[0]!=0b00110011) throw new Error("WHO_AM_I incorrect");
  // enable all axes, normal mode, 10Hz
  this.w(REG.CTRL1, 0x27);

  // High res, block data, 2g range
  this.w(REG.CTRL4, 0x88);

  // full XYZ data ready on INT1
  //this.w(REG.CTRL3, 0x10);
}
LIS3DH.prototype.off = function() {
  this.w(REG.CTRL1,0); // back to idle
};
LIS3DH.prototype.read = function() {
  var d = new DataView(this.r(REG.OUTX_L,6).buffer);
  return {
    x: d.getInt16(0,1) / 16384,
    y: d.getInt16(2,1) / 16384,
    z: d.getInt16(4,1) / 16384
  };
};

exports.LIS3DH = LIS3DH;

exports.connectI2C = function(i2c, options) {
  var a = (options&&options.addr)||25;
  return (new LIS3DH(options, function(reg, len) { // read
    i2c.writeTo(a, reg|0x80);
    return i2c.readFrom(a, len);
  }, function(reg, data) { // write
    i2c.writeTo(a, [reg, data]);
  }));
};
