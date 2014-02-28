  <!--- Copyright (c) 2014 Spence Konde. See the file LICENSE for copying permission. -->
  DHT11 Temperature and RH Sensor
  =====================

  * KEYWORDS: Module,DHT11,temperature,humidity

This module interfaces with the DHT11, a very cheap temperature and relative humidity sensor. 


The DHT11 sometimes fails to recognize the trigger pulse. Occasionally it also returns bad data. Despite the datasheet claiming that the DHT11 sends an 8 bit checksum (40 bits total), the DHT11s I had only returned the 32 data bits. If the DHT11 were to send the full 40 bits, this module would handle it, however, the checksum would not be used for validation. 

This module will retry if it doesn't get any response, or if relative humidity is given as >100 (indicating bad data). 
If it fails 20 times in a row, the callback will be called with {"temp":-1, "rh":-1}, indicating a likely problem with the sensor or wiring.
It is recommended that you do your own sanity-check on the data returned.



Wiring - from left to right when part is viewed from the front (the side with the ventilation holes) with pins pointing down. (The DHT11 has no pin markings)

  | Device Pin | Espruino |
  | ---------- | -------- |
  | 1 (Vcc)    | 3.3      |
  | 2 (S)      | Any GPIO |
  | 3 (NC)     | N/C*     |
  | 4 (GND)    | GND      |

*There are reports of DHT11s on the market where pins 3 and 4 are reversed.


Usage:

call require("DHT11").connect(pin) to get a DHT11 object. To read the sensor, the read method is called with a single argument, the function that is called when the read is complete. This function is called with an object containing two properties, temp and rh. Temperature is in C, RH is in %. 

For example:
```
    var dht = require("DHT11").connect(C11);
    dht.read(function (a) {console.log("Temp is "+a.temp.toString()+" and RH is "+a.rh.toString());});
```
