  /* Copyright (C) 2014-2015 Spence Konde. See the file LICENSE for copying permission. */
  /*
This module interfaces with I2C EEPROMs, like the AT24C256. 

This only supports EEPROMs with 16-bit addressing (up to 2mbit/256kbyte), not the low-capacity ones that use part of the device address for addressing. 1 mbit devices use the low bit of address for the memory address, and 2mbit devices use the two low bits; on these parts, the address pins control the high bits of i2c address. 


Usage: 

Setup I2C, then call:

var eeprom=require("AT24").connect(i2c, pagesize, capacity, i2caddress)

i2c is the i2c bus. 

pagesize is the page size for page writes. 

capacity is the eeprom capacity, in kbits. 

i2caddress is the value of the address pins (A0, A1, and (on AT24CxxxB) A2 pins on on EEPROM). This is optional - it defaults to 0 (all pins grounded), and in any event, can be specified in all of the read/write methods, in order to support multiple eeproms on one I2C bus. 

eeprom.read(address,bytes,asStr)
Read the specified number of bytes. If asStr is true, it will return the value as a string, and will perform the read in chunks of 64 bytes to control memory usage. 

eeprom.write(address,data)
Write the specified data starting at the specified address. Writes that cross page boundaries are handled transparently.  


*/


exports.connect = function(i2c, pgsz, cap, i2ca) {
	if (cap > 2048 || !cap || (cap==1024&&(i2ca&1)) || (cap==2048&&(i2ca&3)) ){
		throw "i2ca invalid for that capacity";
	}
    return new AT24(i2c, pgsz, cap, i2ca);
};

function AT24(i2c, pgsz, cap, i2ca) {
  this.i2c = i2c;
  this.i2ca = (i2ca===undefined) ? 0x50 : 0x50|(i2ca&0x07);
  this.pgsz=pgsz?pgsz:0;
  this.cap=cap<<7;
  this.ca=0;
}

AT24.prototype.a=function(b) {return (this.cap>2048)?E.toString([b>>8,b]):E.toString(b);}; //
AT24.prototype.i=function(a) {return this.i2ca|(a>>((this.cap>2048)?16:8))}; //get the i2c address from the address

AT24.prototype.read= function(add,bytes) {
	if (add!==undefined) {
		this.i2c.writeTo(this.i(add),this.a(add));
	}
	var ov=this.i2c.readFrom(this.i(add),bytes);
	return ov;
	
};

AT24.prototype.write= function(add,data) {
	if(typeof data!="string"){data=E.toString(data);}
	var idx=0;
	while (idx < data.length) {
		var i=this.pgsz?(this.pgsz-(add%this.pgsz)):data.length;
		this.i2c.writeTo(this.i(add),this.a(add)+data.substr(idx,i));
		var et=getTime()+0.012;
		while (getTime() < et && this.pgsz) {"";}
		idx+=i; add+=i;
	}
	return data.length;
}
