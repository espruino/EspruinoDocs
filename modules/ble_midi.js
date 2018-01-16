/* Copyright (c) 2017 Gordon Williams, George Mandis, Joe Bowbeer, Pur3 Ltd. See the file LICENSE for copying permission. */
/* usage:
var midi = require("ble_midi");
midi.init();

midi.send(channel, controller, value);
*/

/// Turns the device into a MIDI controller
exports.init = function() {
  NRF.setServices({
    "03B80E5A-EDE8-4B33-A751-6CE34EC4C700": { // MIDI
      "7772E5DB-3868-4112-A1A9-F2669D106BF3": {
        readable: true,
        writable: true,
        notify: true,
        value: [0x80, 0x80, 0x00, 0x00, 0x00]
      }
    }
  });
  NRF.setAdvertising([
    // Flags: LE Limited Discoverable Mode, BR/EDR Not Supported
    0x02, 0x01, 0x05,
    // Complete Local Name: PuckCC
    0x07, 0x09, 0x50, 0x75, 0x63, 0x6B, 0x43, 0x43,
    // MIDI
    0x11, 0x06, 0x00, 0xC7, 0xC4, 0x4E, 0xE3, 0x6C, 0x51,
    0xA7, 0x33, 0x4B, 0xE8, 0xED, 0x5A, 0x0E, 0xB8, 0x03
  ]);
};

/// Sends a raw MIDI command
exports.cmd = function(cmd, d1, d2) {
  NRF.updateServices({
    "03B80E5A-EDE8-4B33-A751-6CE34EC4C700": {
      "7772E5DB-3868-4112-A1A9-F2669D106BF3": {
        value: [0x80, 0x80, cmd, d1, d2],
        notify: true
      }
    }
  });
};

/// Send a 'control change' (0xB0) MIDI command
exports.send = function(channel, controller, value) { this.cmd(0xB0+channel,controller,value); };
/// Send a 'note on' (0x90) MIDI command
exports.noteOn = function(channel, note, velocity) { this.cmd(0x90+channel,note,velocity); };
/// Send a 'note off' (0x80) MIDI command
exports.noteOff = function(channel, note, velocity) { this.cmd(0x80+channel,note,velocity); };
