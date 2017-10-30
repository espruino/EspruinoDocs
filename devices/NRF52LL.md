<!--- Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
nRF52 Low Level Interface Library
=================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/NRF52LL. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,nRF52,nRF5x,nRF52832,Puck.js
* USES: Puck.js

The nRF52 microcontroller used in [[Puck.js]] has a load of really interesting peripherals built-in, not all of which are exposed by Espruino. The microcontroller also contains something called PPI - the "Programmable Peripheral Interconnect". This allows you to 'wire' peripherals together internally.

PPI lets you connect an `event` (eg. a pin changing state) to a `task` (eg. increment the counter). All of this is done without the processor being involved, allowing for very fast and also very power efficient peripheral use.

Check out [the chip's reference manual](http://infocenter.nordicsemi.com/pdf/nRF52832_PS_v1.1.pdf) for more information.

This library provides a low level interface to PPI and some of the nRF52's peripherals.

**Note:** Failure to 'shut down' peripherals when not in use could drastically increase the nRF52's power consumption.


Basic Usage
-----------

* Initialise a peripheral to create events
* Initialise a peripheral you want to send tasks to
* Set up and Enable a PPI to wire the two together

For instance the following will count the number of times the BTN pin changes state:

```
var ll = require("NRF52LL");
// Source of events - the button
var btn = ll.gpiote(0, {type:"event",pin:BTN,lo2hi:1,hi2lo:1});
// A place to recieve Tasks - a counter
var ctr = ll.timer(3,{type:"counter"});
// Set up and enable PPI
ll.ppiEnable(0, btn.eIn, ctr.tCount);
/* This function triggers a Task by hand to 'capture' the counter's
value. It can then be read back from the relevant `cc` register */ 
function getCtr() {
  poke32(ctr.tCapture[0],1);
  return peek32(ctr.cc[0]);
}
```

Or the following will create a square wave on pin `D0`, with the inverse of the square wave on `D1`:

```
var ll = require("NRF52LL");
// set up D0 and D1 as outputs
digitalWrite(D0,0);
digitalWrite(D1,0);
// create two 'toggle' tasks, one for each pin
var t0 = ll.gpiote(0, {type:"task",pin:D0,lo2hi:1,hi2lo:1,initialState:0});
var t1 = ll.gpiote(1, {type:"task",pin:D1,lo2hi:1,hi2lo:1,initialState:1});
// create a timer that counts up to 1000 and back at full speed
var tmr = ll.timer(3,{cc:[1000],cc0clear:1});
// use two PPI to trigger toggle events
ll.ppiEnable(0, tmr.eCompare[0], t0.tOut);
ll.ppiEnable(1, tmr.eCompare[0], t1.tOut);
// Manually trigger a task to start the timer
poke32(tmr.tStart,1);
```

Reference
---------
 
* APPEND_JSDOC: NRF52LL.js
