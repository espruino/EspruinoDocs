<!--- Copyright (c) 2018 Joachim Klein. See the file LICENSE for copying permission. -->
LIS3MDL
=======

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/LIS3MDL. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Shield, LIS3MDL, Magentic-Sensor, Compass, Magnetometer

The [LIS3MDL](http://www.st.com/en/mems-and-sensors/lis3mdl.html) is an ultra-low-power high-performance three-axis magnetic sensor. Support is provided with the
[[LIS3MDL.js]] module.

This module was tested with the NUCLEO-STM32F401 + X-NUCLEO-IKS01A1.

The IKDS01A1 shield includes the following sensors:
* [LPS25HB](/LPS25HB)  
* [HTS221](/HTS221)
* [LSM6DS0](/LSM6DSL)
* [LIS3MDL](/LIS3MDL)

## Required Resources
This module require the following resources:

- I2C Interface, data rate max is 400k, in this example we use B8 and B9
- DRDY Input if this signal is used (C0, A5 on shield)
- INT Pin if you se the interrupt. (C1, A4 on shield)

## Enable and use the Sensor
In this example the Sensor is enabled in normal operating mode, with interrupt enabled.
Temperature sensor is also enabled.
If you like to use the default parameters (no interrupts, no temperature sensing) just remove the parameters.
The maxscale is also adjusted. Values for Gauss can be 4, 8, 12 and 16.
```
I2C1.setup({scl:B8,sda:B9});
var temp = require("LIS3MDL").connect(I2C1);
var result;

print(temp.GetID()); // Who I am
temp.enable({Interrupt:true, TempSense:true, FullScale:16, Threshold:1000});

result =  temp.Read();

print ("x:"+result[0]);  
print ("y:"+result[1]);  
print ("z:"+result[2]);  

print ("Temp:"+temp.GetTemperature());  
```
## Diagnostic data
To verify our configuration we can use the logReg function.
This function will dump all relevant register values, including configuration
and status registers to the serial interface.
This function is intended to be used only during development.
```
temp.logReg();
```
## Enable the Sensor
To verify if we are connected to the expected periveral we can read the chip ID.
The return value should be 61 (dec).
```
print(temp.GetID()); // Who I am
```

Reference
---------

* APPEND_JSDOC: LIS3MDL.js
