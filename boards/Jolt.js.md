<!--- Copyright (c) 2024 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Jolt.js
=======

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Jolt.js. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Espruino,Official Board,Jolt,Joltjs,Jolt.js,nRF52840,nRF52,Nordic,Board,PCB,Pinout,Bluetooth,BLE,Bluetooth LE,Motor driver,driver,h-bridge,hbridge,stepper

![Jolt.js](Joltjs/board.jpg)

**Jolt.js is a programmable Bluetooth motor driver board**


**Just got your Jolt.js? [Take a look here!](/Quick+Start+BLE#joltjs)**

Contents
--------

* APPEND_TOC

Features
--------

* Bluetooth Low Energy
* Espruino JavaScript interpreter pre-installed
* nRF528402 SoC - 64MHz ARM Cortex M4, 256kB RAM, 1MB Flash
* 8x high power 1A H-bridge outputs on screw terminal block
* 4x Qwiic/Stemma connectors (2x analog capable with 500mA FET, 2x with 4x GPIO)
* 2.7v to 18v input range
* USB-C with USB Serial support
* 1x 3mm mounting hole
* 1x Button
* PCB Dimensions: 37.2mm x 36mm


<a name="powering"></a>Powering Jolt.js
---------------------------------

Jolt.js can be powered in multiple ways:

* **USB-C** - USB-C can power your Jolt.js from 5v, with a 1A self-resettable fuse (via a diode)
  * This can be disabled by cutting the `USB +` solder jumper on the rear of Jolt.js
* **LiPo battery** - You can plug a single cell (3.7v) LiPo battery into the JST PH connector on the board. It will power the board via a diode, and will be charged with a LiPo charge circuit (at 80mA) when USB power is applied (at this point Jolt.js will be powered via USB)
  * You can short the `LiPo +` solder jumper to short the diode and avoid the associated voltage drop. **Once done you can't then use USB unless you cut `USB+`** as it will apply USB voltage across the battery
  * You can cut the `LiPo Chg` solder jumper to disable the LiPo charge circuit, which allows you to use non-LiPo (or multi-LiPo) batteries up to 18v
* **Terminal Block** - you can attach 2.7 -> 18v directly to the screw terminals on Jolt.js

Power Consumption
-----------------

All power figures below are with the LCD on:

* No advertising - 0.004mA
* Advertising - 0.06mA
* Connected via BLE - 0.8mA
* Connected via BLE (1 min inactivity, or `NRF.setConnectionInterval(200)`)- 0.05mA
* 1x Motor driver on - 2.7mA
* 2x Motor drivers on - 5.4mA
* 100% CPU usage running JavaScript
* Using `NRF.findDevices` to scan for devices - 12mA


Resetting Jolt.js
-----------------

Occasionally you may want to hard-reset Jolt.js. To do this you just need to power cycle the board (or you can call `E.reboot()` from JavaScript)

Resetting Jolt.js this way will not clear out any saved code - see [Hard Reset](#hard-reset) below.


Hard Reset
----------

To clear out all saved code, reset Jolt.js while keeping the button held for around 10 seconds (even while Jolt.js's green LED is active).

Once Jolt.js has stopped flashing LEDs you can release it - this will clear out any previously saved code and bonding data that could have caused problems.

**Note:** If you release the button when all 3 LEDs are lit (eg the LED is white) then a self-test will be performed. Saved code will not be loaded from flash, *but will not be erased from flash either* - a subsequent reset will start Espruino up loading the saved code as normal.


Tutorials
--------

First, it's best to check out the [Getting Started Guide](/Quick+Start+BLE#joltjs)

There is more information below about using the motor driver and Qwiic connectors.

Tutorials using Jolt.js:

* APPEND_USES: Jolt.js

Tutorials using Bluetooth LE:

* APPEND_USES: Only BLE,-Jolt.js

Tutorials using Bluetooth LE and functionality that may not be part of Pixl.js:

* APPEND_USES: BLE,-Only BLE,-Jolt.js

There are [many more tutorials](/Tutorials) that may not be specifically for
you device but will probably work with some tweaking. [Try searching](/Search)
to find what you want.

Pinout
--------

* APPEND_PINOUT: JOLTJS

**Note:** Jolt.js has one available I2C, SPI and USART (and infinite software SPI and I2C).
Unlike other Espruino boards, these peripherals can be used on *any* pin.

Information
-----------

![Jolt.js](Joltjs/board.jpg)

* There's an [API reference here](https://espruino.com/ReferenceJOLTJS)
* [Circuit Diagram - coming soon]()
* [Board Layout - coming soon]()

Certifications:

* Jolt.js's radio module has certifications for [FCC (USA), CE(EU), TELEC (Japan), SRRC (China), IC (Canada), NCC (Taiwan) and KC (South Korea)](/datasheets/MDBT50Q-1M.pdf)

<a name="motor"></a>Motor Drivers
----------------------------------

Jolt.js has 8 powered outputs, divided between two motor drivers (`H0/H1/H2/H3` are on driver 0,`H4/H5/H6/H7` are on driver 1);

When enabled, the motor drivers each draw around 2.7mA, so they are disabled by default (and all outputs are then open circuit).

To enable a motor driver, use [`Jolt.setDriverMode(driverNumber,mode)`](https://www.espruino.com/Reference#l_Jolt_setDriverMode), and then set the pin to the value you want. For example:

```JS
Jolt.setDriverMode(0,true); // enables H0..H3
H0.set(); // H0 now outputs a high voltage
setTimeout(function() {
  Jolt.setDriverMode(0,false); // disables H0..H3
}, 1000);
```

The argument to [`Jolt.setDriverMode`](https://www.espruino.com/Reference#l_Jolt_setDriverMode) can be one of several different values (see [the reference](https://www.espruino.com/Reference#l_Jolt_setDriverMode))
but the most useful values are `true` (enable in the default mode where all pins are pulled either high or low) or `false` (disables, making all pins open circuit).

Analog Inputs
-------------

Jolt.js has 8 analog inputs in total:

* 2 are on Qwiic connector `Q0` `SDA`/`SCL` pins
* 2 are on Qwiic connector `Q1` `SDA`/`SCL` pins
* 4 are connected via potential dividers to motor driver pins `H0`, `H2`, `H4` and `H6`. These can be used without the motor driver enabled.

<a name="qwiic"></a>Qwiic/Stemma Connectors
--------------------------------------------

Jolt.js has 4 Qwiic/Stemma compatible connectors. Each variable (`Jolt.Q0`/etc) is an [instance of the `Qwiic` class](https://www.espruino.com/Reference#Qwiic) and contains at minimum `sda` and `scl` fields
which correspond to the Qwiic pins.

You can use  `Jolt.Q0.setPower(1)` to set power on the connector (see below) or `Jolt.Q0.i2c` to directly access [an `I2C` Instance](https://www.espruino.com/Reference#I2C)

For instance if you wish to control a [[SSD1306]] OLED from the `Q0` Qwiic connector you could do:

```JS
Jolt.Q0.setPower(1);
var g = require("SSD1306").connect(Jolt.Q0.i2c, function(){
  g.drawString("Hello World!",2,2);
  g.flip();
}, { height : 16 });
```

The rear of Jolt.js is marked as follows:

| Marking | Pin |
|---------|-----|
| 0       | GND |
| +       | VCC (3.3v) |
| D       | SDA |
| C       | SCL |


### `Q0` and `Q1`

These have two GPIO connected to `sda` and `scl`, and have their power controlled by a 500mA FET which switches GND. To turn the connector on run `Jolt.Q0.setPower(1)`, or use `Jolt.Q0.fet` to directly access the pin connected to the FET.

The `sda` and `scl` pins on these ports are also analog inputs - use `analogRead(Jolt.Q0.sda)`/etc

### `Q2` and `Q3`

All 4 pins are connected to Jolt.js's GPIO (including those usually used for power). As such only around 8mA of power can be supplied to any connected device.

`Jolt.Q2.setPower(1)` will set the GPIOs for GND and VCC such that whatever is connected to `Q2` is turned on. These contain `gnd` and `vcc` fields which reference the pins connected to GND and VCC on the Qwiic connector.



<a name="onboard"></a>On-board LED and Buttons
------------------------------------------------------

### LED

Jolt.js has 3 programmable LEDs, controllable via the `LED` or `LED1` (red), `LED2` (green) and `LED3` (blue) variables.

* `digitalWrite(LED,1)`, `LED.write(1)` or `LED.set()` turns the red LED on
* `digitalWrite(LED,0)`, `LED.write(0)` or `LED.reset()`turns the red LED off

### Buttons

There is 1 buttons on Pixl.js, accessible as `BTN` or `BTN1`.

* You can access a button's state with `digitalRead(BTN1)` or `BTN1.read()`
(the two commands are identical).
* Polling to get the button state wastes power, so it's better to use `setWatch`
to call a function whenever the button changes state:

```
setWatch(function() {
  console.log("Pressed");
}, BTN, {edge:"rising", debounce:50, repeat:true});
```

### NFC - Near Field Communications

**Note:** as of the current 2v21 firmware build, NFC functionality is not enabled in software.

NFC is available on Jolt.js, however it requires you to wire up an antenna, and to solder
tuning capacitors to the two capacitor pads on the rear of the board next to the screw hole
such that the antenna resonates at 13.56 MHz.

Once connected, NFC can be configured with [NRF.nfcURL(...)](/Reference#l_NRF_nfcURL)


Firmware Updates
-----------------

Please see the [Firmware Update](/Firmware+Update#nrf52) page for detailed instructions.


Troubleshooting
---------------

For more answers please check out the [Bluetooth Troubleshooting](Troubleshooting+BLE) or [General Troubleshooting](/Troubleshooting) pages.



Other Official Espruino Boards
------------------------------

* APPEND_KEYWORD: Official Board
