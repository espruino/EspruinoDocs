<!--- Copyright (c) 2014 Peter Clarke. See the file LICENSE for copying permission. -->
Thermistor Temperature Sensor.
=====================

* KEYWORDS: thermistor, sensor

This module uses the following common thermistor characteristics found in most off the shelf thermistor based temperature sensors.

The module has been written to match the characteristics and codes in this [thermistor datasheet](http://www.sontay.com/sites/default/files/productdownloads/Thermistor%20Types%20and%20Compatibility%20Charts_10.pdf).

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