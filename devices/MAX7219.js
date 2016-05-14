/* Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
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
exports.connect = function(/*=SPI*/spi, /*=PIN*/cs, screens) {
  screens = screens||1;
  spi.write ({data:[0xa,0xf], count:screens}, cs);  // intensity  -full
  spi.write ({data:[0xb,0x7], count:screens}, cs);  // scan limit - all 8 chars
  spi.write ({data:[0xc,0], count:screens}, cs);    // shutdown
  return {
    /// Display the given characters - only 0123456789-EHLP are possible
    set : function(val) {
      spi.write([0x9,0xff],cs); // decode all as numbers
      var map = "0123456789-EHLP ";
      var s = "        "+val;
      if (s.length>8) s = s.substr(s.length-8);
      for (var i=0;i<8;i++) {
        spi.write([8-i,map.indexOf(s[i])],cs);
      }
      spi.write([0x0c,1],cs); // no shutdown
    },
    // Send the given raw LED data to the display
    raw : function(val) {     
      spi.write ({data:[0x9,0], count:screens}, cs); // output raw data
      for (var row=0;row<8;row++) {
        digitalWrite(cs, 0);
        for (var i=screens-1;i>=0;i--) {
          spi.send([8-row, val[i+row*screens]]);
        }
        digitalWrite(cs, 1);
      }
      spi.write({data:[0x0C,1], count:screens}, cs); // no shutdown
    },
    // Turn display off
    off : function() {
      spi.write({data:[0xc,0], count:screens}, cs);
    },
    // Turn display on
    on: function() {
      spi.write({data:[0xc, 1], count:screens}, cs);
    },
    // Set intensity (0 to 1)
    intensity : function(i) {
      spi.write({data:[0xA,E.clip(i*15,0,15)], count:screens}, cs);
    },
    // Test the display
    displayTest: function(mode) {
      spi.write({data:[0xf, mode === true], count:screens}, cs);
    },
    // Set the scan limit
    scanLimit : function(limit) {
      spi.write({data:[0xb, limit-1], count:screens}, cs);
    }
  };
};

