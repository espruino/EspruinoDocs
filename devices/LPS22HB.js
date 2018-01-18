/* Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */

var C = {
  WHO_AM_I : 0x0F,
  CTRL_REG1 : 0x10,
  CTRL_REG2 : 0x11,
  CTRL_REG3 : 0x12,
  STATUS : 0x27,
  PRESS_OUT_XL : 0x28,
  TEMP_OUT_L : 0x2B,
};

/* Initialise LIS2DH12 - called automatically from connectI2C

options = {
  int : pin, // optional interrupt pin (when data ready, it'll be sent via a 'data' event - default once a second)  
};
 */
function LPS22HB(r,w,options) {
  this.r = r; // read from a register
  this.w = w; // write to a register
  this.options = options||{};
  if (this.r(C.WHO_AM_I, 1)[0] != 0b10110001)
    throw "LPS22HB WHO_AM_I check failed";
  //this.w(C.CTRL_REG2,4); // force software reset
  this.w(C.CTRL_REG1, 0x00); // one shot mode
  this.w(C.CTRL_REG2, 0x10); // multibyte i2c read
  if (this.options.int) {            
    this.watch = setWatch(function() {
      this.emit('data', this.get());
    }.bind(this), this.options.int, {edge:"rising",repeat:true});
    this.get(); // clear any data ready signal    
    this.w(C.CTRL_REG1, 0x10); // once a second (bits 4-6)
    this.w(C.CTRL_REG3, 0x04); // irq active high, use for data ready    
  }
}

// Shut down the sensor
LPS22HB.prototype.stop = function() {
  if (this.watch) {
    clearWatch(this.watch);
    this.watch = undefined;
  }
  this.w(C.CTRL_REG1, 0x00); // one shot mode (eg. off)  
  this.w(C.CTRL_REG3, 0x00); // irq off
};

/* Get the current pressure value. Returns:

{ 
  pressure : float,     // pressure in hPa
  temperature : float,  // temperature in degrees C
  new : bool,           // is this a new reading?
}
*/
LPS22HB.prototype.get = function() {
  var d = this.r(C.STATUS, 6); // status, 3x pressure, 2x temp
  var pressure = (d[3]<<16)|(d[2]<<8)|d[1];
  if (pressure&0x800000) pressure-=0x1000000; // negative
  var temp = (d[5]<<8)|d[4];
  if (temp&0x8000) temp-=0x10000;
  return {
    pressure : pressure / 4096,
    temperature : temp / 100,
    new : (d[0]&3)==3
  };
};

// Call the callback with a new pressure value
LPS22HB.prototype.read = function(callback) {  
  if (this.options.int) {
    callback(this.get());
  } else {    
    this.w(C.CTRL_REG2, 0x11); // multbyte i2c read, one-shot enable
    var intr = setInterval(function() {
      if (this.r(C.STATUS)&3) {
        clearInterval(intr);
        callback(get());
      }        
    }.bind(this), 100);
    return this.get();
  }
};


/* Initialise the LPS22HB module with the given I2C interface  (and optional address with connectI2C(i2c,{addr:...}) )
See 'LPS22HB' above for more options */
exports.connectI2C = function(i2c,options) {  
  var addr = (options&&options.addr)||0x5C;
  return new LPS22HB(function(reg,len) { // read
    i2c.writeTo(addr,reg|128);
    return i2c.readFrom(addr,len);
  }, function(reg,data) { // write
    i2c.writeTo(addr,reg,data);
  },options);
};
