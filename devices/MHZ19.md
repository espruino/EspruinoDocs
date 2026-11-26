<!--- Copyright (c) 2017 dpro. See the file LICENSE for copying permission. -->
MH-Z19 CO2 Sensor
=================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/MHZ19. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,MHZ19,MH-Z19,MH-Z19B,CO2,Carbon Dioxide,Sensor,Serial,UART

The MH-Z19 and MH-Z19B from Winsen are NDIR CO2 sensors that connect over a 9600 baud serial port. Use the [MHZ19](MHZ19.js) module for them.

Wiring
------

| Sensor | Espruino            |
| ------ | ------------------- |
| Vin    | 5V                  |
| GND    | GND                 |
| TX     | RX pin of your UART |
| RX     | TX pin of your UART |

The sensor needs 4.5 - 5.5V power, but its serial lines are 3.3V.

Usage
-----

```JavaScript
var mhz19 = require("MHZ19").connect({ port: Serial1 });

setInterval(function() {
  var r = mhz19.read();
  if (r.status) console.log("CO2: " + r.co2 + "ppm, temp: " + r.temp + "°C");
}, 2000);
```

`read()` sends a request and returns the reply that is waiting on the serial port. That reply belongs to the *previous* request, so the first call returns `status: false`, and each later reading is one interval old. Always check `status` (which is `true` if the checksum is valid) before using the values.

The `temp` value comes from the sensor's internal temperature, so it's only approximate.

Calibration
-----------

```JavaScript
mhz19.calibrate(); // set the zero point. Only do this after 20+ minutes in fresh air (~400ppm)
mhz19.abc_off();   // turn off Automatic Baseline Correction
mhz19.abc_on();    // turn on Automatic Baseline Correction (the default)
```

With Automatic Baseline Correction on, the sensor treats the lowest reading over each 24 hours as 400ppm. This works for rooms that get aired regularly, but not for places that never have fresh air.

Reference
---------

`require("MHZ19").connect({ port, speed })`

* `port` - the Serial port to use, for example `Serial1`
* `speed` - (optional) baud rate, default 9600

Links
-----

* [MH-Z19B datasheet](https://www.winsen-sensor.com/d/files/infrared-gas-sensor/mh-z19b-co2-ver1_0.pdf)
