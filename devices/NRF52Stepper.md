<!--- Copyright (c) 2018, Uri Shaked. See the file LICENSE for copying permission. -->
nRF52 Accurate Stepper Motor Driver
===================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/NRF52Stepper. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,nRF52,nRF5x,nRF52832,Puck.js,Stepper,Motor,Steppermotor,Stepper motor,A4988,DRV8825,DRV8834
* USES: Puck.js,Pixl.js,MDBT42Q,nRF52832,nRF52

**Note:** For a more general look at Stepper Motors, see the [Stepper Motor](/Stepper+Motors) page.

This module allows accurate control of Stepper motors drivers
using nRF52's built-it hardware capabilities. Stepper motor
drivers are chips that connect to your stepper motor and provide a simple digital interface for precise position control. Commonly available drivers include A4988, DRV8825, DRV8834, etc. They can be found inside 3D Printers, CNC machines, etc.

Stepper motor drivers has two digital inputs for controlling the motor: DIR and STEP. DIR controls the direction of the rotation (CW vs CCW), and sending a pulse on the STEP pin rotates the motor a single step in the selected direction. Common motors have step angle of 1.8 degrees (that is 200 steps per one turn), and many drivers also support microsteps, allowing more fine-grained control of the position. For instance, DRV8825 supports up to 32 microsteps, and other drivers may support up to 256 microsteps.

This module allows sending an exact number of steps in a specified speed on a given digital pin that is connected to the STEP pin of a stepper motor. It concurrently only supports running one motor at a time.

Usage Example
-------------

Send 1000 pulses per second up to a total of 6400 pulses on the digital pin D8. This should rotate a 200 steps-per-turn motor
connected to a 32-microsteps driver exactly one turn (200 * 32 = 6400) in 6.4 seconds:

```
const NRF52Stepper = require('NRF52Stepper');
const stepper = new NRF52Stepper(D8);
stepper.start(1000, 6400);
```

Pause the stepping:
```
stepper.pause();
// The motor will stop moving until you call stepper.resume()
```

Resume the stepping:
```
stepper.resume();
```

Change the speed to 500 steps per second (total count of steps to move will stay intact):
```
stepper.setSpeed(500);
```

Stop the motor:
```
stepper.stop();
// After calling stop(), you can call start() again. This will
// also reset the counter.
```

Restart the motor after it has stopped, with the same step
count given in the previous start() call. If this is called
while the motor is still moving, the step counter will be reset,
similar to the bahaviour of the start() method:
```
stepper.restart();
```

Return the number of steps (pulses) sent so far:
```
stepper.readCounter();
```

Using
-----

* APPEND_USES: stepper

Buying
-----

You can get Stepper Motor Drivers from:

* [Pololu](https://www.pololu.com/category/120/stepper-motor-drivers)
* [SparkFun](https://www.sparkfun.com/categories/334)
* eBay - [A4988](http://www.ebay.com/sch/i.html?_nkw=A4988), [DRV8825](http://www.ebay.com/sch/i.html?_nkw=DRV8825) and [DRV8834](http://www.ebay.com/sch/i.html?_nkw=DRV8834)
