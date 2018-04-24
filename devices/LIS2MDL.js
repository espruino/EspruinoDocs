/* Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
var REG = {
  WHO_AM_I: 0x4F,
  OUTX_L: 0x68,
  CFG_A: 0x60,
  CFG_B: 0x61,
  CFG_C: 0x62,
};
function LIS2MDL(options,r,w) {
  this.r = r;
  this.w = w;
  if (this.r(REG.WHO_AM_I,1)[0]!=64) throw new Error("WHO_AM_I incorrect");
  // Temp compensation, 10Hz continuous readings
  this.w(REG.CFG_A, 0x80);
  // low pass filter, ODR/4
  this.w(REG.CFG_B, 0x01);
  // data ready irq, block data read
  this.w(REG.CFG_C, 0x11);
}
LIS2MDL.prototype.off = function() {
  this.w(REG.CFG_A,0x03); // back to idle
};
LIS2MDL.prototype.read = function() {
  var d = new DataView(this.r(REG.OUTX_L,6).buffer);
  return {
    x: d.getInt16(0,1),
    y: d.getInt16(2,1),
    z: d.getInt16(4,1)
  };
};
exports.LIS2MDL = LIS2MDL;

exports.connectI2C = function(i2c, options) {
  var a = (options&&options.addr)||30;
  return (new LIS2MDL(options, function(reg, len) { // read
    i2c.writeTo(a, reg);
    return i2c.readFrom(a, len);
  }, function(reg, data) { // write
    i2c.writeTo(a, [reg, data]);
  }));
};
