<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
OneWire
======

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/OneWire. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Peripheral,Peripherals,One Wire,1-Wire,Built-In

[OneWire Class](/Reference#OneWire) in the Reference.

Espruino's [1-Wire](http://en.wikipedia.org/wiki/1-Wire) API is designed to be similar to Arduino's OneWire library. Simply instantiate it with the pin to use, search for devices, and start communicating:

```
var ow = new OneWire(pin);
device = ow.search()[0]; // search returns an array of device IDs
if (device===undefined) print("No OneWire devices found");
ow.reset();
ow.select(device);
ow.write(42);
var result = ow.read()
```

**Note:** OneWire devices need a 4.7kOhm pullup resistor on the data line in order to work correctly.

For examples of use, look in the source code for libraries that use OneWire...

 OneWire
---------------

* APPEND_KEYWORD: OneWire
