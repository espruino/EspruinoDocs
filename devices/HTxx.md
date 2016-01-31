/* Copyright (C) 2016 Enchanted Engineering. See the file LICENSE for use. */
DHTxx or RHTxx Generic Humidity and Temperature Sensor
======================================================

* KEYWORDS: Module, Humidity, Temperature, DHT11, DHT21, DHT22, DHT33, DHT44, RHT01, RHT02, RHT03,RHT04, RHT05, AM2301, AM2302, AM2303, HM2301

Generic Relative humidity and temperature sensor interface module based on the DHTxx (RHTxx or AM23xx) sensor. 

Wire sensor as follows:

| Device Pin | Espruino |
| ---------- | -------- |
| 1 (VCC)    | 3.3      |
| 2 (IO)     | A0*      |
| 3 (N.C.)   |          |
| 4 (GND)    | GND      |

  ***Note:** Any general purpose digital I/O pin may be used. 

MODULE REFERENCE
----------------

**Function read(cb,n)** - Read the humidity and temperature of the sensor.

Parameters:

* **cb** - {function} Callback to receive data.
* **n** - {Integer} An optional number of read attempts, default=3

Returns (to callback):

* JSON object with the keys...
  - err:  false if reading good; if true raw included,
  - rh:   relative humidity valid for all sensor types except DHT11 (RHT01),
  - t:    temperature valid for all sensor types except DHT11 (RHT01),
  - rh11: relative humidity valid for DHT11 (RHT01) only,
  - t11:  temperature valid for DHT11 (RHT01) only

Example...
----------

```JavaScript
// demo callback that dumps returned JSON object
function cb(js) {
	console.log(JSON.stringify(js));
  }

var ht = require("HTxx").init(A0);  // DHT22 sensor on pin A0
ht.read(cb);
```

Will produce...

```JavaScript
answer: {"err":false,"rh":29.7,"t":26.7,"rh11":1,"t11":1,"raw":[1,41,1,11,54]}
```

Note: rh11 and t11 not valid for DHT22 sensor.

Reference
---------

* APPEND_JSDOC: HTxx.js

Using
-----

* APPEND_USES: HTxx.js
