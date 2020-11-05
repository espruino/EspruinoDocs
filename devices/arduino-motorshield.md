<!--- Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Arduino Motor Shield
=====================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/arduino-motorshield. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Arduino,Shield,Arduino Shield,Motor Shield,Driver,L293D,DK Electronics
* USES: Pixl.js

![Motor Shield](arduino-motorshield.jpg)

This is a cheap (<4USD) motor shield for Arduino that contains two L293D driver IC, and a 74HCT595N shift register IC.

**NOTE:** [Pixl.js](/Pixl.js) is a 3.3V device, and the  Arduino Motor Shield is a 5V shield. You need to connect the Vin pin to 5V pin, the jumper shown just right of the red circle. Without this the shield will have the green light shine dimly and do nothing!

![Vin to 5V](https://www.espruino.com/refimages/Pixljs_jst.jpg)

Support is provided via the [[arduino-motorshield.js]] module.

First, initialise the module:

```
var motor = require("arduino-motorshield").connect(); // Pixl.js
var motor = require("arduino-motorshield").connect(require("ArduinoPico")); // Espruino Pico Shim
var motor = require("arduino-motorshield").connect(Nucleo); // Nucleo
```

Then you can control it simply with `motor.set`:

```
// reset to power on state
motor.reset();
// turn drivers on
motor.on();
// set which motors to move
let FORWARD = 0b00100000; // M1A
let BACKWRD = 0b00010000; // M1B
motor.set(FORWARD); // Motor 1 forwards

// M3A, set(0b10000000)
// M2A, set(0b01000000)
// M1A, set(0b00100000)
// M1B, set(0b00010000)
// M2B, set(0b00001000)
// M4A, set(0b00000100)
// M3B, set(0b00000010)
// M4B, set(0b00000001)
```

Or you can use PWM:

```
function ramp(direction,durationSec) {
  return new Promise(function(resolve, reject) {
    // Ramp over a period of durationSec
    let steps = durationSec * 100 / 10;
    let n = 0;
    let animInterval = setInterval(function() {
      console.log(new Date().toISOString().substring(11, 22), "ramp",direction, n*100);
      n += 1 / steps; // steps
      if (n > 1) {
        clearInterval(animInterval); //stop function
        resolve();
      }
      if (direction>0) motor.speed(n * 100); // %
      if (direction<0) motor.speed(100 - n * 100); // %
    }, 100); // every 10 ms
  });
}

function motorControl() {
  // Define Motors Used and Wiring
  // M3A, set(0b10000000)
  // M2A, set(0b01000000)
  // M1A, set(0b00100000)
  // M1B, set(0b00010000)
  // M2B, set(0b00001000)
  // M4A, set(0b00000100)
  // M3B, set(0b00000010)
  // M4B, set(0b00000001)
  let FORWARD = 0b00100000; // M1A
  let BACKWRD = 0b00010000; // M1B
  motor.set(FORWARD); // Motor 1 forwards
  ramp(1,10).then(()=>{ramp(-1,10);});
  //rampUp(rampDown(console.log("fin")));
}

var motor = motorDriver();
motor.reset();
// Call the motor immediately on first run
motorControl();
// Call the motor every n seconds
setInterval(motorControl, 22 * 1000);
```

Buying
-----

* [eBay](http://www.ebay.com/sch/i.html?_nkw=arduino+l293d+motor+shield+-nodemcu)
* [Banggood](https://www.banggood.com/Motor-Driver-Shield-L293D-Duemilanove-Mega-U-NO-p-72855.html)
