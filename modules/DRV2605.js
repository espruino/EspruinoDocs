/**
Control a DRV2605 haptic motor driver.

Tested with the Adafruit breakout, read more: https://learn.adafruit.com/adafruit-drv2605-haptic-controller-breakout

Datasheet: http://www.adafruit.com/datasheets/DRV2605.pdf

This code is a port of Ladyada's Ardunio implementation
https://github.com/adafruit/Adafruit_DRV2605_Library/

Copyright (c) 2022 CH. See the file LICENSE for copying permission.
*/

var MODES = [
  'internal-trigger',
  'external-trigger-rising',
  'external-trigger-falling',
  'pwm',
  'audio',
  'rtp',
  'diagnostics',
  'calibration'
];

var EFFECTS = [
  'strong click 100%', 'strong click 60%', 'strong click 30%',
  'sharp click 100%', 'sharp click 60%', 'sharp click 30%',
  'soft bump 100%', 'soft bump 60%', 'soft bump 30%',
  'double click 100%', 'double click 60%', 'triple click 100%',
  'soft fuzz 60%', 'strong buzz 100%',
  '750 ms alert 100%', '1000ms alert 100%',
  'strong click 1 100%', 'strong click 2 80%', 'strong click 3 60%', 'strong click 4 30%',
  'medium click 1 100%', 'medium click 2 80%', 'medium click 3 60%',
  'sharp tick 1 100%', 'sharp tick 2 80%', 'sharp tick 3 60%',
  'short double click strong 1 100%', 'short double click strong 2 80%', 'short double click strong 3 60%', 'short double click strong 4 30%',
  'short double click medium 1 100%', 'short double click medium 2 80%', 'short double click medium 3 60%',
  'short double sharp tick 1 100%', 'short double sharp tick 2 80%', 'short double sharp tick 3 60%',
  'long double sharp click strong 1 100%', 'long double sharp click strong 2 80%', 'long double sharp click strong 3 60%', 'long double sharp click strong 4 30%',
  'long double sharp click medium 1 100%', 'long double sharp click medium 2 80%', 'long double sharp click medium 3 60%',
  'long double sharp tick 1 100%', 'long double sharp tick 2 80%', 'long double sharp tick 3 60%',
  'buzz 1 100%', 'buzz 2 80%', 'buzz 3 60%', 'buzz 4 40%', 'buzz 5 20%',
  'pulsing strong 1 100%', 'pulsing strong 2 60%', 'pulsing medium 1 100%', 'pulsing medium 2 60%',
  'pulsing sharp 1 100%', 'pulsing sharp 2 60%',
  'transition click 1 100%', 'transition click 2 80%', 'transition click 3 60%', 'transition click 4 40%', 'transition click 5 20%', 'transition click 6 10%',
  'hum 1 100%', 'hum 2 80%', 'hum 3 60%', 'hum 4 40%', 'hum 5 20%', 'hum 6 10%',
  'ramp down long smooth 1', 'ramp down long smooth 2',
  'ramp down medium smooth 1', 'ramp down medium smooth 2',
  'ramp down short smooth 1', 'ramp down short smooth 2',
  'ramp down long sharp 1', 'ramp down long sharp 2',
  'ramp down medium sharp 1', 'ramp down medium sharp 2',
  'ramp down short sharp 1', 'ramp down short sharp 2',
  'ramp up long smooth 1', 'ramp up long smooth 2',
  'ramp up medium smooth 1', 'ramp up medium smooth 2',
  'ramp up short smooth 1', 'ramp up short smooth 2',
  'ramp up long sharp 1', 'ramp up long sharp 2',
  'ramp up medium sharp 1', 'ramp up medium sharp 2',
  'ramp up short sharp 1', 'ramp up short sharp 2',
  'ramp down long smooth 1 half', 'ramp down long smooth 2 half',
  'ramp down medium smooth 1 half', 'ramp down medium smooth 2 half',
  'ramp down short smooth 1 half', 'ramp down short smooth 2 half',
  'ramp down long sharp 1 half', 'ramp down long sharp 2 half',
  'ramp down medium sharp 1 half', 'ramp down medium sharp 2 half',
  'ramp down short sharp 1 half', 'ramp down short sharp 2 half',
  'ramp up long smooth 1 half', 'ramp up long smooth 2 half',
  'ramp up medium smooth 1 half', 'ramp up medium smooth 2 half',
  'ramp up short smooth 1 half', 'ramp up short smooth 2 half',
  'ramp up long sharp 1 half', 'ramp up long sharp 2 half',
  'ramp up medium sharp 1 half', 'ramp up medium sharp 2 half',
  'ramp up short sharp 1 half', 'ramp up short sharp 2 half',
  'long buzz no stop',
  'smooth hum 1 50%', 'smooth hum 2 40%', 'smooth hum 3 30%', 'smooth hum 4 20%', 'smooth hum 5 10%',
];

