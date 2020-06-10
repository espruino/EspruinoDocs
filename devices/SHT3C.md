<!--- Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
SHT3C Temperature and Humidity sensor
======================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/SHT3C. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,I2C,SHT3C,SHT3,sensirion,temperature,humidity

Use the [SHT3C](/modules/SHT3C.js) ([About Modules](/Modules)) module for reading data from the Sensirion SHT3C series of devices.

Basic usage:

```
I2C1.setup({scl:B6,sda:B7});
var sht = require("SHT3C").connect(I2C1);
sht.read(function(d) {
  console.log('Temperature:', d.temp);
  console.log('Humidity:', d.humidity);
}
```

Reference
--------------

* APPEND_JSDOC: SHT3C.js


Using
-----

* APPEND_USES: SHT3C
