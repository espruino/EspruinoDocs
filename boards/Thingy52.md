<!--- Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Nordic Thingy:52
================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Thingy52. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Third Party Board,Espruino,Thingy52,Thingy,Thingy:52,nRF52832,nRF52,Nordic,Pinout,Bluetooth,BLE,Bluetooth LE
* USES: LIS2DH12,MPU9250,LPS22HB,HTS221,CCS811,BH1745

![Nordic Thingy:52](Thingy52/board.jpg)

The Nordic Thingy:52® is a compact, power-optimized, multi-sensor development kit. It is an easy-to-use development platform, designed to help you build IoT prototypes and demos, without the need to build hardware or write firmware.

Contents
--------

* APPEND_TOC

Features
--------

* 6x6 cm plastic and rubber case
* Environment Sensors (temp, humidity, pressure, air quality color and light)
* 9-axis motion sensing (accelerometer, gyroscope and compass)
* Speaker for playing pre-stored samples or tones
* Microphone
* Configurable RGB LED and button.
* Long battery life with Li-ion battery and charging via USB.

It contains the following sensors:

* [[LIS2DH12]]
* [[MPU9250]]
* [[LPS22HB]]
* [[HTS221]]
* [[CCS811]]
* [[BH1745]]

<a name="buy"></a>Buying
------

