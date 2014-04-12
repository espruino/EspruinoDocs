function Midi(uart, speed, noteOn) {
	var midi = uart;
	midi.setup(speed, { parity:'none', bytesize:8, stopbits:1 });

	console.log("Port: " + midi + ' initialized');
	var state = 'WAITING';
	var message = '';
	var p1 = 0;
	var p2 = 0;
	var channel = 0;

	midi.onData(function(d) {
		var data = d.data;
		if (data.length != 1) {
	    console.log("Weird multibyte thing, discarding");
		}
		var b = data.charCodeAt(0);
    console.log("Got data!" + b + ' - I am: ' + this);
		if (state == 'WAITING') {
	    if (b < 0x80) {
				print("Out of order or non-command, discarding");
	    } else { // command
				channel = b & 0b1111;
				message = b & 0b11110000;
				console.log("Command: " + message + ' on channel: ' + channel);
				state = 'P1';
	    }
		} else if (state == 'P1') {
			p1 = b;
	    state = 'P2';
		} else if (state == 'P2') {
			p2 = b;
	    // print("So, mess: " + this.message + ' ,p1: ' + this.p1 + ' ,p2: ' + this.p2);
			if (message == 0x90) {
				noteOn(channel, p1, p2);
			}
			state = 'WAITING';
		}
	});
};

exports.setup = function(uart, speed, noteOn) {
  return new Midi(uart, speed, noteOn);
};

