/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 
Module for the ST7565, often used in LCD12864-style displays

Just:

```
var spi = new SPI();
spi.setup({ sck: SCK, mosi: SDA });
var g = require("ST7565").connect({spi:spi, DC:..., CS:..., RST:..., function() {
  g.clear();
  g.drawString("Hello",0,0);
  g.drawLine(0,10,g.getWidth(),10);
  g.flip();
});
```  
*/

exports.connect = function(options, callback) {
  if (typeof options !== "object") throw "Expecting an object as first arg"
  var w = (options.width || 128);
  var g = Graphics.createArrayBuffer(w,64,1,{vertical_byte:true});
  var spi = options.spi;
  var CS = options.cs;
  var DC = options.dc;

  CS.reset();
  if (options.rst!==undefined) options.rst.reset();
  setTimeout(function() {
    if (options.rst!==undefined) options.rst.set();
    spi.write([
     0xA3, // bias 7 (0xA2 for bias 9)
     0xA0, // no horiz flip
     0xC8, // vertical flip
     0x40, // top left start
     0x2F, // all power on (adafruit does this one at a time, but it doesn't seem to be required)
     0x20|2, // resistor divider contrast 2 (0..7)
     0xAF, // display on
     0x81, // dynamic contrast
     31 // 0..63
    ], DC);
    if (callback) callback(g);
  }, 100);

  /* set contrast to a value between 0 and 1. 
  If div is specified, it should be an integer between 0 and 7 (2 is default) */
  g.setContrast = function(c, div) {
    if (c<0) c=0;
    if (c>1) c=1;
    CS.reset();
    spi.write([0x81, 0|(c*63)], DC);
    if (div!==undefined) spi.write(0x20|div, DC);
    CS.set();
  };

  /* Write to the screen */
  g.flip = function () {  
    CS.reset();
    for (var y=0;y<8;y++) {      
      spi.write([0xB0|y/* page */,0x00/* col lower*/,0x10/* col upper*/], DC); 
      spi.write(new Uint8Array(this.buffer, w*y, w));
    }
    CS.set();
  };
  return g;
};

