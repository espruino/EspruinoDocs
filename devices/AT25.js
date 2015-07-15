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

eeprom.read(address,bytes)
Read the specified number of bytes as a Uint8Array. Presently this requires enough memory to fit the output array twice over due to limitations of SPI.send()

eeprom.write(address,data)
Write the specified data starting at the specified address. Writes that cross page boundaries are handled transparently.  


*/


exports.connect = function(spi, pgsz, cap, cspin) {
	if (cap > 4096 || !cap || pgsz > cap || !cspin) {
		throw "Unsupported or invalid options";
	}
	cspin.set(); //pull the CS line high. 
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
	var t=new Uint8Array(bytes+(this.cap>65536?4:3));
	var i=0;
	t[i++]=3;
	if(this.cap>65536){t[i++]=add>>16;}
	t[i++]=add>>8; 
	t[i]=add;
	var ov=this.spi.send(t,this.cspin);
	this.ca=add+bytes;
	return new Uint8Array(ov.buffer,(this.cap>65536?4:3),bytes);
}


AT25.prototype.write= function(add,data) {
	var l=data.length;
	if(typeof data!="string"){data=E.toString(data);}
	var idx=0;
	while (idx < l) {
		this.spi.send(6,this.cspin); //WREN
		var i=this.pgsz?(this.pgsz-(add%this.pgsz)):l;
		var t=(this.cap>65536)?E.toString(2,add>>16,add>>8,add):E.toString(2,add>>8,add);
		t=t+data.substr(idx,i);
		this.spi.send(t,this.cspin);
		var et=getTime()+0.012;
		while (getTime() < et && this.pgsz) {"";}
		idx+=i; add+=i;
	}
	return l;
}
