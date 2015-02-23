<!--- Copyright (c) 2014 Spence Konde. See the file LICENSE for copying permission. -->
DHT11 Temperature and RH Sensor
=====================

* KEYWORDS: Module,DHT11,temperature,humidity

Overview
-----------------

This module interfaces with the DHT11, a very cheap (and cheaply made) temperature and relative humidity sensor. Support is included in the [[DHT11.js]] module.

Key Specifications:
  | Temperature Range | 0 ~ 50 C |
  | Temp. Accuracy    | +/- 1C   |
  | Humidity Range    | 20 ~ 90% |
  | Humidity Accuracy | +/- 4%   |


The DHT11 sometimes fails to recognize the trigger pulse, and occasionally the module fails to properly read the data. The checksum is used to validate all data received. 

The module will retry if it doesn't get any response, or if other sanity checks fail. If it fails 20 times in a row, the callback will be called with {"temp":-1, "rh":-1}, indicating a likely problem with the sensor or wiring.
It is recommended that you do your own sanity-check on the data returned.



Wiring
-----------------

From left to right when part is viewed from the front (the side with the ventilation holes) with pins pointing down. (The DHT11 has no pin markings)

  | Device Pin | Espruino |
  | ---------- | -------- |
  | 1 (Vcc)    | 3.3      |
  | 2 (S)      | Any GPIO |
  | 3 (NC)     | N/C*     |
  | 4 (GND)    | GND      |

*There are reports of DHT11s on the market where pins 3 and 4 are reversed.


Usage
-----------------

call require("DHT11").connect(pin) to get a DHT11 object. To read the sensor, the read method is called with a single argument, the function that is called when the read is complete. This function is called with an object containing two properties, temp and rh. Temperature is in C, RH is in %. 

For example:
```JavaScript
    var dht = require("DHT11").connect(C11);
    dht.read(function (a) {console.log("Temp is "+a.temp.toString()+" and RH is "+a.rh.toString());});
```


Buying
-----

DHT11 parts and modules can be purchased from many places:
* [eBay](http://www.ebay.com/sch/i.html?_nkw=DHT11&_sacat=92074)
* [digitalmeans.co.uk](https://digitalmeans.co.uk/shop/index.php?route=product/search&tag=dht11)
