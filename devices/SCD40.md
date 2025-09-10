<!--- Copyright (c) 2014 Hywel Warsop. See the file LICENSE for copying permission. -->
SCD40
=====================

* KEYWORDS: Module,SCD40,SCD41,SCD43,Temperature,Humidity,C02

This module should work with Sensirons SDC40, SCD41 and SCD43 sensors, although it has only been tested on the SDC40. Use the [SCD40](/modules/SCD40.js) ([About Modules](/Modules)) module for it.

You can wire this up as follows:

| Device Pin | Espruino |
| ---------- | -------- |
| 1 (GND)    | GND      |
| 2 (VCC)    | 3.3      |
| 3 (SCL)    | B10       |
| 4 (SDA)    | B3       |

How to use my module:

To Set up the module
 
```JavaScript
  I2C2.setup({scl:B10,sda:B3});
  var scd = require("SCD40").connectI2C(I2C2);
```

To make a single measurement

```JavaScript
  scd.measure_single_shot();
  scd.get_data_ready_status();
  readings = scd.read_measurement();
  console.log({readings});
```

To make a continous measurements

```JavaScript
  scd.start_periodic_measurement();
  readings = scd.read_measurement();
  console.log({readings});

  scd.stop_periodic_measurement();
```

The other calls as defined in the datasheet have all been set up in the module.

The module also contains a commented out version of the C code to calculate the crc-8 checksum used for these chips. It runs in around 1.2 ms on the pico, where as the Javascript version takes around 4.5 ms. If performance is an issue this can be used instead.

  Reference
  ---------

  * APPEND_JSDOC: MOD123.js

  Using
  -----

  * APPEND_USES: MOD123