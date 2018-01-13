<!--- Copyright (c) 2014 Spence Konde. See the file LICENSE for copying permission. -->
ADXL345 Accelerometer
=====================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/ADXL345. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,ADXL345,accelerometer,gyroscope

Overview
-----------------

This module interfaces with an ADXL345 accelerometer. This is a low cost digital accelerometer which is widely available online. It is a MEMS device, using the same principle as used in other MEMS accelerometers, like those used in smartphones. The ADXL345 can communicate with the MCU using SPI or I2C, however, this module only supports I2C. Per the data sheet, using SPI is more complicated because another device on the same bus could do something that looks like an I2C start command while CS is high, so they recommend adding external components to prevent anything from getting through the data line when CS is low, if SPI is used.

It is recommended that you have the data sheet on hand if using advanced functionality. This is a complicated part, with a surprising number of features.

http://www.analog.com/static/imported-files/data_sheets/ADXL345.pdf

Wiring
----------------

The following assumes you are using a breakout board. The pins are not practical to solder at home.

Connect SDA and SCL to the appropriate I2C pins on the Espruino, and VCC and GND to 3.3v and GND.

The ADXL is calibrated for operation at 2.5v, not 3.3v, and this throws off the measurements slightly (see datasheet for details on correcting for this).

The CS pin must be connected to a GPIO pin (the ADXL345 doesn't seem to register that CS is high if it's that way when the part is powered on). 
The INT1 and INT2 pins can be connected to any GPIO pin if you wish to use the interrupt feature. Otherwise, don't connect them. 

Setup
-----------------

Setup I2C, then call:
```JavaScript
var accel = require("ADXL345").connect(i2c,cspin,range)
```

