<!--- Copyright (c) 2016 Luwar. See the file LICENSE for copying permission. -->
MMC212xMG Dual-axis Magnetic Sensor from MEMSIC used in HDMM01 breakout from Pollin
===================================================================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/MMC212xMG. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,I2C,MMC212xMG,magnetic,compass,HDMM01

The MMC212xMG/HDMM01 is a dual-axis magnetic sensor with [[I2C]] interface. It can measure magnetic field with a full range of ±5 gausses and a sensitivity of 512counts/gauss @3.0 V at 25°C. Use the [MMC212xMG](/modules/MMC212xMG.js) ([About Modules](/Modules)) module for it.

You can wire this up as follows:

| Device Pin | Espruino |
| ---------- | -------- |
| GND /      | GND      |
| VCC        | 3.3      |
| SCL        | A8       |
| SDA        | B4       |

**Note:** Connect I2C pull up resistors on SCL and SDA to 3V3. There are no resistors on the HDMM01 breakout.
Rp selection guide: 4.7Kohm for a short I²C bus length (less than 10cm), and 10Kohm for less than 5cm I²C bus.


Restore Sensor Characteristics 
------------------------------

The influence of a strong magnetic field (more than 5.5 gausses) could change the sensor characteristics. It is possible to restore the original sensor characteristics with a strong restoring magnetic field which can be generated internally by the sensor. The following command will do this. It's not necessary to execute this command on every reboot but should be done occasionally.

```JavaScript
I2C3.setup( { scl: A8, sda: B4 } );
var mmc = require("MMC212x").connect( I2C3 );
mmc.restoreSensorCharacteristic();
```

Calibration
-----------

The sensor is not calibrated and must be calibrated for the first time and later from time to time.

You have to rotate the sensor horizontally during the following endless loop and try to find the minimal and maximal values of x and y.

```JavaScript
I2C3.setup( { scl: A8, sda: B4 } );
var mmc = require("MMC212x").connect( I2C3 );

var xMax, xMin, yMax, yMin;
function startMeasuring() {
  mmc.getMagneticValue( function(x,y) {

    xMin = Math.min( xMin || x, x );
    xMax = Math.max( xMax || x, x );
    yMin = Math.min( yMin || y, y );
    yMax = Math.max( yMax || y, y );

    print( "mmc.calibrate(" + xMin + ", " + xMax + ", " + yMin + ", " + yMax + " ); // x=" + x + " y=" + y );

    startMeasuring();
  } );
}

startMeasuring();
```

After calling the dumped command the sensor is calibrated. The sensor does not remember the min and max values. So you have to call the method calibrate() every time on program startup:

Now you should place the last output to , e.g. mmc.calibrate(1925, 2151, 1919, 2147 );
 
```JavaScript
I2C3.setup( { scl: A8, sda: B4 } );
var mmc = require("MMC212x").connect( I2C3 );
mmc.calibrate(1925, 2151, 1919, 2147 ); // call on every startup
``` 


Read raw magnetic sensor values
-------------------------------

The uncalibrated magnetic values of the x- and y-axis can be read asynchronously.

```JavaScript
I2C3.setup( { scl: A8, sda: B4 } );
var mmc = require("MMC212x").connect( I2C3 );

mmc.getMagneticValue( function(x,y) {
  console.log( "x = " + x + "    y = " + y );
} );
```


Calculate the angle between magnetic north and the +y-axis of the sensor
------------------------------------------------------------------------

On Page 4 of the datasheet is a picture with the sensing directions +x and +y.
The module can calculate from the raw sensor values (x,y) the angle between the magnetic north and the +y-axis of the sensor with the following convention:

 - The angle is increasing in clockwise direction.
 - +y-axis pointing to north →   0°
 - +y-axis pointing to east  →  90°
 - +y-axis pointing to south → 180°
 - +y-axis pointing to west  → 270°

```JavaScript
I2C3.setup( { scl: A8, sda: B4 } );
var mmc = require("MMC212x").connect( I2C3 );
mmc.calibrate(1925, 2151, 1919, 2147 ); // values from calibration

mmc.getMagneticValue( function(x,y) {
  console.log( " angle = " + mmc.getAngle(x,y));
} );
```

Types with different I²C-addresses
----------------------------------

There are four types which only differ by their I²C addresses:

| Device    | I²C addresse |                         |
| --------- | ------------ |------------------------ |
| MMC2120MG | 0x30         | Default, used in HDMM01 |
| MMC2121MG | 0x32         |                         |
| MMC2122MG | 0x34         |                         |
| MMC2123MG | 0x36         |                         |


```JavaScript
I2C3.setup( { scl: A8, sda: B4 } );

var mmc = require("MMC212x").connect( I2C3 ); // MMC2120MG, default, use address 0x30
var mmc = require("MMC212x").connect( I2C3, 0x30 ); // MMC2120MG 
var mmc = require("MMC212x").connect( I2C3, 0x32 ); // MMC2121MG 
var mmc = require("MMC212x").connect( I2C3, 0x34 ); // MMC2122MG 
var mmc = require("MMC212x").connect( I2C3, 0x36 ); // MMC2123MG 
```


Buying
-----

* [Pollin](http://www.pollin.de/shop/dt/NTM4OTgxOTk-)


Links
-----
* [Datasheet from Memsic](files/MMC212xMG.pdf)
* [Datasheet from Pollin](http://www.pollin.de/shop/downloads/D810164D.PDF)
* [Breakout HDMM01 (in German)](http://www.pollin.de/shop/downloads/D810164B.PDF)


References
----------

* APPEND_JSDOC: MMC212xMG.js
