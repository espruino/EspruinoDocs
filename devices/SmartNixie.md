<!--- Copyright (c) 2014 Spence Konde. See the file LICENSE for copying permission. -->
SmartNixie Nixie Tube driver
=====================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/SmartNixie. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Nixie,SmartNixie

Overview
-----------------

This module interfaces with the Smart Nixie Tube, from [Switchmode Design](http://switchmodedesign.com)

These consist of two PCBs, containing an IN-14 Nixie Tube, RGB LED, a boost converter to generate the high voltage for the tubes, and a serial interface to control it. They include connectors to daisy chain multiple units together, with the data being passed from left to right (like a shift register). They use an ATmega328P microcontroller, and are Arduino-compatible. The warm glow of a Nixie tube offers a unique retro aesthetic. 

The Smart Nixie Tube modules require a separate power supply at 9-12V. 

Wiring
-----------------

Connect the Espruino ground to the Smart Nixie Tube ground (pin on the 6-pin header closest to the power connector). 

Connect any 5V-tolerant UART TX pin on the Espruino to the Smart Nixie Tube RX pin (4th pin from the power connector on the 6-pin header) on the left-most Smart Nixie Tube. Although the Smart Nixie Tube logic runs at 5v, no level shifter is required to use with the Espruino, as long as the pin used is 5v tolerant. 

Usage
-----------------

Setup the Serial interface to use 115200 baud, and call connect:

```
Serial3.setup(115200,{tx:B10});
var nixie=require("SmartNixie").connect(Serial3,digits);
```

`digits` is the number of Smart Nixie Tubes chained together. 

The following functions are provided to set the options for the tube. Note that in all cases, *no* *error* *checking* is performed, in order to reduce the memory footprint of the module. 

```
nixie.send()
nixie.setTube(digit,number,ldot,rdot,brightness,red,green,blue)  
nixie.setString(string)
nixie.setLED(digit,red,green,blue) 
nixie.setBright(digit,brightness) 
nixie.setAllLED(red,green,blue)
nixie.setAllBright(brightness) 
```

`nixie.send()` sends the data to the Smart Nixie Tubes. No changes are sent to the Smart Nixie Tube devices until this is called. This allows you to make multiple changes, and then apply them all at once. 

`nixie.setTube(digit,number,ldot,rdot,brightness,red,green,blue)` sets ALL the options for the specified digit. Number is the numeral to display (should be a number between 0 and 9, ldot and rdot set the status of the left and right decimal places - these should be 0 or 1. Brightness, red, green, and blue should be a number from 0 to 255. 

`nixie.setString(string)` sets the provided string to be displayed. Valid characters are space, 0-9, comma, and period. Periods and commas control the left and right decimal places respectively, and apply to the following digit, not the preceeding one. LED and brightness are not effected. 

`nixie.setLED(digit,red,green,blue) sets the LED color for the specified digit. 

`nixie.setBright(digit,brightness) sets the brightness for the specified digit.

`nixie.setAllLED(red,green,blue) sets the LED color for all digits (default 0 - off). 

`nixie.setAllBright(brightness) sets the brightness for all digits (default 128).


Example
-----------------

This simple example connects to a bank of 6 Smart Nixie Tubes and displays the first 6 digits of Pi - with one wrong digit - and highlights the correct digits in green, and the error in red:

```
Serial3.setup(115200,{tx:B10});
var nixie=require("SmartNixie").connect(Serial3,6);

nixie.setString("4.16159");
nixie.setAllLED(0,255,0);
nixie.setLED(2,255,0,0);
nixie.send();
```


Buying
-----

SmartNixie build kits can be purchased from the manufacturer:

* [switchmodedesign.com](http://switchmodedesign.com/collections/arduino-shields/products/smart-nixie-tube)
