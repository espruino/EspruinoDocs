<!--- Copyright (c) 2021 AkosLukacs. See the file LICENSE for copying permission. -->
MCP794xx Battery-Backed I2C Real-Time Clock/Calendar with SRAM, (optional) EEPROM and Protected EEPROM
===================================================================================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/MCP9808. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,I2C,RTC,EEPROM,MCP79400,MCP79401,MCP79402,MCP79410,MCP79411,MCP79412

This is a module that makes it easy to connect to a MCP794xx [[I2C]] real time clock / calendar.

The MCP794xx is a family of [[I2C]] real time clocks from Microchip with 64 byte battery backed SRAM and Protected EEPROM. The MCP7941x parts also contain 128 byte EEPROM. This module makes it easy to connect this clock with an espruino board.

Use the [MCP794xx](/modules/MCP794xx.js) module for it.

Wiring Up
---------

| Pin   | Espruino |
|-------|----------|
| GND   | GND      |
| VCC   | 3.3v     |
| SDA   | A4       |
| SCL   | A5       |
| MFP   | Not implemented |


Software
--------

How to use the module:

```
I2C1.setup({scl:A5,sda:A4, bitrate: 60000});
var rtc = require('MCP794xx').connect(I2C1);

// you have to enable vbat on first use. It's not on by default, won't keep time from the backup battery...
rtc.enableVbat()

// set the date - assuming the "Set Current Time" is set in your Espruino IDE, just uploading this code will set it up
rtc.setDateTime(new Date()) 


// get the date & time from the RTC, for example at boot
var now = rtc.getDateTime()
// and set Espruino's internal clock to it
setTime(now/1000);
```


Using SRAM
----------
All MCP794xx parts have 64 byte battery backed SRAM. Store anything you want to keep as long as the RTC has battery.
The battery backed SRAM area starts at 0x20.

```
// pass in the memory address, and data in a regular array, or Uint8Array
rtc.sramWrite(0x20, [42, 42, 42, 42])

// read back data
rtc.sramRead(0x20, 4)
// =new Uint8Array([42, 42, 42, 42])
```

Using EEPROM
------------
The MCP7941x parts contain 128 bytes of EEPROM - store anything you want :)
The EEPROM address starts at 0.
This library handles EEPROM memory "paging", so you can send in more than 8 bytes of data easily.

```
// first parameter is the memory address
rtc.eepromWrite(0, [1,2,3,4,5,6,7])

// first parameter is the memory address, second is the number of bytes to read
rtc.eepromRead(0,6)
// =new Uint8Array([1, 2, 3, 4, 5, 6])
```


EUI-48 / EUI-64 in MCP794x1 and MCP794x2
----------------------------------------
The MCP794x1 parts have an EUI-48, the MCP794x2 have an EUI-64 node address factory programmed. You can use these as a unique identifiers of the device.
```
/// Reads the factory programmed 48 bit EUI. Only for MCP794x1
rtc.readEUI48()

// or 

/// Reads the factory programmed 64 bit EUI. Only for MCP794x2
rtc.readEUI64()
```


Other features
--------------

Alerts, using the MFP pin and some other things not implemented. Send a PR or raise an issue, if you need something else :)


Reference
--------
 
* APPEND_JSDOC: MCP794xx.js


Links
-----

* [MCP79400 Datasheet](https://www.microchip.com/en-us/product/MCP79400)
* [MCP79410 Datasheet](https://www.microchip.com/en-us/product/MCP79410)