var C = {
  ADDR: 0x5A,                 // I2C address
  REG_STATUS: 0x00,           // Status
  REG_MODE: 0x01,             // Mode
  REG_MODE_INTTRIG: 0x00,     // Internal trigger
  REG_MODE_EXTTRIGEDGE: 0x01, // Ext. edge trigger
  REG_MODE_EXTTRIGLVL: 0x02,  // Ext. level trigger
  REG_MODE_PWMANALOG: 0x03,   // PWM/analog input
  REG_MODE_AUDIOVIBE: 0x04,   // Audio-to-vibe
  REG_MODE_REALTIME: 0x05,    // Real-time playback
  REG_MODE_DIAGNOS: 0x06,     // Diagnostics
  REG_MODE_AUTOCAL: 0x07,     // Auto calibration

  REG_RTPIN: 0x02,       // Real-time playback input
  REG_LIBRARY: 0x03,     // Waveform library selection  
  REG_WAVESEQ1: 0x04,    // Waveform sequence 
  REG_WAVESEQ2: 0x05,    // Waveform sequence
  REG_WAVESEQ3: 0x06,    // Waveform sequence
  REG_WAVESEQ4: 0x07,    // Waveform sequence
  REG_WAVESEQ5: 0x08,    // Waveform sequence
  REG_WAVESEQ6: 0x09,    // Waveform sequence
  REG_WAVESEQ7: 0x0A,    // Waveform sequence
  REG_WAVESEQ8: 0x0B,    // Waveform sequence

  REG_GO: 0x0c,          // Go
  REG_OVERDRIVE: 0x0D,    // Overdrive time offset
  REG_SUSTAINPOS: 0x0E,  // Sustain time offset, positive
  REG_SUSTAINNEG: 0x0F,  // Sustain time offset, negative
  REG_BREAK: 0x10,       // Brake time offset
  REG_AUDIOCTRL: 0x11,   // Audio-to-vibe control
  REG_AUDIOLVL: 0x12,    // Audio-to-vibe min input level
  REG_AUDIOMAX: 0x13,    // Audio-to-vibe max input level
  REG_AUDIOOUTMIN: 0x14, // Audio-to-vibe max output level
  REG_RATEDV: 0x16,      // Rated voltage
  REG_CLAMPV: 0x17,      // Overdrive clamp
  REG_AUTOCALCOMP: 0x18, // Auto-calibration compensation
  REG_AUTOCALEMP: 0x19,  // Auto-calibration back-EMF

  REG_FEEDBACK: 0x1A,    // Feedback control
  REG_CONTROL1: 0x1B,
  REG_CONTROL2: 0x1C,
  REG_CONTROL3: 0x1D,
  REG_CONTORL4: 0x1E,
  REG_VBAT: 0x21,        // Vbat voltage-monitor
  REG_LRARESON: 0x22     // LRA resonance-period
};

function DRV2605(options, read, write) {
  options = options || {};
  this.read = read;
  this.write = write;

  let id = read(C.REG_STATUS, 8);

  write(C.REG_MODE, 0x00);    // out of standby
  write(C.REG_RTPIN, 0x0);    // no real-time playback
  write(C.REG_WAVESEQ1, 1);   // strong click
  write(C.REG_WAVESEQ2, 0);   // end sequence
  write(C.REG_OVERDRIVE, 0);  // no overdrive

  write(C.REG_SUSTAINPOS, 0);
  write(C.REG_SUSTAINNEG, 0);
  write(C.REG_BREAK, 0);
  write(C.REG_AUDIOMAX, 0x64);

  // ERM open loop
  this.useERM();

  // Turn on ERM_OPEN_LOOP
  write(C.REG_CONTROL3, read(C.REG_CONTROL3) | 0x20);
}

DRV2605.prototype.EFFECTS = EFFECTS;

