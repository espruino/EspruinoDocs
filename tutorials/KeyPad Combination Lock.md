<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
KeyPad Combination Lock
==========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/KeyPad+Combination+Lock. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Combination,Lock,Code,Unlock,KeyPad
* USES: KeyPad,Espruino Board

Introduction
-----------

If you want to make an electronic lock, using a [[KeyPad]] is the obvious way. There's one of these in the Espruino Ultimate kit, but see the [[KeyPad]] page to see where you can buy them.

You'll Need
----------

* One [Espruino Board](/Original)
* A [[KeyPad]]

Wiring Up
--------

Just plug the Key Pad in to B2,B3,B4,B5,B6,B7,B8 and B9 (they're one long row of pins) so that as the KeyPad is facing you, the wire nearest ```D``` goes to B2, and the wire nearest ```*``` goes to B9. There are no real requirements for the pins you can use, but if you use different pins then you'll have to change the software below.

Software
-------

The first step is to respond when a button is pressed. Connect to the Espruino, copy and paste this into the right-hand window, and click the ```Send to Espruino``` button:

```
function onKey(key) {
  console.log("123A456B789C*0#D"[key]);
}

require("KeyPad").connect([B2,B3,B4,B5],[B6,B7,B8,B9], onKey);
```

Note that we can't paste this into the left-hand side initially, because it uses the KeyPad module which the Web IDE needs to be able to load off the internet for you.

Now, when you press a key, that character will be output on the screen.

The next step is to check each digit in turn against out combination. Copy and paste the following into the right-hand side and click ```Send to Espruino```:

```
var code = "B59";
var digit = 0;

function setLocked(isLocked) {
  // output red or green depending on whether we're locked or not
  digitalWrite([LED1,LED2,LED3], isLocked ? 0b100 : 0b010);
  // then two seconds later turn it off
  setTimeout(function() {
    digitalWrite([LED1,LED2,LED3], 0);
  }, 2000);
}

function onKey(key) {
  var ch = "123A456B789C*0#D"[key];
  // check against our code
  if (ch == code[digit]) {
    digit++; // go to next digit
    if (digit >= code.length) {
      console.log("We're at the end of the code - unlock!");
      setLocked(false);
      // and go to the begining of the code again
      digit = 0;
    } else {
      console.log("Digit correct - next digit!");
    }
  } else {
    console.log("Wrong! Go back to the start");
    setLocked(true);
    digit = 0;
  }
}

require("KeyPad").connect([B2,B3,B4,B5],[B6,B7,B8,B9], onKey);
```

And we're done! Press ```B...5...9``` and the green LED will light for 2 seconds, but if you press any other characters in any other combination then the red LED will light.

Next Steps
---------

The next thing to do might be to operate some kind of lock when the combination was entered. To do this, just change the ```setLocked``` function. For instance you could plug a [Servo Motor](/Servo Motors) into pin B13 and replace ```setLocked``` with the following:

```
function setLocked(isLocked) {
  // output red or green depending on whether we're locked or not
  digitalWrite([LED1,LED2,LED3], isLocked ? 0b100 : 0b010);
  // then two seconds later turn it off
  setTimeout(function() {
    digitalWrite([LED1,LED2,LED3], 0);
  }, 2000);
  // Now operate a servo motor - give it 1 second of pulses (50 * 20ms) to move it to the new location
  var servoPos = isLocked ? 0 : 1;
  var servoPulses = 0;
  var interval = setInterval(function() {
    digitalPulse(B13, 1, 1+servoPos);
    servoPulses++;
    if (servoPulses>50) clearInterval(interval);
  }, 20);
}
```
