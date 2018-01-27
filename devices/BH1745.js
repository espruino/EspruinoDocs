/* Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */

var C = {
  WHO_AM_I : 0x92,
  WHO_AM_I_VALUE : 0xE0,
  SYSTEM_CONTROL : 0x40,
  MODE_CONTROL1 : 0x41,
  MODE_CONTROL2 : 0x42,
  MODE_CONTROL3 : 0x44,
  RED_DATA_LSB : 0x50,
  //green,blue,clear
  INTERRUPT : 0x60,
};

var MEASUREMENT_TIMES = [ 160,320,640,1280,2560,5120 ];

/* Initialise BH1745 - called automatically from connectI2C 
*/
function BH1745(r,w,options) {
  this.r = r; // read from a register
  this.w = w; // write to a register
  this.options = options;
    
  if (this.r(C.WHO_AM_I, 1)[0] != C.WHO_AM_I_VALUE)
    throw "BH1745 WHO_AM_I check failed";  
    
  this.w(C.MODE_CONTROL1, MEASUREMENT_TIMES.indexOf(160));
  this.w(C.MODE_CONTROL2, 0x10); // enable RGBC measurement, 1x gain
  this.w(C.MODE_CONTROL3, 0x02); // datasheet says so!  
  
  // interrupt seems to only happen based on threshold (not data ready)
}

// Shut down the sensor
BH1745.prototype.stop = function() {
  this.w(C.MODE_CONTROL2, 0x0); // off
}

/* read the current light measurements as {r,g,b,c} */
BH1745.prototype.read = function() {
  var d = this.r(C.RED_DATA_LSB,  8);
	return { 
    r : (d[0]<<8)|d[1],
    g : (d[2]<<8)|d[3],
    b : (d[4]<<8)|d[5],
    c : (d[6]<<8)|d[7]   
  };
};

// Initialise the CCS811 module with the given I2C interface (and optional address with connectI2C(i2c,{addr:...}) )
exports.connectI2C = function(i2c,options) {  
  options = options||{};
  var addr = options.addr||0x38;
  return new BH1745(function(reg,len) { // read
    i2c.writeTo(addr,reg);
    return i2c.readFrom(addr,len);
  }, function(reg,data) { // write
    i2c.writeTo(addr,reg,data);
  },options);
};
