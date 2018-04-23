<!--- Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Pixl.js
=======

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Pixl.js. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Espruino,Pixl,Pixljs,Pixl.js,nRF52832,nRF52,Nordic,Board,PCB,Pinout,Bluetooth,BLE,Bluetooth LE,Graphics

![Pixl.js](Pixl.js/board.jpg)

Features
--------

* Bluetooth Low Energy
* Espruino JavaScript interpreter pre-installed
* nRF52832 SoC - 64MHz ARM Cortex M4, 64kB RAM, 512kB Flash
* 54mm diagonal, 128 x 64 Sunlight readable monochrome display with white backlight
* 20x GPIO in Arduino footprint (capable of PWM, SPI, I2C, UART, Analog Input)
* Support for GSM, LTE, WiFi and Ethernet Arduino shields
* 3v to 16v input range
* CR2032 battery holder, or Micro USB (power only)
* 4x 3mm mounting holes
* 4x Buttons
* Built in thermometer and battery level sensors
* NFC tag programmable from JavaScript
* Dimensions: 60mm x 53mm x 15mm (2.4 x 2.1 x 0.6 inches)


<a name="buy"></a>Buying
------

You can now buy Pixl.js [from the Espruino Store](https://shop.espruino.com/pixljs)


Powering Pixl.js
------------------

Pixl.js can be powered in multiple ways:

* **Micro USB** - the Micro USB connector can easily provide power to your Pixl.js (there is no data connection)
* **CR2032 Lithium Battery** - a CR2032 battery will power Pixl.js for around 20 days with light JavaScript usage
* **`Vin` pins** - available via the Arduino header, or the separate pin header to the side. You can supply 3v - 16v which is regulated down to 3.3v for Pixl.js
* **CR2032 LiPo battery** - you can not use a CR2032 LiPo battery without some minor modifications as the voltage is too high. There is a small solder jumper below the CR2032 holder. Cut the existing connection and solder between the other two pads. This causes the battery to be connected via the voltage regulator. **Note:** the LiPo will then be connected directly to Vin, and you will be unable to use the USB for power (as it'll connect to LiPo to 5v).
* **CR2032 battery backup** - the CR2032 can be used as a backup when Vin/USB power is not present. Cut the trace in the solder jumper below the CR2032 holder, and add a surface mount diode to the two pads to the right of it.


Power Consumption
-----------------

All power figures below are with the LCD on:

* Advertising - 320uA
* Connected via BLE - 500uA
* Backlight on - 5mA
* 100% CPU usage running JavaScript - 5mA
* Backlight on, 100% CPU usage running JavaScript - 10mA
* Using NRF.findDevices to scan for devices - 12mA

This means that when running off a CR2032 battery you could expect around 20 days of battery life with light JavaScript usage and no backlight.

Pixl.js sends advertising data without ever executing JavaScript. To get the best power consumption, make sure your code executes as rarely as possible.


Tutorials
--------

First, it's best to check out the [Getting Started Guide](/Puck.js+Quick+Start)

Tutorials using Pixl.js:

* APPEND_USES: Pixl.js

Tutorials using Bluetooth LE:

* APPEND_USES: Only BLE,-Pixl.js

Tutorials using Bluetooth LE and functionality that may not be part of Pixl.js:

* APPEND_USES: BLE,-Only BLE,-Pixl.js


<a name="pinout"></a>Pinout
---------------------------

* APPEND_PINOUT: PIXLJS

Pins on the Arduino header are accessed via the built-in variables `D0`..`D13` and `A0`..`A5`.

**Note:** Pixl.js has one available I2C, SPI and USART (and infinite software SPI and I2C).
Unlike other Espruino boards, these peripherals can be used on *any* pin.


Arduino Shields
---------------

Pixl.js is a 3.3v device, and is only designed for 3.3v shields.

### Shield power

If you find that your shield isn't powered, it may be because the `5v` pin on
the Arduino shield isn't connected. There is a solder jumper near the LCD
connector labelled `3.3 5V Vin`, and you can apply solder to:

* **short 3.3 to 5v** - the 5v pin will be connected to regulated 3.3v power (note: max power draw is 150mA)
* **short Vin to 5v** - the 5v pin will be connected to 5v (when connected via USB) or whatever the voltage provided on Vin is


Information
-----------

![Pixl.js](Pixl.js/back.jpg)

* [nRF52832 Datasheet](/datasheets/nRF52832_PS_v1.0.pdf)
* [MDBT42 Datasheet](/datasheets/MDBT42Q-E.pdf)


On-board LED, Buttons and GPIO
-------------------------------

### LED

The only LED available on Pixl.js is the backlight, which is controllable via
the `LED` or `LED1` variable.

* `digitalWrite(LED,1)`, `LED.write(1)` or `LED.set()` turns the backlight on
* `digitalWrite(LED,0)`, `LED.write(0)` or `LED.reset()`turns the backlight off

### Buttons

There are 4 buttons on Pixl.js. Starting in the top left, going clockwise, they are `BTN1`, `BTN2`, `BTN3` and `BTN4`.

* You can access a button's state with `digitalRead(BTN1)` or `BTN1.read()`
(the two commands are identical). `BTN` is also defined, and is the same as `BTN1`.
* Polling to get the button state wastes power, so it's better to use `setWatch`
to call a function whenever the button changes state:

```
setWatch(function() {
  console.log("Pressed");
}, BTN, {edge:"rising", debounce:50, repeat:true});
```

### GPIO pins

GPIO pins are numbered `D0` to `D13` and `A0` to `A5` (matching the Arduino header). They are marked on the PCB (for `D0` to `D13`, the `D` is omitted).

You can use the same `digitalWrite`/`digitalRead` commands with these that you
did with the LEDs and buttons, but you can also use [[PWM]], [[I2C]], [[SPI]] and [[Analog]].


Serial Console
---------------

When power is first applied, Pixl.js checks if pin `D0` is at 3.3v (which will be the
case if it is connected to a Serial port's transmit line). If it is, it initialises
the on-chip UART on `D0` (Pixl.js RX) and `D1` (Pixl.js TX) and puts the Espruino
console (REPL) on it at 9600 baud.

To use it, connect to a 3.3v output USB to TTL converter as follows:

| Pixl.js  | USB->TTL converter |
|----------|--------------------|
| `GND`    | `GND`              |
| `D1`     | `RX` ( -> PC )     |
| `D0`     | `TX` ( <- PC )     |
| `Vin`    | `5v` (Optional - to run without a battery) |

You can now use the normal Espruino Web IDE, or a serial terminal application at 9600 baud.

When you connect via Bluetooth, the console will automatically move over. To
stop this, execute `Serial1.setConsole(true)` to force the console to stay on
`Serial1`.

**Note:** Serial1 is not enabled by default because it requires the high speed
oscillator to stay on, which increases power draw a huge amount. If you connect
the UART but don't power down and power on Pixl.js, you won't get a serial port.
