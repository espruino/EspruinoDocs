  /* Copyright (C) 2014 Spence Konde. See the file LICENSE for copying permission. */
  /*
This module interfaces with an ADXL345 accelerometer

Usage:
Setup I2C, then call:
var accel = require("ADXL345").connect(i2c,cspin,range)

i2c is the I2C it is connected to, cspin is the pin that CS is connected to, since the ADXL345 doesn't seem to recognize that CS is high if it's high on startup. 
Range (default 0) is:
  | 0 | +/-2 g  |
  | 1 | +/-4 g  |
  | 2 | +/-8 g  |
  | 3 | +/-16 g |

Start measuring with:
accel.measure(true)

Read with:
accel.read()

*/



exports.connect = function(i2c,cspin,range) {
    return new ADXL345(i2c,cspin,range);
}

function ADXL345(i2c,cspin,range) {
  this.i2c = i2c;
  this.range = (range) ? range : 0;
  this.datarate = 0x0A;
  this.a=0x53;
  digitalWrite(cspin,1);
  this.i2c.writeTo(this.a,[0x31,0x08|range]);

}
ADXL345.prototype.setoffset = function(x,y,z){
	var xo=Math.round(E.clip(x/0.0156,-128,127));
	var yo=Math.round(E.clip(y/0.0156,-128,127));
	var zo=Math.round(E.clip(z/0.0156,-128,127));
	xo=(xo<0) ? xo+256 : xo;
	yo=(xo<0) ? yo+256 : yo;
	zo=(xo<0) ? zo+256 : zo;
	this.i2c.writeTo(this.a,[0x1E,xo,yo,zo]);
}

ADXL345.prototype.tap = function(thresh,dur,lat,win,axes) {
	var ax=(axes) ? axes : 0x07;
	var th=Math.round(E.clip(thresh/62.5,0,255));
	var du=Math.round(E.clip(dur/0.625,0,255));
	var la=Math.round(E.clip(lat/1.25,0,255));
	var wi=Math.round(E.clip(win/1.25,0,255));
	this.i2c.writeTo(this.a,[0x1D,th]);
	this.i2c.writeTo(this.a,[0x21,du,la,wi]);
	this.i2c.writeTo(this.a,[0x2A,ax]);
}

ADXL345.prototype.act = function(thact,thinact,tinact,actctl){
	var ac=(actctl) ? actctl : 0x77;
	var tha=Math.round(E.clip(thact/62.5,0,255));
	var thi=Math.round(E.clip(thinact/62.5,0,255));
	var ti=Math.round(E.clip(tinact,0,255));
	this.i2c.writeTo(this.a,[0x24,tha,thi,ti,ac]);
}

ADXL345.prototype.ff = function(thresh,time) {
	var th=Math.round(E.clip(thresh/62.5,0,255));
	var t=Math.round(E.clip(time/5,0,255));
	this.i2c.writeTo(this.a,[0x28,th,t]);
}

ADXL345.prototype.interrupts = function(enable,map) {
	this.i2c.writeTo(this.a,[0x2E,enable,map]);
}

ADXL345.prototype.getintinfo = function() {
	this.i2c.writeTo(this.a,0x2B);
	var d=this.i2c.readFrom(this.a,6);
	return {tap:d[0], interrupt:d[5]};
}
ADXL345.prototype.setup = function(rate,power) {
	this.i2c.writeTo(this.a,[0x2C,rate,(power & 0x37)]);
}

ADXL345.prototype.measure = function(m) {
	this.i2c.writeTo(this.a,[0x2D,m<<3]);
}

ADXL345.prototype.read = function() {
	this.i2c.writeTo(this.a,0x32);
	var gdat = this.i2c.readFrom(this.a,6)
	var x = (gdat[1] << 8) | gdat[0];
	var y = (gdat[3] << 8) | gdat[2];
	var z = (gdat[5] << 8) | gdat[4];
	x=(x>=32767) ? x - 65536 : x;
	y=(y>=32767) ? y - 65536 : y;
	z=(z>=32767) ? z - 65536 : z;
	return {x:x/256, y:y/256, z:z/256};
}

