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
  if (this.r(REG.MANUFACTUREID) != 0x5449)
    throw new Error("Unexpected Manufacturer ID");
  if (this.r(REG.DEVICEID) != 0x3001)
    throw new Error("Unexpected Device ID");
  this.on();
}
/** Turn the sensor on, taking continuous readings */
OPT3001.prototype.on = function() {
  this.w(REG.CONFIG,0b1100110000010000);
};
/** Turn the sensor off */
OPT3001.prototype.off = function() {
  this.w(REG.CONFIG,0b1100100000010000);
};
/** Returns the last reading in Lux */
OPT3001.prototype.read = function() {
  var d = this.r(REG.RESULT);
  var lux =  0.01 * ((d&0x0FFF) << (d>>12))
  return lux;
};

exports.OPT3001 = OPT3001;

exports.connectI2C = function(i2c, options) {
  var a = (options&&options.addr)||0x44; // or 0x45?
  return (new OPT3001(options, function(reg) { // read 16 bits
    i2c.writeTo(a, reg);
    var r = i2c.readFrom(a,2);
    return r[1] | r[0]<<8;
  }, function(reg, data) { // write
    i2c.writeTo(a, [reg, data>>8, data]);
  }));
};
