<!--- Copyright (C) 2016 Enchanted Engineering. See the file LICENSE for use. -->
DHTxx or RHTxx Humidity and Temperature Sensor
======================================================

* KEYWORDS: Module, Humidity, Temperature, DHT21, DHT22, DHT33, DHT44, RHT01, RHT02, RHT03,RHT04, RHT05, AM2301, AM2302, AM2303, HM2301

DISCLAIMER
----------

**This module is not directly compatible with the existing Espruino DHT22 module.**


APPLICATION
-----------

Relative humidity and temperature sensor interface module based on the DHTxx (RHTxx or AM23xx) sensor. 

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

Return (callback) signiture: function callback(error,JSON) { }

* **error**   boolean flag for result
* JSON object keys if error is true ...
  - **bs**:   bitstream string of received data
* JSON object keys if error is false ...
  - **rh**:   relative humidity valid for all sensor types except DHT11 (RHT01)
  - **t**:    temperature valid for all sensor types except DHT11 (RHT01)

Example...
----------

```JavaScript
// demo callback that dumps returned JSON object
function cb(err,js) {
	console.log("answer: "+((err)?"ERROR":"OK"), JSON.stringify(js));
  }

var ht = new (require("HTxx"))(A0);  // DHT22 sensor on pin A0
ht.read(cb);
```

Will produce...

```JavaScript
answer: OK {"rh":29.7,"t":26.7}
```

or for an failed sensor read...

```JavaScript
answer: ERROR {"bs":""}
```

Reference
---------

* APPEND_JSDOC: HTxx.js

Using
-----

* APPEND_USES: HTxx.js
