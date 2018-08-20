<!--- Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Exercise Machine controlled Video
=================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Puck.js+Exercise+Machine. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Puck.js,BLE,Bluetooth,Exercise,Cross Trainer,HID
* USES: Puck.js,BLE,Only BLE

[[http://youtu.be/8h01nn2oW-c]]

In this video I show you how to rig up a cross trainer or
other exercise machine to play or pause video depending on
whether is it used or not. It uses [Puck.js's](/Puck.js)
[Bluetooth LE HID](/Puck.js+Keyboard) capability.

The method of connecting to the trainer here could be used
for all kinds of things - for instance you could easily
log your usage of the trainer throughout a whole training
session and then download it to your phone or PC afterwards.


Wiring
------

I used an oscilloscope to look at the signal on the wire from
the trainer. However if you don't have one, just use a volt
meter and move the exercise machine very slowly.

The important thing is to get the polarity of the wiring correct.
All you need to do is make sure that when the meter is across
the wire, it reads a positive (not negative) voltage.

If the voltage across the wire is higher than 3v, ask on
[the forums](http://form.espruino.com) - you may need some
extra work to safely connect to Puck.js without damaging it.



Software
--------

The code used in the video is:

```
var controls = require("ble_hid_controls");
NRF.setServices(undefined, { hid : controls.report });

var rotations = 0;
var lastRotations = 0;
var wasPlaying = false;

var PLAYSPEED = 5;

setWatch(function(e) {
  digitalPulse(LED3,1,10);
  rotations++;
}, D1, { edge:"falling",repeat:true});

function setPlaying(play) {
  if (play!=wasPlaying) {
    wasPlaying = play;
    // flash a LED
    if (play) {
      // green = go
      digitalPulse(LED2,1,100);      
    } else {
      // red = stop
      digitalPulse(LED1,1,100);
    }
    // Call playpause to toggle beteen play and stop
    // Catch any exceptions thrown here in case HID
    // wasn't enabled
    try { controls.playpause(); } catch (e) { }
  }
}


NRF.on('connect', function(addr) {
  setInterval(function() {
    if (rotations >= PLAYSPEED &&
        lastRotations >= PLAYSPEED) {
      // if both the last time periods have been fast enough
      // start playing
      setPlaying(true);
    } else if (rotations < PLAYSPEED &&
               lastRotations < PLAYSPEED) {
      // else if both were too slow, stop playing
      setPlaying(false);
    }
    lastRotations = rotations;
    rotations = 0;
  }, 2000);
});

NRF.on('disconnect', function() {
  // Remove any intervals
  clearInterval();
});
```
