<!--- Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
HopeRF RFM69 Wireless Module
======================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/RFM69. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,SPI,RFM69,HopeRF,315Mhz,433Mhz,434Mhz,868Mhz,915Mhz,Wireless,Radio,Transceiver

The HopeRF RFM69 is a transceiver module capable of operation over a wide frequency range, including the 315,433, 868 and 915MHz license-free ISM (Industry Scientific and Medical) frequency bands. ([datasheet here](http://www.hoperf.cn/upload/rf/RFM69-V1.3.pdf))

A driver for it is available in the [[RFM69.js]] module.

**Note:** This module is still very new, and doesn't support anywhere near all the features of the RFM69. [Contributions](https://github.com/espruino/EspruinoDocs/blob/master/devices/RFM69.js) are always appreciated!

Connect as follows:

| RFM69 | Name |  Espruino  |
|-------|------|------------|
| 1 | RST  | B1 |
| 2 | DIO0 | | 
| 3 | DIO1 | | 
| 4 | DIO2 | | 
| 5 | DIO3 | | 
| 6 | DIO4 | | 
| 7 | DIO5 | | 
| 8 | 3.3V | 3.3 |
| 9 | GND | GND |
| 10 | ANA | Aerial of correct length - around 17.3cm |
| 11 | GND | GND |
| 12 | SCK | B13 |
| 13 | MISO | B14 |
| 14 | MOSI | B15 |
| 15 | NSS | B10 |
| 15 | NC | GND |

For the Espruino [[Pico]], there is [an adaptor shim available](/Shims#rfm69-rfm12b-0-1-adaptor) that makes connecting this module a lot easier.


Software
-----------

There are simple functions that allow you to send and receive data:

To send data when the button is pressed:

```
var rfm;

function onInit() {
  SPI2.setup({mosi:B15,miso:B14,sck:B13});
  rfm = require("RFM69").connect(SPI2, {cs:B10, rst:B1, freq:434}, function() {
    console.log("Connected");
  });
}

setWatch(function() {
  digitalWrite(LED1,1);
  rfm.sendPacket("Hello World", function() {
    digitalWrite(LED1,0); // done sending
  });
}, BTN, {debounce:50, edge:"rising", repeat:true});
```

And to repeatedly listen for data:

```
var rfm;

function onInit() {
  SPI2.setup({mosi:B15,miso:B14,sck:B13});
  rfm = require("RFM69").connect(SPI2, {cs:B10, rst:B1, freq:434}, function() {
    rfm.rxmode(); // in order to receive data
    console.log("Connected");
    setInterval(function() { 
      if (rfm.hasPacket()) 
        console.log("Received : "+JSON.stringify(E.toString(rfm.getPacket()))); 
    },100);
  });
}
```

Reference
--------------
 
* APPEND_JSDOC: RFM69.js

Using 
-----

* APPEND_USES: RFM69

