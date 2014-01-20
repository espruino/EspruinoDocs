<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Pyroelectric Motion Sensor
=======================

* KEYWORDS: Pyroelectric Motion Sensor,PIR,Motion,Movement,Sensor,HC-SR501

![Pyroelectric Motion Sensor Front](front.jpg)

![Pyroelectric Motion Sensor Back](back.jpg)

Pyroelectric Motion Sensor's are what you'd find in a home burglar alarm or a motion sensitive light. The module shown is the HC-SR501, and it outputs a pulse of around 2 sec on the output pin whenever movement is detected.

The HC-SR501 draws less than 50uA when it is on, which means it'll run off a battery for ages.

Connect as follows:

| HC-SR501 | Espruino   |
| ------- | ------- |
| VCC | VBAT (5v) |
| OUT | A1      |
| GND | GND     |

**Note:** any GPIO pin will do for OUT

You can then easily trigger something to happen when movement is detected:

```
setWatch(function() {
  console.log("Movement detected");
}, A1, {repeat:true, edge:"rising"});
```

Specs
----

| Specification | Value |
| ------- | ------- |
| Input Voltage | 4.5-20v |
| Output Voltage | 0 (low), 3.3v (high) |
| Current Draw | &lt; 50uA |


Using 
-----

* APPEND_USES: Pyroelectric

Buying
-----

* [eBay](http://www.ebay.com/sch/i.html?_nkw=HC-SR501)
