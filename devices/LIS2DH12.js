/* Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
var C = {
  WHO_AM_I:0x0F,
  CTRL_REG1:0x20,
  CTRL_REG2:0x21,
  CTRL_REG3:0x22,
  CTRL_REG4:0x23,
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
};

function LIS2DH12(spi, cs, callback) {
  this.spi = spi;
  this.cs = cs;
  this.callback = callback;
  if (this.read(C.WHO_AM_I, 1)[0] != C.I_AM_MASK)
    throw "LIS2DH12 WHO_AM_I check failed";
  this.g_scale = C.SCALE2G;
  this.interval = undefined;  
}
// internal - read from to a register
LIS2DH12.prototype.read = function(reg,len) {
  return this.spi.send([reg|0xC0,new Uint8Array(len)], this.cs).slice(1);
};
// internal - write to a register
LIS2DH12.prototype.write = function(reg,data) {
  return this.spi.write(reg, data, this.cs);
};

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
    this.data = undefined;
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
    this.write(C.CTRL_REG1, ctrl1RegVal);
    this.write(C.CTRL_REG4, ctrl4RegVal);
    /* save power mode to check in get functions if power is enabled */
    this.mode = mode;

    // set up timer
    if (this.interval) clearInterval(this.interval);
    this.interval = undefined;
    if (time_ms)
      this.interval = setInterval(function(acc) {
        acc.data = new DataView(new Uint8Array(acc.read(C.OUT_X_L, 6)).buffer);
        if (acc.callback) acc.callback(acc.getAccel());
      }, time_ms, this);
};

// Get the last read accelerometer readings as 
// an object with {x,y,z} elements
LIS2DH12.prototype.getXYZ = function() {
  if (!this.data) return undefined;
  var scale = 1 / (16 << (this.g_scale)) * 1000 / 1024;  
  return {
    x: this.data.getInt16(0,1)*scale,
    y: this.data.getInt16(2,1)*scale,
    z: this.data.getInt16(4,1)*scale
  };  
};

// Initialise the LIS2DH12 module with the given SPI interface and CS pins
exports.connectSPI = function(spi,cs,callback) {
  return new LIS2DH12(spi,cs,callback);
};
