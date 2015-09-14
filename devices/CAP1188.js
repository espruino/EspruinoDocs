/* Copyright (c) 2015 Andrew Nicolaou. See the file LICENSE for copying permission. */
/*
  Module for Adafruit CAP1188 8-Key Capacitive Touch Sensor Breakout
  Only I2C is supported.

  See: https://www.adafruit.com/products/1602
  Bit writing code from: http://www.espruino.com/modules/MPU6050.js
  Influenced by Adafruit's CAP1188: https://github.com/adafruit/Adafruit_CAP1188_Library
*/
var C = {
  ADDRESS_DEFAULT       : 0x29
};

/* Register addresses*/
var R = {
  MAIN_CONTROL          : 0x00,
  SENSOR_INPUT_STATUS   : 0x03,
  MULTI_TOUCH_CONFIG    : 0x2a,
  STANDBY_CONFIG        : 0x41,
  SENSOR_INPUT_LINKING  : 0x72,
  LED_OUTPUT_CONTROL    : 0x74
};

/* Bits within register for functions */
var B = {
  MAIN_CONTROL_INT      : 0x0
};

function CAP1188(_i2c, _opts) {
  _opts = (_opts == null) ? {} : _opts;
  this.i2c = _i2c;

  // Support old API where second param was _addr
  if (typeof _opts === 'number') {
    this.addr = _opts;
  } else {
    this.addr  = _opts.address || C.ADDRESS_DEFAULT;
    this.resetPin = _opts.resetPin || null;
  }

  this.initialize();
}

/* Initialize the chip */
CAP1188.prototype.initialize = function() {
  this.linkLedsToSensors();
  this.multipleTouches(true);
  // "Speed up a bit"
  this.i2c.writeTo(this.addr, [R.STANDBY_CONFIG, 0x30]);
};

/* Reset the chip if a reset pin has been specified */
CAP1188.prototype.reset = function(callback) {
  var delay = 100,
      pin   = this.resetPin,
      self  = this;

  if (pin == null) {
    throw new Error('CAP1188 reset called but no resetPin given');
  }

  pin.write(0);
  setTimeout(function () {
    pin.write(1);
    setTimeout(function () {
      pin.write(0);
      setTimeout(function () {
        self.initialize();
        if (callback) { callback(); }
      }, delay);
    }, delay);
  }, delay);
};

/* How many simultaneous touches to allow */
CAP1188.prototype.multipleTouches = function(enable) {
  // 1 will block multiple touches
  this.writeBit(R.MULTI_TOUCH_CONFIG, 7, enable ? 0 : 1);
};

/* Link the LED to corresponding sensor */
CAP1188.prototype.linkLedsToSensors = function() {
  for(var i = 0; i < 8; i++) {
    this.linkLedToSensor(i, 1);
  }
};

/* Link LED pin to sensor */
CAP1188.prototype.linkLedToSensor = function(num, enable) {
  this.writeBit(R.SENSOR_INPUT_LINKING, num, enable);
};

/* Read state of all sensors */
CAP1188.prototype.readTouches = function() {
  var touches = [],
      raw;

  this.i2c.writeTo(this.addr, R.SENSOR_INPUT_STATUS);
  raw = this.i2c.readFrom(this.addr, 1)[0];

  if (raw) {
    // Clear interrupt to be able to read again
    this.writeBit(R.MAIN_CONTROL, B.MAIN_CONTROL_INT, 0);
  }

  for(var i = 0; i < 8; i++) {
    touches[i] = this.getBit(raw, i);
  }


  return touches;
};

/*  */
CAP1188.prototype.getBit = function(byt, position) {
  return (1 == ((byt >> position) & 1));
};

/* Set a single bit in a register */
CAP1188.prototype.writeBit = function(reg, bit, val) {
  this.i2c.writeTo(this.addr, reg);
  var b = this.i2c.readFrom(this.addr, 1)[0];
  b = (val !== 0) ? (b | (1 << bit)) : (b & ~(1 << bit));
  this.i2c.writeTo(this.addr, [reg, b]);
};

/* Set more bits in a register */
CAP1188.prototype.writeBits = function(reg, shift, val) {
  this.i2c.writeTo(this.addr, reg);
  var b = this.i2c.readFrom(this.addr, 1)[0];
  b = b | (val << shift);
  this.i2c.writeTo(this.addr, [reg, b]);
};

exports.connect = function (_i2c,_addr) {
  return new CAP1188(_i2c,_addr);
};
