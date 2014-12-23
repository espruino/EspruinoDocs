  /* Copyright (C) 2014 Spence Konde. See the file LICENSE for copying permission. */
  /*
This module interfaces with I2C EEPROMs, like the AT24C256. 

This only supports EEPROMs with 16-bit addressing (up to 512kbit/64kbyte), not the low-capacity ones that use part of the device address for addressing. 

Usage: 

Setup I2C, then call:

var eeprom=require("AT24").connect(i2c, pagesize, capacity, i2caddress)

i2c is the i2c bus. 

pagesize is the page size for page writes. 

capacity is the eeprom capacity, in kbits. 

i2caddress is the value of the address pins (A0, A1, and (on AT24CxxxB) A2 pins on on EEPROM). This is optional - it defaults to 0 (all pins grounded), and in any event, can be specified in all of the read/write methods, in order to support multiple eeproms on one I2C bus. 

eeprom.read(address,bytes)
eeprom.readc(bytes)           -Continues read from where it last read from. 
eeprom.reads(address,bytes)   -works like read(), but reads 64 bytes at a time and converts to string. 
eeprom.writes(address,data)   -writing a string is faster than an array, as we have to convert the array to a string. 
eeprom.writeb(address,data)
eeprom.writel(address,data)   -write long block of data (more than 1 page), supplied as string. 

address: address to start the read at. For example, 0x05c0 
bytes: number of bytes to read. 
data: Data to write. For writeb(), this is an array of bytes (up to page size). For writes(), this is a string (no longer than page size). For writel(), this is a string of any length that will fit on the eeprom.

It is recommended to write a page at a time, starting from the start of the page. 

WARNING: I2C.readFrom() returns data as a simple array, which takes up 2 memory units per byte - for this reason, read operations must be done in chunks. The eeprom.readc() function will probably prove useful for this. 

Additionally, this includes the helper function, which converts arrays of bytes to strings:
eeprom.aToS(array);

*/


exports.connect = function(i2c, pgsz, cap, i2ca) {
	if (cap > 512 || !cap || !pgsz || pgsz > cap) {
		console.log("Unsupported or invalid options");
		return;
	}
    return new AT24(i2c, pgsz, cap, i2ca);
};

function AT24(i2c, pgsz, cap, i2ca) {
  this.i2c = i2c;
  this.i2ca = (i2ca===undefined) ? 0 : i2ca&0x07;
  this.pgsz=pgsz;
  this.cap=cap<<7;
  this.ca=0;
}

AT24.prototype.aToS= function(a) {
  var s = "";
  for (var i in a)
    s+=String.fromCharCode(a[i]);
  return s;
};

AT24.prototype.read= function(add,bytes) {
	if (add+bytes>this.cap-1) {
		return;
	}
	this.ca=add+bytes;
	this.i2c.writeTo(0x50|this.i2ca,[add>>8&0xff,add&0xff]);
	return this.i2c.readFrom(0x50|this.i2ca,bytes);
};

AT24.prototype.readc= function(bytes){
	if (this.ca+bytes>this.cap-1) {
		return;
	}
	this.ca+=bytes; 
	return this.i2c.readFrom(0x50|this.i2ca,bytes);
};

AT24.prototype.reads= function(add,bytes) {
	if (add+bytes>this.cap-1) {
		return;
	}
	this.ca=add+bytes;
	this.i2c.writeTo(0x50|this.i2ca,[add>>8&0xff,add&0xff]);
	var outval="";
	while (bytes > 0) {
		var b=64;
		if (bytes >= 64) {
			bytes-=64;
		} else {
			b=bytes;
			bytes=0;
		}
		outval=outval+this.aToS(this.i2c.readFrom(0x50|this.i2ca,b));
	}
	return outval;
};


AT24.prototype.writes= function(add,data) {
	if (data.length > this.pgsz) {
		return;
	}
	data=this.aToS([add>>8&0xff,add&0xff])+data;
	this.i2c.writeTo(0x50|this.i2ca,data);
	return 1;	
}
AT24.prototype.writeb= function(add,data) {
	if (data.length > this.pgsz) {
		return;
	}
	data=this.aToS([add>>8&0xff,add&0xff])+this.arrayToString(data);
	this.i2c.writeTo(0x50|this.i2ca,data);
	return 1;
}
AT24.prototype.writel= function(addr,data) {
	var idx=0;
	while (idx < data.length) {
		this.writes(addr+idx,data.substr(idx,this.pgsz),this.i2ca);
		var et=getTime()+0.01;
        	var x;
		while (getTime() < et) { //delay(100)
			x = 5^5; 
		}
		idx+=this.pgsz;
	}
	return data.length;
}
