<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
HC-SR04 Ultrasonic Distance Sensor
=========

* KEYWORDS: Module,Ultrasonic Distance Sensor,Sound,Distance,Sensor,HC-SR04

![Ultrasonic Distance Sensor](module.jpg)

The HC-SR04 Ultrasonic distance sensor measures distance by sending out a 40kHz pulse of sound and then listening for the echo. It's got just 4 pins: Vcc, GND, Trig and Echo. Trig triggers a pulse and Echo gives a pulse whenever an echo is heard.

Connect as follows:

| HC-SR04 | Espruino   |
| ------- | ---------- |
| GND     | GND        |
| Vcc     | VBAT (5v)  | 
| Trig    | A0         |
| Echo    | A1         |

Note that Trig and Echo can be on any GPIO pins.

It's easy to use with the [[HC-SR04.js]] module:

```
var sensor = require("HC-SR04").connect(A0,A1,function(dist) {
  console.log(dist+" cm away");
});
setInterval(function() {
  sensor.trigger(); // send pulse
}, 500);
```

Using 
-----

* APPEND_USES: Ultrasonic

Buying
-----

* [eBay](http://www.ebay.com/sch/i.html?_nkw=HC-SR04)
