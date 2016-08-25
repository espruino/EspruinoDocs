/*
Copyright (C) 2016, Nic Marcondes <nic@upnic.net>

This module interfaces with a CD4012BE Shifting-in IC;
Usage (with any available SPI):


              ____  ____
        IN 8 | 1  \/ 16 | 5V
          -  |          | IN 7
  Serial Out |          | IN 6
        IN 4 |          | IN 5
        IN 3 |          | -
        IN 2 |          | Serial In (for Castating with other CD4021BE)
        IN 1 |          | Clock
        GND  | 8      9 | Parallel/Serial Control
              ----------

Using SPI2
Connect pin 9 to Espruino C6 (Any GPIO)
Connect pin 10 to Espruino B13 (SPI SCK)
Connect pin 3 to Espruino B14  (SPI MISO)

For single IC:

SPI2.setup({sck: B13, miso: B14, mosi: B15});
var shift_in = new CD4021BE(SPI2, C6);
print(shift_in.read());

For Cascading: 
SPI2.setup({sck: B13, miso: B14, mosi: B15});
var shift_in = new CD4021BE(SPI2, C6, 3);
shift_in.readAll(function(data){print(data);});

*/

exports.connect = function(spi, cs, cascading) {
  return new CD4021BE(spi, cs, cascading);
};

function CD4021BE(spi, cs, cascading) {
  this.SPI = spi;
  this.CS = cs ;
  this.CASCATING = typeof cascading !== 'undefined' ? cascading : 1;
}

function convert(data) {
  return [
    (data & 1)   > 0 ? 1:0,
    (data & 2)   > 0 ? 1:0,
    (data & 4)   > 0 ? 1:0,
    (data & 8)   > 0 ? 1:0,
    (data & 16)  > 0 ? 1:0,
    (data & 32)  > 0 ? 1:0,
    (data & 64)  > 0 ? 1:0,
    (data & 128) > 0 ? 1:0,
  ];
}

CD4021.prototype.read = function() {
  return convert(this.SPI.send(0x00, this.CS));
};

CD4021.prototype.readAll = function(cb) {
  var self = this;
  setTimeout(function(){
	self.CS.set();
	setTimeout(function(){
	  self.CS.reset();
	  var all = [];
	  for(i=0;i<self.CASCATING;i++) {
		all.push(convert(self.SPI.send(0x00)));
	  }
	  cb(all);
	}, 0.2);
  }, 10);
};


