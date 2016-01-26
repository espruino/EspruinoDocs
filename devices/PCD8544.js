/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 
Module for the PCD8544 controller in the Nokia 5110 LCD.

Just:
```
SPI1.setup({ sck:B3, mosi:B5 });
var g = require("PCD8544").connect(SPI1,B6,B7,B8, function() {
  g.clear();
  g.drawString("Hello",0,0);
  g.drawLine(0,10,84,10);
  g.flip();
});
```  

 */
exports.connect = function(/*=SPI*/spi, /*=PIN*/dc, /*=PIN*/ce, /*=PIN*/rst, callback) {
  var LCD = Graphics.createArrayBuffer(84,48,1,{vertical_byte:true});
  setTimeout(function() {
    dc.reset(); // cmd
    digitalPulse(rst, 0, 10); // pulse reset low
    
    setTimeout(function() {      
      spi.write(
        [0x21, // fnset extended
        0x80 | 0x3F, // setvop (experiment with 2nd val to get the right contrast)
        0x14, // setbias 4
        0x04 | 0x02, // temp control
        0x20, // fnset normal
        0x08 | 0x04], ce); // dispctl normal
      if (callback!==undefined) callback();
    }, 100);
  }, 100);

  LCD.flip = function () {
    dc.reset(); // cmd
    spi.write([0x40,0x80], ce); // X + Y addr (0,0)
    dc.set(); // data
    spi.write(this.buffer, ce);
  };
  LCD.setContrast = function(c) { // c between 0 and 1. 0.5 is default
    dc.reset(); // cmd
    spi.write(
        [0x21, // fnset extended
        0x80 | E.clip(c*0x7f,0,0x7f), // setvop
        0x20, // fnset normal
        0x08 | 0x04], ce); // dispctl normal
  };
  return LCD;
};
