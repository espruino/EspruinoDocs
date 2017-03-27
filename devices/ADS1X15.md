<!--- Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
ADS1x15 programmable gain ADC
==========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/ADS1X15. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,I2C,ADS1x15,ADS1015,ADS1115,ADC,Analog to Digital Converter,Programmable Gain

The ADS1015 (12 bit) / ADS1115 (16 bit) is a 4 channel, programmable gain Analog to Digital converter made by TI ([datasheet](http://www.ti.com/lit/ds/symlink/ads1015-q1.pdf)).

Support is included in the [[ADS1X15.js]] module.

Wiring
------

If you're using the Adafruit modules, connect them as per [Adafruit's documentation](https://learn.adafruit.com/adafruit-4-channel-adc-breakouts/overview), making sure you connect SDA and SCL to I2C-capable pins on Espruino.

Software
-------

Just 'connect' the module to the correct I2C port and call `getADC` to get a value. Because conversion can take around 8ms, `getADC` uses a callback - which allows Espruino to do other things in the background.

```
I2C1.setup({ scl : ..., sda: ...} );
var ads = require("ADS1X15").connect(I2C1);
ads.setGain(256); // +/- 0.256mV
ads.getADC(0, function(val) {
  console.log("Read ADC value: "+val);
});
```

API reference
------------

* APPEND_JSDOC: ADS1X15.js

Using 
-----

* APPEND_USES: ADS1X15

Buying
-----

The ADS1015 is available in chip form, however:

* Adafruit sell  the [ADS1115](https://www.adafruit.com/products/1085) (16 bit) or the [ADS1015](https://www.adafruit.com/products/1083) (12 bit) on a breakout board