i2c is the I2C it is connected to, cspin is the pin that CS is connected to, since the ADXL345 doesn't seem to recognize that CS is high if it's high on startup. 
Range (default 0, +/- 2 g's) is:

  |   |         |
  | - | ------- |
  | 0 | +/-2 g  |
  | 1 | +/-4 g  |
  | 2 | +/-8 g  |
  | 3 | +/-16 g |

By default, the accelerometer starts off in standby mode. To take data, you need to set it to Measure mode. If argument is true, measure mode will be turned on, otherwise, it will be turned off. Calling setup() will also turn off measure mode. 


Reading
------------------
```JavaScript
accel.measure(true or false)
```

To read the values from it, just use accel.read(). It returns an object with 3 properties, x, y, and z, converted into units of g:
```JavaScript
accel.read()
```

You may want to calibrate your measurements with known offsets for the x, y and/or z axis. Do this with setoffset() - all arguments are in G's (- or -), maximum 2 g. :
```JavaScript
accel.setoffset(x,y,z)
```


Advanced Options
-------------------
```JavaScript
accel.setup(BW_RATE,POWER_CTL)
```

This sets the two setup registers. Both arguments are bytes that get sent to the respective registers. Note that for power_ctl, bit 4 (measure) is forced off, so calling this turns off measure mode. According to the datasheet, it is recommended to turn off measure mode if any changes are made to power status to ensure that it returns accurate data. 

BW_RATE: Bit 5 is low power bit - if set, noise will be higher, but power use lower. 
Bit 4~1 set the data rate:
  
  | Rate (Hz)|Bandwidth (Hz)|Rate Code|IDD (µA)|
  |----------|--------------|---------|--------|
  | 3200	 | 1600			| 1111    |   140  | 
  | 1600	 | 800			| 1110    |    90  |
  | 800		 | 400			| 1101    |   140  |
  | 400		 | 200			| 1100    |   140  |
  | 200		 | 100			| 1011    |   140  |
  | 100		 | 50			| 1010    |   140  |
  | 50		 | 25			| 1001    |    90  |
  | 25		 | 12.5			| 1000    |    60  |
  | 12.5	 | 6.25			| 0111    |    50  |
  | 6.25	 | 3.13			| 0110    |    45  |
  | 3.13	 | 1.56			| 0101    |    40  |
  | 1.56	 | 0.78			| 0100    |    34  |
  | 0.78	 | 0.39			| 0011    |    23  |
  | 0.39	 | 0.20			| 0010    |    23  |
  | 0.20	 | 0.10			| 0001    |    23  |
  | 0.10	 | 0.05		 	| 0000    |    23  |

POWER_CTL:
Bit 6 links activity and inactivity (see datasheet)
Bit 5 enables auto-sleep (see datasheet)
bit 4 enables measurements (forced off in setup() per mfg recommendations, use measure() to turn on)
bit 3 enables sleep mode (see datasheet)
Bits 1 and 2 set how often the device wakes in sleep mode to take a measurement:

  |    |       |
  | -- | ----- |
  | 00 |  8 hz |
  | 01 |  4 hz |
  | 10 |  2 hz |
  | 11 |  1 hz |


Interrupts
------------------

The ADXL345 supports interupts on the two interupt pins. You can connect these to input pins, and use setWatch() to react to them. The functions below act as wrappers for the relevant registers; This is not intended as a substitute for the datasheet, nor is is expected that this will make much sense without the datasheet. 

```JavaScript
accel.tap(threshold,duration,latency,window,axes)
```

This configures interupts based on "tap" events (ie, a brief acceleration, as if you tapped the device). The sort of interrupt is used in (among many other things) some fitness trackers, which have no buttons, but already have an accelerometer to act as a pedometer. 

* threshold is amount of acceleration needed for something to qualify as a tap (in milli-g's, rounded to nearest 62.5).
* duration is max length of a tap (ms)
* latency is the time after the first tap before a second tap can start (ms)
* window is the length of the window during which the second tap of a double tap can happen. (ms)
* axes is a byte listing which axes can participate in tap events. Only the three least significant bits are used; 0x04 is x, 0x02 is y, 0x01 is z. Default is 0x07 (all axes). 

```JavaScript
accel.ff(threshold,time)
```

This configures interrupts based on "freefall" events (ie, when acceleration is below a given threshold, as if the object is falling). This sort of interrupt is used to park the heads on laptop harddrives when the laptop is dropped, in the (often futile) hope of saving the drive. 

* threshold is the threshold below which the accelerometer will assume it's in freefall, in milli-g's The data sheet recommends 300-600.
* time is the time it has to be in freefall before the interrupt is triggered, in ms. 

```JavaScript
accel.act(thact,thinact,tinact,actctl)
```

The ADXL can generate interupts on activity or inactivity. 
* thact is the threshold for activity (in milli-g's, rounded to nearest 62.5)
* thinact is the threshold for activity  (in milli-g's, rounded to nearest 62.5) 
* tinact is how long (in seconds) accleration must be below thinact before the device considers itself inactive. 
* actctl is a byte specifying which axes may participate in activity and inactivity determination. Axes for activity and inactivity can be set separately. 0x77 enables all axes to participate in both activity and inactivity. 

```JavaScript
accel.interrupts(enable,map)
```

After configuring your interupts, enable them with this function. The datasheet repeatedly warns that the interrupts being used should be configured before being enabled, lest unspecified "undesired behavior" result. 

Both arguments are a byte; enable determies whether each interrupt is enabled (1=enabled), and map determines whether it goes to INT1 (0) or INT2 (1) pin. Format is the same on both, with 1 bit per type of interrupt:

  | Bit | Tyope |
  |---|------------|
  | 7 | Data Ready |
  | 6 | Single Tap |
  | 5 | Double Tap |
  | 4 | Activity |
  | 3 | Inactivity |
  | 2 | free fall |
  | 1 | watermark |
  | 0 | overrun |

```JavaScript
accel.getintinfo()
```

This gets information on the last interrupt triggered. It returns an object with two properties: tap (tap axes), and interrupt (containing the current status of interrupts - same format as for interrupts())


Buying
-----

ADXL345 modules can be purchased from many places:
* [eBay](http://www.ebay.com/sch/i.html?_nkw=ADXL345&_sacat=92074)
* [digitalmeans.co.uk](https://digitalmeans.co.uk/shop/index.php?route=product/search&tag=adxl345)
