/* Copyright (c) 2014 Spence Konde. See the file LICENSE for copying permission. */
/* 
Module for the Digole monochrome display controller. This uses a double-buffer for maximum compatibility with existing code. This does not take advantage of the digole hardware graphics support. 

In order to set up the hardware, you must short the two solder-points marked I2C, and add two 10k resistors, between +3.3v and the SDA and SCL lines. 

Just:
```
I2C2.setup({scl:B10, sda:B11 });
var g=require("DigoleBuf")
g.drawString("LCD OK",50,26);
g.flip();
```  

 */
exports.connect = function(i2c,width,height) {
	var LCD = Graphics.createArrayBuffer(width,height,1);
	LCD.i2c=i2c;
	i2c.writeTo(0x27,"CL");
	LCD.flip = function () {
		var d = new Uint8Array(this.buffer.length+7);
		d.set(E.toArrayBuffer("DIM\x00\x00\x80\x40"),0);
		d.set(new Uint8Array(this.buffer).map(E.reverseByte), 7);
		this.i2c.writeTo(0x27,d);
	};
	LCD.writeByte =function (b) {this.i2c.writeTo(0x27,"DOUT"+String.fromCharCode(b));}; 
	LCD.setContrast =function(c){this.i2c.writeTo(0x27,"CT"+String.fromCharCode(c));};
	LCD.setBacklight=function(b){this.i2c.writeTo(0x27,"BL"+String.fromCharCode(b));}
	return LCD;
};
