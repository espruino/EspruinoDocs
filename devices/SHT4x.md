<!--- Copyright (c) 2014 Gerrit Niezen. See the file LICENSE for copying permission. -->
SHT4x Temperature and Humidity sensor
=====================================

* KEYWORDS: Module,I2C,SHT4x,SHT40,sensirion,temperature,humidity

Use the [SHT4x](/modules/SHT4x.js) ([About Modules](/Modules)) module for reading data from the Sensirion SHT4x series of devices.

Basic usage:

```
I2C1.setup({scl:D6,sda:D7});
var sht = require("SHT4x").connect(I2C1);
sht.read(function(d) {
  console.log('Temperature:', d.temp);
  console.log('Humidity:', d.humidity);
}
```

Reference
--------------

* APPEND_JSDOC: SHT4x.js


Using
-----

* APPEND_USES: SHT4X
