<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Water Physics with Servo Motors
===============================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Water+Simulation. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Servo Motor,Finite Element,Simulation,Physics
* USES: Servo Motor,Espruino Board

[[http://youtu.be/tn0FTlPr1Wo]]

Introduction
-----------

This is just a very simple [Finite Element](http://en.wikipedia.org/wiki/Finite_element_analysis) simulation. Finite element analysis is done all over the place - to work out the airflow over a Formula 1 car, or to calculate if a bridge can support itself.

The basic principle is very simple - take something and divide it up into many finite pieces, then work out how each of those pieces will interact. 

In this case, we're going to (very badly) simulate water running down a thin channel, so we'll divide it into little vertical columns. We assume that each column of water has some mass, and that it wants to try and get to the level of the columns of water to the left and right. That's it. It's a bad simulation, but it does provide a water-like effect, and it is what is used in many computer games to give realistic ripples.

You'll Need
----------

* An [Espruino Board](/Original) wired up for [[Servo Motors]]
* 6 [[Servo Motors]], arranged next to each other

Wiring Up
--------

Just wire up the 6 Servo motors to B13,B14,B15,C4, C5 and C6. More details of how to wire the board up are available on the [[Servo Motors]] page.

Software
-------

Just copy and paste this into the right-hand window, then click the ```Send to Espruino``` button.

```
// we leave space at the beginning and end for stationary points, which don't need servos
var servos = [undefined,B13,B14,B15,C4,C5,C6,undefined];
// String position at each point
var pos = new Float32Array(servos.length);
// Velocity at each point
var velocity = new Float32Array(servos.length);

// This is called quite often to do each step
// of the simulation
function step() {
  var i;
  // Change the end point's position depending on the push button
  pos[0] = digitalRead(BTN) ? 0.5 : 0;
  // For each point...
  for (i=1;i<servos.length-1;i++) {
    // The acceleration is dependent on the distance between this point and its neighbors
    var accel = ((pos[i-1]+pos[i+1])/2) - pos[i];
    // Work out the new velocity (there's a bit of friction, and a bit of acceleration)
    velocity[i] = velocity[i]*0.95 + accel*0.1;
  }
  // And finally for each point...
  for (i=1;i<servos.length-1;i++) {
    // work out the new position
    pos[i] += velocity[i];
    // Send the new position to the Servo motor
    var p = 1.5+E.clip(pos[i],-0.5,0.5);
    digitalPulse(servos[i],1,p);
  }
}

// Call this 50 times a second
setInterval(step, 20);
```

Now, press and hold the pushbutton, and generally play around with it. The servo motors will move as if they were on the surface of a pond...
