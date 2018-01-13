<!--- Copyright (c) 2015 Spence Konde. See the file LICENSE for copying permission. -->
MCP23xxx I2C and SPI port expanders
========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/MCP23xxx. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,port expander,I2C,SPI,MCP23008,MCP23S08,MCP23017,MCP23S17

Overview
------------------

Port expanders, as the name implies, are chips which provide a number of pins with many of the capabilities of GPIO pins, controlled over I2C or SPI. Module support is provided for the 8-bit MCP23008 (I2C) and MCP23S08 (SPI), and the 16-bit MCP23017 and MCP23S17. These are of obvious utility when controlling large numbers of devices.

These modules provide an object-oriented interface to these parts, returning an object with 8 or 16 virtual pins, which can be used with the usual methods: pin.read(), pin.set(), pin.reset(), pin.write() and pin.mode().

Wiring
------------------
The MCP23000-series port expanders require the following connections to be made (see datasheet for pin mapping):

| Pin      | I2C | SPI | Notes |
|----------|----|----|----|
| Vcc      | Vcc  | Vcc  |   |
| Gnd      | Gnd  | Gnd  | |
| Reset  | Vcc | Vcc  | OR connect to IO pin  |
| SCL/SCK   | SCL  | SCK  | |
| SDA/SI   | SDA  | MOSI  |  |
| SO   | NC  | MISO  ||
| CS   | NC  | Any IO Pin  ||
| A0   | Vcc or Gnd  | Vcc or Gnd  |   |
| A1   | Vcc or Gnd  | Vcc or Gnd  |   |
| A2   | Vcc or Gnd  | Vcc or Gnd  | 23x17 only  |

The Reset pin may also be connected to any IO pin on the Espruino if you need to be able to reset the port expander. This is recommended, in order to ensure that the port expander is in the expected state when you start using it, and to ensure that restarting your program also resets the port expander.

Both I2C and SPI devices have 2 or 3 hardware address pins. These must be connected to either Vcc or Gnd. These allow multiple devices to be connected to the same I2C or SPI bus, and in the case of SPI, these may even share the same CS line.

Software
-------------

Connect to the port expander:

### I2C port expanders

```

var i2c=I2C1;
i2c.setup({scl:B6,sda:B7});
var address = 0; //this is the address, set by the address pins.
var RST=A8; //pin connected to reset. Omit if reset is not connected.

// for MCP23008
var port=require("MCP23008").connect(i2c,RST,address);
// for MCP23017
var port=require("MCP23017").connect(i2c,RST,address);
```

### SPI port expanders

```
var spi=SPI1;
spi.setup({sck:A5,miso:A6,mosi:A7});
var address = 0; //this is the address, set by the address pins.
var RST=B10; //pin connected to reset. Omit if reset is not connected.
var CS=B1;

// for MCP23S08
var port=require("MCP23S08").connect(spi,CS,RST,address);
// for MCP23S17
var port=require("MCP23S17").connect(spi,CS,RST,address);
```

These will (assuming no errors) return an object that provides the following methods:

`port.read(pin)` Returns the state of specified pin. (pin number 0 to 7 for 8-bit port expanders, 0-15 for 16-bit ones). If 'pin' is omitted,  the values of all pins are read and returned as a single value (bit 0 to pin 0, and so on).

`port.write(pin,value)` Writes to specified pin. (pin number 0 to 7 for 8-bit port expanders, 0-15 for 16-bit ones). If 'pin' is omitted, the value is written to all the pins (bit 0 to pin 0, and so on).

`port.mode(pin,mode)` Sets the mode ('input','output', or 'input_pullup') specified pin. (pin number 0 to 7 for 8-bit port expanders, 0-15 for 16-bit ones).

`port.writePort(value)` Writes all 8 (or 16) pins and returns them as a single value (bit 0 corresponds to pin 0 and so on). For 16-bit port expanders, the low byte corresponds to pins 0-7.

`port.readPort(value)` Reads all 8 (or 16) pins and returns them as a single value (bit 0 corresponds to pin 0 and so on). For 16-bit port expanders, the low byte corresponds to pins 0-7.

The port object also contains 8 (or 16) virtual pins, each with the normal read(), write(), set(), reset(), and mode() options, named A0-7, (and B0-7 for 16-bit versions).

```
> port.A0.mode('input_pullup');
> console.log(port.A0.read());
1
> port.B3.mode('output');
> port.B3.write(1);
> console.log(port.B3.read());
1
> port.B3.write(0);
> console.log(port.B3.read());
0
```
