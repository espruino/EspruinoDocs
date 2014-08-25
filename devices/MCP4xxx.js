  /* Copyright (C) 2014 Spence Konde. See the file LICENSE for copying permission. */
  /*
This module interfaces with I2C and SPI Digital Potentiometers from Microchip. It is intended to work with the following parts: MCP41xx, 42xx, 43xx, and the high voltage MCP41HVxx via SPI, and MCP44xx, 45xx, 46xx via I2C.   

Usage:


var digipot=require("MCP4xxx").connectI2C(i2c,pots,taps,addr)

or

var digipot=require("MCP4xxx").connectSPI(spi,cs,pots,taps)


i2c:  (I2C only) The I2C interface to use
addr: (I2C only) Supported digipots may dedicate 0, 1, 2, or 3 pins to setting the address. If using a device with fewer than 3, consult the datasheet to make sure you are passing the right address. Typically, if there is no address pin present for an address bit, that bit is a 1, not a zero. 
spi: (SPI only) The SPI interface to use
cs: (SPI only) The pin connected to the CS line of the digipot.
taps: Number of taps on the pot. 129 or 257 for I2C, 129, 257, 128 or 256 for SPI.
pots: Number of pots in the package. 1, 2, or 4.



digipot.setVal(pot,value,nv) //set the current wiper position. 

pot: Number of the potentiometer (or rheostat) in the device being controlled - 0, 1, 2, or 3. Not all supported devices have 4 potentiometers.
value: is the current wiper position of the pot.
nv: Set this to 1 to read or write the non-volatile memory, if supported on your device. In parts with NV memory, the NV memory is used to initialize the wiper position at power on.

digipot.getVal(pot,nv) //get the current wiper position
digipot.incr(pot)  //Increment pot
digipot.decr(pot)  //Decrement pot

digipot.getStatus()
Returns an object with the contents of the status register, and tcon information for all pots.

digipot.setTCON(pot,sdwn,a,w,b)
Set the terminal connections for the specified pot. The 4 arguments should be 0 or 1 (default)
sdwn: Shutdown mode -  1: Normal operation mode. 0: Shut-down mode
a, w, b: Controls whether the 3 pins are connected to the resistor ladder. 1 (default) connects that pin to the resistor ladder.

*/


exports.connectI2C = function(i2c,pots,taps,addr) {
	if ((taps==129 || taps == 257)&& pots < 5 && pots > 0)
	{
	    return new MCP4xxx(pots,taps,undefined,undefined,i2c,(addr==undefined ? 0x28 : 0x28|addr));
	}
	throw "Unsupported part";
};

exports.connectSPI = function(spi,cs,pots,taps) {
	if ((taps==129 || taps == 257 || taps==128 || taps==256 )&& pots < 5 && pots > 0)
	{
	    return new MCP4xxx(pots,taps,spi,cs);
	}
	throw "Unsupported part";
};

function MCP4xxx(pots,taps,spi,cs,i2c,addr) {
  this.taps = taps;
  this.pots = pots;
  this.spi = spi;
  this.cs = cs;
  this.i2c = i2c;
  this.i2ca = addr;
}

MCP4xxx.prototype.setVal= function(pot,value,nv) {
	nv = (nv===undefined) ? 0 : nv;
	if (val >= this.taps || val < 0) {
		throw "Out of range";
	} else {
		this.CMD((pot<2?0:4)+pot+nv*2,0,value);
	}
};

MCP4xxx.prototype.incr = function(pot) {
	this.CMD((pot<2?0:4)+pot,1,value);
}

MCP4xxx.prototype.decr = function(pot) {
	this.CMD((pot<2?0:4)+pot,2,value);
}

MCP4xxx.prototype.getVal= function(pot,nv) {
	nv = (nv===undefined) ? 0 : nv;
	if (val > this.taps || val < 0) {
		throw "Invalid value provided";
	} else {
		var temp= this.CMD((pot<2?0:4)+pot+nv*2,3);
		return temp[1]+(this.taps==257 ? (temp[0]&0x01)<<8:0);
	}
};

MCP4xxx.prototype.setTCON = function(pot,sdwn,a,w,b) {
	var padr=(pot<2?4:10);
	var olddat=this.CMD(padr,3);
	this.CMD(padr,0,((((sdwn<<3)+(a<<2)+(w<<1)+b) << (pot&0x01==1?4:0))+(olddat[1]&(pot&0x01==1?7:240))));
}

MCP4xxx.prototype.getStatus = function() {
	var retobj={};
	var tcon0=this.CMD(4,3,0);
	if (this.pots > 2) {
		var tcon1=this.CMD(10,3,0);
		retobj.pot2=(tcon1[1]&0xF0)>>4;
		retobj.pot3=(tcon1[1]&0x0F);
	}
	status=this.CMD(5,3,0)
	retobj.status=status[1]+((status[0]&3)<<8);
	retobj.pot0=(tcon0[1]&0xF0)>>4;
	retobj.pot1=(tcon0[1]&0x0F);
	return retobj;
}

MCP4xxx.prototype.CMD= function(pad,cmd,data) {
	if (pad+cmd+data==NaN) {
		throw "Invalid parameter";
	} else {
		var b1=(pad << 4)|(cmd << 2);
		var dout;
		if (cmd==1||cmd==2) {
			dout=(pad<<4)|(cmd<<2);
		} else {
			dout=[(pad << 4)|(cmd << 2)|(data>>8),(cmd==3?0:data&255)];
		}
		if (this.spi!=undefined) {
			return this.spi.send(dout,this.cs);
		} else {
			this.i2c.writeTo(this.i2ca,b1);
			if (cmd==3) {
				return this.i2c.readFrom(this.i2ca,2);
			}
		}
	}
};
