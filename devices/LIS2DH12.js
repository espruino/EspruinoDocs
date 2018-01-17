/* Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
var C = {
  WHO_AM_I:0x0F,
  CTRL_REG1:0x20,
  CTRL_REG2:0x21,
  CTRL_REG3:0x22,
  CTRL_REG4:0x23,
  STATUS_REG:0x27,
  OUT_X_L:0x28,

  I_AM_MASK:0x33,
  // CTRL_REG1
  ODR_MASK_1HZ:0x10, /*HR / Normal / Low Power */
  ODR_MASK_10HZ:0x20, /*HR / Normal / Low Power */
  ODR_MASK_25HZ:0x30, /*HR / Normal / Low Power */
  ODR_MASK_50HZ:0x40, /*HR / Normal / Low Power */
  ODR_MASK_100HZ:0x50, /*HR / Normal / Low Power */
  ODR_MASK_200HZ:0x60, /*HR / Normal / Low Power */
  ODR_MASK_400HZ:0x70, /*HR / Normal / Low Power */
  ODR_MASK_1620HZ:0x80, /* Low Power Mode only */
  ODR_MASK_HIGH_RES:0x90, /* in HR+Normal: 1344Hz, in Low Power 5376Hz */
  LPEN_MASK:0x08,
  XYZ_EN_MASK:0x07,
  // CTRL_REG4
  HR_MASK:0x08,

  SCALE2G:0,		/**< Scale Selection */
  SCALE4G:1,
  SCALE8G:2,
  SCALE16G:3
};

/* Initialise LIS2DH12 - called automatically from connectSPI/connectI2C.

options = {
  callback : function, // function to call when data is ready
};
 */
function LIS2DH12(r,w, options) {
  this.r = r; // read from a register
  this.w = w; // write to a register
  this.options = options||{};
  this.callback = this.options.callback;
  if (this.r(C.WHO_AM_I, 1)[0] != C.I_AM_MASK)
    throw "LIS2DH12 WHO_AM_I check failed";
  this.g_scale = C.SCALE2G;
  this.mode = "powerdown";
  this.interval = undefined;  
}

/** Set the power state of the accelerometer. 
  Either :

  "normal" - 100Hz
  "low" - 1Hz
  "fast" - 1000Hz
  "highres" - 1000Hz
  "powerdown" - Off */
LIS2DH12.prototype.setPowerMode = function (mode) {
    var ctrl1RegVal = C.XYZ_EN_MASK; // Enable all axis
    var ctrl4RegVal = this.g_scale<<4; // Set Scale
    var time_ms = 0;    
    switch(mode) {
    case "normal":
        ctrl1RegVal |= C.ODR_MASK_100HZ;
        this.g_mgpb = 4 << this.g_scale; // 4 bits per mg at normal power/2g, adjust by scaling
        time_ms = 10;
        break;
    case "low":
        ctrl1RegVal |= (C.ODR_MASK_1HZ); //Power consumption is same for low-power and normal mode at 1 Hz
        this.g_mgpb = 4 << this.g_scale; // 4 bits per mg at normal power/2g, adjust by scaling
        time_ms = 1000;
        break;
    case "fast":
        ctrl1RegVal |= (C.ODR_MASK_1620HZ | C.LPEN_MASK);
        this.g_mgpb = 16 << this.g_scale; // 16 bits per mg at low power/2g, adjust by scaling
        time_ms = 1;
        break;
    case "highres":
        ctrl1RegVal |= C.ODR_MASK_HIGH_RES;
        ctrl4RegVal |= C.HR_MASK;
        this.g_mgpb = 1 << this.g_scale; // 1 bits per mg at high power/2g, adjust by scaling
        time_ms = 1;
        break;
    case "powerdown":
        ctrl1RegVal = 0;
        time_ms = 0;
        break;
    default:
        throw "Unknown power mode "+JSON.stringify(mode);
    }
    this.w(C.CTRL_REG1, ctrl1RegVal);
    this.w(C.CTRL_REG4, ctrl4RegVal);
    /* save power mode to check in get functions if power is enabled */
    this.mode = mode;

    // set up timer
    if (this.interval) clearInterval(this.interval);
    this.interval = undefined;
    if (time_ms && this.callback) {
      this.interval = setInterval(function(acc) {
         acc.callback(acc.getXYZ());
      }, time_ms, this);
    }
};

/* Get the last read accelerometer readings as 
an object with {x,y,z,new} elements. new is false if the data hasn't changed since the last read */
LIS2DH12.prototype.getXYZ = function() {
  var d = new DataView(new Uint8Array(this.r(C.STATUS_REG, 7)).buffer);
  var scale = 1 / (16 << (this.g_scale)) * 1000 / 1024;  
  return {
    x: d.getInt16(1,true)*scale,
    y: d.getInt16(3,true)*scale,
    z: d.getInt16(5,true)*scale,
    new : (d.getUint8(0)&8)!=0
  };  
};

/* Call the callback with an accelerometer reading {x,y,z}. If the accelerometer is powered off,
 power it on, take a reading, and power it off again */
LIS2DH12.prototype.readXYZ = function(callback) {
  var isOff = this.mode=="powerdown";
  var c = this.callback;
  this.callback = function(xyz) {
    if (isOff) this.setPowerMode("powerdown");
    this.callback = c;
    callback(xyz);
  };
  if (isOff) this.setPowerMode("normal");  
};

/* Initialise the LIS2DH12 module with the given SPI interface and CS pins.
  See 'LIS2DH12' above for options */
exports.connectSPI = function(spi,cs,options) {
  if ("function"==typeof options)
    throw new Error("Use require(LIS2DH12).connectSPI(..., {callback:function() { ... }} instead");
  return new LIS2DH12(function(reg,len) { // read
    return spi.send([reg|0xC0,new Uint8Array(len)], cs).slice(1);
  }, function(reg,data) { // write
    return spi.write(reg, data, cs);
  },options);
};

/* Initialise the LIS2DH12 module with the given I2C interface (and optional address with connectI2C(i2c,{addr:...}) )
See 'LIS2DH12' above for more options */
exports.connectI2C = function(i2c,options) {  
  var addr = (options&&options.addr)||0x19;
  return new LIS2DH12(function(reg,len) { // read
    i2c.writeTo(addr,reg|128);
    return i2c.readFrom(addr,len);
  }, function(reg,data) { // write
    i2c.writeTo(addr,reg,data);
  },options);
};
