<!--- Copyright (c) 2014 Peter Clarke. See the file LICENSE for copying permission. -->
Thermistor Temperature Sensor
=====================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Thermistor. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Temperature,Temp,thermistor,sensor,10K3A1,10K4A1,20K6A1,PT100,NI1000,LAN1,SAT1,STA1,TAC1,2.2K3A1

**Note:** If you want to see how this module works internally, check out the [Thermistors](../tutorials/Thermistors.md) tutorial.

This module uses the following common thermistor characteristics found in most off the shelf thermistor based temperature sensors.

The module has been written to match the characteristics and codes in this [thermistor datasheet](https://www.sontay.com/media/specs/Thermistor_Types_and_Compatibility_Charts.pdf).

Use the [Thermistor](Thermistor.js) module for it.

| Sensor Type | Code |
| ----------  | ---- |
| 10K3A1      |  "A" |
| 10K4A1      |  "B" |
| 20K6A1      |  "C" |
| PT100A      |  "D" |
| PT1000A     |  "E" |
| NI1000      |  "F" |
| LAN1        |  "G" |
| SAT1        |  "H" |
| STA1        |  "K" |
| TAC1        |  "L" |
| 2.2K3A1     |  "M" |

Thermistors can be wired up as follows:

```
  +3.3v
  |
  |
  |
  |
  |
+-+-+
|   |
|   | Biasing resistor
|   | (for a 10K sensor use a 10K resistor)
|   |
+-+-+
  |
  |
  |
  |               +---------+
  +---------------+         +------------+----+ ADC Input
  |               +---------+            |
  |                    100K current      |
  |                    limiting resistor |
  |                    (optional)        |
+-+-+                                    |
|   |                                 +----+
|   | 10K Thermistor                  +----+ 100nF Capacitor
|   |                                    |
|   |                                    |
+-+-+                                    |
  |                                      |
  |                                      |
  |                                     GND
 GND
```
This example shows a 10K based thermistor like a 10K3A1.

**How to use my module:**

```
var variable = require("Thermistor").connect(pin,"sensor characteristic code")
```

i.e. : If the thermistor is a 10K3A1 temperature sensor connected to Pin C0 then the following code will read the input and return the correct temperature to two decimal places.

```
  var t1 = require("Thermistor").connect(C0,"A");
  t1.getTemp();
```

The module assumes a 10K biasing resistor. If you use a different value (for
instance a 20K resistor with a 20K6A1 sensor) then pass its value in Ohms as
the `resistor` option:

```
  var t1 = require("Thermistor").connect(C0,"C",{resistor:20000});
  t1.getTemp();
```

If your thermistor isn't in the table above, you can supply your own
[Steinhart-Hart](https://en.wikipedia.org/wiki/Steinhart%E2%80%93Hart_equation)
coefficients `[A,B,C]` (usually found in the thermistor's datasheet) instead of a
code. For example for the 5K thermistor used in the [Thermistors](../tutorials/Thermistors.md)
tutorial, wired up with a 5.6K biasing resistor:

```
  var t1 = require("Thermistor").connect(C0,[1.2874E-03,2.3573E-04,9.5052E-08],{resistor:5600});
  t1.getTemp();
```

**Troubleshooting.**

If you find the code returns NaN.  Check that you have used ``" " ``around the thermistor type.


Reference
---------

* APPEND_JSDOC: Thermistor.js

Buying
-----

Thermistors are readily available from any electronics supplier, as well as other hobby sources like eBay.
* [eBay](https://www.ebay.com/sch/i.html?_nkw=thermistor&_sacat=92074)
