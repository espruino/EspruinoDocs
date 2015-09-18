<!--- Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Arduino Pico adaptor board
=======================

* KEYWORDS: Arduino,Pico,Adaptor
* USES: Arduino,Pico


There is an [Arduino adaptor shield design](https://github.com/espruino/EspruinoBoard/tree/master/Pico/Adaptors) available online that you can get made by a company such as [OSHPark](https://www.oshpark.com/) by sending them the `.brd` file. Please get in touch on [the forum](http://forum.espruino.com) if you'd like these to be made available to buy directly.

The Pin mapping is as follows:

| Arduino | Pico |
|-----|------|
| A0  | A0   |
| A1  | A1   |
| A2  | A2   |
| A3  | A3   |
| A4  | A4   |
| A5  | A5   |
| D0  | B7   |
| D1  | B6   |
| D2  | B1   |
| D3  | B3   |
| D4  | B4   |
| D5  | B5   |
| D6  | A6   |
| D7  | A7   |
| D8  | A8   |
| D9  | B10  |
| D10 |  A10 |
| D11 |  B15 |
| D12 |  B14 |
| D13 |  B13 |
| SCL |  B8  |
| SDA |  B9  |

However to make this easier we've made a module that contains the pin mapping. You can do:

```
var ard = require("ArduinoPico");
// use normal arduino-style functions
digitalWrite(ard.D9, 1);
console.log(analogRead(ard.A0));
// or access pins directly
ard.D10.set();
```

