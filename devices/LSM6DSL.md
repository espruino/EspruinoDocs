<!--- Copyright (c) 2018 Joachim Klein. See the file LICENSE for copying permission. -->
LSM6DSL Accelerometer and 3D Gyroscope
======================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/LSM6DSL. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Shield,LSM6DSL,I2C,Gyro,Accelerometer,Gyroscope,Sensor

This module is used to initialize and setup a STMicroelectronis LSM6DSL.
For testing I used a NUCLEO-STM32F401 + X-NUCLEO-IKS01A2.  [LSM6DSL](/modules/LSM6DSL.js)

The IKDS01A1 shield includes the following sensors:
* [LPS22HB](/modules/LPS22HB.js)
* [HTS221](/modules/HTS221.js)
* [LSM6DSL](/modules/LSM6DSL.js)
* LSM303AGR

## Required Resources
This module require the following resources:

- I2C Interface, data rate max is 400k
- INT Pin if you se the interrupt. (B5 on Nucleo)

## Enable and use the Sensor
In this example the Sensor is enabled in normal operating mode, with interrupt enabled.
Speed is slow (12.5 Hz). It is a good idea to use a low frequency.
If interrupts are used keep in mind, that a higher frequency will cause a high interrupt load.

If no settings are used for the enable function the following default configuration is used:
- intrrupts disabled
- 12.5Hz Data rate in low power mode
- gyro and acceleromter enabled

```

I2C1.setup({scl:B8,sda:B9, bitrate:400000});

var MyLSM = require("LSM6DSL").connect(I2C1);
MyLSM.enable({interrupt:true, mode:"slow", sensor:"gyro"});

```
## Diagnostic Data
To verify our configuration we can use the logReg function.
This function will dump all relevant register values, including configuration
and status registers to the serial interface.
This function is intended to be used only during development.
```

MyLSM.logReg();

```
## Read Sensor Data
The sensor data is read and stored in object variables.
There exist three functions to read out sensor data.
- update: Read Gyro and accelerator data from sensor
- updateG: Read Gyro  data from sensor
- updateXL: Accelerator data from sensor

Keep in mind: Read only required data, this reduce the time required to read the data.
This approach is choosen, since this allow it to implement more complex allgorithm in the library.
Also it is faster to store the data, then to return data which is not used.

```

MyLSM.update();
MyLSM.updateG();
MyLSM.updateXL();

```
## Use Sensor Data
The sensor data is read and stored in object variables.
Return value is in g for the Accelerometer and Degree (Change) for the Gyro.
Currently calibration is not implemented, therefore you have to take care about the drift.
Also it seems that Degree is not exact what is expected.

- XL_X
- XL_Y
- XL_Z
- G_X
- G_Y
- G_Z

Keep in mind: Read only required data, this reduce the time required to read the data.

```

print("XL_X: " + MyLSM.XL_X);  
print("XL_Y: " + MyLSM.XL_Y);  
print("XL_Z: " + MyLSM.XL_Z);  
print("G_X:  " + MyLSM.G_X);  
print("G_Y:  " + MyLSM.G_Y);  
print("G_Z:  " + MyLSM.G_Z);  

```
## Komplex Example
This example configure the LSM6DSL and enable the interrupts.
The push button on the Nucleo Board is used to turn on and of reading of results.
Since the LIS6DSL waits for the next measurement until the
previous value is read this allows us to start and stop the sensor.
As you can see it is also required to read the sensor at the beginning to start first measurement.

Please be aware that his example will not work from flash.
Use the E.init() function for configuration if it should run from flash.

To start the sensor press the push button on the Nucleo Board.
```

// LSM6DSL Example

// Change Ports if you use another Board!
I2C1.setup({scl:B8,sda:B9, bitrate:400000});

var MyLSM = require("LSM6DSL").connect(I2C1);
var RunMode = false;

MyLSM.enable({interrupt:true, mode:"slow", sensor:"gyro"});

var result = MyLSM.GetID();
print( "ID: " + result);

function io_interrupt ( )
{
  if ( RunMode === true )
  {
    MyLSM.update();
    print("X: " + MyLSM.XL_X + " Y: " + MyLSM.XL_Y+ " Z: " + MyLSM.XL_Z);  
   }
}

function io_RunMode ( )
{
    if ( RunMode === true )
    {
      RunMode = false;
      print ("off");
    } else {
      print ("on");
      RunMode = true;
      MyLSM.update();
    }
}

setWatch(io_RunMode, BTN,
{repeat:true, edge:"rising"});

setWatch(io_interrupt, B5,
{repeat:true, edge:"rising"});


```
  Reference
  ---------

  * APPEND_JSDOC: LSM6DSL.js
