<!--- Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Puck.js Music Controller
========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Puck.js+Music+Control. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Puck.js,BLE,Bluetooth,Car,Hands free,Handsfree,Music,Playback,Play,Pause,Next Track
* USES: Puck.js,BLE,Only BLE

[[http://youtu.be/3iZ9j_ga6zs]]

In this video I show you how to set up [Puck.js](/Puck.js) to control
your mobile phone's music playback by pressing it in different ways.

It uses [Puck.js's](/Puck.js) [Bluetooth LE HID](/Puck.js+Keyboard) capability.

You could extend this relatively easily - for instance:

* Detection of more types of clicks (eg. > 1 second)
* Soldering more buttons directly to Puck.js
* Soldering wires for external buttons (perhaps unused buttons that are in your car's dashboard)

Software
--------

The code used in the video is:

```
var controls = require("ble_hid_controls");
NRF.setServices(undefined, { hid : controls.report });

setWatch(function(e) {
  var len = e.time - e.lastTime;
  if (len > 0.3) {
    controls.next();
    digitalPulse(LED1,1,100);
  } else {
    controls.playpause();
    digitalPulse(LED2,1,100);
  }
}, BTN, { edge:"falling",repeat:true,debounce:50});
```
