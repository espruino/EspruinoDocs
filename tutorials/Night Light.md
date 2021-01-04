<!--- Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Night Light
============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Night+Light. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,LED,Light,Lightbulb,Night,Nightlight,Brightness
* USES: MDBT42Q

Here we're making a simple Night Light that turns on when it gets dark, and off
when it's light.

On the 2400mAh battery used it should last around 4 months assuming the LED
is on for 4 hours a day.

You might also want to check out the [Puck.js Night Light](/Puck.js+Night+Light)
which glows a colour to show you the temperature.

[[http://youtu.be/UNW3oGjMmk4]]


You'll need
-----------

* A [MDBT42Q Breakout board](/MDBT42Q)
* A LED and resistor of around 300 Ohms (you can use the on-board
* A [Battery](/Battery)
* A ping-pong ball and a case (details below)

Wiring
------

Simply:

* Wire up the battery using either the JST connector or directly
* Wire the LED between GND and and IO pin, with the resistor in series. We're using pin `D15` but any pin will do.

Software
--------

```
var light = 0, on = false;

setInterval(function() {
  light = analogRead(LED2);
  if (light < 0.16) on = true;
  if (light > 0.18) on = false;
  D15.write(on);
}, 2000);

// Only use this code if you want to make the light
// invisible on Bluetooth until the button is pressed
NRF.sleep();
setWatch(function() {
  NRF.wake();
}, BTN1);
```

Just upload the code above to flash the MDBT42Q. Once uploaded it'll
disconnect from Bluetooth and will be a usable night light.

**However**, you'll probably want to tweak the numbers for when the
LED turns on and off. Simply do this by removing the last bit of code,
then while connected type `light` into the Web IDE's console to find
out what the light value is at different brightness levels.

Improvements
------------

As noted in the video, the usage of hysteresis can help to stop the
light from flickering on and off, however there are some other additions
that can really help.

* Replace `light = analogRead(LED2);` with `D15.reset(); light = analogRead(LED2); D15.write(on);`. Suggested by Akos Lukacs
in the video comments, this turns the LED off very briefly in order to take a light reading, then turns it back on. There's a
barely perceptible flicker.
* Flip the MDBT42 PCB over, so the LED used for sensing is facing away from the LED producing the light.
* Blank off the bottom of the ping-pong ball so light doesn't shine directly down onto the sensor.


3D Printed Case
---------------

The case was designed with [OpenSCAD](https://www.openscad.org/) - it is simply
a hollow cylinder:

```
difference() {
  translate([0,0,-1.5]) cylinder(r=36/2,h=60);
  cylinder(r=33/2,h=60);
}
```
