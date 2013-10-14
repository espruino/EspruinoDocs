/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 
Module for the MAX7219 7 segment display driver

```
SPI2.setup();
var disp = require("MAX7219").connect(hardware,SPI2,B6);
disp.set(12345);
setTimeout(function() { disp.off(); }, 10000);
```
*/
exports.connect = function(hardware,_spi,_cs) {
  var spi = _spi; 
  var cs = _cs;
  spi.send ([0x9,0xff],B6); // decode mode
  spi.send ([0xa,0x4],B6); // scan limit
  spi.send ([0xb,0x8],B6); // intensity
  spi.send ([0xc,0x1],B6); // shutdown

  return {
   set : function(val) {
     for (var i=5;i>0;i--) {
       spi.send([i,(val / 10000) % 10],cs);
       print((val / 10000) % 10);
       val *= 10;
     }
   },
   off : function() {
     spi.send([0x5,0xff,0x4,0xff,0x3,0xff,0x2,0xff,0x1,0xff],cs);
   }
  };
}
