  /* Copyright (C) 2015 Spence Konde. See the file LICENSE for copying permission. */
  /*
This module interfaces with the Teos TCS3472x-series light color sensors (the units in this series vary only in I2C address and bus voltage). This module will also work with the 3471x-series, however, the proximity sensing functionality is not supported. This module does not (yet) support power saving features, or the enabling of interrupts.

Usage: 

Setup I2C, then call:

var tcs=require("TCS3472x").connect(I2C1)

Available functions are:

tcs.setGain(gain)

Sets the gain. gain is 1, 4, 16, or 60. 

tcs.setTime(int_cycles)

Sets the number of integration cycles to use, from 1 to 256, 2.4ms per cycle. More integration cycles gives a more accurate result, particularly in low-light conditions, and smooths out noise, but will also miss brief events.

tcs.getValue(); 

returns an object with properties clear, red, green, and blue, corresponding to the values measured by the color sensor. If the status register reports that there is not valid data available, all 4 values are returned as -1 to signify this error condition to the user.


*/


exports.connect = function(i2c,int_cycles,gain) {
    return new TCS3472x(i2c,int_cycles,gain);
};

function TCS3472x(i2c,int_cycles,gain) {
  this.i2c = i2c;
  if (int_cycles!==undefined) {
  	this.setTime(int_cycles);
  }
  if (gain!==undefined) {
  	this.setGain(gain);
  }
  this.i2c.writeTo(0x29,0xA0,3);
}


TCS3472x.prototype.setGain= function(gain) {
	if (gain==1||gain==4||gain==16||gain==60) {
		var g=(gain==1?0:(gain==4?1:(gain==16?2:3)));
		this.i2c.writeTo(0x29,0xAF,g);
	} else {
		throw "Invalid gain";
	}
};

TCS3472x.prototype.setTime= function(cycles) {
	var g=(256-E.clip(cycles,1,256));
	this.i2c.writeTo(0x29,0xA1,g);
};

TCS3472x.prototype.getValue= function() {
	this.i2c.writeTo(0x29,0xB3);
	var dat=this.i2c.readFrom(0x29,9);
	if (dat[0]|1) {
		var rval={};
		rval.clear=dat[1]+dat[2]<<8
		rval.red=dat[3]+dat[4]<<8
		rval.green=dat[5]+dat[6]<<8
		rval.blue=dat[7]+dat[8]<<8
		return rval;
	} else {
		return {"clear":-1,"red":-1,"green":-1,"blue":-1};
	}
};
