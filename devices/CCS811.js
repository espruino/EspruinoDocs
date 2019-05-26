/* Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */

const C = {
  /** The value of the WHO_AM_I register: 0x81 */
  WHIV: 0x81,

  // STATUS_ERROR: 0x01,
  /** STATUS_DATA_READY */
  SDRD: 0x08,
  // STATUS_APP_VALID: 0x10,
  /** STATUS_FW_MODE */
  SFM: 0x80,

  // MEAS_MODE_INT_THRESH: 0x04,
  /** MEAS_MODE_INT_DATARDY */
  MMID: 0x08,

  /** BOOTLOADER_APP_START */
  BLAS: 0xF4,
};

const MEAS_MODE = {
  /** Mode 0 – Idle (Measurements are disabled in this mode) */
  IDLE: 0x00,
  /** Mode 1 – Constant power mode, IAQ measurement every second */
  S1: 0x10,
  /** Mode 2 – Pulse heating mode IAQ measurement every 10 seconds */
  S10: 0x20,
  /** Mode 3 – Low power pulse heating mode IAQ measurement every 60 seconds */
  S60: 0x30,
  /** Mode 4 – Constant power mode, sensor measurement every 250ms */
  S025: 0x40
}

const REGS = {
  /** Status register */
  STAT: 0x00,

  /** MEAS_MODE Measurement mode and conditions register */
  MEMO: 0x01,

  /** ALG_RESULT_DATA Algorithm result. The most significant 2 bytes contain a ppm estimate of the equivalent CO2 (eCO2) level, and the next two bytes contain a ppb estimate of the total VOC level. */
  ARD: 0x02,

  /** Environment Data register */
  ENVD: 0x05,

  /** Baseline register. The encoded current baseline value can be read. A previously saved encoded baseline can be written. */
  BASE: 0x11,

  /** Hardware ID. The value is 0x81 */
  WHOI: 0x20,

  /** SW_RESET If the correct 4 bytes (0x11 0xE5 0x72 0x8A) are written to this register in a single sequence the device will reset and return to BOOT mode. */
  SW_R: 0xFF,
};

/** Get the value for the drive mode register. */
function getDriveMode(mode) {
  switch (mode) {
    case 0: return MEAS_MODE.IDLE;
    case 1: return MEAS_MODE.S1;
    case 2: return MEAS_MODE.S10;
    case 3: return MEAS_MODE.S60;
    case 4: return MEAS_MODE.S025;
    default: throw "Invalid mode!" + mode;
  }
}

/** Helper function to set the nWake pin low / high before and after I2C communication.
 * (used if nWake is present in the options) */
function wrapWithnWake(nWakePin, i2cFunc) {
  return function(arg1, arg2) {
    nWakePin.write(0);
    // According to the datasheet, you should wait 50us after setting nWake to low, but the Espruino interpreter is slow enough :)
    var i2cResult = i2cFunc(arg1, arg2);
    nWakePin.write(1);
    return i2cResult;
  }
}

/** Set up the CCS811.
 @constructor
 (see details at exports.connectI2C) */
function CCS811(r, w, options) {

  this.r = (options && options.nWake) ? wrapWithnWake(options.nWake, r) : r; // read from a register
  this.w = (options && options.nWake) ? wrapWithnWake(options.nWake, w) : w; // write to a register
  this.options = options || {};
  this.options.mode = this.options.mode || 1;

  this.w(REGS.SW_R, [0x11, 0xE5, 0x72, 0x8A]); // software reset
  var ccs = this;
  setTimeout(function() {
    if (ccs.r(REGS.WHOI, 1)[0] != C.WHIV)
      throw "CCS811 WHO_AM_I check failed";
    // start bootloader
    ccs.w(C.BLAS, []);
    setTimeout(function() {
      if (!ccs.r(REGS.STAT, 1)[0] & C.SFM)
        throw "CCS811 not in FW mode";

      ccs.setMode(ccs.options.mode);
    }, 100);
  }, 100);
}

/** Sets up watch, if needed, and not already set up. */
CCS811.prototype._setupWatch = function() {
  var ccs = this;
  if (ccs.options.int && !ccs.watch) {
    ccs.watch = setWatch(function() {
      ccs.emit('data', ccs.get());
    }, ccs.options.int, {edge: "falling", repeat: true});
  }
}

// Shut down the CCS811
CCS811.prototype.stop = function() {
  this.options.mode = 0;
  if (this.watch) {this.watch = clearWatch(this.watch);}
  this.w(REGS.MEMO, MEAS_MODE.IDLE);
};

