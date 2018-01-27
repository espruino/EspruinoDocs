<!--- Copyright (c) 2018 Your Name. See the file LICENSE for copying permission. -->
LIS3MDL
=====================

* KEYWORDS: Shield, LIS3MDL, Magentic-Sensor

This module is used to initialize and setup a STMicroelectronis LIS3MDL.
For testing I used a NUCLEO-STM32F401 + X-NUCLEO-IKS01A1. [LIS3MDL](/modules/LIS3MDL.js). 
The IKDS01A1 shield includes the following sensors:
* [LPS25HB](/modules/LPS25HB.js)  
* [HTS221](/modules/HTS221.js)
* LSM6DS0 
* [LIS3MDL](/modules/LIS3MDL.js)

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
