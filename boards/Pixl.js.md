<!--- Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Pixl.js
=======

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Pixl.js. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Espruino,Official Board,Pixl,Pixljs,Pixl.js,nRF52832,nRF52,Nordic,Board,PCB,Pinout,Bluetooth,BLE,Bluetooth LE,Graphics

![Pixl.js](Pixl.js/board.jpg)

* BUYFROM: £36,£25.92,https://shop.espruino.com/pixljs,/Order#pixljs

A smart LCD with Bluetooth LE. Monitor and control other Bluetooth LE devices,
act as a wireless display, create your own smart conference badge, or even
just display the status of your code - all while drawing tiny amounts of
power.

Pixl.js's unique design allows you to use the Arduino footprint to interface
with the huge array of existing Arduino shields, while still using the LCD
and buttons. Add Ethernet, WiFi, Motor drivers, even GSM. No soldering required!

Contents
--------

* APPEND_TOC

Features
--------

* Bluetooth Low Energy
* Espruino JavaScript interpreter pre-installed
* nRF52832 SoC - 64MHz ARM Cortex M4, 64kB RAM, 512kB Flash
* 54mm diagonal, 128 x 64 Sunlight readable monochrome display with white backlight
* 20x GPIO in Arduino footprint (capable of PWM, SPI, I2C, UART, Analog Input)
* Support for GSM, LTE, WiFi and Ethernet Arduino shields
* 2.5v to 16v input range (0.3mA idle)
* CR2032 battery holder, or Micro USB (power only)
* 4x 3mm mounting holes
* 4x Buttons
* Built in thermometer and battery level sensors
* NFC tag programmable from JavaScript
* Dimensions: 60mm x 53mm x 15mm (2.4 x 2.1 x 0.6 inches)


<a name="powering"></a>Powering Pixl.js
------------------

Pixl.js can be powered in multiple ways:

