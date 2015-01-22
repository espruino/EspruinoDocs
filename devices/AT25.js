  /* Copyright (C) 2014 Spence Konde. See the file LICENSE for copying permission. */
  /*
This module interfaces with SPI EEPROMs, like the AT24C256. 

This supports all AT25-compatible SPI eeproms, as well as compatible FRAM devices.

Usage: 

Setup SPI, then call:

var eeprom=require("AT25").connect(spi, pagesize, capacity, cspin)

spi is the spi bus. 

pagesize is the page size for page writes. 

capacity is the eeprom capacity, in kbits. 

cspin is the pin connected to CS on the EEPROM

eeprom.read(address,bytes,asStr)
Read the specified number of bytes. If asStr is true, it will return the value as a string, and will perform the read in chunks of 64 bytes to control memory usage. Unlike I2C EEPROMs, address must be supplied. 

eeprom.write(address,data)
Write the specified data starting at the specified address. Writes that cross page boundaries are handled transparently.  


*/


exports.connect = function(spi, pgsz, cap, cspin) {
	if (cap > 4096 || !cap || pgsz > cap || !cspin) {
		throw "Unsupported or invalid options";
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


AT25.prototype.read= function(add,bytes) {
	if (add===undefined) {
		add=this.ca;
	}
	t=(this.cap>65536)?E.toString(3,add>>16&0xff,add>>8&0xff,add&0xff):E.toString(3,add>>8&0xff,add&0xff)
	var ov=this.spi.send(t,this.cspin);
	var o=new Uint8Array(ov.buffer,(this.cap>65536?4:3),bytes);
	this.ca=add+bytes;
	return o;
}


AT25.prototype.write= function(add,data,num) {
	if(typeof data!="string"){data=E.toString(data);}
	var idx=0;
	while (idx < data.length) {
		this.spi.send(6,this.cspin); //WREN
		var i=(this.pgsz-(add%this.pgsz))
  		console.log(this.spi.send([5,0],this.cspin));
		t=(this.cap>65536)?E.toString(2,add>>16&0xff,add>>8&0xff,add&0xff):E.toString(2,add>>8&0xff,add&0xff)
		t=t+data.substr(idx,i);
		this.spi.send(t,this.cspin)
		var et=getTime()+0.012;
		while (getTime() < et) {"";}
		idx+=i; add+=i;
	}
	return data.length;
}

