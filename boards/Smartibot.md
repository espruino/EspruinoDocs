<!--- Copyright (c) 2019 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Smartibot
==========

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Smartibot. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Third Party Board,nRF52,nRF52832,Smartibot,The Crafty Robot,Crafty Robot,Board,Module

![Smartibot](Smartibot.jpg)

The world’s first Artificial Intelligence enabled cardboard robot that you build yourself.

Smartibot works with your smartphone, meaning you can use your mobile as a remote control, or by attaching it to your robot, as it’s brain.

Firmware binaries can be found in:

* the [Download page](/Download#smartibot) - either from the list of firmwares, or a downloadable ZIP.
* the [binaries folder](/binaries) (current version)
* the [automatic Travis Builds](https://www.espruino.com/binaries/travis/master/) (cutting edge builds)

To update your firmware, follow [the instructions below](#firmware-updates)

Contents
----------

* APPEND_TOC

Using
-----

Smartibot can be used like any other Espruino Bluetooth LE device, with full access to the [NRF](http://www.espruino.com/Reference#NRF) class for BLE Functionality.

Check out the [Getting Started Guide](/Quick+Start+BLE#smartibot).

### Buttons

There are two built-in variables for buttons, `BTN1` (Button A) and `BTN2` (Button B).

These can be read using `BTN1.read()` or `digitalRead(BTN1)` (the two commands
are identical), or you can be notified when a button changes state:

```
setWatch(function(e) {
  if (e.state) print("Button pressed");
  else print("Button released");
}, BTN1, {repeat:true, edge:"both"});
```

The code above will call the function when the button is pressed and
when it is released. You can remove `edge:"both"` completely or use `edge:"rising"`
to be notified only when the button is pressed, or cal use `edge:"falling"` to
be notified only when it is released.

**NOTE:** On the Smartibot build that ships with KickStarter devices,
the value from `BTN1.read()` is inverted (`true` when released, `false` when pressed).

### Motors

There are 4 motor outputs which can be controlled using `require("Smartibot").setMotor(motor, value)`.

`value` is a number between `-1` (full reverse) and `1` (full forward).

```
var smarti = require("Smartibot");

smarti.setMotor(2, 1); // run motor 2 forward at full speed
smarti.setMotor(1, -0.5); // run motor 1 in reverse at half speed
```

### LEDs

There is one blue LED controllable using `LED.write(..)`, however
the left and right 'eyes' must be controlled using the `require("Smartibot").setLEDs(left, right)` command:

```
var smarti = require("Smartibot");

// Set left LED to RED, right LED to GREEN
smarti.setLEDs([255,0,0], [0,255,0]);
```

**NOTE:** On the Smartibot build that ships with KickStarter devices,
the single blue LED is inverted (`true` for off, `false` for on).

### Servo outputs

To control servos, use the `require("Smartibot").setServo(servo, value)`.

`value` is a number between `0` and `100`.

```
var smarti = require("Smartibot");

smarti.setServo(1, 50); // Set servo 1 to midpoint
```

### Display board

Plug the display into `E1`. Calling `g = require("Smartibot-display").connect(smarti.E1)`
will return an instance of [[Graphics]] which you can then use. It is 16 pixels wide, 9 pixels high, and 8 bits per pixel.

When you need to display something, call `g.flip()` to send it to the screen:

```
var smarti = require("Smartibot");
var g = require("Smartibot-display").connect(smarti.E1);

// Clear the screen
g.clear();
g.setColor(127); // set brightness - 0..255
// Draw something!
g.drawRect(0,0,15,8);
g.drawString("Hi",2,2);
// Send what we drew to the screen
g.flip();
```

Check out [[Graphics]] for full details on how to use Graphics and add your
own images.

### Distance board

Plug the board into `E1`. Calling `require("Smartibot-distance").connect(smarti.E1);`
returns an object with the following entries:

* `dist.getLeft()` returns the distance from the left sensor in millimeters
* `dist.getRight()` returns the distance from the left sensor in millimeters
* `dist.getGesture()` returns `"left"`/`"right"`/`"up"`/`"down"` is a gesture was found, or `undefined` if not.
* `dist.gesture` is an instance of [[APDS9960]] for direct access to the gesture sensor
* `dist.left`/`dist.right` are instances of [[VL53L0X]] for direct access to the laser sensors

```
var smarti = require("Smartibot");
var dist = require("Smartibot-distance").connect(smarti.E1);

setInterval(function() {
  // try and avoid obstacles if less than 10cm away
  if (dist.getLeft() < 100) smarti.setMotor(1,0);
  else smarti.setMotor(1,1);
  if (dist.getRight() < 100) smarti.setMotor(2,0);
  else smarti.setMotor(2,1);

  // if a gesture was found, output what it was
  var gesture = dist.getGesture();
  if (gesture) console.log(gesture);
}, 100);
```


Reference
---------

* APPEND_JSDOC: Smartibot.js


Tutorials
---------

First, it's best to check out the [Getting Started Guide](/Quick+Start+BLE#smartibot)

* APPEND_USES: Smartibot

Tutorials using just Bluetooth LE:

* APPEND_USES: Only BLE,-Smartibot

Tutorials using Bluetooth LE and functionality that may not be part of Smartibot:

* APPEND_USES: BLE,-Only BLE,-Smartibot


Firmware Updates
-----------------

For this you'll need an Android or Apple phone or tablet.

* Power on your Smartibot, **while holding down Button A**
* Release Button A less than 2 seconds after power on
* Follow the [Puck.js instructions](https://www.espruino.com/Puck.js#firmware-updates) for updating firmware using the NRF Connect app on your phone (download the `smartibot` firmware file, not the `puckjs` one).
