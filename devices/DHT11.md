<!--- Copyright (c) 2014 Spence Konde. See the file LICENSE for copying permission. -->
DHT11 Temperature and RH Sensor
===============================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/DHT11. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,DHT11,temperature,humidity

Overview
-----------------

This module interfaces with the DHT11, a very cheap (and cheaply made) temperature and relative humidity sensor. Support is included in the [[DHT11.js]] module.

 Key Specifications:

  |                   |          |
  |-------------------|----------|
  | Temperature Range | 0 ~ 50 C |
  | Temp. Accuracy    | +/- 1C   |
  | Humidity Range    | 20 ~ 90% |
  | Humidity Accuracy | +/- 4%   |


The DHT11 sometimes fails to recognize the trigger pulse, and occasionally the module fails to properly read the data. The checksum is used to validate all data received. 

The module will retry if it doesn't get any response, or if other sanity checks fail. If it fails 10 times in a row, the callback will be called with an error (see below), indicating a likely problem with the sensor or wiring. However it is still recommended that you do your own sanity-check on the data returned.

**Note:** The [[DHT22]] sensor is also available - it is similar, but more accurate and reliable.

Wiring
-----------------

From left to right when part is viewed from the front (the side with the ventilation holes) with pins pointing down. (The DHT11 has no pin markings)

  | Device Pin | Espruino |
  |------------|----------|
  | 1 (Vcc)    | 3.3      |
  | 2 (S)      | Any GPIO |
  | 3 (NC)     | N/C*     |
  | 4 (GND)    | GND      |

**Note:** There are reports of DHT11s on the market where pins 3 and 4 are reversed.


Usage
-----------------

Call `require("DHT11").connect(pin)` to get a `DHT11` object. To read the sensor, the `read` method is called with a single argument, the function that is called when the read is complete. This function is called with an object containing two properties, `temp` and `rh.` Temperature is in C, RH is in %. 

For example:

```JavaScript
var dht = require("DHT11").connect(C11);
dht.read(function (a) {console.log("Temp is "+a.temp.toString()+" and RH is "+a.rh.toString());});
```

Returns `-1` for the temperature and humidity (and `err:true`) if no data is received. An extra `checksumError` field contains extra information about the type of the failure:

* If no data received at all: `{"temp": -1, "rh": -1, err : true, "checksumError": false}`.

* If some data received, but the checksum is invalid, or timed out: `{"temp": -1, "rh": -1, err : true, "checksumError": true}`

In all cases, a field called `raw` is present which contains the raw data received, as a string of `1` and `0` characters.

**Note:** You can also supply a second argument which is the number of retries if there is an error. The default is 10.

Buying
-----

DHT11 parts and modules can be purchased from many places:
* [eBay](http://www.ebay.com/sch/i.html?_nkw=DHT11&_sacat=92074)
* [digitalmeans.co.uk](https://digitalmeans.co.uk/shop/index.php?route=product/search&tag=dht11)
