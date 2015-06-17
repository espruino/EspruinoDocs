/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Module for the ILI9163 LCD controller

Just:
```
var g = require("ILI9163").connect(spi, B1, B13, B10, function() {
  g.clear();
  g.setRotation(2);
  g.drawString("Hello",0,0);
  g.setFontVector(20);
  g.setColor(0,0.5,1);
  g.drawString("Espruino",0,10);
});
```

*/
/* ILI9163 128x128

| VCC | B15 | 3.3v
| GND | B14 | GND
| CS/CE  | B13 |
| RST | B10 | 3.3v
| A0/DC  | B1  |
| SDA | A7  |
| SCL | A6  |
| LED | A5  |


*/

var LCD_WIDTH = 128;
var LCD_HEIGHT = 128;

function init(spi, dc, ce, rst, callback) {
  function cmd(c,d) {
    dc.reset();
    spi.write(c, ce);
    if (d!==undefined) {
      dc.set();
      spi.write(d, ce);
    }
  }
  
  if (rst) {
    digitalPulse(rst,0,10);
  } else {
    cmd(0x01); //Software reset
  }
  setTimeout(function() {
    cmd(0x11); //Exit Sleep
    setTimeout(function() {
      cmd(0x26, 0x04); //Set Default Gamma
      cmd(0xB1, [0x0e,0x10]); //Set Frame Rate
      cmd(0xC0, [0x08,0]); //Set VRH1[4:0] & VC[2:0] for VCI1 & GVDD
      cmd(0xC1, 0x05); //Set BT[2:0] for AVDD & VCL & VGH & VGL
      cmd(0xC5, [0x38,0x40]); //Set VMH[6:0] & VML[6:0] for VOMH & VCOML

      cmd(0x3a, 5); //Set Color Format, 5=16 bit,3=12 bit
      cmd(0x36, 0xc8); //RGB

      cmd(0x2A,[0,0,0,LCD_WIDTH]); //Set Column Address
      cmd(0x2B,[0,0,0,LCD_HEIGHT]); //Set Page Address

      cmd(0xB4, 0); // display inversion

      cmd(0xf2, 1); //Enable Gamma bit
      cmd(0xE0,[0x3f,0x22,0x20,0x30,0x29,0x0c,0x4e,0xb7,0x3c,0x19,0x22,0x1e,0x02,0x01,0x00]); 
      cmd(0xE1,[0x00,0x1b,0x1f,0x0f,0x16,0x13,0x31,0x84,0x43,0x06,0x1d,0x21,0x3d,0x3e,0x3f]);

      cmd(0x29); // Display On
      cmd(0x2C); // reset frame ptr      

      if (callback) callback();
    },20);
  } ,100);
}


exports.connect = function(spi, dc, ce, rst, callback) {
  var g = Graphics.createCallback(LCD_WIDTH, LCD_HEIGHT, 16, {
    setPixel:function(x,y,c){
      ce.reset();
      spi.write(0x2A,dc);
      spi.write(0,x,0,x+1);
      spi.write(0x2B,dc);
      spi.write(0,y,0,y+1);
      spi.write(0x2C,dc);
      spi.write(c>>8,c);
      ce.set();
    },
    fillRect:function(x1,y1,x2,y2,c){
      ce.reset();
      spi.write(0x2A,dc);
      spi.write(0,x1,0,x2);
      spi.write(0x2B,dc);
      spi.write(0,y1,0,y2);
      spi.write(0x2C,dc);
      spi.write({data:String.fromCharCode(c>>8,c), count:(x2-x1+1)*(y2-y1+1)});
      ce.set();
    }
  });
  init(spi, dc, ce, rst, callback);
  return g;
};

exports.connectPaletted = function(palette, spi, dc, ce, rst, callback) {
  var bits;
  if (palette.length>16) bits=8;
  else if (palette.length>4) bits=4;
  else if (palette.length>2) bits=2;
  else bits=1;
  var g = Graphics.createArrayBuffer(LCD_WIDTH, LCD_HEIGHT, bits, { msb:true });
  g.flip = function() {
    ce.reset();
    spi.write(0x2A,dc);
    spi.write(0,0,0,LCD_WIDTH);
    spi.write(0x2B,dc);
    spi.write(0,0,0,LCD_HEIGHT);
    spi.write(0x2C,dc);
    var lines = 16; // size of buffer to use for un-paletting
    var a = new Uint16Array(LCD_WIDTH*lines);
    for (var y=0;y<LCD_HEIGHT;y+=lines) {
      E.mapInPlace(new Uint8Array(g.buffer, y*LCD_WIDTH*bits/8, a.length), a, palette, bits);
      spi.write(a.buffer);
    }
    ce.set();
  };
  init(spi, dc, ce, rst, callback);
  return g;
};

