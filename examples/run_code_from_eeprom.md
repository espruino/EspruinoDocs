<!--- Copyright (c) 2015 Spence Konde. See the file LICENSE for copying permission. -->
Running code from an EEPROM
===============================

* KEYWORDS: EEPROM,AT24,AT25,storage
* USES: EEPROM

Introduction
-----------
Memory is one of the eternal limitations of computing, and the Espruino is no exception. Because Espruino does not compile the application code, and runs it from RAM, not flash, this problem can be especially acute on Espruino. However, because code is interpreted, that allows code to be stored in other mediums and easily run by Espruino, which is not possible on most microcontroller platforms. This shows an example of how one might store code on an EEPROM, and then call that code from elsewhere in your program. Because this requires preparing the EEPROM in advance, it's utility may be limited to code which does not change often. 

Concept
------------
In order to call these functions, we'll need a way to refer to a given function, and determine where it is on the EEPROM to execute it. We could pass the address that the function starts at, and it's length - but that means that every time the code on the EEPROM is modified, the application code has to change too. Instead, let's store a table in the EEPROM, using 4 bytes per entry - the first two will be the address, and the second two the length. In this example, it's started at an offset of 0x0100 (256), leaving the first 256 bytes free for general purpose storage. If we assume a limit of 192 functions, that would place the end of the index at 0x03FF (1023), so functions can start at 1024. 

```JavaScript

I2C1.setup({scl:B8,sda:B9});
rom=require("AT24").connect(I2C1,128,512); //512 kbit I2C EEPROM - you could use SPI EEPROM if you prefer; OneWire EEPROMs are too small.

rom.r = function (id) {
	var x=this.read(256+id*4,4); //start at 256
	if (x[2]!=255) { //this is the high byte of the length of the function we're calling - no funtion could be that long, so we're reading a blank index entry. 
		return eval(E.toString(this.read((x[1]+(x[0]<<8)),(x[3]+(x[2]<<8)))));
	}
};

```

Let's try it:

```javascript

>rom.write(0x0400,"setInterval('digitalWrite(LED2,!a);digitalWrite(LED1,a);a=!a;',1000)"); 
=68
>//so we put it at 0x0400, and it's 68 bytes long... Lets call this function 0, so it's index entry will start at 0x100
>rom.write(0x0100,[0x04,0,0,68]);
=4
>rom.r(0); //and the lights blink!
=1

```

A few helper functions can handle modifying the stored functions in the code, and ensure that we don't overwrite existing functions:

```javascript

maxid=192;
ftst=256;

//getList() returns an object containing one property for each function listed in the function index on the rom, and also prints out it's progress in human readable format to assist the operator in loading the rom.

function getList() {
	var count=0;
	var map={};
	for (var i=0;i<maxid;i++) {
		var b=rom.read(ftst+i*4,4);
		if (b[2]!=255) { //if b[2]==255, length ~= 64K, which is clearly not valid data. 
			count++;
			var a=b[1]+(b[0]<<8);
			var l=b[3]+(b[2]<<8);
			map[i]=[a,l];
			console.log(i+". 0x"+a.toString(16)+" "+l+" bytes."); 
		}
	}
	console.log("Scan complete "+ count+ " functions in index"); 
	return map;
}

//getFunction(id) will return a string containing the code for that function, assuming it exists. 

function getFunction(id) {
	var x=rom.read(ftst+id*4,4);
	if (x[2]!=255) {return E.toString(rom.read((x[1]+(x[0]<<8)),(x[3]+(x[2]<<8))));}
}

//isSafe(address, length, map) takes a 'map' object (as returned by getList()), and returns 1 if a function of specified length can be placed in the specified address without overwriting something. 
//If it fails, print the ID of the function that it's got a problem with. 

function isSafe(adr,len,map) {
	var max=len+adr;
	for (var i=0;i<maxid;i++) {
		if (map[i]!=undefined) {
			var a=map[i][0];
			var l=map[i][1];
			if (((a < adr)&&(a+l > adr))||((a > adr)&&(a < max))) {
				console.log("Conflict on function "+i);
				return 0;
			}
		}
	}
	return 1;
}

//addFunction(id, address, function) - This creates a new entry for a function of 'id', located at 'address' in the function index, and writes that and the function (supplied as a string) to the rom, provided that that can be done without overwriting another function.


function addFunction(id,adr,str) {
	console.log("Adding function of length "+str.length+" at address "+adr+" with ID: "+id);
	if (isSafe(adr,str.length,getList())) {
		rom.write(adr,str);
		rom.write(ftst+4*id,E.toString((adr>>8),(adr&0xFF),(str.length>>8),(str.length&0xFF)));
	} else {
		console.log("Selected location would overlap with other function!");
	}
}

//deleteFunction(id) deletes the function with that ID from the function index. Nothing is done to the stored code itself, but it will now not be protected from overwriting by isSafe(). 

function deleteFunction(id) {
	console.log("deleting function: " + id);
	rom.write(ftst+4*id,"ÿÿÿÿ"); //that's char code 255
}

```

Taking it one step further, we probably don't want those helper functions wasting memory - during normal operation, they won't be used at all, and a system offloading code to an EEPROM to save memory likely cannot spare the memory anyway. 

