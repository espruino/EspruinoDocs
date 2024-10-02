<!--- Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Puck.js Duplo Siren
===================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Puck.js+Duplo+Siren. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Puck.js,LED,Light,Siren,Lights,Noise,Duplo,Lego
* USES: Puck.js,LED

This is how you can use a [Espruino Puck.js](/Puck.js) and 3D printed Duplo block to create a siren for a Duplo Fire Engine!

[[https://youtu.be/1EkSWVqevaY]]

You'll need
-----------

* A [Puck.js](/Puck.js)
* A 3D printed clear Duplo Block. I used [the design from here](https://www.thingiverse.com/thing:116411/files)
with the middle removed, printed upside-down with PET.
* Two Blue LEDs
* A Piezo Speaker


Wiring
------

Wire up as in the video:

* One LED to `D1/D2`
* One LED to `D30/D31`
* A piezo speaker to `D28/D29`


Software
--------

* APPLOADER_APP: pucksiren


```
D2.reset();
D30.reset();
D29.reset();
var LEDA = D1;
var LEDB = D31;
var SPK = D28;

var n = 0;
var lightInterval;

function pattern1() {
  n++;
  LEDA.write(n&1);
  LEDB.write(!(n&1));
  var f = (n&1) ? 800 : 600;
  analogWrite(SPK, 0.5, { freq : f});
}

function pattern2() {
  n++;
  var p = n&15;
  LEDA.write(p==0 || p==2);
  LED3.write(p==6 || p==8);
  LEDB.write(p==12 || p==14);
  var f = (p<8) ? 800 : 600;
  analogWrite(SPK, 0.5, { freq : f});
}

function turnOn() {
  if (lightInterval)
    clearInterval(lightInterval);

  if (Math.random()<0.5)
    lightInterval = setInterval(pattern2, 50);
  else
    lightInterval = setInterval(pattern1, 500);
}

function turnOff() {
  if (lightInterval)
    clearInterval(lightInterval);
  lightInterval = undefined;
  LEDA.reset();
  LEDB.reset();
  LED3.reset();
  SPK.reset();
}

// detect movement
require("puckjsv2-accel-movement").on();
var idleTimeout;
Puck.on('accel',function(a) {
  if (idleTimeout) clearTimeout(idleTimeout);
  else turnOn();
  idleTimeout = setTimeout(function() {
    idleTimeout = undefined;
    turnOff();
  },5000);
});

NRF.sleep();
```
