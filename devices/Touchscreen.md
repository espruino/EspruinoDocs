<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Touchscreen
==========

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Touchscreen. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,HYSTM32,HYSTM32_24,HYSTM32_28,HYSTM32_32,Touchscreen,SPI,ADS7843

We've created a [[Touchscreen.js]] module that allows you to easily access the touchscreen on devices that have them built in. If you've wired up your own touchscreen then you will probably need to use the relevant touchscreen module directly though (such as the [[ADS7843]]). 

Using the touchscreen is as easy as writing ```require("Touchscreen").connect( ... )```, and supplying a callback function. The callback function has two arguments (X and Y). When you move your finger on the touchscreen the X and Y coordinates are reported back, and when you lift your finger, the callback function is called once with X and Y set to undefined.

The following example draws a rectangle at each point that is reported when you drag your finger.

```
function onTouch(x,y) {
  if (x!==undefined)
    LCD.fillRect(x-1,y-1,x+1,y+1);
}

require("Touchscreen").connect(onTouch);
```

In most cases you'll want to know when the user's finger was first pressed. You can do this by remembering when the user last lifted their finger. The following example shows how to draw lines - note that it uses ```moveTo``` when the user first presses their finger.

```
var fingerLifted = true;

LCD.clear();

function onTouch(x,y) {
  if (x===undefined) {
    fingerLifted = true;
  } else {
    if (fingerLifted) {
      // first call after finger was lifted
      fingerLifted = false;
      LCD.moveTo(x,y);
    } else {
      // subsequent calls
      LCD.lineTo(x,y);
    }
  }
};

require("Touchscreen").connect(onTouch);
```

Using 
-----

* APPEND_USES: Touchscreen
