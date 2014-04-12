function Midi(uart, speed, noteOn) {
	this.midi = uart,
	this.midi.setup(speed, { parity:'none', bytesize:8, stopbits:1 });

	this.state = 'WAITING';
	this.message = '';
	this.p1 = 0;
	this.p2 = 0;
	this.chan = 0;
	this.noteOn = noteOn;

	this.midi.onData(function(d) {
		var data = d.data;
		if (data.length != 1) {
	    print("Weird multibyte thing, discarding");
		}
		var b = data.charCodeAt(0);
		if (this.state == 'WAITING') {
	    if (b < 0x80) {
				print("Out of order, non command, discarding");
	    } else { // command
				this.channel = b & 0b1111;
				this.message = b & 0b11110000;
				print("Command: " + this.message + ' on channel: ' + this.channel);
				this.state = 'P1';
	    }
		} else if (this.state == 'P1') {
			this.p1 = b;
	    this.state = 'P2';
		} else if (this.state == 'P2') {
			this.p2 = b;
	    // print("So, mess: " + this.message + ' ,p1: ' + this.p1 + ' ,p2: ' + this.p2);
			if (this.message == 0x90) {
				this.noteOn(this.channel, this.p1, this.p2);
			}
			this.state = 'WAITING';
		}
	});
};

exports.setup = function(uart, speed, noteOn) {
  return new Midi(uart, speed, noteOn);
};

