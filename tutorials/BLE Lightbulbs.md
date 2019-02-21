<!--- Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Controlling Bluetooth Lights with Puck.js
============================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Puck.js+and+Bluetooth+Lightbulbs. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Puck.js,BLE,Bluetooth,LED,Light,Lightbulb,Awox,Smartlight
* USES: Puck.js,Web Bluetooth,BLE,Only BLE

This video shows you how to control most types of Bluetooth lightbulb using
Puck.js.

[[http://youtu.be/LCvmmpQjnj0]]

The actual code used is:

```
function setLight(isOn) {
  var gatt;
  NRF.connect("98:7b:f3:61:1c:22").then(function(g) {
    //         ^^^^^^^^^^^^^^^^^  your light's address here
    gatt = g;
    return gatt.getPrimaryService("33160fb9-5b27-4e70-b0f8-ff411e3ae078");
  }).then(function(service) {
    return service.getCharacteristic("217887f8-0af2-4002-9c05-24c9ecf71600");
  }).then(function(characteristic) {
    return characteristic.writeValue(isOn ? 1 : 0);
  }).then(function() {
    gatt.disconnect();
    console.log("Done!");
  });
}

var on = false;
setWatch(function() {
  on = !on;
  setLight(on);
}, BTN, { repeat:true, edge:"rising", debounce:50 });
```

But you'll have to change the address to that of your lightbulb!

This code will work with Awox Smartlight C9 and W13 bulbs. For other bulbs
you may need to use the steps shown in the video to work out which characteristics
were used.

Extras
------

For the Awox Smartlight W13 you can also change:

* **Brightness** by writing a value from 0 to 127 to characteristic `d8da934c-3d8f-4bdf-9230-f61295b69570` on service `fff6fe25-469d-42bc-9179-b3a093f19032`
* **Colour temperature** by writing a value from 0 to 127 to characteristic `5b430c99-cb06-4c66-be2c-b538acfd1961` on service `fff6fe25-469d-42bc-9179-b3a093f19032`

Buying
------

You can buy the lights I used here from eBay:

* [Awox Smartlight C9](http://www.ebay.com/sch/i.html?_nkw=awox+c9&_sacat=0) - multicolour
* [Awox Smartlight W13](http://www.ebay.com/sch/i.html?_nkw=awox+w13+-striim+-striimlight&_sacat=0) - white, variable temperature
