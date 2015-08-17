<!--- Copyright (c) 2015 Spence Konde. See the file LICENSE for copying permission. -->
MCP23xxx I2C and SPI port expanders
========================

* KEYWORDS: Module,port expander,MCP23008,MCP23S08,MCP23017,MCP23S17


Overview
------------------
A 'port expander' is a chip which allows a large number (typically 8 or 16) pins to be controlled through a serial bus, typically SPI or I2C. These pins can be used as inputs or outputs, and can switch mode during operation, much like the normal GPIO pins on an Espruino or other microcontroller board. The MCP23xxx modules provide an object-oriented interface to these devices, by providing a number of virtual pins, which can be controlled using pin.write(), pin.read(), and pin.mode(). Functions are also provided for accessing all pins at once. 

