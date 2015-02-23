<!--- Copyright (c) 2014 Spence Konde. See the file LICENSE for copying permission. -->
DHT22/AM2302 Temperature and RH Sensor
=====================

* KEYWORDS: Module,DHT22,AM2302,temperature,humidity

Overview
-----------------

This module interfaces with the DHT22 (AKA AM2302), an inexpensive temperature and relative humidity sensor similar to the DHT11, but with higher accuracy and wider range. 

Key Specifications:
  | Temperature Range | -40~80 C |
  | Temp. Accuracy    | +/- 0.5C |
  | Humidity Range    | 0 ~ 100% |
  | Humidity Accuracy | +/- 2%   |

The DHT22 is much more reliable than the DHT11, and it rarely fails to provide data, however, it is still important to perform your own sanity checks on the data returned. 


Wiring
-----------------

From left to right when part is viewed from the front (the side with the ventilation holes) with pins pointing down. (The DHT22 has no pin markings). 
IMPORTANT: Be sure to get the polarity right! If connected backwards, it will ruin the DHT22. 

  | Device Pin | Espruino |
  | ---------- | -------- |
  | 1 (Vcc)    | 3.3      |
  | 2 (S)      | Any GPIO |
  | 3 (NC)     | N/C*     |
  | 4 (GND)    | GND      |

*There are reports of DHT22s on the market where pins 3 and 4 are reversed. Meanwhile, app notes sometimes depict pins 2 and 3 tied together. 


Usage
------------

call require("DHT22").connect(pin) to get a DHT22 object. To read the sensor, the read method is called with a single argument, the function that is called when the read is complete. This function is called with an object containing two properties, temp and rh. Temperature is in C, RH is in %. 

For example:
```JavaScript
    var dht = require("DHT22").connect(C11);
    dht.read(function (a) {console.log("Temp is "+a.temp.toString()+" and RH is "+a.rh.toString());});
```

Buying
-----

DHT22 parts and modules can be purchased from many places:
* [eBay](http://www.ebay.com/sch/i.html?_nkw=DHT22&_sacat=92074)
* [digitalmeans.co.uk](https://digitalmeans.co.uk/shop/index.php?route=product/search&tag=dht22)