* **Micro USB** - the Micro USB connector can easily provide power to your Pixl.js (there is no data connection)
* **CR2032 Lithium battery** - a CR2032 battery will power Pixl.js for around 20 days with light JavaScript usage
* **`Vin` pins** - available via the Arduino header, or the separate pin header to the side. You can supply 3v - 16v which is regulated down to 3.3v for Pixl.js. The unpopulated pins to the side are spaces to accommodate a connector for [JST PHR-2 Batteries](/Battery).
* **CR2032 LiPo battery** - you can not use a CR2032 LiPo battery without some minor modifications as the voltage is too high. There is a small solder jumper below the CR2032 holder. Cut the existing connection and solder between the other two pads. This causes the battery to be connected via the voltage regulator. **Note:** the LiPo will then be connected directly to Vin, and you will be unable to use the USB for power (as it'll connect to LiPo to 5v).
* **CR2032 battery backup** - the CR2032 can be used as a backup when Vin/USB power is not present. Cut the trace in the solder jumper below the CR2032 holder, and add a surface mount diode to the two pads to the right of it.

### `Vin` pins

As mentioned above you can solder a JS connector (part number `B2B-PH-K-S` to Pixl.js):

![JST pins on Pixl.js](Pixl.js/jst.jpg)

**Note:** This connects stright to the `Vin` pins, so you should use USB
*or* CR2032 *or* the JST connector, but not more than one at the same time!


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


Resetting Pixl.js
-----------------

Occasionally you may want to hard-reset Pixl.js. To do this:

* **With a CR2032 Battery** - Remove and replace the battery. It helps to remove the battery by pushing it out from behind using something thin like a matchstick. If you intend to reset Pixl.js multiple times you can only half-insert the battery to make it easier to remove.
* **On USB Power** - disconnect and re-connect the USB plug

For short (1 second) periods of time you can also just short out the 3v power rail. Do to this take something metallic and touch it between the top of the CR2032 Battery/holder and the USB socket's metal outer.

Resetting Pixl.js this way will not clear out any saved code - see [Hard Reset](#hard-reset) below.


Hard Reset
----------

To clear out all saved code, reset Pixl.js while keeping `BTN1` held for around 10 seconds (even while Pixl.js says `SELF TEST` `Release BTN1`).

Once Pixl.js displays `Removed saved code from Flash` you can release it - this will clear out any previously saved code and bonding data that could have caused problems.

**Note:** If you release `BTN1` when instructed by the text `Release BTN1` then a self-test will be performed. Saved code will not be loaded from flash, *but will not be erased from flash either* - a subsequent reset will start Espruino up loading the saved code as normal.


Tutorials
--------

First, it's best to check out the [Getting Started Guide](/Quick+Start+BLE#pixljs)

There is more information below about using the [LCD](#lcd) and [onboard peripherals](#onboard) as well.

Tutorials using Pixl.js:

* APPEND_USES: Pixl.js,-Arduino Shield

Tutorials using Bluetooth LE:

* APPEND_USES: Only BLE,-Pixl.js

Tutorials using Bluetooth LE and functionality that may not be part of Pixl.js:

* APPEND_USES: BLE,-Only BLE,-Pixl.js

There are [many more tutorials](/Tutorials) that may not be specifically for
you device but will probably work with some tweaking. [Try searching](/Search)
to find what you want.

Pinout
--------

* APPEND_PINOUT: PIXLJS

Pins on the Arduino header are accessed via the built-in variables `D0`..`D13` and `A0`..`A5`.

**Note:** Pixl.js has one available I2C, SPI and USART (and infinite software SPI and I2C).
Unlike other Espruino boards, these peripherals can be used on *any* pin.


<a name="arduino"></a>Arduino Shields
---------------

Pixl.js is a 3.3v device, and is only designed for 3.3v shields.

### Shield power

If you find that your shield isn't powered, it may be because the `5v` pin on
the Arduino shield isn't connected. There is a solder jumper near the LCD
connector labelled `3.3 5V Vin`, and you can apply solder to:

* **short 3.3 to 5v** - the 5v pin will be connected to regulated 3.3v power (note: max power draw is 150mA)
* **short Vin to 5v** - the 5v pin will be connected to 5v (when connected via USB) or whatever the voltage provided on Vin is

**Do not short all 3 pins of the solder jumper together!** This will connect `3.3v` to `Vin`, which will power your Pixl's processor (and the LCD) directly from `Vin`, which is likely to be a high enough voltage that it will permanently damage it.

### Shields

Here are some of the [Arduino shields](Arduino) that we have tested and documented:

* APPEND_KEYWORD: Arduino Shield

Information
-----------

![Pixl.js](Pixl.js/back.jpg)

* [Circuit Diagram](https://github.com/espruino/EspruinoBoard/blob/master/Pixl.js/pdf/pixljs_sch.pdf)
* [Board Layout](https://github.com/espruino/EspruinoBoard/blob/master/Pixl.js/pdf/pixljs_brd.pdf)
* [Eagle CAD files](https://github.com/espruino/EspruinoBoard/tree/master/Pixl.js/eagle)
* [nRF52832 Datasheet](/datasheets/nRF52832_PS_v1.0.pdf)
* [MDBT42 Datasheet](/datasheets/MDBT42Q-E.pdf)
* [3D model of Pixl.js in STL](https://github.com/espruino/EspruinoBoard/blob/master/Pixl.js/other/pixljs.stl) or [OpenSCAD](https://github.com/espruino/EspruinoBoard/blob/master/Pixl.js/other/pixljs.scad)
* [SVG Vector drawing of Pixl.js with laser-cut case](https://github.com/espruino/EspruinoBoard/blob/master/Pixl.js/other/pixljs.svg)

<a name="onboard"></a>LCD Screen
--------------------------------

Pixl.js's displays the REPL (JavaScript console) by
default, so any calls like `print("Hello")` or `console.log("World")` will output
to the LCD when there is no computer connected via Bluetooth or [Serial](#serial-console).
Any errors generated when there is no connection will also be displayed on the LCD.

You can also output graphics on Pixl.js's display via the global variable `g`
that is an instance of the [Graphics class](/Reference#Graphics). The display
is double-buffered, so when you want the changes you made to be displayed
you need to call `g.flip()`:

```
// Draw a pattern with lines
g.clear();
for (i=0;i<64;i+=7.9) g.drawLine(0,i,i,63);
g.drawString("Hello World",30,30);
// Update the display when done
g.flip();
```

### Screen updates

`g.flip()` only updates the area of the screen that has been
modified by `Graphics` commands. If you're modifying the underlying buffer
(`g.buffer`) then use `g.flip(true)` to update the entire screen contents.

### Contrast

You can change the LCD screen's contrast with `Pixl.setContrast(0.5)` with
a number between 0 and 1.

You can also write single byte commands to the ST7567 LCD controller using
the `Pixl.lcdw(...)` command if you want to experiment with different LCD modes.

### Terminal

Pixl.js's LCD acts as a VT100 Terminal. To write text to the LCD regardless of
connection state you can use `Terminal.println("your text")`. Scrolling
and simple VT100 control characters will be honoured.

You can even move the JavaScript console (REPL) to the LCD while connected
via Bluetooth, and use your bluetooth connection as a simple keyboard using
the following commands:

```
Bluetooth.on("data",d=>Terminal.inject(d));
Terminal.setConsole();
```


<a name="onboard"></a>On-board LED, Buttons and GPIO
------------------------------------------------------

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

Firmware Updates
-----------------

### via nRF Toolbox App (iOS & Android)

* On your Bluetooth LE capable phone, install the `nRF Toolbox` app
* Download the latest `espruino_xxx_pixljs.zip` file from [the Download page](/Download#pixljs)
* [Reset Pixl.js](#resetting-pixl-js) with `BTN1` held down. The display will show `BOOTLOADER` `RELEASE BTN1 FOR DFU`. Make sure release `BTN1` before the progress bar reaches the end.
* The display should now show `DFU STARTED` `READY TO UPDATE`
* Open the `nRF Toolbox` app
* Tap the `DFU` icon
* Tap `Select File`, choose `Distribution Packet (ZIP)`, and choose the ZIP file you downloaded
* If choosing the ZIP file opens the ZIP and displays files inside (it can do on some Android 7 devices) then hit back, long-press on the ZIP, and choose `Open` in the top right.
* If a `Select scope` window appears, choose `All`
* Tap `Select Device` and choose the device called `DfuTarg`
* Now tap `Upload` and wait. Pixl.js's LCD should show a connection and the DFU process will start - it will take around 90 seconds to complete
* If you have problems after completion, perform a [Hard Reset](#hard-reset)

### via nRF Connect App (Android)

* On your Bluetooth LE capable phone, install the `nRF Connect` app
* Download the latest `espruino_xxx_pixljs.zip` file from [the Download page](/Download#pixljs)
* [Reset Pixl.js](#resetting-pixl-js) with `BTN1` held down. The display will show `BOOTLOADER` `RELEASE BTN1 FOR DFU`. Make sure release `BTN1` before the progress bar reaches the end.
* The display should now show `DFU STARTED` `READY TO UPDATE`
* Open the `nRF Connect` app
* It should show some Bluetooth devices, including one called `DfuTarg`
* Click `Connect` to the right of `DfuTarg`
* Once connected, a `DFU` symbol in a circle will appear in the top right of the App
* Click it, choose `Distribution Packet (ZIP)`, and your Download. If clicking on the downloaded zip file opens its contents (Android 7 may do this) then long-press on the zip and tap open instead.
* The DFU process will start - it will take around 90 seconds to complete
* If you have problems after completion, perform a [Hard Reset](#hard-reset)


Troubleshooting
---------------

Please check out the [Bluetooth Troubleshooting](Troubleshooting+BLE) or [General Troubleshooting](/Troubleshooting) pages.


Other Official Espruino Boards
------------------------------

* APPEND_KEYWORD: Official Board
