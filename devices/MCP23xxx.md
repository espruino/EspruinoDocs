<!--- Copyright (c) 2015 Spence Konde. See the file LICENSE for copying permission. -->
MCP23xxx I2C and SPI port expanders
========================

* KEYWORDS: Module,port expander,MCP23008,MCP23S08,MCP23017,MCP23S17

Overview
------------------

Port expanders, as the name implies, are chips which provide a number of pins with many of the capabilities of GPIO pins, controlled over I2C or SPI. Module support is provided for the 8-bit MCP23008 (I2C) and MCP23S08 (SPI), and the 16-bit MCP23017 and MCP23S17. These are of obvious utility when controlling large numbers of devices. 

These modules provide an object-oriented interface to these parts, returning an object with 8 or 16 virtual pins, which can be used with the usual methods: pin.read(), pin.set(), pin.reset(), pin.write() and pin.mode(). 
