  <!--- Copyright (c) 2014 Spence Konde. See the file LICENSE for copying permission. -->
  ADXL345 Accelerometer
  =====================

  * KEYWORDS: Module,ADXL345,accelerometer,gyroscope


This module interfaces with an ADXL345 accelerometer. This is a low cost digital accelerometer which is widely available online. 
It is recommended that you have the data sheet on hand if using advanced functionality. This is a complicated part, with a surprising number of features.

http://www.analog.com/static/imported-files/data_sheets/ADXL345.pdf


Setup I2C, then call:

var accel = require("ADXL345").connect(i2c,cspin,range)

i2c is the I2C it is connected to, cspin is the pin that CS is connected to, since the ADXL345 doesn't seem to recognize that CS is high if it's high on startup. 
Range (default 0, +/- 2 g's) is:

  | - | ------- |
  | 0 | +/-2 g  |
  | 1 | +/-4 g  |
  | 2 | +/-8 g  |
  | 3 | +/-16 g |

By default, the accelerometer starts off in standby mode. To take data, you need to set it to Measure mode. If argument is true, measure mode will be turned on, otherwise, it will be turned off. Calling setup() will also turn off measure mode. 

accel.measure(true or false)

To read the values from it, just use accel.read(). The read process is lightning fast, so it doesn't need to use a callback. It returns an object with 3 properties, x, y, and z, converted into units of g:

accel.read()

You may want to calibrate your measurements with known offsets for the x, y and/or z axis. Do this with setoffset() - all arguments are in G's (- or -), maximum 2 g. :

accel.setoffset(x,y,z)


Change setup options:

accel.setup(BW_RATE,POWER_CTL)

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

  | -- | ----- |
  | 00 |  8 hz |
  | 01 |  4 hz |
  | 10 |  2 hz |
  | 11 |  1 hz |



Interrupt configuration - the ADXL345 supports interupts on the two interupt pins. To make these work, it is recommended that you have a copy of the data-sheet hand. 

Configure taps with:

accel.tap(threshold,duration,latency,window,axes)

threshold is amount of acceleration needed for something to qualify as a tap, in milli-g's (rounded to nearest 62.5)
duration is max length of a tap, latency is the time after the first tap before a second tap can start, and window is the length of the window during which the second tap of a double tap can happen. All are in ms

axes is a byte listing which axes can participate in tap events. Only the three least significant bits are used; 0x04 is x, 0x02 is y, 0x01 is z. Default is 0x07 (all axes). 

Configure freefall interrupts:

accel.ff(threshold,time)

threshold is the threshold below which the accelerometer will assume it's in freefall, in milli-g's The data sheet recommends 300-600.

time is the time it has to be in freefall before the interrupt is triggered, in ms. 


Configure activity/inactivity setup:

accel.act(thact,thinact,tinact,actctl)

thact and thinact are the thresholds for activity and inactivity, in millig's, rounded to nearest 62.5. 
tinact is how long (in seconds) change must be below thinact before the device considers itself inactive. 
actctl is a byte specifying which axes may participate in activity and inactivity determination. Axes for activity and inactivity can be set separately. 0x77 enables all axes to participate in both activity and inactivity. 


Enable/disable interrupts:

Finally, once you've configured your interupts, enable them here:

accel.interrupts(enable,map);

Both arguments are a byte; enable determies whether each interrupt is enabled (1=enabled), and map determines whether it goes to INT1 (0) or INT2 (1) pin. Format is the same on both, with 1 bit per type of interrupt:

|Data Ready|Single Tap|Double Tap|Activity|Inactivity|free fall|watermark|overrun|

When an interrupt happens, you can get information on it with:

accel.getintinfo()

This returns an object with two properties: tap (tap axes), and interrupt (containing the current status of interrupts - same format as for interrupts())

