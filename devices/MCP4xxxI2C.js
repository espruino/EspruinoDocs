  /* Copyright (C) 2014 Spence Konde. See the file LICENSE for copying permission. */
  /*
This module interfaces with I2C Digital Potentiometers from Microchip. It is intended to work with the following parts, however, it is likely to work with other Microchip I2C digital potentiometers: MCP444x/443x/446x/445x/453x/455x/463x/465x/454x/456x/464x/466x

Usage:


var digipot=require("MCP4xxxI2C").connect(I2C2,pots,taps,addr)

pots: Number of pots in the package. 1, 2, or 4.
taps: Number of taps on the pot. 129 or 257.
addr: Supported digipots may dedicate 0, 1, 2, or 3 pins to setting the address. If using a device with fewer than 3, consult the datasheet to make sure you are passing the right address. Typically, if there is no address pin present for an address bit, that bit is a 1, not a zero. 



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


exports.connect = function(i2c,pots,taps,addr) {
	if ((taps==129 || taps == 257)&& pots < 5 && pots > 0)
	{
	    return new MCP4xxx(i2c, pots,taps,addr );
	}
	throw "Only 129 or 257 tap devices with 1-4 pots supported.";
};

function MCP4xxx(i2c, pots , taps, addr) {
  this.taps = taps;
  this.pots = pots;
  this.i2c = i2c;
  this.i2ca = (addr===undefined) ? 0x28 : 0x28|addr;
}

MCP4xxx.prototype.getReg = function (pot,nv) {
	if (pot > this.pots || pot < 0) {
		throw "Invalid pot number";
	} else {
		if (pot < 2) {
			return pot+(nv*2);
		} else {
			return pot+4+(nv*2);
		}
	}
}

MCP4xxx.prototype.setVal= function(pot,value,nv) {
	nv = (nv===undefined) ? 0 : nv;
	if (val >= this.taps || val < 0) {
		throw "Invalid value provided";
	} else {
		var padr=this.getReg(pot,nv);
		this.CMD(padr,0,value);
	}
};

MCP4xxx.prototype.incr = function(pot) {
	var padr=this.getReg(pot,0);
	this.CMD(padr,1,value);
}

MCP4xxx.prototype.decr = function(pot) {
	var padr=this.getReg(pot,0);
	this.CMD(padr,2,value);
}

MCP4xxx.prototype.getVal= function(pot,nv) {
	nv = (nv===undefined) ? 0 : nv;
	if (val > this.taps || val < 0) {
		throw "Invalid value provided";
	} else {
		var padr=this.getReg(pot,nv);
		this.CMD(padr,3);
	}
	var temp= this.i2c.readFrom(this.i2ca,2);
	return temp[1]+(temp[0]<<8);
};
MCP4xxx.prototype.setTCON = function(pot,sdwn,a,w,b) {
	if (pot < 2) {
		var padr=4;
	} else {
		var padr=10;
		pot-=2
	}
	this.CMD(padr,3);
	var olddat=this.i2c.readFrom(this.i2ca,2);
	var data=((sdwn<<3)+(a<<2)+(w<<1)+b);
	if (pot==1) {
		data = (data <<4) + (olddat[1]&0x0F);
	} else {
		data += olddat[1]&0xF0;
	}
	this.CMD(padr,0,data);
}

MCP4xxx.prototype.getStatus = function() {
	var retobj={};
	this.i2c.writeTo(this.i2ca,0x4C);
	var tcon0=this.i2c.readFrom(this.i2ca,2);
	this.i2c.writeTo(this.i2ca,0x5C)
	var status=this.i2c.readFrom(this.i2ca,2);
	status=status[1]+(status[0]<<8)
	if (this.pots > 2) {
		this.i2c.writeTo(this.i2ca,0xAC);
		var tcon1=this.i2c.readFrom(this.i2ca,2);
		retobj.pot2=(tcon1[1]&0xF0)>>4;
		retobj.pot3=(tcon1[1]&0x0F);
	}
	retobj.status=status;
	retobj.pot0=(tcon0[1]&0xF0)>>4;
	retobj.pot1=(tcon0[1]&0x0F);
	return retobj;
}

MCP4xxx.prototype.CMD= function(pad,cmd,data) {
	var b1=(pad << 4)|(cmd << 2);
	if (data==256) {
		b1+=1;
	} 
	if (cmd==0) 
	{
		this.i2c.writeTo(this.i2ca,[b1,(data&0xff)]);
	} else {
		this.i2c.writeTo(this.i2ca,b1);
	}
};
