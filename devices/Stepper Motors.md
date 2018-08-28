<!--- Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Stepper Motors
============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Stepper+Motors. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Stepper,Motor,Steppermotor,Stepper motor

[Stepper motors](http://en.wikipedia.org/wiki/Stepper_motor) generally come in two types, [Unipolar](http://en.wikipedia.org/wiki/Stepper_motor#Unipolar_motors) with 5 or 6 wires, and [Bipolar](http://en.wikipedia.org/wiki/Stepper_motor#Bipolar_motor) with 4 wires.

**There are now code libraries available to automate the task of controlling
a stepper motor (below).** If you're interested in seeing how a stepper motor works and controlling it from first principles, read on!

* The [Stepper Motor Module](/StepperMotor) allows direct connection to a stepper
motor via a simple motor driver IC (eg. one wire per motor coil is connected from Espruino into the driver). This works on any Espruino device.
* The [NRF52 Stepper Motor Module](/NRF52Stepper) is designed for connecting
nRF52-based Espruino devices to a specialist stepper motor driver IC. It uses
the nRF52 peripherals to provide glitchless stepper motor control independent
of CPU usage.


Wiring Up
--------

You can't drive stepper motors (whatever the type) directly from Espruino - you'll need to use some kind of motor driver to provide enough power. Which driver you use depends on which type of stepper motor you have...

### 4 wire (BiPolar)

These motors require you to be able to connect each wire to positive voltage or ground independently. Because of this you need a [H Bridge](http://en.wikipedia.org/wiki/H-bridge) motor driver with 4 outputs, like the [[L293D]]. Something that can only pull down to ground (like the [[ULN2003]]) won't be good enough.

We're assuming the following connections:

| Stepper Wire | Connection |
|------|------------|
| Bank 1 Wire 1 | Motor Driver 1 |
| Bank 1 Wire 2 | Motor Driver 3 |
| Bank 2 Wire 1 | Motor Driver 2 |
| Bank 2 Wire 2 | Motor Driver 4 |


### 5/6 wire (Unipolar)

You connect the common wire(s) of these motors to a positive voltage and then move them by connecting the other wires to ground in the correct pattern. Because of this, you can use almost any drive chip as long as it has enough outputs. The [[ULN2003]] is a good example, but you can also use the [[L293D]] (however you won't be using its pull-up functionality).

We're assuming the following connections:

| Stepper Wire | Connection |
|------|------------|
| Bank 1 Wire 1 | Motor Driver 1 |
| Bank 1 Common | Positive Voltage |
| Bank 1 Wire 2 | Motor Driver 3 |
| Bank 2 Wire 1 | Motor Driver 2 |
| Bank 2 Common | Positive Voltage |
| Bank 2 Wire 2 | Motor Driver 4 |

4 Step Control
------------

Once wired up, controlling stepper motors should be very similar no matter which type they are:

```JavaScript
var step = 0;
var steps = [0b0001,0b0010,0b0100,0b1000];
var stepperPins = [A3,A2,B10,B11]; // Change these to pins for your motor driver

function doStep() {
 step++;
 digitalWrite(stepperPins, steps[step % steps.length]);
}
var stepInterval = setInterval(doStep, 200);
```

When you run this, you may notice that the stepper motor you have does not step around in the same direction for each step. This is just because the wires aren't connected in the right order. Try swapping the 4 pins in the stepperPins array around to see if different combinations work.

8 Step Control
------------

Just copy the code from above, and while it's running, type:

```JavaScript
var steps = [0b0001,0b0011,0b0010,0b0110,0b0100,0b1100,0b1000,0b1001];
```

Change the Speed
--------------

This is really easy, just call changeInterval to update the speed at which setInterval works:

```JavaScript
changeInterval(stepInterval, 100);
```

Microstepping
-----------

You can even use the PWM analog outputs to [microstep](http://en.wikipedia.org/wiki/Stepper_motor#Microstepping)!

```JavaScript
function doStep() {
  step+=0.1;
  analogWrite(stepperPins[0], Math.sin(step));
  analogWrite(stepperPins[1], Math.sin(step + Math.PI*0.5));
  analogWrite(stepperPins[2], Math.sin(step + Math.PI));
  analogWrite(stepperPins[3], Math.sin(step + Math.PI*1.5));
}
```

Stepping to an exact location
-------------------------

The code below will step to an exact location, with dynamic speed control! Just set targetStep to the integer step number you require!

```JavaScript
var step = 0;
var targetStep = 0;
var steps = [0b0001,0b0011,0b0010,0b0110,0b0100,0b1100,0b1000,0b1001];
var stepperPins = [D9,D11,D14,D12];
var stepInterval = setInterval(doStep, 100);
var doStep = function () {
 var d = step - targetStep;
 if (d < 0)
   step++;
 else if (d > 0)
   step--;
 if (d==0) { // we're there - sleep
   changeInterval(stepInterval, 500);
   digitalWrite(stepperPins, 0);
 } else {
   var time = 100 - Math.abs(d)*4;
   if (time<10) time=10;
   changeInterval(stepInterval, time);
   digitalWrite(stepperPins, steps[step%steps.length]);
 }
};
```

Using
-----

* APPEND_USES: Stepper Motor

Buying
-----

You can get all kinds of stepper motors and drivers, however the
[small 5V geared stepper motors on eBay](http://www.ebay.com/sch/i.html?_nkw=5v+stepper+motor+uln2003)
are amazingly cheap, and very easy to wire up to Espruino.
