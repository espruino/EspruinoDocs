<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Measuring and Controlling Fan Speed
===============================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Fan+Speed. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Sensor,Control,Fan,Speed,Motor
* USES: Fan

This Tutorial assumes that you are able to enter code in Espruino. If you can't do that yet, please follow the steps on the [[Quick Start]] page

Introduction
----------

In this tutorial, we'll try and measure the speed of a [4 wire Intel](http://www.pavouk.org/hw/fan/en_fan4wire.html) CPU fan, and we'll then go on to make it run at exactly the speed we want. We'll do the measurements using 'setWatch', which 'watches' a pin, and calls a function whenever it changes state.

There is also a video version of this tutorial:

[[http://youtu.be/fOVz74YKzWA]]

Wiring Up
--------

The Intel 4 wire fans are 12v fans designed to be compatible with previous 2 and 3 wire fans. They have one digital input to control speed and one digital output to sense it. The pins are as follows:

|Fan Pin|Wire Colour|Connection
|-|--------------|-------
|1|	 Black	 |Ground
|2|	 Yellow	 |12v Power
|3|	 Green	 |Pull-down speed sensor (pulled down twice per revolution)
|4|	 Blue	 |Speed Control
The specification for the fans is quite exact, however for the sake of simplicity we'll ignore it, and instead of running the fan off of 12v, we'll run it off 5 - as that's what the Espruino board has available from USB.

So:

* Connect the black wire (Pin 1) to GND on the Espruino board
* Connect the yellow wire (Pin 2) to 5V on the Espruino board
* Connect the green wire (Pin 3) to any free pin on the Espruino board (I'm using B9 for this example)
* Connect the blue wire (Pin 4) to any pin that will produce a PWM analog output (type 'analogWrite()' and a list of pins will be shown - if any say '(DAC)' by them, don't use them)  (I'm using B8 for this example)
* Finally, find a 10 kOhm resistor, and connect it between pin 3 (green) on the fan, and a 3.3v pin on the Espruino board. This will 'pull up' the speed sensor. If you're feeling really lazy you can just connect pins 2 and 3 on the fan using the resistor instead.
* When you turn the power on, the fan should now start rotating (although quite slowly - because you're really supposed to run it from 12v).

Software
-------

First, we'll save our pin names to make everything more obvious. If you've used different pins, set them here:

```
var FAN_SPEED_OUT = B8;
var FAN_SPEED_IN = B9;
```

Now, we'll do a quick check to make sure everything is working. 

```
setWatch(function (e) { 
  digitalWrite(LED1, e.state); 
}, FAN_SPEED_IN, { repeat: true });
```

This will make the LED light up when the fan speed indicator sends a signal. Whenever the signal changes, this calls a function which sets the LED to the signal's new state.

It should make the LED flash on and off, and if you slow the fan down, it will flash on and off more slowly.

```digitalWrite(FAN_SPEED_OUT, 0);```

The fan (and LED) should now go *really* slowly.

```digitalWrite(FAN_SPEED_OUT, 1);```

The fan (and LED) should speed back up.

Now we're going to clear our watch (which will stop the LED blinking), because we want to try something else.

```clearWatch()```

We'll make a function which measures the time between signals from the fan. From this, we'll work out the RPM - revs per minute.

```
function onFanMovement(e) { 
  var d = e.time-lastTime;
  lastTime = e.time;  
  RPM = 60 / (d*2);
}
setWatch(onFanMovement, FAN_SPEED_IN, { repeat: true, edge: 'falling' });   
```

Note that here, we have set 'edge' to 'falling'. This is so that we only call our function when the signal goes from high to low. We do this because the signal may not be symmetrical (spending the same amount of time high as low). If we only measure the signal falling, we don't have to care about it.

We work out RPM because RPM = revs per minute, and there are 60 seconds in a minute. Also there are two pulses per revolution, so if we measure a pulse width, we have to double it.

Now we've entered that, but not much has happened. Espruino is silently updating a variable called 'rpm' in the background. Just type:

```RPM```

And the calculated rpm will be displayed!

Slow the fan back down with:

```digitalWrite(FAN_SPEED_OUT, 0);```

And then check the rpm again.. It should have lowered.

```RPM```

What if we now want to control the fan's RPM to make it constant?

We can change our onFanMovement function to turn the fan on or off depending on the speed we want. We'll also turn the LED on and off so we can see what's happening:

```
var targetRPM = 200;
function onFanMovement(e) { 
  var d = e.time-lastTime;
  lastTime = e.time;
  RPM = 60 / (d*2);
  var fanOn = RPM < targetRPM;
  digitalWrite(LED1, fanOn);
  digitalWrite(FAN_SPEED_OUT, fanOn);
}
```

You can now change targetRPM to the revs per minute that you want, and Espruino will try and control the fan speed (you can see from the LED).

```var targetRPM = 300;```
 
If you set it really high (for instance 10000) then the fan will never reach that speed, and the LED will stay on. If you set it very low then the LED will stay off.
 
Note that if you do set it in the middle, the fan speed oscillates up and down - it's not very steady at all. We can do better than this by using Pulse Width Modulation to turn the fan speed control on and off very quickly.
 
What we'll do is instead using fanOn (which is either on or off), we'll create a new variable, which we remember. This will be a number between 0 and 1 that determines how much the fan's motor should be on. Instead of setting it, we'll increment or decrement it by a small amount depending on whether we are faster or slower than we want to go.

```
var fanDrive = 0.5;
function onFanMovement(e) { 
  var d = e.time-lastTime;
  lastTime = e.time;
  RPM = 60 / (d*2);
  if (RPM < targetRPM) {
    if (fanDrive<1) fanDrive += 0.01;
  } else {
    if (fanDrive>0) fanDrive -= 0.01;
  }
  digitalWrite(LED1, fanDrive>0.5);
  analogWrite(FAN_SPEED_OUT, fanDrive);
}
```

Note that we have to stop the 'fanDrive' variable going out of range. If you had set targetRPM to something unreachable, the value of fanDrive would have kept going up - and when you set targetRPM back down, it would have taken ages for it to get below 1 again!

If you try setting targetRPM now, after a few seconds the fan will reach almost exactly the right speed. You can see how much the fan is being told to move by typing:

```fanDrive```

If you keep executing that, you'll see it changing as the fan speed it kept constant.

You can also nudge it and see what happens!

```fanDrive=1;```

This will make the fan run as fast as possible, and then Espruino will slowly count it down until the correct value is reached.

So now this works quite well, however it takes longer to adjust when the fan is going slowly than it does to adjust when it is going quickly. In fact if the fan stopped, it would never adjust at all!

We can fix this easily though.

First, we'll no longer change the fan's speed when the signal from it changes. We'll do it 10 times a second regardless of the fan speed:

```
function onFanMovement(e) { 
  var d = e.time-lastTime;
  lastTime = e.time;
  RPM = 60 / (d*2);
}
function onTimer() {
  if (RPM < targetRPM) {
    if (fanDrive<1) fanDrive += 0.01;
  } else {
    if (fanDrive>0) fanDrive -= 0.01;
  }
  digitalWrite(LED1, fanDrive>0.5);
  analogWrite(FAN_SPEED_OUT, fanDrive);
}
setInterval(onTimer, 100);
```

So now, the fan will respond within the same time whether it is going faster or slower (and we'll be sure that within 10 seconds, it will be at the correct speed).

There are other ways of controlling things that will reach the correct speed much faster... For instance, see the [Wikipedia Article on PID Contollers](http://en.wikipedia.org/wiki/PID_controller)