/** 
 * Assign a waveform to a sequencer slot. 
 * See the datasheet, section 11.2 for a list of effects.
 * https://cdn-shop.adafruit.com/datasheets/DRV2605.pdf
 * @param {number} slot Slot to set, 0-7
 * @param {string|number} nameOrIndex Waveform sequence value. Either 1-123, or string to use a named effect.
*/
DRV2605.prototype.setWaveform = function (slot, nameOrIndex) {
  if (slot < 0 || slot > 7) throw new Error('Slot should be 0-7');
  if (typeof nameOrIndex === 'string') {
    nameOrIndex = this.getWaveform(nameOrIndex);
    if (nameOrIndex < 0) throw new Error('Effect not found: ' + nameOrIndex);
  }
  if (nameOrIndex < 0 || nameOrIndex > 123) throw new Error('Waveform should be 0-123');
  this.write(C.REG_WAVESEQ1 + slot, nameOrIndex);
};

/**
 * Set up to eight steps. Unused steps are emptied.
 * @param {string[]|number[]} steps An array of indexes or effect names
 */
DRV2605.prototype.setSequence = function (steps) {
  if (!Array.isArray(steps)) throw new Error('steps parameter should be an array');
  if (steps.length > 8) throw new Error('Cannot sequence more than eight steps');

  for (let i = 0; i < 8; i++) {
    if (i < steps.length) this.setWaveform(i, steps[i]);
    else this.setWaveform(i, 0);
  }
};

/**
 * Assigns a waveform to the initial sequencer slot and plays it
 * @param {string|number} nameOrIndex Name of effect or numerical index
 */
DRV2605.prototype.trigger = function (nameOrIndex) {
  this.setWaveform(0, nameOrIndex);
  this.start();
};

/**
 * Looks up a waveform index by name
 * @param {string} name Name of effect
 * @returns Index, or -1 if not found
 */
DRV2605.prototype.getWaveform = function (name) {
  var i = EFFECTS.findIndex(n => n === name);
  if (i < 0) return i;
  return i + 1; // Effects start at 1
};

/**
 * Select library
 * @param {number} lib 0 is empty, 1-5 ERM, 6 is LRA
 */
DRV2605.prototype.selectLibrary = function (lib) {
  if (lib < 0 || lib > 6) throw new Error('Library should be 0-6');
  this.write(C.REG_LIBRARY, lib);
};

/** 
 * Run sequence 
 */
DRV2605.prototype.start = function () {
  this.write(C.REG_GO, 1);
};

/** 
 * Stop sequence
 */
DRV2605.prototype.stop = function () {
  this.write(C.REG_GO, 0);
};

/** 
 * Sets a mode by integer value, see datasheet
 * Section 7.6.2 http://www.adafruit.com/datasheets/DRV2605.pdf
 * @param {number} mode Mode (0-7)
 */
DRV2605.prototype.setModeInt = function (mode) {
  if (mode < 0 || mode > 7) throw new Error('Mode expected to be 0-7');
  this.write(C.REG_MODE, mode);
};

/**
 * Sets mode by string. Use `setModeInt` to assign by number
 * Available modes are: 
 *  internal-trigger, external-trigger-rising,
 *  external-trigger-falling, pwm, audio, rtp,
 *  diagnostics, calibration
 * @param {string} mode String mode 
 */
DRV2605.prototype.setMode = function (mode) {
  let v = MODES.findIndex(m => m === mode);
  if (v < 0) throw new Error('Mode not found (' + mode + ')');
  this.setModeInt(v);
};

/**
 * Sets amplitude of motor when in real-time mode.
 * @param {number} Amplitude 0-127
 */
DRV2605.prototype.setRealtimeValue = function (rtp) {
  if (rtp < 0) rtp = 0;
  if (rtp > 127) rtp = 127;
  this.write(C.REG_RTPIN, rtp);
};

/**
 * Use ERM (Eccentric Rotating Mass) mode.
 */
DRV2605.prototype.useERM = function () {
  this.write(C.REG_FEEDBACK, this.read(C.REG_FEEDBACK) & 0x7F);
};


/**
 * Use LRA (Linear Resonance Actuator) mode.
 */
DRV2605.prototype.useLRA = function () {
  this.write(C.REG_FEEDBACK, this.read(C.REG_FEEDBACK) & 0x80);
};

/**
 * Connects to module
 * @param {1} i2c I2C instance
 * @param {*} opts Options
 * @returns 
 */
exports.connect = function (i2c, opts) {
  var addr = (opts && opts.addr) || C.ADDR;
  return new DRV2605(
    opts,
    // Read
    function (reg, len) {
      i2c.writeTo(addr, reg);
      return i2c.readFrom(addr, len);
    },
    // Write
    function (reg, data) {
      i2c.writeTo(addr, [reg, data]);
    }
  );
};