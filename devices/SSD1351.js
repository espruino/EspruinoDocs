/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 
Module for the SSD1351 OLED controller

Just:
```
SPI1.setup({ mosi:A7, sck:A5, baud:1000000 });
var g = require("SSD1351").connect(SPI1, A3, B10, B11, function() {
  g.clear();
  g.drawString("Hello",0,0);
  g.setFontVector(20);
  g.setColor(0,0.5,1);
  g.drawString("Espruino",0,10);
});
```  

 */
exports.connect = function(/*=SPI*/spi, /*=PIN*/dc, /*=PIN*/cs, /*=PIN*/rst, callback) {
  cs.write(1); // disable
  dc.write(0); // command
  rst.write(0); // reset
  var cd = function (c,d) {
    dc.write(0); // command
    spi.write(c);
    if (d!==undefined) {
      dc.write(1); // data
      spi.write(d);
    }
  };
  setTimeout(function() { // 20ms delay
    rst.write(1); // un-reset
    setTimeout(function() { // 50ms delay
      cs.write(0); // enable
      cd(0xfd, 0x12); // unlock
      cd(0xfd, 0xb1); // unlock
      cd(0xae); // display off
      cd(0xb3,0xf1); // clock div
      cd(0xca,0x7f); // Multiplex Ratio
      cd(0xa0,0x74); // remap
      cd(0x15,[0,0x7f]); // col
      cd(0x65,[0,0x7f]); // row
      cd(0xa1,0); // startline
      cd(0xa2,0); // display offset
      cd(0xb5,0); // GPIO
      cd(0xab,1); // func select
      cd(0xB1,0x32); // precharge
      cd(0xBE,5); // vcomh
      cd(0xA6); // normal display
      cd(0xC1,[0xC8,0x80,0xC8]); // contrast abc
      cd(0xC7,0x0F); // contrast master
      cd(0xB4,[0xA0,0xB5,0x55]); // set vsl
      cd(0xB6,1); // precharge2
      cd(0xaf); // display on
      cs.write(1); // disable
      if (callback!==undefined) callback();
    }, 50);
  }, 20);

  return Graphics.createCallback(128,128,16,{ setPixel : function(x,y,c) {
    cs.write(0); 
    dc.write(0);spi.write(0x15);
    dc.write(1);spi.write([x,127]);
    dc.write(0);spi.write(0x75);
    dc.write(1);spi.write([y,127]);
    dc.write(0);spi.write(0x5c);
    dc.write(1);spi.write([c>>8,c]);
    cs.write(1);
  }, fillRect : function(x1,y1,x2,y2,c) {
    cs.write(0); 
    dc.write(0);spi.write(0x15);
    dc.write(1);spi.write([x1,x2]);
    dc.write(0);spi.write(0x75);
    dc.write(1);spi.write([y1,y2]);
    dc.write(0);spi.write(0x5c);
    dc.write(1);
    spi.write({data:String.fromCharCode(c>>8,c), count:(x2-x1+1)*(y2-y1+1)});
    cs.write(1);
  }});
};
