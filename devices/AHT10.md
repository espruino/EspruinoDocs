<!--- Copyright (c) 2014 Gustav Karlström. See the file LICENSE for copying permission. -->
AHT10 RH/TEMP Sensor
=====================

* KEYWORDS: Module,Sensor,rh,aht10,aht,temperature,humidity

A bit about my module. Use the [AHT10](/modules/AHT10.js) ([About Modules](/Modules)) module for it.

You can wire this up as follows:

| Device Pin | Espruino                         |
| ---------- | -------------------------------- |
| 1 (GND)    | GND                              |
| 2 (VCC)    | 3.3                              |
| 3 (SCL)    | Any I2C software compatible pin  |
| 4 (SDA)    | Any I2C software compatible pin  |

How to use my module:

```
  const sensor = require("AHT10").connect(SCL,SDA, bitrate); // Bitrate is optional, defaults to 300000
  sensor.getTemerature();
  sensor.getHumidity();
  sensor.getDewPoint();
```