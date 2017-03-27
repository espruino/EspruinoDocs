<!--- Copyright (c) 2014 Peter Clarke. See the file LICENSE for copying permission. -->
Thermistor Temperature Sensor
=====================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Thermistor. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Temperature,Temp,thermistor,sensor,10K3A1,10K4A1,20K6A1,PT100,NI1000,LAN1,SAT1,STA1,TAC1,2.2K3A1

**Note:** If you want to see how this module works internally, check out the [[Thermistors]] tutorial.

This module uses the following common thermistor characteristics found in most off the shelf thermistor based temperature sensors.

The module has been written to match the characteristics and codes in this [thermistor datasheet](https://www.sontay.com/media/specs/Thermistor_Types_and_Compatibility_Charts.pdf).

Use the [Thermistor](/modules/Thermistor.js) ([About Modules](/Modules)) module for it.

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

**Troubleshooting.**

If you find the code returns NaN.  Check that you have used ``" " ``around the thermistor type.


Buying
-----

Thermistors are readily available from any electronics supplier, as well as other hobby sources like eBay.
* [eBay](http://www.ebay.com/sch/i.html?_nkw=thermistor&_sacat=92074)
* [digitalmeans.co.uk](https://digitalmeans.co.uk/shop/index.php?route=product/search&tag=thermistor)
