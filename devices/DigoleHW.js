/* Copyright (c) 2014 Spence Konde. See the file LICENSE for copying permission. */
/* 
Module for the Digole 182x64 pixel monochrome display. This uses the hardware graphics commands wrapped to work like the normal graphics library, where possible. 

In order to set up the hardware, you must short the two solder-points marked I2C, and add two 10k resistors, between +3.3v and the SDA and SCL lines. 



There is no double buffer. 

Most of the normal graphics commands work. All have an optional last argument, DM. If defined, the specified logical operation will be applieed to the pixels relative to the existing pixed - "!", "~" : Not, "|": or, "^": xor, "&" and. 

setRotation() - second argument ignored. 

drawImage() - rows must by multiple of 8 in length. Slow. 

setFont() - argument is number 0, 6, 10, 18, 51, 120, 123 for the fonts they have available. 

There is no drawPoly(). 

Additional functions:

setLinePattern(p) - argument is 1 byte representing a pattern to apply to lines.

drawCircle(x,y,r,f,dm) - f is 1 for solid, 0 for unfilled

writeByte(b) - write a byte to the 8 output pins on the board.

moveArea(x,y,w,h,xoff,yoff) - Move a rectangular area to another place on the screen. 

Just:
```
I2C2.setup({scl:B10, sda:B11 });
var g=require("Digole").connect(I2C2,128,64)
g.drawString("LCD OK",50,26);

```  

 */
exports.connect = function(i2c,width,height) {
  var LCD = {}
  LCD.i2c=i2c;
  LCD.w=width;
  LCD.h=height;
  LCD.dr= function(cmd,dm) {
    if (dm) this.i2c.writeTo(0x27,"DM"+dm)
    this.s(cmd);
  };
  LCD.s=function(cmd) {this.i2c.writeTo(0x27,cmd);};
  LCD.drawString = function(s,x,y,dm) {
    this.s("ETP"+String.fromCharCode(x,y));
    this.dr("TT"+s+"\x00",dm);
  };
  LCD.setPixel= function(x,y,col,dm) {
    if (col != this.col){
      this.s("SC"+String.fromCharCode(col));
    }
    this.dr("DP"+String.fromCharCode(x,y),dm);
    if (col != this.col){
      this.s("SC"+String.fromCharCode(this.col));
    }
  ;}
  LCD.drawImage = function(image,x,y,dm) {
    var d = new Uint8Array(image.buffer.length+7);
    d.set(E.toArrayBuffer("DIM"+string.fromCharCode(x,y,image.width,image.height)),0);
    d.set(new Uint8Array(this.buffer).map(E.reverseByte), 7);
    this.dr(d,dm);
  };
  LCD.drawLine = function(x1,y1,x2,y2,dm) {this.dr("LN"+String.fromCharCode(x1,y1,x2,y2),dm);};
  LCD.drawRect = function(x1,y1,x2,y2,dm) {this.dr("DR"+String.fromCharCode(x1,y1,x2,y2),dm);};
  LCD.fillRect = function(x1,y1,x2,y2,dm) {this.dr("FR"+String.fromCharCode(x1,y1,x2,y2),dm);};
  LCD.lineTo = function(x,y,dm) {this.dr("LT"+String.fromCharCode(x,y),dm);};
  LCD.drawCircle=function(x,y,r,f,dm){this.dr("CC"+String.fromCharCode(x,y,r,f),dm);};
  LCD.setColor = function(col) {this.s("SC"+String.fromCharCode(col));this.col=col;};
  LCD.moveArea=function(x,y,w,h,xo,yo) {this.s("MA"+String.fromCharCode(x,y,w,h,xo,yo));}
  LCD.setRotation=function(ro,re) {this.s("SD"+String.fromCharCode(ro));};
  LCD.setLinePattern = function (p) {this.s("SLP"+String.fromCharCode(p));};
  LCD.getWidth = function() {return this.w;};
  LCD.getHeight=function() {return this.h;};
  LCD.setFont = function(f) {this.s("SF"+String.fromCharCode(f));};
  LCD.moveTo = function(x,y) {this.s("GP"+String.fromCharCode(x,y));}
  LCD.clear=function() {this.s("CL");};
  LCD.writeByte =function (b) {this.s("DOUT"+String.fromCharCode(b));}; 
  LCD.setContrast =function(c){this.s("CT"+String.fromCharCode(c));};
  LCD.setBacklight =function(c){this.s("BL"+String.fromCharCode(c));};
  LCD.setColor(1);
  LCD.clear();
  return LCD;
};
