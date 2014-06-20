/* Copyright (c) 2014 Luca S.G.de Marinis - loop23-at-gmail.com,
 * See the file LICENSE for copying permission */

/* This module implements midi input (which is serial after all),
 *  and generates events based on what it received on the wire */

function Midi(uart, speed) {
    this.uart = uart;
    uart.setup(speed, { parity:'none', bytesize:8, stopbits:1 });
    var state = 'W';
    var message = '';
    var p1 = 0;
    var p2 = 0;
    var channel = 0;
    var emitter = this;
    uart.on('data', function(data) {
      for (var i in data) {
        var b = data.charCodeAt(i);
        if (state === 'W') {
           if (b < 0x80) {
                print("Out of order or non-command, discarding");
        } else { // command
                channel = b & 0xf;
                message = b & 0xf0;
                if (message == 0xc0 || message == 0xd0) {
                    state = '2';
                } else {
                    state = '1';
                }
        }
        } else if (state == '1') {
            p1 = b;
        state = '2';
        } else if (state == '2') {
            p2 = b;
            if (message === 0x90) {
                emitter.emit('noteOn', { chan: channel, note: p1, velocity: p2 });
            } else if (message === 0x80) {
                emitter.emit('noteOff', { chan: channel, note: p1, velocity: p2 });
            } else if (message === 0xb0) {
                emitter.emit('ctrlChange', { chan: channel, ctrl: p1, value: p2 });
            } else if (message === 0xe0) {
                emitter.emit('pitchBend', { chan: channel, value: p1 | (p2 << 7) });
            } else if (message === '0xa0') {
                emitter.emit('afterTouch', { chan: channel, note: p1, value: p2 });
            } else if (message === 0xc0) {
                emitter.emit('patchChange', { chan: channel, patch: p2 });
            } else if (message === 0xd0) {
                emitter.emit('channelPress', { chan: channel, press: p2 });
            }
            state = 'W';
        }
      }
    });
};

exports.setup = function(uart, speed) {
  return new Midi(uart, speed);
};

