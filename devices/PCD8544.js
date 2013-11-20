/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 
Module for the PCD8544 controller in the Nokia 5110 LCD.

Just:
```
SPI1.setup({ baud: 200000, sck:B3, mosi:B5 });
var g = require("PCD8544").connect(SPI1,B6,B7,B8);
g.clear();
g.drawString("Hello",0,0);
g.drawLine(0,10,84,10);
g.flip();
```  

 */
exports.connect = function(/*=SPI*/_spi, /*=PIN*/_dc, /*=PIN*/_ce, /*=PIN*/_rst) {
  var LCD = Graphics.createArrayBuffer(84,48,1,{vertical_byte:true});
  var spi = _spi;
  var dc = _dc;                       
  var ce = _ce;                  
  var rst = _rst;            
  digitalPulse(rst, 0, 10); // pulse reset low
  setTimeout(function() {
    digitalWrite(dc,0); // cmd
    spi.send(
      [0x21, // fnset extended
      0x80 | 0x40, // setvop (experiment with 2nd val to get the right contrast)
      0x14, // setbias 4
      0x04 | 0x02, // temp control
      0x20, // fnset normal
      0x08 | 0x04], ce); // dispctl normal
    }, 100);

  LCD.flip = function () {       
   for (var i=0;i<6;i++) {  
    digitalWrite(dc,0); // cmd
    spi.send(0x40|i, ce); // Y addr
    spi.send(0x80, ce); // X addr          
    digitalWrite(dc,1); // data
    spi.send(new Uint8Array(this.buffer,i*84,84+2), ce);
   }
   // Why +2 in SPI.send? Maybe it needs some time to sort itself out
  }  
  return LCD; 
}