Nordic has [a list of distributors](http://www.nordicsemi.com/eng/Buy-Online?search_token=nRF6936)
on their website.

Getting Started
----------------

**Note:** Nordic Thingy devices **do not have Espruino
pre-installed**. You'll have to update the firmware yourself.

There are two options:<a name="firmware-updates"></a>

### Over the air firmware updates

This can be done with any iPhone or Android phone/tablet from the last few years,
but will take a few minutes.

**Note: After following these instructions your Thingy will *only* be able to
run Espruino** unless you buy a nRF52 DK and use that to write the original
Thingy:52 firmware back (see the second option for updating firmware).


#### If you haven't installed Espruino on the Thingy before:

If you haven't installed Espruino before, you need to change the SoftDevice on your Thingy.

* Install the `nRF Toolbox` app on your device
* Go to http://www.espruino.com/binaries and download `espruino_*_thingy52_softdevice.zip`
and `espruino_*_thingy52_app.zip` to your device.
* Pull off the Thingy:52 case
* Turn the Thingy:52 off if it was on (using the sliding switch)
* Hold down the silver button on the top of the Thingy while turning the power on.
The LED should quickly start pulsing Yellow, showing the Thingy is in bootloader mode.
* Open the `nRF Toolbox` app
* Tap the `DFU` icon
* Tap `Select File`, choose `Distribution Packet (ZIP)`, and choose the `espruino_*_thingy52_softdevice.zip` ZIP file you downloaded
* If choosing the ZIP file opens the ZIP and displays files inside (it can do on some Android 7 devices) then hit back, long-press on the ZIP, and choose `Open` in the top right.
* If a `Select scope` window appears, choose `All`
* Tap `Select Device` and choose the device called `ThingyDfu`
* Now tap `Upload` and wait. The update will take around 90 seconds to complete

Now, you need to follow the next set of instructions:

#### If you have installed Espruino on the Thingy before:

* Turn the Thingy:52 off if it was on (using the sliding switch)
* Hold down the silver button on the top of the Thingy while turning the power on.
The LED should quickly start pulsing Yellow, showing the Thingy is in bootloader mode.
* Open the `nRF Toolbox` app
* Tap the `DFU` icon
* Tap `Select File`, choose `Distribution Packet (ZIP)`, and choose the `espruino_*_thingy52_app.zip` ZIP file you downloaded
* If choosing the ZIP file opens the ZIP and displays files inside (it can do on some Android 7 devices) then hit back, long-press on the ZIP, and choose `Open` in the top right.
* If a `Select scope` window appears, choose `All`
* Tap `Select Device` and choose the device called `ThingyDfu`
* Now tap `Upload` and wait. The update will take around 90 seconds to complete
* Turn the Thingy off and back on
* If the Red LED **doesn't** blink once when you turn the Thingy back on, you need to force it to delete any saved information. Turn it off, then turn it on and then press the button as soon after as you can. This may take a few attempts as pressing too soon will cause the Thingy to enter bootloader mode (pulsing yellow).

You now have Espruino installed!


### Updates with the nRF52 DK

This has the advantage of allowing you to use 'cutting edge' Espruino builds,
and is much faster. However you will need a Nordic
[nRF52 DK](https://www.nordicsemi.com/eng/Products/Bluetooth-low-energy/nRF52-DK)
and a [2x5 pin 0.05" ribbon cable](https://www.adafruit.com/product/1675) to program
your device.

* Pull off the Thingy:52 case
* Attach the ribbon cable to the Thingy and to the `Debug Out` port on the nRF52 DK
* Plug the nRF52 DK in and turn the Thingy:52 on
* Go to http://www.espruino.com/binaries (or http://www.espruino.com/binaries/travis/master/
  for the absolute latest builds) and download the latest file named `espruino_*_thingy52.hex`
* Save it to the `JLINK` drive that should have appeared on your computer and wait for the LEDs on the nRF52 DK to stop flashing
* The red LED on the Thingy should flash to show Espruino has started. If it doesn't,
power the Thingy off and back on.

And you're ready to go! Follow the [Getting Started Guide](/Quick+Start+BLE#thingy52) for details
on getting the IDE connected wirelessly.


On-board peripherals
--------------------

On-board peripherals are exposed via the `Thingy` library:

```
// Button
BTN

// R/G/B leds
LED1/2/3  

// MOSFET outputs
MOS1/2/3/4

// External IO outputs
IOEXT0/1/2/3

// Get repeated callbacks with {x,y,z}. Call with no argument to disable
Thingy.onAcceleration = function(callback) { ... }

// Get one callback with a new {x,y,z} acceleration value
Thingy.getAcceleration = function(callback) { ... }

// Get repeated callbacks with {accel,gyro,mag} from the MPU at 10Hz. Call with no argument to disable
Thingy.onMPU = function(callback) { ... }

// Get one callback with a {accel,gyro,mag} value from the MPU
Thingy.getMPU = function(callback) { ... }

// Get repeated callbacks with {pressure,temperature}. Call with no argument to disable
Thingy.onPressure = function(callback) { ... }

// Get one callback with a new {pressure,temperature} value
Thingy.getPressure = function(callback) { ... }

// Get repeated callbacks with {humidity,temperature}. Call with no argument to disable
Thingy.onHumidity = function(callback) { ... }

// Get one callback with a new {humidity,temperature} value
Thingy.getHumidity = function(callback) { ... }

// Get repeated callbacks with air quality `{eCO2,TVOC}`. Call with no argument to disable
Thingy.onGas = function(callback) { ... }

//Get one callback with a new air quality value `{eCO2,TVOC}`. This may not be useful as the sensor takes a while to warm up and produce useful values
Thingy.getGas = function(callback) { ... }

// Get repeated callbacks with color `{r,g,b,c}`. Call with no argument to disable
Thingy.onColor = function(callback) { ... }

// Get one callback with a new color value `{r,g,b,c}`
Thingy.getColor = function(callback) { ... }

// Returns the state of the battery (immediately, or via callback) as { charging : bool, voltage : number }
Thingy.getBattery = function(callback) { ... }

// Make a simple beep noise. frequency in Hz, length in milliseconds. Both are optional.
Thingy.beep = function(freq, length) { ... }

// Play a sound, supply a string/uint8array/arraybuffer, samples per second, and a callback to use when done
// This can play up to 3 sounds at a time (assuming ~4000 samples per second)
Thingy.sound = function(waveform, pitch, callback) { ... }

// Record audio for the given number of samples, at 8192 Hz 8 bit.
// This can then be fed into Thingy.sound(waveform, 8192). RAM is scarce, so realistically 1 sec is a maximum.
Thingy.record = function(samples, callback)  { ... }
```

You can also enable the graphical editor blocks for Thingy:52 in the Web IDE
by clicking `Settings` -> `General` ->  `Graphical Editor Extensions`-> `Nordic Thingy:52`


Tutorials
--------

First, it's best to check out the [Getting Started Guide](/Quick+Start+BLE#thingy52)

Tutorials using Thingy:52:

* APPEND_USES: Thingy52

Tutorials using Bluetooth LE:

* APPEND_USES: Only BLE,-Thingy52

Tutorials using Bluetooth LE and functionality that may not be part of Thingy:52:

* APPEND_USES: BLE,-Only BLE,-Thingy52

Information
-----------

* [nRF52832 Datasheet](/datasheets/nRF52832_PS_v1.0.pdf)
* [Nordic Thingy:52 information](https://www.nordicsemi.com/eng/Products/Nordic-Thingy-52)


Serial Console
---------------

When power is first applied, the Thingy checks if pin `D3` is at 3.3v (which will be the
case if it is connected to a Serial port's transmit line). If it is, it initialises
the on-chip UART on `D3` (Thingy RX) and `D2` (Thingy TX) and puts the Espruino
console (REPL) on it at 9600 baud.

To use it, connect to a 3.3v output USB to TTL converter as follows:

| Thingy   | USB->TTL converter |
|----------|--------------------|
| GND      | GND                |
| D2       | RX ( -> PC )       |
| D3       | TX ( <- PC )       |
| 3V       | 3.3v (Optional - to run without a battery) |

You can now use the normal Espruino Web IDE, or a serial terminal application at 9600 baud.

When you connect via Bluetooth, the console will automatically move over. To
stop this, execute `Serial1.setConsole(true)` to force the console to stay on
`Serial1`.

**Note:** Serial1 is not enabled by default because it requires the high speed
oscillator to stay on, which increases power draw a huge amount. If you connect
the UART but don't power down and power on the Thingy, you won't get a serial port.


Firmware Updates
-----------------

As of writing, the Thingy:52 bootloader is signed with a private key, so
you need to write firmware using an nRF52 DK board. See the [`Getting Started`](#getting-started)
guide above.
