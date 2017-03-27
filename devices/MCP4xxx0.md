<!--- Copyright (c) 2014 Spence Konde. See the file LICENSE for copying permission. -->
MCP4xxx0 SPI digital potentiometers
======================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/MCP4xxx0. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,SPI,digipot,digital potentiometer,ADC,rheostat

Overview
------------------

A digital potentiometer is a potentiometer that can be controlled via digital means (typically I2C or SPI). They consist of a "resistor ladder" of many identical value resistors between two pins (the ends of the potentiometer), while a third pin (the wiper) can be connected between any of those resistors. The number of taps (points between resistors that the wiper can be connected to) varies, but is typically a power of two, or 1 more than a power of two. Some digital potentiometers have non-volatile memory and use that to initialize the wiper position on startup. Digital pots are available in the same resistance ranges as analog pots. Digital rheostats are also available. Note that in most digital potentiometers, the voltage on any of the potentiometer terminals must always be between ground and supply voltage (sometimes with allowance for voltages slightly beyond that), though there do exist digital potentiometers capable of handling much higher voltages on the analog pins. Digital potentiometers generally cannot handle very much current - see the datasheet for specifics. 

See also: [[MCP4xxx.md]]

Supported Parts
------------------

This module [[MCP4xxx0.js]] interfaces with a number of 1 and 2 pot SPI digital potentiometers from Microchip, with part numbers like MCP4xyyy, where x is the number of pots in the package and y is the resistance in k-ohms. For example, an MCP42010 is a dual 10k pot. These are very simple devices, supporting only writing of data or shutting down the part. A unique feature is the ability to daisychain these parts, much like a shift register. See the datasheet for more information.


Wiring (SPI)
-----------------

Wiring is straightforward:  
GND goes to GND on the Espruino
VCC goes to 3.3v on the Espruino (VCC can be 5v on these parts, which means you could use VBat instead *if* VBat isn't above 5v). 
Connect a 0.1uf ceramic capacitor between VCC and GND. 
Connect SCK, and SDI to SCK, and MOSI pins of SPI respectively.
Connect CS pin to any GPIO pin.
Connect any additional pins (SDWN, RST), either to VCC, Ground, or a GPIO line, as appropriate for your project.
If using the 42xx0 part in a daisychain configuration, connect the CS and SCK pins of each chip together, and connect SDO of each one to SDI of the next one in the chain.


Usage
-----------------

Setup SPI, and then call:

```
var digipot=require("MCP4xxx0").connect(spi,cs,pots);

`spi` is the SPI interface it is connected to (SPI only)
`cs` is the Espruino pin connected to the CS (chip select) line on the part. (SPI only)
`pots` is the number of pots (1, 2, or 4)
```

Control it using:

```
digipot.setValue(pot,value)
digipot.shutdown(pot)
```

`pot` is the number of the pot being acted on (0, 1, or 2 - if 2 is selected, both pots will be controlled)
`value` is the value to be set. 


Buying
-------------

* [Digikey](http://www.digikey.com/product-search/en?FV=fff40027%2Cfff801be%2Cfffc0096)
* [Mouser](http://mouser.com)
* eBay (search for the part number, only common ones, like 10k ohm)
