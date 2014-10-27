  /* Copyright (C) 2014 Spence Konde. See the file LICENSE for copying permission. */
  /*
This module interfaces with SPI EEPROMs, like the AT24C256. 

This only supports EEPROMs with 16-bit addressing (up to 512kbit/64kbyte), not the low-capacity ones that use part of the device address for addressing. 

Usage: 

Setup SPI, then call:

var eeprom=require("AT25").connect(spi, pagesize, capacity, cspin)

spi is the spi bus. 

pagesize is the page size for page writes. 

capacity is the eeprom capacity, in kbits. 

cspin is the pin connected to CS on the EEPROM

eeprom.read(address,bytes)
eeprom.reads(address,bytes)   -works like read(), but reads 64 bytes at a time and converts to string. 
eeprom.writes(address,data)   -writing a string is faster than an array, as we have to convert the array to a string. 
eeprom.writeb(address,data)
eeprom.writel(address,data)   -write long block of data (more than 1 page), supplied as string. 

address: address to start the read at. For example, 0x05c0 
bytes: number of bytes to read. 
data: Data to write. For writeb(), this is an array of bytes (up to page size). For writes(), this is a string (no longer than page size). For writel(), this is a string of any length that will fit on the eeprom.

It is recommended to write a page at a time, starting from the start of the page. 

WARNING: SPI.send() returns data as a simple array, which takes up 1 memory units per byte - for this reason, read operations must be done in chunks.

Additionally, this includes the helper function:
eeprom.aToS(array);

*/


exports.connect = function(spi, pgsz, cap, cspin) {
	if (cap > 512 || !cap || !pgsz || pgsz > cap || !cspin) {
		console.log("Unsupported or invalid options");
		return;
	}
    return new AT25(spi, pgsz, cap, cspin);
};

function AT25(spi, pgsz, cap, cspin) {
  this.spi = spi;
  this.cspin=cspin;
  this.pgsz=pgsz;
  this.cap=cap<<7;
  this.ca=0;
}

AT25.prototype.aToS= function(a) {
  var s = "";
  for (var i in a)
    s+=String.fromCharCode(a[i]);
  return s;
};

AT25.prototype.read= function(add,bytes) {
	if (add+bytes>this.cap-1) {
		throw "Bad address"
	} else {
		var cmd=new Uint8Array(bytes+3);
		cmd[0]=3;
		cmd[1]=add>>8;
		cmd[2]=add&0xff;
		var ret=this.spi.send(cmd,this.cspin);
		return new Uint8Array(ret.buffer,3,bytes);
	}
};

AT25.prototype.reads= function(add,bytes) {
	var outval="";
	while (bytes > 0) {
		var b=64;
		if (bytes >= 64) {
			bytes-=64;
		} else {
			b=bytes;
			bytes=0;
		}
		outval=outval+this.aToS(this.read(add,b));
		add+=b;
	}
	return outval;
};


AT25.prototype.writes= function(add,data) {
	if (data.length > this.pgsz) {
		throw "data too big";
	} else { 
		this.spi.send(6,this.cspin); //WREN
		var cmd=this.aToS([0x02,add>>8,add&0xFF])+data;
		this.spi.send(cmd,this.cspin);
		return 1;
	}
}
AT25.prototype.writeb= function(add,data) {
	return this.writes(add,this.aToS(data));
}
AT25.prototype.writel= function(addr,data) {
	var idx=0;
	while (idx < data.length) {
		this.writes(addr+idx,data.substr(idx,this.pgsz));
		var et=getTime()+0.01;
        	var x;
		while (getTime() < et) { //delay(100)
		}
		idx+=this.pgsz;
	}
	return data.length;
}
