<!--- Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bluetooth LE Printers
======================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/BLE+Printers. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Modules,BLE,Bluetooth,Printer,Receipt Printer
* USES: Puck.js,Graphics,BLE,Only BLE

[![Koolertron BLE printer](Puck.js Printer/koolertron.jpg)](http://www.koolertron.com/koolertron-58mm-mini-portable-bluetooth-40-wireless-receipt-thermal-printer-compatible-with-apple-and-android-p-648.html)

Some wireless receipt printers come with Bluetooth Low Energy support, and you can use these with Espruino Bluetooth LE devices using the [[ble_printer.js]] module as follows:

```
var printer = require("ble_printer");

// Some graphics to print
var g = Graphics.createArrayBuffer(256,32,1,{msb:true});
g.setFontVector(32);
g.drawString("Espruino!");

// Connect to nearest Printer
NRF.requestDevice({ filters: [{ services: ['18f0'] }] }).then(function(device) {
  // When connected print 'Hello World' text, and then the graphics
  printer.print(device, "Hello World\n" + printer.getGraphics(g), function() {
    print('Done!');
  });
});
```
