<!--- Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Door Controlled Light with Puck.js
==================================

* KEYWORDS: Tutorials,Puck.js,BLE,Bluetooth,Light,Magnet,Magnetometer,Door
* USES: Puck.js,Web Bluetooth

This video shows you how to control devices from Puck.js when a door opens.

It uses the Magnetometer to sense when a Magnet is near the Puck.

[[http://youtu.be/T3YbwAtgrcg]]

The code used in the video is:

#### Flashing an LED when a door is opened or closed

```
var zero = Puck.mag();
var doorOpen = false;
function onMag(p) {
  p.x -= zero.x;
  p.y -= zero.y;
  p.z -= zero.z;
  var s = Math.sqrt(p.x*p.x + p.y*p.y + p.z*p.z);
  var open = s<1000;
  if (open!=doorOpen) {
    doorOpen = open;
    digitalPulse(open ? LED1 : LED2, 1,1000);
  }
}
Puck.on('mag', onMag);
Puck.magOn();
```

#### Controlling IR Light remotely

```
function send(cmd) {
  NRF.requestDevice({ filters: [{ namePrefix: 'Puck.js' }] }).then(function(device) {
    require("ble_simple_uart").write(device, cmd, function() {
      print('Done!');
    });
  });
}

var zero = Puck.mag();
var isOpen = false;
function onMag(p) {
  p.x -= zero.x;
  p.y -= zero.y;
  p.z -= zero.z;
  var s = Math.sqrt(p.x*p.x + p.y*p.y + p.z*p.z);
  var open = s<1000;
  if (open != isOpen) {
    isOpen = open;
    digitalPulse(open ? LED1 : LED2,1,1000);
    if (open)    
          send("Puck.IR([8.9,4.5,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,1.7,0.5,1.8,0.5,1.7,0.5,1.7,0.5,1.7,0.5,1.7,0.5,1.7,0.5,1.8,0.5,1.7,0.5,1.7,0.5,1.7,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,1.7,0.5,1.7,0.5,1.7,0.5,1.8,0.5,1.7,0.5,39.9,8.9,2.3,0.5,96.2,8.9,2.3,0.5]);\n");
    else
       send("Puck.IR([8.9,4.5,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,1.7,0.5,1.8,0.5,1.7,0.5,1.7,0.5,1.8,0.5,1.7,0.5,1.7,0.5,1.8,0.5,0.6,0.5,1.7,0.5,1.7,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,1.7,0.5,0.6,0.5,0.6,0.5,1.8,0.5,1.7,0.5,1.7,0.5,1.8,0.5,1.7,0.5,39.9,8.9,2.3,0.5,96.2,8.9,2.3,0]);\n");

  }
}
Puck.on('mag', onMag);
Puck.magOn();
```

Buying
------

You can buy the IR remote control lights like the ones I used from
[eBay](http://www.ebay.com/sch/i.html?_nkw=rgb+led+light+ir+remote+control&_sacat=0).
They are also available in strip form.

**Note:** while some of these lights look identical, they often use a different
set of control codes. About the only way to be sure is to [record your own codes](/Puck.js Infrared).
