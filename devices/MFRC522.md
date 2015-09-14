<!--- Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
MFRC522 NFC/RFID module
==================

* KEYWORDS: Module,SPI,NFC,RFID,MFRC522,RC522,NXP,13.56 MHz,Mifare

The MFRC522 is an RFID reader chip. It's common and very easy to interface to with the [[MFRC522.js]] module.


Wiring Up
--------

Simply connect up SPI as follows:

| RFID | Espruino |
|------|----------|
| GND | GND |
| VCC | BAT |
| CS/SS/SDA | B2 |
| SCK | B3 |
| MISO | B4 |
| MOSI | B5 |

Software
-------

The Espruino module currently implements only a very small subset of the MFRC522's functionality, but you can use it as follows.

The code below will light the red, green or blue LED depending on which of three RFID tags is in range:

```
SPI1.setup({sck:B3, miso:B4, mosi:B5 });
var nfc = require("MFRC522").connect(SPI1, B2/*CS*/);
setInterval(function() {
 nfc.findCards(function(card) {
  print("Found card "+card);
  card = JSON.stringify(card);
  var leds = [LED1,LED2,LED3];
  if (card=="[147,239,211,128]") digitalWrite(leds,1);
  if (card=="[249,192,235,164]") digitalWrite(leds,2);
 });
}, 1000);
```

Once the module is connected, you can poll the MFRC522 to see if it has any cards in range using `nfc.findCards(...)`. If a card is in range, it will return an array containing the unique ID of that card.


Using 
-----

* APPEND_USES: MFRC522

Buying
-----

* [eBay](http://www.ebay.co.uk/sch/i.html?_nkw=MFRC522)
* [digitalmeans.co.uk](https://digitalmeans.co.uk/shop/index.php?route=product/search&tag=MFRC522)
