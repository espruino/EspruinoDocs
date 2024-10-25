<!--- Copyright (c) 2024 Gordon Williams. See the file LICENSE for copying permission. -->
PID Controller
===============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/PID. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,PID,Proportional,Integral,Derivative

A [PID Controller](https://en.wikipedia.org/wiki/Proportional%E2%80%93integral%E2%80%93derivative_controller) (or
proportional–integral–derivative controller) is a way of controlling some external system so that it reaches
a desired point.

For example a fridge or freezer. Mostly these turn the compressor on when the temperature is too high
and off when the temperature is too low, and keep the temperature constant that way. However if you can
control the *speed* of the compressor you can use a PID controller to work out what speed to run
the compressor at at any given point, which is a lot more efficient.

Usage
------

Using the controller is very easy - just give `step` an error number (difference between
`desired` and `current`) and it'll give you an output value. To ensure consistent
response you'll want to call `pid.step` at a set time interval.

For example to modulate temperature for a heater:

```JS
const PID = require("PID");
var pid = new PID({
  Pg : 1, // proportional gain
  Ig : 1, // integral gain
  Dg : 0, // differential gain
  Imin:-1,Imax:1 // range for clipping integral
});
var desiredTemperature = 20;

setInterval(function() {
  var currentTemperature = getCurrentTemperature();
  var out = pid.step(desiredTemperature - currentTemperature);
  setHeaterPower(0.5+out/2); // out is from -0.5 to 0.5
}, 1000);
```

The sign of the error and output value is important.
You want the sign of the `error` given to `pid.step` to match
the sign of the output you want, so in this heater example:

A higher `out` value means the heater turns on, making things hotter.
So the `error` value should be positive if we're too cold (eg.
we want to be hotter).

Tuning
------

Tuning PID systems is important for them to work correctly. There is a
good explanation of this at https://pidexplained.com/how-to-tune-a-pid-controller/

To do this easily you probably want to be able to graph the response of the
system over time, perhaps using the [Graph Library](/graph)

You need to do the following (using temperature as an example) - with Espruino
you can change the PID values on the fly just by sending the relevant commands
in the Web IDE's REPL:

### 1. Proportional

Set Integral and Derivative values to 0, which you can do with `pid.Ig = pid.Dg = 0`.

Increase the proportional value `pid.Pg = ...` until the system starts to oscillate
when you change the desired temperature valye (with the output value oscillating between the full range of `-1..1`).

Now divide the proportional value in half and use that.

### 2. Integral

Once you've done the above, slowly increase the integral `pid.Ig`,
giving time for it to react, and changing the desired
temperature suddenly to see how it reacts.

You want the integral increased to the point where the
desired temperature is reached quickly, but without oscillation.
If there is oscillation then you need to turn the `pid.Ig` back down.

### 3. Derivative

The derivative can be used to dampen the response of the PID controller,
allowing other values to be more aggressive while letting the derivative
stop oscillation or overshoot.

However in many cases it can just be left at `0` (the default for the library).

Check out https://pidexplained.com/how-to-tune-a-pid-controller/ for more information.


Reference
----------

* APPEND_JSDOC: PID.js

Using
-----

* APPEND_USES: PID

