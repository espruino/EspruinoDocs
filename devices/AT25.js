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

Additionally, this includes the helper function, which converts arrays of bytes to strings:
eeprom.aToS(array);

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

AT25.prototype.aToS= function(a) {
  var s = "";
  for (var i in a)
    s+=String.fromCharCode(a[i]);
  return s;
};


AT25.prototype.read= function(add,bytes,asStr) {
	if (add===undefined) {
		add=this.ca;
	}
	t=new Uint8Array(bytes+(this.cap>65536?4:3));
	t[0]=3;//READ
	if (this.cap>65536){t[1]=add>>16&0xff;t[2]=add>>8&0xff;t[3]=add&0xff;} else {t[1]=add>>8&0xff;t[2]=add&0xff;}
	var ov=this.spi.send(t,this.cspin);
	var o=new Uint8Array(ov.buffer,(this.cap>65536?4:3),bytes);
	this.ca=add+bytes;
	return (asStr)?this.aToS(o):o;
}


AT25.prototype.write= function(add,data,num) {
	if(typeof data=="object"){data=this.aToS(data);}
	if (data.length > (this.pgsz-(add%this.pgsz))) {
		var idx=0;
		while (idx < data.length) {
			this.spi.send(6,this.cspin); //WREN
			var i=(this.pgsz-(add%this.pgsz))
  			t=new Uint8Array((this.cap>65536)?4:3);
  			console.log(this.spi.send([5,0],this.cspin));
			t[0]=2;//WRITE
			if (this.cap>65536){t[1]=add>>16&0xff;t[2]=add>>8&0xff;t[3]=add&0xff;} else {t[1]=add>>8&0xff;t[2]=add&0xff;}
			t=this.aToS(t)+data.substr(idx,i);
			this.spi.send(t,this.cspin)
			var et=getTime()+0.012;
			while (getTime() < et) {"";}
			idx+=i; add+=i;
		}
	} else {
		this.sp .send(6,this.cspin); //WREN
		t=new Uint8Array((this.cap>65536)?4:3);
		t[0]=2;//WRITE
		if (this.cap>65536){t[1]=add>>16&0xff;t[2]=add>>8&0xff;t[3]=add&0xff;} else {t[1]=add>>8&0xff;t[2]=add&0xff;}
		this.spi.send(this.aToS(t)+data,this.cspin)
	}
	return data.length;
}

