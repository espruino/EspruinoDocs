<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
KeyPad Timer
==========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/KeyPad+Timer. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Timer,Counter,KeyPad
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

Now, when you press a key that character will be output on the screen.

The next step is to add each character together to make a long number (as long as it is in the range 0-9). If it's not a number we'll just assume we want to start the timer.

Copy and paste the following into the right-hand side and click ```Send to Espruino```:

```
function startTimer(time) {
  console.log("Start "+time+" sec counter");
}


var value = "";
function onKey(key) {
  var ch = "123A456B789C*0#D"[key];
  if ("0123456789".indexOf(ch)<0) {
    // it's not numeric then just start the timer...
    startTimer(parseInt(value, 10/*decimal*/));
    value = "";
  } else {
    // otherwise save this value...
    value += ch;
    console.log(value); // write it out...
  }
}

require("KeyPad").connect([B2,B3,B4,B5],[B6,B7,B8,B9], onKey);
```

If you press digits on the Key Pad now, they'll be output on the screen - and if you press something else, like ```A```, it'll output the full number and reset:

```
// press 1
1
// press 2
12
// press 3
123
// press 4
1234
// press A
Start 1234 sec counter
```

Next, we can make the timer itself... Just copy and paste the following code over the top of the old ```startTimer``` function:

```
var timerInterval;
var timerCount;

function timerFinished() {
  // light the red LED for a second to signal that we're done
  digitalPulse(LED1, 1, 1000);
}

function startTimer(time) {
  // clear the current timer (if there was one)
  if (timerInterval!==undefined) 
    clearInterval(timerInterval);
  timerInterval = undefined;
  // if there was a time (it wasn't just blank), start the timer
  if (time>0) {
    console.log("Start "+time+" sec counter");
    timerCount = time;
    // Call this every second...
    timerInterval = setInterval(function() {
      // decrement our counter
      timerCount--;
      if (timerCount<=0) {
        // if we reached zero, stop our timer and call timerFinished()
        clearInterval(timerInterval);
        timerInterval = undefined;
        timerFinished();        
      } else {
        // otherwise just blink the green LED
        digitalPulse(LED2, 1, 100);
      }
    }, 1000);
  }
}
```

And now, if you type a number (unless you're really patient, type a small number!) and press a non-numeric key then the timer will start. The green LED will flash until the time is elapsed, and then the red LED will stay on for 1 second.
