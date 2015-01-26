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
In order to call these functions, we'll need a way to refer to a given function, and determine where it is on the EEPROM to execute it. We could pass the address that the function starts at, and it's length - but that means that every time the code on the EEPROM is modified, the application code has to change too. Instead, let's store a table in the EEPROM, using 4 bytes per entry - the first two will be the address, and the second two the length. In this example, it's started at an offset of 0x0100 (256), leaving the first 256 bytes free for other purposes. 

```

I2C1.setup({scl:B8,sda:B9});
rom=require("AT24").connect(I2C1,128,512);

rom.r = function (id) {
	var x=this.read(256+id*4,4); //start at 256
	if (x[2]!=255) {return eval(E.toString(this.read((x[1]+(x[0]<<8)),(x[3]+(x[2]<<8)))));}
};

```


