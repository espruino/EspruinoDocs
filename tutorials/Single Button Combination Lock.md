<!--- Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Single Button Combination Lock
==========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Single+Button+Combination+Lock. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Combination,Lock,Code,Unlock
* USES: Only Espruino Board

Introduction
-----------

If you want to make an electronic lock, the obvious way is to use something like a [KeyPad](/KeyPad Combination Lock). But maybe you don't want to wire up the wires, don't have space, or even just want to hide the entry. You could just use one button, and could tap out the code almost like morse code. That's what we'll do here.

You'll Need
----------

* One [Espruino Board](/Original)

Wiring Up
--------

There's no wiring up at the moment, we're just using the LED lights and button built in to the board.

Software
-------

The first step is respond when a button is pressed. Connect to the Espruino and copy and paste this into the left-hand window:

```
function buttonWatcher(e) {
  console.log(e.time);
}

setWatch(buttonWatcher, BTN, {edge:"falling", repeat:true});
```

Press the button (the one furthest from the USB connector - the other one resets Espruino!). When released, it should print out the time (according to Espruino) when the button is pressed. Note that sometimes it outputs the time more that once - this is because of 'bounce' in the button. The button itself is mechanical, and sometimes it physically bounces when it is pressed or released, making it turn on and off very quickly. We want to be able to check for this and avoid it.

Now copy and paste the following - this will change the function that is called when the button is pressed so that it checks the time between presses. If the time is greater than 0.1 seconds, it'll write 'Pressed!':

```
var lastPress = 0;
function buttonWatcher(e) {
  var timeDiff = e.time - lastPress;
  lastPress = e.time;
  console.log(timeDiff);
  if (timeDiff>0.1) console.log("Pressed!");
}
```

Now, we'll make a function called ```onPress``` that is called when the button is pressed (making sure to de-bounce it). It'll count the number of presses, and will zero that number if more than a second passes without a button press:


```
var lastPress = 0;
// the number of button presses
var pressCount = 0;
// the timeout that happens one second after a button press
var timeout;

function onTimeout() {
  timeout = undefined;
  pressCount = 0;
  console.log("Timeout!");
}

function onPress(timeDiff) {
  pressCount++;
  console.log(pressCount);

  // if we had a timeout from another button press, remove it
  if (timeout) clearTimeout(timeout);
  // one second after this press, run 'onTimeout'
  timeout = setTimeout(onTimeout, 1000);
}

function buttonWatcher(e) {
  var timeDiff = e.time - lastPress;
  lastPress = e.time;
  if (timeDiff>0.1) onPress(timeDiff);
}

setWatch(buttonWatcher, BTN, {edge:"falling", repeat:true});
```

Now press the button a few times. You should be able to count up, and then if you don't press the button for a second, "Timeout" will be printed and the number will be reset. From here it's pretty easy to make a combination lock by changing what happens in ```onTimeout```.

```
var code = [3,1,2]; // the code to unLock
var digit = 0; // which digit of the code we're on

function setLocked(isLocked) {
  // output red or green depending on whether we're locked or not
  digitalWrite([LED1,LED2,LED3], isLocked ? 0b100 : 0b010);
  // then two seconds later turn it off
  setTimeout(function() {
    digitalWrite([LED1,LED2,LED3], 0);
  }, 2000);
}

function onTimeout() {
  timeout = undefined;
  // check against our code
  if (pressCount == code[digit]) {
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
  pressCount = 0;
}
```

And that's it! If you do the following: ```[tap]...[tap]...[tap], wait a second, [tap], wait a second, [tap]...[tap]``` then the green light will light for 2 seconds, signalling an unlock. If you get it wrong it'll light the red light.

It's easy enough to change the code as well (even it's length), just by typing something like:

```
code = [5,1,3,4];
```

Final code
---------

If you just want to enter the code on the right-hand side, the complete code is:

```
var lastPress = 0;
var pressCount = 0;
var timeout;
var code = [3,1,2];
var digit = 0;

function setLocked(isLocked) {
  // output red or green depending on whether we're locked or not
  digitalWrite([LED1,LED2,LED3], isLocked ? 0b100 : 0b010);
  // then two seconds later turn it off
  setTimeout(function() {
    digitalWrite([LED1,LED2,LED3], 0);
  }, 2000);
}

function onTimeout() {
  timeout = undefined;
  // check against our code
  if (pressCount == code[digit]) {
    digit++; // go to next digit
    if (digit >= code.length) {
      console.log("We're at the end of the code - unlock it!");
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
  pressCount = 0;
}

function onPress(timeDiff) {
  pressCount++;
  console.log(pressCount);
  // if we had a timeout from another button press, remove it
  if (timeout) clearTimeout(timeout);
  // one second after this press, run 'onTimeout'
  timeout = setTimeout(onTimeout, 1000);
}

function buttonWatcher(e) {
  var timeDiff = e.time - lastPress;
  lastPress = e.time;
  if (timeDiff>0.1) onPress(timeDiff);
}

setWatch(buttonWatcher, B12, { repeat:true, edge:'falling' });
```

Next Steps
---------

The next thing to do might be to operate some kind of lock when the combination was entered. To do this, just change the ```setLocked``` function. For instance you could plug a [Servo Motor](/Servo Motors) into pin B13 and write the following :

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
