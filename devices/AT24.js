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

eeprom.read(address,bytes,i2caddress)
eeprom.readc(bytes,i2caddress)           -Continues read from where it last read from. 
eeprom.reads(address,bytes,i2caddress)   -works like read(), but reads 64 bytes at a time and converts to string. 
eeprom.writes(address,data,i2caddress)   -writing a string is faster than an array, as we have to convert the array to a string. 
eeprom.writeb(address,data,i2caddress)

address: address to start the read at. For example, 0x05c0 
bytes: number of bytes to read. 
data: Data to write. For writeb(), this is an array of bytes. For writes(), this is a string. wr
i2caddress: Optional - if specified, this is the value of the address pins, otherwise, uses the value specified in the initial connect call, or 0 if nothing was specified. 

It is recommended to write a page at a time, starting from the start of the page. 

WARNING: I2C.readFrom() returns data as a simple array, which takes up 2 memory units per byte - for this reason, read operations must be done in chunks. The eeprom.readc() function will probably prove useful for this. 

Additionally, this includes the helper function:
eeprom.arrayToString(array);

*/


exports.connect = function(i2c, pgsz, cap, i2ca) {
	if (cap > 512 || !cap || !pgsz || pgsz > cap) {
		console.log("Unsupported or invalid options");
		return;
	}
    return new EEPROM(i2c, pgsz, cap, i2ca);
};

function EEPROM(i2c, pgsz, cap, i2ca) {
  this.i2c = i2c;
  this.i2ca = (i2c==Undefined) ? 0 : i2ca&0x07;
  this.pgsz=pgsz;
  this.cap=cap<<7;
  this.ca=0;
}

EEPROM.prototype.arrayToString= function(a) {
  var s = "";
  for (var i in a)
    s+=String.fromCharCode(a[i]);
  return s;
};

EEPROM.prototype.read= function(add,bytes,i2ca) {
	i2ca = (i2ca==undefined) ? this.i2ca : i2ca;
	if (add+bytes>this.cap-1) {
		return;
	}
	if (i2ca==this.i2ca) {
		this.ca=add+bytes;
	}
	this.i2c.writeTo(0x50|i2ca,[add>>8&0xff,add&0xff]);
	return this.i2c.readFrom(0x50|i2ca,bytes);
};

EEPROM.prototype.readc= function(bytes,i2ca){
	i2ca = (i2ca==undefined) ? this.i2ca : i2ca;
	if (i2ca==this.i2ca) {
		if (this.ca+bytes>this.cap-1) {
			return;
		}
		this.ca+=bytes;
	} 
	return this.i2c.readFrom(0x50|i2ca,bytes);
};

EEPROM.prototype.reads= function(add,bytes,i2ca) {
	i2ca = (i2ca==undefined) ? this.i2ca : i2ca;
	if (add+bytes>this.cap-1) {
		return;
	}
	if (i2ca==this.i2ca) {
		this.ca=add+bytes;
	}
	this.i2c.writeTo(0x50|i2ca,[add>>8&0xff,add&0xff]);
	var outval="";
	while (bytes > 0) {
		var b=64;
		if (bytes >= 64) {
			bytes-=64;
		} else {
			b=bytes;
			bytes=0;
		}
		outval=outval+this.arrayToString(this.i2c.readFrom(0x50|i2ca,b));
	}
	return outval;
};


EEPROM.prototype.writes= function(add,data,i2ca) {
	i2ca = (i2ca==undefined) ? this.i2ca : i2ca;
	if (data.length > this.pgsz) {
		return;
	}
	data=this.arrayToString([add>>8&0xff,add&0xff])+data;
	this.i2c.writeTo(0x50|i2ca,data);
	return 1;	
}
EEPROM.prototype.writeb= function(add,data,i2ca) {
	i2ca = (i2ca==undefined) ? this.i2ca : i2ca;
	if (data.length > this.pgsz) {
		return;
	}
	data=this.arrayToString([add>>8&0xff,add&0xff])+this.arrayToString(data);
	this.i2c.writeTo(0x50|i2ca,data);
	return 1;
}
