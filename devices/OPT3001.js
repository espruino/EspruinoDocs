/* Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
var REG = {
  RESULT: 0x00,
  CONFIG: 0x01,
  LOWLIMIT: 0x02,
  HIGHLIMIT: 0x03,
  MANUFACTUREID: 0x7E,
  DEVICEID: 0x7F
};
function OPT3001(options,r,w) {
  this.r=r;
  this.w=w;
  this.w(REG.CONFIG,0b1100110000010000);
  print(this.r(REG.MANUFACTUREID)); // 0x5449
  print(this.r(REG.DEVICEID));  // 0x3001
}
OPT3001.prototype.off = function() {
  this.w(REG.CONFIG,0xc810);
};
OPT3001.prototype.read = function() {
  return this.r(REG.RESULT);
};

exports.OPT3001 = OPT3001;

exports.connectI2C = function(i2c, options) {
  var a = (options&&options.addr)||0x44; // or 0x45?
  return (new OPT3001(options, function(reg) { // read 16 bits
    i2c.writeTo(a, reg);
    var r = i2c.readFrom(a,2);
    return r[1] | r[0]<<8;
  }, function(reg, data) { // write
    i2c.writeTo(a, [reg, data]);
  }));
};
