  /* Copyright (C) 2014 Spence Konde. See the file LICENSE for copying permission. */
  /*
This module interfaces with an HMC5883 Compass/Magnetometer, a cheap I2C magnetometer. 

Usage:
Setup I2C, then call:
var compass = require("HMC5883").connect(i2c,drdy,mode)

i2c is the I2C it is connected to, drdy is the pin that drdy is connected to. 

read in single measurement mode:

compass.reads(function(a){print(a);});

read in continuous measurement mode:
compass.setMode(0);
console.log(compass.readc());

*/



exports.connect = function(i2c,drdy,mode) {
    return new HMC5883(i2c,drdy,mode);
}

function HMC5883(i2c,drdy,mode) {
  this.i2c = i2c;
  this.mode = (typeof mode !== 'undefined') ? mode : 1;
  this.drdy = drdy;
  this.a=0x1E;
  pinMode(drdy,'input');
  this.i2c.writeTo(this.a,1);
  this.gain=(this.i2c.readFrom(this.a,1)[0])>>5;
  this.ngain=this.gain;
  this.i2c.writeTo(this.a,[2,this.mode]);
  this.scale=new Float32Array([0.73,0.92,1.22,1.52,2.27,2.56,3.03,4.35]);
}


HMC5883.prototype.readc = function() {
	this.i2c.writeTo(this.a,3);
	var f=this.scale[this.gain];
	this.gain=this.ngain;
	var gdat = this.i2c.readFrom(this.a,6);
	var x = (gdat[0] << 8) | gdat[1];
	var y = (gdat[2] << 8) | gdat[3];
	var z = (gdat[4] << 8) | gdat[5];
	x=(x>=32767) ? x - 65536 : x;
	y=(y>=32767) ? y - 65536 : y;
	z=(z>=32767) ? z - 65536 : z;
	var o=(x==-4096 || y==-4096 || z==-4096);
	return {x:x*f, y:y*f, z:z*f, overflow:o};
}

HMC5883.prototype.setMode = function(mode) {
	this.i2c.writeTo(this.a,[2,(mode & 0x03)]);
    	this.mode=mode&0x03;
}

HMC5883.prototype.setup = function(sample,dout,ms) {
	ms=(ms) ? ms&3 : 0;
	dout=(typeof dout !== 'undefined') ? dout&7 : 4;
	sample=sample&3;
	this.i2c.writeTo(this.a,[0,ms|(dout<<2)|(sample<<5)]);
}

HMC5883.prototype.setGain = function(gain) {
	this.i2c.writeTo(this.a,[1,((gain & 7)<<5)]);
	this.i2c.writeTo(this.a,1);
    	this.ngain=(this.i2c.readFrom(this.a,1)[0])>>5;
    	if (this.mode === 1) {
		var hmc=this;
		setWatch(function(){hmc.readc();},this.drdy);
    	}
}

HMC5883.prototype.reads = function(c) {
	this.onwatch=c;
	var hmc=this;
	setWatch(function(){hmc.onwatch(hmc.readc());},this.drdy);
	this.setMode(1);
}
