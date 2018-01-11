<!--- Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
LIS2DH12 Accelerometer
======================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/LIS2DH12. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Accelerometer,LIS2DH12,SPI,Sensor

The LIS2DH12 is an ultra-low-power high-performance three-axis linear accelerometer with a digital I2C/SPI serial interface.

You can use the [[LIS2DH12.js]] module with the LIS2DH12 as follows:

SPI
---

```
SPI1.setup({miso:..., mosi:..., sck:...);
var accel = require("LIS2DH12").connectSPI(SPI1, CS_PIN, function(xyz) {
   // callback whenever data is received
   console.log(xyz);
   // prints { "x": 3.90625, "y": -7.8125, "z": 984.375 }
});
accel.setPowerMode(on?"low":"powerdown");
```

I2C
---

```
I2C1.setup({sda:..., scl:...);
var accel = require("LIS2DH12").connectI2C(I2C1, function(xyz) {
   // callback whenever data is received
   console.log(xyz);
   // prints { "x": 3.90625, "y": -7.8125, "z": 984.375 }
});
accel.setPowerMode(on?"low":"powerdown");
```

**Note:** you can supply a 3rd argument to `connectI2C` containing the I2C
address if it is non-standard.


Reference
---------
 
* APPEND_JSDOC: LIS2DH12.js
