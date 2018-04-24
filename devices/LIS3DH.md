<!--- Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
LIS3DH Accelerometer
======================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/LIS3DH. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,LIS3DH,I2C,Sensor,Accelerometer

The [LIS2MDL](http://www.st.com/en/mems-and-sensors/lis3dh.html) is an ultra-low-power, high performance
3-axis digital magnetic sensor.

You can use the [[LIS2MDL.js]] module with the LIS2MDL as follows:

I2C
---

```
I2C1.setup({sda:..., scl:...);
var acc = require("LIS3DH").connectI2C(I2C1);
print(acc.read()); // prints { x: ..., y: ..., z: ... }
```

**Note:** you can supply `addr` to `connectI2C`'s second argument to set an I2C
address if it is non-standard.


Reference
---------

* APPEND_JSDOC: LIS3DH.js
