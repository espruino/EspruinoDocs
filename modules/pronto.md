<!--- Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Infrared 'Pronto Hex' decoder
=========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/pronto. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Modules,IR,Infrared,Pronto,IRDB,IRDB.tk,puckmote
* USES: Puck.js,Infrared,IR

![An IR remote](pronto.jpg)

While you can [plug in an IR receiver and decode IR signals](/Puck.js Infrared),
it requires you to have an IR receiver and is a bit fiddly.

[IRDB](https://github.com/probonopd/irdb) contains a list of common remote control
codes for different devices. The original website (irdb.tk) that interpreted these no longer exists, however [Ben Foxall](https://github.com/benfoxall)
has made a great tool called puckmote that will automatically generate the commands you need for you:

https://benjaminbenben.com/puckmote ([source](https://github.com/benfoxall/puckmote))

To use it:

* Choose a manufacturer and device type
* Click on on the function, eg `Power On`
* Now the `Puck.IR` code will be listed below and you can copy it (it'll also offer to connect to your Puck with Web Bluetooth where it'll send the IR code directly).


Pronto codes
------------

Originally with irdb.tk you could get 'pronto' coded by doing this:

* Click `Find IR codes for your device`
* Choose your device
* When you see a list of buttons, click the `Pronto Hex` tab, and for
most devices you will see a code - for example this is the code for the
Power button on a Samsung TV:

```
0000 006C 0000 0022 00AD 00AD 0016 0041 0016 0041 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0041 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0016 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 06FB
```

Now just enclose that in quotes, and use it with the pronto decoder:

```
var prontoHex = "0000 006C 0000 0022 00AD 00AD 0016 0041 0016 0041 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0041 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0016 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 06FB";
var pulseTimes = require("pronto").decode(prontoHex);
```

`pulseTimes` now contains an array of pulses in milliseconds that you can use with [`digitalPulse`](/Pico+Infrared)
on normal Espruino boards, or [`Puck.IR`](/Puck.js Infrared) on Puck.js devices:

### Puck.js

```
Puck.IR(pulseTimes);
```

### Other boards

```
analogWrite(IR_ANODE,0.9,{freq:38000});
digitalPulse(IR_CATHODE, 1, pulseTimes);
digitalPulse(IR_CATHODE, 1, 0);
digitalRead(IR_ANODE);
```
