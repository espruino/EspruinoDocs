<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Charlieplexed LED Module
=====================

* KEYWORDS: Module,Charlieplex,LED,LEDs,Matrix,Light,Graphics,Graphics Driver

[Charlieplexing](http://en.wikipedia.org/wiki/Charlieplexing) is a way of wiring up LED lights
 that takes advantage of the the fact that they only light up when connected one way around.

You can connect LEDs up in such a way that with `N` IO pins, you can control `N*(N-1)` LED lights.

You can control Charlieplexed LED lights using the [[Charlieplex.js]] module. 

**Note:** Charlieplexed LEDs require constant updates (ideally via interrupts and timers). Espruino doesn't allow you to do this at the moment, so you will find that if you update the display or write functions that take a long time to execute, the display will flicker.

To use the module, simply connect up an array of Charlieplexed LEDs and use:

```
var g = require("Charlieplex").connect([pin1,pin2,pin3,...]);
```

You'll then get a Graphics object, which you can use just like any other graphics object. When you're done drawing, just call `g.flip()` to update the display with the latest information. For instance:

```
var g = require("Charlieplex").connect([C0,C1,C2,C3,A0]);
g.drawLine(0,0,g.getWidth()-1,g.getHeight()-1);
g.flip();
```

Using 
-----

* APPEND_USES: Charlieplex

Buying
-----

You can buy Charlieplexed LEDs from the places below (and many others), or it's easy enough to wire up your own.

* [Phenoptix](http://www.phenoptix.com/products/adafruit-jprodgers-lol-shield-lots-of-leds-for-arduino-charlieplexed-display)
* [eBay](http://www.ebay.com/sch/i.html?_nkw=Charlieplexed)
