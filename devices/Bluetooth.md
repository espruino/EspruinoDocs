<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bluetooth
=========

* KEYWORDS: Bluetooth,Wireless,BT,HC-05,HC05

![HC-05 front](HC05_front.jpg)
![HC-05 back](HC05_back.jpg)

The most common Serial bluetooth module is the HC-05 (above) or HC-06. These are very similar modules and both will work with Espruino. The main difference is that the HC-05 can be configured as a Bluetooth Master, and the HC-06 can't.

Connecting
--------

![HC-05 module on Espruino](HC05_placed.jpg)

[[http://youtu.be/J0HJVTDNSUQ]]

The [Espruino Board](/EspruinoBoard] has pads on it already for the placement of an HC-05 bluetooth module, so it's very easy to connect. Note that while there are many connections on the HC-05 module, only 4 of them are needed. See the [[Wiring Up]] page if you want to connect bluetooth to something other than the Espruino Board.

To solder the HC-05 module, do the following:

* Add a small piece of Magic Tape to the back of the module, over the circular aerial connection.
* Place the module as pictured above, so it overlaps the pads on the Espruino board
* Solder the pins. **Note:** not all the pins need soldering. Only the pins in the picture above with the red dots by them absolutely need soldering, however we'd suggest at a minimum soldering the pin with the orange dot by it as well.

Pairing
------

The bluetooth module will appear by name as either ```HC-05``` or ```linvor```. Simply pair with this module and enter the pairing code ```1234```. Espruino should then appear as a new Serial port, and you will be able to connect to it with the Web IDE.

Software
-------

If there is no USB connection, the Espruino board defaults to using the fist Serial Port (USART1) for the Console at 9600 - which is what the bluetooth module is connected to. This means that just powering Espruino from a USB wall supply, the battery connector, or the GND and VBAT pins will make it work. **Note:** If you power the board from your PC's USB port, it will move the console to USB and you will get no response from the Bluetooth connection.

Using 
-----

* APPEND_USES: Bluetooth

Buying
-----

HC05 bluetooth modules can be purchased from many places. If you wish to buy from eBay, make sure you get one **without** the 0.1" adaptor PCB included if you want to connect it to the [Espruino Board](/EspruinoBoard) ([eBay search](http://www.ebay.com/sch/i.html?_nkw=HC05+bluetooth) - around $6)