// Returns true if data is available
CCS811.prototype.available = function() {
  return (this.r(REGS.STAT, 1)[0] & C.SDRD) != 0;
};

/** Sets the mode (0 -> idle / 1 -> 1s / 2 -> 10s / 3 -> 60s)
 * @param {number} mode The new drive mode (0..4)
 */
CCS811.prototype.setMode = function(mode) {
  if (mode == 0) {
    this.stop();
  } else {
    var driveMode = getDriveMode(mode);
    this.options.mode = mode;
    if (this.options.int) {
      // DRDY IRQ
      this._setupWatch();
      this.w(REGS.MEMO, driveMode | C.MMID);
    } else {
      this.w(REGS.MEMO, driveMode);
      // no interrupt
    }
  }
}

/** Reads the BASELINE register. See AMS AN000370 for details about baseline save and restore. */
CCS811.prototype.readBaseline = function() {
  return this.r(REGS.BASE, 2);
}

/** Writes to the BASELINE register. See AMS AN000370 for details about baseline save and restore. */
CCS811.prototype.writeBaseline = function(baseline) {
  this.w(REGS.BASE, baseline);
}

/**
 * @param {number} humidity The relative humidity in %
 * @param {number} temperature The temperature in °C
 */
function convertEnvData(humidity, temperature) {
  if (isNaN(humidity)) {throw 'CCS811 RH NaN!';}
  if (isNaN(temperature)) {throw 'CCS811 Temp NaN!';}
  if (!(humidity >= 0 && humidity <= 100)) {throw 'CCS811 RH invalid!';}

  // Humidity is stored as an unsigned 16 bits in 1/512%RH. The
  // default value is 50% = 0x64, 0x00. As an example 48.5%
  // humidity would be 0x61, 0x00.
  var humiData = humidity * 512

  // Temperature is stored as an unsigned 16 bits integer in 1/512
  // degrees; there is an offset: 0 maps to -25°C. The default value is
  // 25°C = 0x64, 0x00. As an example 23.5% temperature would be
  // 0x61, 0x00.
  // The internal algorithm uses ENV_DATA values (or default values
  // if not set by the application) to compensate for changes in
  // relative humidity and ambient temperature.
  // For temperatures below-25°C the 7-bit temperature field in
  // Byte 2 above should be set to all zeros.
  var tempData = (Math.max(-25, temperature) + 25) * 512

  // And move to a single 4 byte array
  var regData = [(humiData >> 8), (humiData & 0xFF), tempData >> 8, tempData & 0xFF]
  return regData;
}

/** Set humidity and temperature for compensation
 * @param {number} humidity The relative humidity in %
 * @param {number} temperature The temperature in °C
 */
CCS811.prototype.setEnvData = function(humidity, temperature) {
  var regData = convertEnvData(humidity, temperature);
  this.w(REGS.ENVD, regData);
}

/* read the current environment settings, assuming available()==true.
```
{
 eCO2 : int, // equivalent CO2, in ppm (400..29206)
 TVOC : int, // Total Volatile Organic Compounds, in ppb (0..32768)
 new : bool  // true if this is a new reading
}
```
ec02 and TVOC values are clipped to the given ranges - so for instance you'll never see a CO2 value below 400.
*/
CCS811.prototype.get = function() {
  var d = this.r(REGS.ARD, 5); // could read 8, but don't need last 3
  /* NOTE: STATUS is 5th data element, and can be read in a single transaction to check if there is new data */
  var isNew = (d[4] & C.SDRD) != 0;
  return {
    eCO2: (d[0] << 8) | d[1],
    TVOC: (d[2] << 8) | d[3],
    new: isNew
  };
};

/*
Initialise the CCS811 module with the given I2C interface
```
options = {
  int : pin // optional - DRDY interrupt pin. If specified, 'data' event with data from 'get' will be emitted when data is ready
  addr: 0x5A | 0x5B // optional - I2C address of the CCS811, defaults to 0x5A. When ADDR pin of the CCS811 is low, the I2C address 0x5A. When ADDR is high the I2C address is 0x5B.
  mode: 0..4 // optional - Operation mode, defaults to 1: Constant power mode, IAQ measurement every second
  nWake: pin // optional - Connect a pin to the CCS811's nWake pin to the lower it's power consumption in Mode 2 or Mode 3
}
``` */
exports.connectI2C = function(i2c, options) {
  var addr = (options && options.addr) || 0x5A;
  return new CCS811(function(reg, len) { // read
    i2c.writeTo(addr, reg);
    return i2c.readFrom(addr, len);
  }, function(reg, data) { // write
    i2c.writeTo(addr, reg, data);
  }, options);
};
