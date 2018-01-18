<!--- Copyright (c) 2018 Gordon Williams. See the file LICENSE for copying permission. -->
LPS22HB pressure sensor
=======================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/LPS22HB. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,I2C,LPS22HB,pressure,sensor

LPS22HB is an [[I2C]] pressure sensor from ST, which is handled with the [LPS22HB](/modules/LPS22HB.js) module.

How to use
----------

```
I2C1.setup({scl:B6,sda:B7});
var pressure = require("LPS22HB").connectI2C(I2C1);
pressure.read(print);
// prints { "pressure": 1017.3583984375, "temperature": 22.62 }
```

Or specify an interrupt pin to have data 'pushed':

```
var pressure = require("LPS22HB").connectI2C(I2C1, {int : B8});
pressure.on('data', print);
// prints { "pressure": 1017.3583984375, "temperature": 22.62 }
```

Reference
---------

* APPEND_JSDOC: LPS22HB.js
