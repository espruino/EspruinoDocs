<!--- Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Stepper Motor Module
====================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/StepperMotor. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Stepper,Motor,Steppermotor,Stepper motor

**Note:** For a more in-depth look at Stepper Motors, see the
[Stepper Motor](/Stepper Motors) page - this page deals with the
stepper motor module.

You can see the source for the [[StepperMotor.js]] module here.

Wiring Up
--------

See the [Stepper Motor](/Stepper Motors) page for more information on wiring.
For this module you need to have attached your stepper motor driver to any
4 IO pins on Espruino.



Simple Usage
------------

Just create an instance of `StepperMotor` and pass in an array of pins for
each of the 4 stepper motor coils. For most stepper motor & driver combinations
that you would buy, just supply the 4 pins in the order they are numbered on
the driver board (1 to 4).

If your stepper motor doesn't move smoothly, you may need experiment with
different orderings of the pins.

When initialised you can call `moveTo` on it to move the motor.

```JavaScript
var StepperMotor = require("StepperMotor");

var motor = new StepperMotor({
  pins:[B10,B13,B14,B15]
});

setWatch(function() {
  motor.moveTo(motor.getPosition()+100);
}, BTN, {repeat:true, edge:"rising", debounce:50});
```

Advanced usage
--------------

If your motor is stepping too fast or slow then you can set `stepsPerSec`
to a differen number (default is 100):

```
var motor = new StepperMotor({
  pins : [B10,B13,B14,B15],
  stepsPerSec : 50,
});
```

You can also choose the speed at which you wish to move the motor by specifying
it in `moveTo` - you can also have a callback function when the position is reached,
and by specitying `true` for `turnOff` (the very last argument) you can turn
the motor off when finished:

```
// Move to step 100 in 1 second
motor.moveTo(100, 1000, function() {
  // Move back to step 0 in 0.5 seconds
  motor.moveTo(0, 500, function() {
    // we're done!
    console.log("Done!");
  }, true);  
});
```

If you want to use a different step pattern or your motor driver uses
different polarities for some pins, you can set these on initialisation.

It may also be important to set the output pattern used to turn the stepper
motor completely off.

For instance the following sets an 8 step pattern.

```
var motor = new StepperMotor({
  pins : [B10,B13,B14,B15],
  stepsPerSec : 100, /* default */
  pattern :  [0b0001,0b0011,0b0010,0b0110,0b0100,0b1100,0b1000,0b1001],
  offpattern : 0b0000, /* default */
  onstep : undefined, /* default - or specify a function to be called once per step */
});
```

Reference
---------

* APPEND_JSDOC: StepperMotor.js

Using
-----

* APPEND_USES: stepper

Buying
-----

You can get all kinds of stepper motors and drivers, however the
[small 5V geared stepper motors on eBay](http://www.ebay.com/sch/i.html?_nkw=5v+stepper+motor+uln2003)
are amazingly cheap, and very easy to wire up to Espruino.
