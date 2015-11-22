/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 
Module for the MAX7219 7 segment display driver

```
SPI2.setup({mosi:B15, sck:B13});
var disp = require("MAX7219").connect(SPI2,B14);
disp.set("--HELP--"); // disp can display strings with the following chars: 0123456789-EHLP

setTimeout(function() {
  disp.raw([1,2,4,8,16,32,64,128]); // you can set the LEDs directly
}, 1000);

setTimeout(function() {
  var n = 0;
  setInterval(function() {
    disp.set(n++); // it can display integers
    disp.intensity(0.5+0.5*Math.sin(n*0.2)); // you set set intensity
  }, 100);
}, 2000);
```
*/
exports.connect = function(/*=SPI*/_spi,/*=PIN*/_cs) {
  var spi = _spi;
  var cs = _cs;
  spi.send ([0xa,0xf],cs);  // intensity  -full
  spi.send ([0xb,0x7],cs);  // scan limit - all 8 chars
  spi.send ([0xc,0],cs);    // shutdown
  return {
    /// Display the given characters - only 0123456789-EHLP are possible
    set : function(val) {
      spi.send ([0x9,0xff],cs); // decode all as numbers
      var map = "0123456789-EHLP  "; // FIXME indexOf doesn't find last index
      var s = "        "+val;
      if (s.length>8) s = s.substr(s.length-8);
      for (var i=0;i<8;i++) {
        spi.send([8-i,map.indexOf(s[i])],cs);
      }
      spi.send([0x0c,1],cs); // no shutdown
    },
    // Send the given raw LED data to the display
    raw : function(val) {
      spi.send ([0x9,0],cs); // output raw data
      for (var i=0;i<val.length;i++) {
        spi.send([i+1,val[i]],cs);
      }
      spi.send([0x0c,1],cs); // no shutdown
    },
    // Turn display off
    off : function() {
      spi.send([0xc,0],cs);
    },
    // Turn display on
    on: function() {
      spi.send([0xc, 1], cs);
    },
    // Set intensity (0 to 1)
    intensity : function(i) {
      spi.send([0xA,E.clip(i*15,0,15)],cs);
    },
    // Test the display
    displayTest: function(mode) {
      spi.send([0xf, mode === true], cs);
    },
    // Set the scan limit
    scanLimit : function(limit) {
      spi.send([0xb, limit-1], cs);
    }
  };
};
