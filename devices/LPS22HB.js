/* Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */

var C = {
  WHO_AM_I : 0x0F,
  CTRL_REG1 : 0x10,
  CTRL_REG2 : 0x11,
  CTRL_REG3 : 0x12,
  PRESS_OUT_XL : 0x28,
  TEMP_OUT_L : 0x2B,
};

function LPS22HB(r,w,options) {
  this.r = r; // read from a register
  this.w = w; // write to a register
  if (this.r(C.WHO_AM_I, 1)[0] != 0b10110001)
    throw "LPS22HB WHO_AM_I check failed";
  //this.w(C.CTRL_REG2,4); // force software reset
  // set to one-shot mode
  this.w(C.CTRL_REG1, 0); // low 4 bits = datarate  
}

LPS22HB.prototype.read = function() {
  this.w(C.CTRL_REG1, 0x11); // multbyte i2c read, one-shot enable
  var d = this.r(C.PRESS_OUT_XL, 5); // 3x pressure, 2x temp
  var pressure = (d[2]<<16)|(d[1]<<8)|d[0];
  if (pressure&0x800000) pressure-=0x1000000; // negative
  var temp = (d[4]<<8)|d[3];
  if (temp&0x8000) temp-=0x10000;
  return {
    pressure : pressure / 4096,
    temp : temp / 100
  };
};


// Initialise the LPS22HB module with the given I2C interface
exports.connectI2C = function(i2c,options) {  
  var addr = 0x5C;
  return new LPS22HB(function(reg,len) { // read
    i2c.writeTo(addr,reg|128);
    return i2c.readFrom(addr,len);
  }, function(reg,data) { // write
    i2c.writeTo(addr,reg,data);
  },options);
};
