<!--- Copyright (c) 2017 Uri Shaked. Released under the MIT license. -->
Sensirion SHT20, SHT21 & SHT25 Temperature and Relative Humidity Sensor
=====================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/SHT2x. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,SHT20,SHT21,SHT25,sensirion,temperature,humidity

Use the [SHT2x](/modules/SHT2x.js) ([About Modules](/Modules)) module for reading data from the Sensirion SHT2x series of devices.

This module communicates with the chip over I2C. It also takes care of CRC checking, and will throw an error in case of corrupt data.

Basic usage:

```
I2C1.setup({scl:B6,sda:B7});
var sht = require("SHT2x").connect(I2C1);
console.log('Temperature:', sht.readTemperature());
console.log('Humidity:', sht.readHumidity());
```

**SHT2x module functions**

**readTemperature()** - measures and returns the temperature in celsius

**readHumidity()** - measures and returns the humidity as a percentage (%), value between 1 and 100

