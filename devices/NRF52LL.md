<!--- Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
nRF52 Low Level Interface Library
=================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/NRF52LL. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,nRF52,nRF5x,nRF52832,Puck.js
* USES: Puck.js,Pixl.js,MDBT42Q,nRF52832,nRF52

The nRF52 microcontroller used in [Puck.js](/Puck.js), [Pixl.js](/Pixl.js) and [MDBT42Q](/MDBT42Q) has a load of really interesting peripherals built-in, not all of which are exposed by Espruino. The microcontroller also contains something called PPI - the "Programmable Peripheral Interconnect". This allows you to 'wire' peripherals together internally.

PPI lets you connect an `event` (eg. a pin changing state) to a `task` (eg. increment the counter). All of this is done without the processor being involved, allowing for very fast and also very power efficient peripheral use.

Check out [the chip's reference manual](http://infocenter.nordicsemi.com/pdf/nRF52832_PS_v1.1.pdf) for more information.

This library provides a low level interface to PPI and some of the nRF52's peripherals.

**Note:** Failure to 'shut down' peripherals when not in use could drastically increase the nRF52's power consumption.


Basic Usage
-----------

* Initialise a peripheral to create events
* Initialise a peripheral you want to send tasks to
* Set up and Enable a PPI to wire the two together

The following are some examples:

Count the number of times the BTN pin changes state (GPIO + counter timer):

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

Or the following will create a square wave on pin `D0`, with the inverse of the square wave on `D1` (GPIO):

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

Toggle the state of `LED` every time `D31`'s analog value goes above `VCC/2` (low power comparator + GPIO).

```
var ll = require("NRF52LL");
// set up LED as an output
digitalWrite(LED,0);
// create a 'toggle' task for the LED
var tog = ll.gpiote(0, {type:"task",pin:LED,lo2hi:1,hi2lo:1,initialState:0});
// compare D31 against vref/2
var comp = ll.lpcomp({pin:D31,vref:8});
// use a PPI to trigger the toggle event
ll.ppiEnable(0, comp.eCross, tog.tOut);
```

Count how many times `D31` crosses `VCC/2` in 10 seconds  (low power comparator + counter timer).

```
var ll = require("NRF52LL");
// source of events - compare D31 against vref/2
var comp = ll.lpcomp({pin:D31,vref:8});
// A place to recieve events - a counter
var ctr = ll.timer(3,{type:"counter"});
// Set up and enable PPI
ll.ppiEnable(0, comp.eCross, ctr.tCount);
/* This function triggers a Task by hand to 'capture' the counter's value. It can then clear it and read back the relevant `cc` register */
function getCtr() {
  poke32(ctr.tCapture[0],1);
  poke32(ctr.tClear,1); // reset it
  return peek32(ctr.cc[0]);
}
// Every 10 seconds, wake and print out the number of crosses
setInterval(function() {
  print(getCtr());
}, 10000);
```

Make one reading from the ADC:

```
var saadc = ll.saadc({
  channels : [ { // channel 0
    pin:D31,
    gain:1/4,
    tacq:40,
    refvdd:true,
  } ]
});
print(saadc.sample()[0]);
```

Read a buffer of data from the ADC, alternating between 2 pins (ADC).
It's also possible to use `.sample(...)` for this, but this example
shows you how to use it in more detail.

```
// Buffer to fill with data
var buf = new Uint16Array(128);
// source of events - compare D31 against vref/2
var saadc = ll.saadc({
  channels : [ { // channel 0
    pin:D31,
    gain:1/4,
    tacq:40,
    refvdd:true,
  }, { // channel 1
    pin:D30,
    gain:1/4,
    tacq:40,
    refvdd:true,
  } ],
  samplerate:2047, // 16Mhz / 2047 = 7816 Hz auto-sampling
  dma:{ptr:E.getAddressOf(buf,true), cnt:buf.length},
});
// Start sampling until the buffer is full
poke32(saadc.eEnd,0); // clear flag so we can test
poke32(saadc.tStart,1);
poke32(saadc.tSample,1); // start!
while (!peek32(saadc.eEnd)); // wait until it ends
poke32(saadc.tStop,1);
print("Done!", buf);
```

Use the RTC to toggle the state of an LED:

```
var ll = require("NRF52LL");

// set up LED as an output
digitalWrite(LED,0);
// create a 'toggle' task for the LED
var tog = ll.gpiote(0, {type:"task",pin:LED,lo2hi:1,hi2lo:1,initialState:0});

// set up the rtc
var rtc = ll.rtc(2);
poke32(rtc.prescaler, 4095); // 32kHz / 4095 = 8 Hz
rtc.enableEvent("eTick");
poke32(rtc.tStart,1); // start RTC
// use a PPI to trigger the toggle event
ll.ppiEnable(0, rtc.eTick, tog.tOut);
```

Use the RTC to measure how long a button has been held down for:

```
var ll = require("NRF52LL");
// Source of events - the button
// Note: this depends on the polarity of the physical button (this assumes that 0=pressed)
var btnu = ll.gpiote(0, {type:"event",pin:BTN,lo2hi:1,hi2lo:0});
var btnd = ll.gpiote(1, {type:"event",pin:BTN,lo2hi:0,hi2lo:1});
// A place to recieve Tasks - the RTC
var rtc = ll.rtc(2);
poke32(rtc.prescaler, 0); // no prescaler, 32 kHz
poke32(rtc.tStop, 1); // ensure RTC is stopped
// Set up and enable PPI to start and stop the RTC
ll.ppiEnable(0, btnd.eIn, rtc.tStart);
ll.ppiEnable(1, btnu.eIn, rtc.tStop);
// Every so often, check the RTC and report the result
setInterval(function() {
  print(peek32(rtc.counter));
  poke32(rtc.tClear, 1);  
}, 5000);
```

Reference
---------

* APPEND_JSDOC: NRF52LL.js


Interrupts
----------

Espruino doesn't allow you to react to interrupts from these peripherals
directly, however you can change the state of an external pin (see the
examples above) and can then short that pin to another pin that you can
use as an input with `setWatch`.


LPCOMP
------

LPCOMP is a low-power comparator. You can use it as follows:

```
// Compare D31 with 8/16 of vref (half voltage)
o = ll.lpcomp({pin:D31,vref:8});
// or {pin:D31,vref:D2} to compare with pin D2

// Read the current value of the comparator
console.log(o.sample());
// Return an object {up,down,cross} showing how
// the state changed since the last call
console.log(o.compare());
```
