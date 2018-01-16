<!--- Copyright (c) 2014 Spence Konde. See the file LICENSE for copying permission. -->
DS2xxx OneWire EEPROMs (DS24B33, DS2431, DS28EC20 etc)
======================================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/DS2xxx. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,EEPROM,storage,rom,DS24B33,DS2431,DS28EC20,OneWire


Overview
------------------

This module interfaces to an OneWire EEPROM. These are powered entirely by the signal line, requiring connection only to ground and signal. These parts are available only in low capacities, compared to I2C and SPI eeproms, and are considerably more expensive. They are most commonly available in the convenient TO-92 through-hole package.

Supported parts:

| Part     | Size (kbit) | Size (kbyte) | Page size |
|----------|-------------|--------------|-----------|
| DS2431   | 1           | 128 Bytes    | 8 bytes   |
| DS24B33  | 4           | 512 Bytes    | 32 bytes  |
| DS28EC20 | 20          | 2.5 KBytes   | 32 bytes  |
 


Wiring
-------------------

Connect pin 1 to ground, and pin 2 to any IO pin on the Espruino. 

Connect a 1k-2.2k ohm resistor between pin 2 and +3.3v. 


Setup
-------------------

Setup OneWire, then call:

```JavaScript 
var eeprom=require("DS2xxx").connect(onewire, pagesize, capacity, nopartial, device)
```

onewire is the OneWire bus object. 

pagesize is the page size for page writes, in bytes. 

capacity is the eeprom capacity, in kbits. 

nopartial is true for devices that cannot start a write except on a page boundary, otherwise undefined or false. 

device is the code identifying the device, or it's number in the search. Optional - if undefined, the first device will be assumed. 
 


Reading and Writing
-------------------

These support the same interface as the SPI (AT25) and I2C (AT24) EEPROM modules

```JavaScript
eeprom.read(address,bytes)
```

`read()` reads the specified number of bytes, starting at the specified address, returned as a Uint8Array.

```JavaScript
eeprom.write(address,data)
```

`write()` writes the supplied data to the specified address. The data can be a string or an array of bytes. Address may be undefined, in this case, it will read from where last read ended. This handles breaking the write up into pages, and waiting for the write delay period. The write delay is 5ms per page (This means that large writes can be quite slow). 
