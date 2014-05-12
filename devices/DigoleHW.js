/* Copyright (c) 2014 Spence Konde. See the file LICENSE for copying permission. */
/* 
Module for the Digole 182x64 pixel monochrome display. This uses the hardware graphics commands wrapped to work like the normal graphics library, where possible. 

In order to set up the hardware, you must short the two solder-points marked I2C, and add two 10k resistors, between +3.3v and the SDA and SCL lines. 



There is no double buffer. 

Most of the normal graphics commands work. All have an optional last argument, DM. If defined, the specified logical operation will be applieed to the pixels relative to the existing pixed - "!", "~" : Not, "|": or, "^": xor, "&" and. 

setRotation() - second argument ignored. 

drawImage() - rows must by multiple of 8 in length.

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
  i2c.writeTo(0x27,"CL");
  LCD.width=width;
  LCD.setColor(1);
  LCD.height=height;
  LCD.drawString = function(s,x,y,dm) {
  	if (dm) {this.i2c.writeTo(0x27,"DM"+dm)}
  	this.i2c.writeTo(0x27,"TP"+String.fromCharCode(x,y));
  	this.i2c.writeTo(0x27,"TT"+s+"\x00");
  };
  LCD.drawLine = function(x1,y1,x2,y2,dm) {
  	if (dm) {this.i2c.writeTo(0x27,"DM"+dm)}
  	this.i2c.writeTo(0x27,"LN"+String.fromCharCode(x1,y1,x2,y2));
  };
  LCD.drawRect = function(x1,y1,x2,y2,dm) {
  	if (dm) {this.i2c.writeTo(0x27,"DM"+dm)}
  	this.i2c.writeTo(0x27,"DR"+String.fromCharCode(x1,y1,x2,y2));
  };
  LCD.fillRect = function(x1,y1,x2,y2,dm) {
  	if (dm) {this.i2c.writeTo(0x27,"DM"+dm)}
  	this.i2c.writeTo(0x27,"FR"+String.fromCharCode(x1,y1,x2,y2));
  };
  LCD.setColor = function(col) {this.i2c.writeTo(0x27,"SC"+String.fromCharCode(col));this.col=col;};
  LCD.setPixel= function(x,y,col,dm) {
  	if (dm) {this.i2c.writeTo(0x27,"DM"+dm)}
  	if (col != this.col){
  		this.i2c.writeTo(0x27,"SC"+String.fromCharCode(col);
  	}
  	this.i2c.writeTo(0x27,"DP"+String.fromCharCode(x,y));
  	if (col != this.col){
  		this.i2c.writeTo(0x27,"SC"+String.fromCharCode(this.col);
  	}
  ;}
  LCD.setRotation=function(ro,re) {
  	this.i2c.writeTo(0x27,"SD"+String.fromCharCode("ro");
  }
  LCD.drawCircle=function(x,y,r,f,dm){
  	if (dm) {this.i2c.writeTo(0x27,"DM"+dm)}
	this.i2c.writeTo(0x27,"CC"+String.fromCharCode(x,y,r,f));

  }
  LCD.setLinePattern = function (p) {
  	this.i2c.writeTo(0x27,"SLP"+String.fromCharCode(p);
  }
  LCD.getWidth = function() {return this.width;};
  LCD.getHeight=function() {return this.height;};
  LCD.setFont = function(f) {this.i2c.writeTo(0x72,"SF"+string.fromCharCode(f));};
  LCD.drawImage = function(image,x,y,dm) {
  	if (dm) {this.i2c.writeTo(0x27,"DM"+dm)}
  	var d = new Uint8Array(image.buffer.length+7);
    d.set(E.toArrayBuffer("DIM"+string.fromCharCode(x,y,image.width,image.height)),0);
    d.set(new Uint8Array(this.buffer).map(E.reverseByte), 7);
    this.i2c.writeTo(0x27,d);
  };
  LCD.clear()=function() {i2c.writeTo(0x27,"CL");};
  LCD.moveArea=function(x,y,w,h,xo,yo) {this.i2c.writeTo(0x27,"MAA"+String.fromCharCode(x,y,w,h,xo,yo));}
  LCD.writeByte =function (b) {this.i2c.writeTo(0x27,"DOUT"+String.fromCharCode(b));}; 
  LCD.setContrast =function(c){this.i2c.writeTo(0x27,"SC"+String.fromCharCode(c));};
  return LCD;
};
