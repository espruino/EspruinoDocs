<!--- Copyright (c) 2014 Lucie Tozer. See the file LICENSE for copying permission. -->
Sensirion SHT10 SHT11 & SHT15 Temperature and Relative Humidity Sensor Module
=====================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/SHT1x. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,SHT10,SHT11,SHT15,sensirion,temperature,humidity

Use the [SHT1x](/modules/SHT1x.js) ([About Modules](/Modules)) module for reading data from the Sensirion SHT1x series of devices.

These devices use a 2 wire communication bus using a protocol similar to, but not quite the same as the I2C protocol. The differences mean that these sensor devices cannot be used with a standard I2C bus.

This module handles the communication between the Espruino and the SHT1x sensor. The differences in protocol means that any 2 digital pins may be used to communicate with the sensor simply by telling the module which pins it is connected to.

Currently the module only provides support for the high resolution modes meaning that temperature readings take a minimum of 320ms and humidity reading take a minimum of 80ms to complete.


Here is an example of how to wire the sensor up (I have chosen to use B2(as scl) and B3(as sda)):

| SHT1x Pin  | Espruino |
| ---------- | -------- |
| 1 (GND)    | GND      |
| 2 (SDA)    | B3       |
| 3 (SCL)    | B2       |
| 4 (VCC)    | 3.3v     |

How to use the SHT1x module:

```
  var sht = require("SHT1x").connect(B2,B3);
  sht.readTemperature();
  sht.readHumidity();
```

**List of function in the SHT1x module**

**readTemperature()** - returns the temperature reading in degC to 2 decimal places eg. 20.41

**readHumidity()** - returns the humidity reading as a percentage (%) to 11 decimal places eg. 48.43267804799

**readCompensatedHumidity()** - reads both the temperature and humidity of the sensor then applies a formula to compensate for the coefficient of the humidity sensor that can drift at different temperatures. Useful for extremities of temperature but takes longer to perform. Returns the humidity reading as a percentage (%) to 11 decimal places eg. 48.43267804799

**resetConnection()** - resets the connection with the sensor if any problems occur

**calculateDewPoint(temperature, humidity)** - A function in the software module that will return the present dew point in degC depending on the temperature and humidity values that you provide as parameters.
eg.

```
  var sht = require("SHT1x").connect(B2,B3);
  mytemp = sht.readTemperature();
  myhumid = sht.readHumidity();
  sht.calculateDewPoint(mytemp,myhumid);
```

--------------------------------------------------------------------------------------------------------------------

**expected updates**

- Streamline the general flow
- Error logging
- Self correction to allow the module to reset the sensor if it detects any problems and attempt reading it again.
- Include an option to read the sensor with the lower resolutions providing a faster response (80ms temp : 20ms humidity)
- Option to use the sensor in passive mode. Currently your code must wait until the sensor completes its reading before carrying on, a passive mode would allow your code to continue and set a boolean variable to let you know when the requested value is ready.
- Option to enable the on chip heater
- create a minified version of the module as standard(small undescriptive internal function names etc.) with a more easy to read commented module as an optional download.
