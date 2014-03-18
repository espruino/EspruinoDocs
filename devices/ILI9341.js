/* Copyright (c) 2013 Juergen Marsch and Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Module for the ILI9341 LCD controller

Just:
```
SPI1.setup({sck:B3, miso:B4, mosi:B5, baud: 1000000});
var g = require("ILI9341").connect(SPI1, B6, B8, B7, function() {
  g.clear();
  g.drawString("Hello",0,0);
  g.setFontVector(20);
  g.setColor(0,0.5,1);
  g.drawString("Espruino",0,10);
});
```

*/
var LCD_WIDTH = 240;
var LCD_HEIGHT = 320;

exports.connect = function(spi, dc, ce, rst, callback) { 
  function writeCMD(d){
    dc.write(0);
    ce.write(0);
    spi.send(d);
    dc.write(1);
  }
  function writeCD(c,d){
    dc.write(0);
    ce.write(0);
    spi.send(c);
    dc.write(1);
    spi.send(d);
    ce.write(1);
  }

  var LCD = Graphics.createCallback(LCD_WIDTH, LCD_HEIGHT, 16, {
    setPixel:function(x,y,c){
      writeCD(0x2A,[x>>8,x,(x+1)>>8,x+1]);
      writeCD(0x2B,[y>>8,y,(y+1)>>8,y+1]);
      writeCD(0x2C,[c>>8,c]);
    },
    fillRect:function(x1,y1,x2,y2,c){
      var cnt = (x2 - x1 + 1) * (y2 - y1 + 1);
      writeCD(0x2A,[x1>>8,x1,x2>>8,x2]);
      writeCD(0x2B,[y1>>8,y1,y2>>8,y2]);
      writeCMD(0x2C);
      c = String.fromCharCode(c>>8)+String.fromCharCode(c);
      var cl = c+c+c+c;
      cl = cl+cl;
      var cn = cnt>>3;
      while (cn--)spi.send(cl);
      cl = [c>>8,c,c>>8];
      cn = cnt&7;
      while (cn--)spi.send(c);
      ce.write(1);
    }
  });

  ce.write(1);
  dc.write(1);
  rst.write(0);
  setTimeout(function(){
    rst.write(1);
    setTimeout(function(){
      writeCMD(0x01);
      setTimeout(function(){
        writeCMD(0x28);ce.write(1);
        writeCD(0xCF,[0x00,0x83,0x30]);
        writeCD(0xED,[0x64,0x03,0x12,0x81]);
        writeCD(0xE8,[0x85,0x01,0x79]);
        writeCD(0xCB,[0x39,0x2C,0x00,0x34,0x02]);
        writeCD(0xF7,0x20);
        writeCD(0xEA,[0x00,0x00]);
        writeCD(0xC0,0x26);
        writeCD(0xC1,0x11);
        writeCD(0xC5,[0x35,0x3E]);
        writeCD(0xC7,0xBE);
        writeCD(0x36,0x48);
        writeCD(0x3A,0x55);
        writeCD(0xB1,[0x00,0x1B]);
        writeCD(0xF2,0x08);
        writeCD(0x26,0x01);
        writeCD(0xE0,[0x1F,0x1A,0x18,0x0A,0x0F,0x06,0x45,0x87,0x32,0x0A,0x07,0x02,0x07,0x05,0x00]);
        writeCD(0xE1,[0x00,0x25,0x27,0x05,0x10,0x09,0x3A,0x78,0x4D,0x05,0x18,0x0D,0x38,0x3A,0x1F]);
        writeCD(0xB7,0x07);
        writeCD(0xB6,[0x0A,0x82,0x27,0x00]);
        writeCMD(0x11);ce.write(1);
        setTimeout(function(){
          writeCMD(0x29);ce.write(1);
          setTimeout(function(){
            if (callback!==undefined) callback();
          },100);
        },100);
      },5);
    },5);
  },1);
  
  return LCD;
};
