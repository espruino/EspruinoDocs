<!--- Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
MDBT42Q Bluetooth Module
========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/MDBT42Q. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Espruino,Official Board,MDBT42Q,MDBT42,nRF52832,nRF52,Nordic,Pinout,Bluetooth,BLE,Bluetooth LE

![Raytac MDBT42Q](MDBT42Q/board.jpg)

* BUYFROM: £12,£5.96,https://shop.espruino.com/mdbt42q,/Order#mdbt42q

This is the Bluetooth module that we use in [Puck.js](/Puck.js) and [Pixl.js](/Pixl.js)
devices. You can get it with Espruino installed in two forms:

* [Breakout board](https://shop.espruino.com/mdbt42q-breakout) with 0.1" pins, voltage regulator, Button and LEDs
* [Bare module](https://shop.espruino.com/mdbt42q-module) (0.7mm pin pitch, surface mount)

**Note:** We only provide support for MDBT42 modules purchased from us. Other
modules don't have a bootloader installed and will need connecting to a programmer
tool to have firmware installed.

Contents
--------

* APPEND_TOC

Features
--------

* Bluetooth Low Energy
* Espruino JavaScript interpreter pre-installed
* nRF52832 SoC - 64MHz ARM Cortex M4, 64kB RAM, 512kB Flash
* 32 x GPIO (capable of PWM, SPI, I2C, UART) on 0.7mm Pitch, including 8 analog inputs
* 1.7v - 3.6v voltage range
* Built in thermometer
* NFC tag programmable from JavaScript (when an antenna is connected)
* Dimensions: 16mm x 10mm x 2.2mm thick

### Breakout board features

* 2.5 - 16v voltage input, 20uA power draw when advertising
* 0.1" pin header (With 22 GPIO, 7 analog inputs)
* Red and Green LEDs
* Button


Getting Started
----------------

### Breakout board

Apply power between the `V+`/`Vin` and `GND` pins. Any voltage between 2.5 and 16 volts
will work - just be careful not to get the polarity wrong! Check [the pinout](#pinout) below
for more information on the location of pins.

Once powered up follow the [Getting Started Guide](/Quick+Start+BLE#mdbt42q) for details
on getting the IDE connected wirelessly. You can also [use a wired connection](#serial-console)
if you prefer.

### Bare Module

All you need to get the MDBT42Q working is to apply power between the `VDD` and
`GND` pins. A 3v non-rechargeable lithium cell is ideal for this (LiPo batteries
have a voltage that is too high and will need the voltage dropping with a diode
or voltage regulator). Check [the pinout](#pinout) below for details on where to
 connect power.

It is recommended to connect all the `GND` pins together (especially when
designing a PCB) but it is not absolutely required - you can boot the
MDBT42Q module with just two wires.

Once powered up follow the [Getting Started Guide](/Quick+Start+BLE#mdbt42q) for details
on getting the IDE connected wirelessly. You can also [use a wired connection](#serial-console)
if you prefer.


On-board peripherals
--------------------

While there are no buttons or LEDs on the bare module, the MDBT42Q build assumes
the following (which are connected on the breakout board):

* There is a button (`BTN`/`BTN1`) between pin `D0` and 3.3v. Pulling this high on boot
enables the bootloader.
* There is a LED (`LED`/`LED1`) between pin `D1` and GND. This is flashes at
boot and also indicates bootloader mode.

The breakout board also contains a green LED on pin `D2`. As of build 1v99 this
isn't mapped to a built-in variable, but a simple `global.LED2=D2` command will add it.


Hard Reset
----------

Occasionally you may manage to save code to your MDBT42Q that then
runs at boot and stops you connecting to it, effectively 'bricking' it.

Recovering it easy:

* Follow [the step for a firmware update](#firmware-updates), but leave `BTN`/`D0` pressed/connected for 5 seconds (or until the LED goes out).
* Espruino will now have booted *without loading any saved code*, however the
code will still be there and the next time you reset it the code will be loaded
as normal.
* You can now connect normally with the IDE and continue.
* To reset completely, type `reset(true)` into the REPL. This will remove any saved code that is present in the MDBT42Q so even after a reset, your code will not be loaded.


Tutorials
--------

First, it's best to check out the [Getting Started Guide](/Quick+Start+BLE#mdbt42q)

Tutorials using MDBT42Q:

* APPEND_USES: MDBT42Q

Tutorials using Bluetooth LE:

* APPEND_USES: Only BLE,-MDBT42Q

Tutorials using Bluetooth LE and functionality that may not be part of the MDBT42Q module:

* APPEND_USES: BLE,-Only BLE,-MDBT42Q



Pinout
--------

* APPEND_PINOUT: MDBT42Q

**Note:** The nRF52 port has one available I2C, SPI and USART (and infinite software SPI and I2C).
Unlike other Espruino boards, these peripherals can be used on *any* pin.

The bare MDBT42Q module must be powered with a voltage between 1.7v and 3.6v. **You can
not connect a LiPo battery to it without a voltage regulator**. However the breakout board
contains a regulator that will work off of 2.5 to 16 volts.


Information
-----------

[![MDBT42Q library](MDBT42Q/lbr.png)](https://raw.githubusercontent.com/espruino/EspruinoBoard/master/MDBT42/mdbt42.lbr)

* [Eagle CAD footprint](https://raw.githubusercontent.com/espruino/EspruinoBoard/master/MDBT42/mdbt42.lbr)
* [Eagle design files](https://github.com/espruino/EspruinoBoard/tree/master/MDBT42/eagle) for breakout board and simple beacon
* [PDF schematic and board layouts](https://github.com/espruino/EspruinoBoard/tree/master/MDBT42/pdf) for breakout board and simple beacon
* [nRF52832 Datasheet](/datasheets/nRF52832_PS_v1.0.pdf)
* [MDBT42 Datasheet](/datasheets/MDBT42Q-E.pdf)


Serial Console
---------------

When power is first applied, the MDBT42Q checks if pin `D8` (labelled `RX` on the breakout board) is at 3.3v (which will be the
case if it is connected to a Serial port's transmit line). If it is, it initialises
the on-chip UART on `D8` (MDBT42Q RX) and `D6` (MDBT42Q TX) and puts the Espruino
console (REPL) on it at 9600 baud.

To use it, connect to a 3.3v output USB to TTL converter as follows:

| MDBT42Q     | USB->TTL converter |
|-------------|--------------------|
| `GND`       | `GND`                |
| `D8` (`RX`) | `TX` ( <- PC )       |
| `D6` (`TX`) | `RX` ( -> PC )       |
| `3V`        | 3.3v (Optional - to run without a battery) |

You can now use the normal Espruino Web IDE, or a serial terminal application at 9600 baud.

When you connect via Bluetooth, the console will automatically move over. To
stop this, execute `Serial1.setConsole(true)` to force the console to stay on
`Serial1`.

**Note:** Serial1 is not enabled by default because it requires the high speed
oscillator to stay on, which increases power draw a huge amount. If you connect
the UART but don't power down and power on the MDBT42Q, you won't get a serial port.


Firmware Updates
-----------------

Up to date firmwares are available from [the Download page](/Download#mdbt42q).

Check out the [Puck.js firmware update instructions](/Puck.js#firmware-updates)
for full details. All you need to do is apply power to your module with
pin `D0` connected to `VDD` (or `BTN` held down on the breakout board), then
release it after a second to enter bootloader mode. The module will advertise
itself as `DfuTarg`, and you can then connect with the `nRF Connect` app and
write new firmware.

**Note:** If you hold `BTN` (or leave `D0` connected to `VDD`) for too long (> 3 sec),
the MDBT42 will leave bootloader mode and will instead start Espruino *without loading
saved code*, allowing a [hard reset](#hard-reset) to be performed.


Other Official Espruino Boards
------------------------------

* APPEND_KEYWORD: Official Board
