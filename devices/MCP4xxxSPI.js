  /* Copyright (C) 2014 Spence Konde. See the file LICENSE for copying permission. */
  /*
This module interfaces with most SPI Digital Potentiometers from Microchip. It should work with any part numbers of the form MCP41xx, MCP42xx, MCP43xx, including the high voltage MCP41HVx1 series. It does not work with the less capable MCP4xxx0 series, which uses a different protocol. 

Usage:


var digipot=require("MCP4xxxSPI").connect(SPI1,pots,taps,addr)

pots: Number of pots in the package. 1, 2, or 4.
taps: Number of taps on the pot. 128, 129, 256, or 257.
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


exports.connect = function(spi,cs,pots,taps) {
	if ((taps==129 || taps == 257 || taps==128 || taps==256 )&& pots < 5 && pots > 0)
	{
	    return new MCP4xxxSPI(spi, cs, pots,taps);
	}
	throw "Only 129 or 257 tap devices with 1-4 pots supported.";
};

function MCP4xxxSPI(spi, cs, pots , taps) {
  this.taps = taps;
  this.pots = pots;
  this.spi = spi;
  this.cs = cs;
}

MCP4xxxSPI.prototype.getReg = function (pot,nv) {
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

MCP4xxxSPI.prototype.setVal= function(pot,value,nv) {
	nv = (nv===undefined) ? 0 : nv;
	if (val >= this.taps || val < 0) {
		throw "Invalid value provided";
	} else {
		var padr=this.getReg(pot,nv);
		this.CMD(padr,0,value);
	}
};

MCP4xxxSPI.prototype.incr = function(pot) {
	var padr=this.getReg(pot,0);
	this.CMD(padr,1,value);
}

MCP4xxxSPI.prototype.decr = function(pot) {
	var padr=this.getReg(pot,0);
	this.CMD(padr,2,value);
}

MCP4xxxSPI.prototype.getVal= function(pot,nv) {
	nv = (nv===undefined) ? 0 : nv;
	if (val > this.taps || val < 0) {
		throw "Invalid value provided";
	} else {
		var padr=this.getReg(pot,nv);
		var temp= this.CMD(padr,3);
		return temp[1]+((temp[0]&0x01)<<8);
	}
};
MCP4xxxSPI.prototype.setTCON = function(pot,sdwn,a,w,b) {
	if (pot < 2) {
		var padr=4;
	} else {
		var padr=10;
		pot-=2
	}
	var olddat=this.CMD(padr,3);
	var data=((sdwn<<3)+(a<<2)+(w<<1)+b);
	if (pot==1) {
		data = (data <<4) + (olddat[1]&0x0F);
	} else {
		data += olddat[1]&0xF0;
	}
	this.CMD(padr,0,data);
}

MCP4xxxSPI.prototype.getStatus = function() {
	var retobj={};
	var tcon0=this.spi.send([0x4C,0x00],this.cs);
	status=status[1]+(status[0]<<8)
	if (this.pots > 2) {
		var tcon1=this.spi.send([0xAC,0x00],this.cs);
		retobj.pot2=(tcon1[1]&0xF0)>>4;
		retobj.pot3=(tcon1[1]&0x0F);
	}
	retobj.status=this.spi.send([0x5C,0x00],this.cs);
	retobj.pot0=(tcon0[1]&0xF0)>>4;
	retobj.pot1=(tcon0[1]&0x0F);
	return retobj;
}

MCP4xxxSPI.prototype.CMD= function(pad,cmd,data) {
	var b1=(pad << 4)|(cmd << 2);
	if (data==256) {
		b1+=1;
	} 
	if (cmd==0) 
	{
		this.spi.send([b1,(data&0xff)],this.cs);
	} else if (cmd != 3) {
		this.spi.send(b1,this.cs);
	} else if (cmd == 3 ) {
		return this.spi.send([b1,0x00],this.cs);
	}
};
