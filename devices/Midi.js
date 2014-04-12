function Midi(uart, speed) {
	var midi = uart;
	midi.setup(speed, { parity:'none', bytesize:8, stopbits:1 });

	// console.log("Port: " + midi + ' initialized');
	var state = 'W';
	var message = '';
	var p1 = 0;
	var p2 = 0;
	var channel = 0;
	var emitter = this;

	midi.onData(function(d) {
		var data = d.data;
		if (data.length != 1) {
	    console.log("Weird multibyte thing, discarding");
		}
		var b = data.charCodeAt(0);
    // console.log("Got data!" + b + ' - I am: ' + this);
		if (state === 'W') {
	    if (b < 0x80) {
				print("Out of order or non-command, discarding");
	    } else { // command
				channel = b & 0b1111;
				message = b & 0b11110000;
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
	    // print("So, mess: " + this.message + ' ,p1: ' + this.p1 + ' ,p2: ' + this.p2);
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
	});
};

exports.setup = function(uart, speed) {
  return new Midi(uart, speed);
};

