<!--- Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Temperature Controlled Night Light with Puck.js
===============================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Puck.js+Night+Light. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Puck.js,BLE,Bluetooth,LED,Light,Lightbulb,IR,Infrared,Night,Nightlight,Temperature
* USES: Puck.js,Infrared,BLE

If you've got a baby you're supposed to keep room temperature between 16
and 20 degrees Celsius - but how do you know at night? Here, we'll make a night light
that changes color depending on the temperature.

[[http://youtu.be/NSGWWB9otaY]]

You'll need
-----------

* A [Puck.js](/Puck.js)
* A IR controlled RGB Light bulb ([you can find these on eBay](http://www.ebay.com/sch/i.html?_nkw=rgb+led+light+ir+remote+control&_sacat=0))
* An [Infrared Receiver](Puck.js Infrared) (if your light bulb differs from the one I used)

Software
--------

First, you need to get the Infrared codes for your light bulb - you can
just [follow the instructions here](Puck.js Infrared) for that.

Then, the code to use is simply:

```
var light = {
  normal : [8.9,4.5,0.5,0.5,0.6,0.5,0.6,0.5,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,1.7,0.5,1.7,0.5,1.7,0.6,1.8,0.4,1.7,0.5,1.7,0.5,1.7,0.5,1.7,0.5,1.7,0.5,0.6,0.5,1.7,0.5,1.7,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,1.7,0.5,0.6,0.5,0.6,0.5,1.7,0.5,1.7,0.5,1.7,0.5,1.7,0.5,39.9,8.9,2.2,0.5],
  hot : [8.9,4.5,0.5,0.6,0.5,0.5,0.6,0.5,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,1.7,0.5,1.7,0.5,1.7,0.5,1.7,0.5,1.7,0.5,1.7,0.5,1.7,0.5,1.7,0.5,1.7,0.5,0.6,0.5,0.6,0.5,1.7,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,1.7,0.5,1.7,0.5,0.6,0.5,1.7,0.5,1.7,0.6,1.7,0.5,1.7,0.5,39.9,8.9,2.3,0.5],
  cold :  [8.9,4.5,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.5,0.6,1.7,0.5,1.7,0.5,1.7,0.6,1.8,0.5,1.7,0.5,1.7,0.5,1.7,0.5,1.7,0.5,0.6,0.5,1.7,0.6,1.7,0.5,1.7,0.5,0.6,0.5,0.6,0.5,0.6,0.5,0.6,0.5,1.7,0.5,0.5,0.6,0.5,0.5,0.6,0.5,1.7,0.5,1.7,0.5,1.7,0.5,1.7,0.5,39.9,8.9,2.3,0.5]
};
var offset = 20.2 - 17.75;

function tempTest() {
  var temp = E.getTemperature()+offset;
  print("Temperature:"+temp);
  if (temp < 16)
    Puck.IR(light.cold);
  else if (temp <= 20)
    Puck.IR(light.normal);
  else
    Puck.IR(light.hot);
}

setInterval(tempTest, 30*1000);
```

Once uploaded, it will run until the battery runs down or is removed. If
you want to save everything so it runs even after a battery removal, simply
type `save()` on the left-hand side.


Notes
-----

* `Puck.light()` can be used to get a rough idea of ambient light - to turn off the night light in the day time.
* Since Puck.js has Bluetooth, you could use a Bluetooth LE light bulb as well. They're often harder to reverse-engineer though!
* Puck.js has RGB lights on board so you could use those for the night light, but I didn't because:
  * The battery would run down pretty quickly (a day or two) with the LEDs on all night
  * The act of powering the LEDs will raise the die temperature of Puck.js, messing up the temperature reading. It's another reason to only measure the temperature every few seconds rather than all the time.
