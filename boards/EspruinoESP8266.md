<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Espruino on ESP8266 WiFi
=====================

* KEYWORDS: ESP8266,ESP-12,ESP12,ESP01,ESP1,ESP-01,Espruino,Board,PCB,Pinout

**Note:** *This page documents running the Espruino firmware on the ESP8266 board. To find out how to connect an ESP8266 board to another Espruino board (as a Wifi Adaptor) [please see this page instead](/ESP8266)*

Features
-------

* 24mm x 16mm
* 17 GPIO pins (11 usable): 1 serial, 1 SPI, 1 I2C
* 1 Analog input (0..1V)
* None of the GPIO are 5 volt tolerant!
* Built-in Wifi
* 1023 JS variables

Not supported
-------------
The following features are not supported by Espruino on the ESP8266:

- No hardware [[I2C]], however, the software I2C works OK.
- No hardware [[SPI]] (implementing that is on the to-do list), the software SPI works OK.
- No [[DAC]]/[[PWM]]/analogWrite: the esp8266 does not have a DAC and the one PWM it has is very
  finnicky and its timer is used to implement the Espruino timer, which is used to create
  pulses and such.

Pinout
------

* APPEND_PINOUT: ESP8266_BOARD

<span style="color: red">**Note:** You need a good 3.3v regulator with a solid power supply.
If you get errors as soon as Wifi starts it's probably because the power is insufficient.
A 500-600mA regulator with at least 22uF capacitor is recommended.</span>

GPIO Pins
---------
The esp8266 GPIO pins support [totem-pole](https://en.wikipedia.org/wiki/Push%E2%80%93pull_output#Totem-pole_push.E2.80.93pull_output_stages) and [open-drain outputs](https://en.wikipedia.org/wiki/Open_collector), and they
support a weak internal [pull-up resistor](https://en.wikipedia.org/wiki/Pull-up_resistor) (in the 20KOhm-50KOhm range). The
Espruino D0 through D15 pins map directory to GPIO0 through GPIO15 on
the esp8266. Remember that GPIO6 through GPIO11 are used for the external
flash chip and are therefore not really available. Also, GPIO0 and GPIO2
must be pulled-up at boot and GPIO15 must be pulled-down at boot.

The current implementation does not support hardware PWM as the timers
are used elsewhere. The esp8266 ADC function is available on any pin
(D0-D15) but really uses a separate pin on the esp8266 (this should
be changed to an A0 pin).

GPIO16 is not currently supported in Espruino, it is not a normal GPIO
pin but rather is attached to the real-time-clock circuitry.

I2C Implementation
------------------
The I2C interface is implemented in software because the esp8266 does
not have hardware support for i2c (contrary to what the datasheet seems
to imply). The software implementation has the following limitations:
- operates at approx 100Khz
- is master-only
- does not support clock stretching (a method by which slaves can slow down the master)

The I2C interface can be bound to almost any pin pair, but you
should avoid GPIO15 because it needs to be pulled-down at boot time
and the I2C bus needs pull-up resistors. The pins chosen for I2C are
configured to be open-drain outputs and an external pull-up resistor
is required on each of the two pins. Remember that esp8266 pins are
not 5v compatible...

SPI Implementation
------------------

The current SPI features are also only implemented currently in software.  The ESP8266 does have
hardware SPI support but this has not been take advantage of yet.

System time
-----------
The esp8266 has two notions of system time implemented in the SDK by
`system_get_time()` and `system_get_rtc_time()`. The former has 1us
granularity and comes off the CPU cycle counter, the latter has approx
57us granularity (need to check) and comes off the RTC clock. Both are
32-bit counters and thus need some form of roll-over handling in software
to produce a JsSysTime.

It seems pretty clear from the API and the calibration concepts that the
RTC runs off an internal RC oscillator or something similar and the SDK
provides functions to calibrate it WRT the crystal oscillator.

The RTC timer is preserved when the chip goes into light sleep mode,
when it does a software restart (WDT, exception, or reset call) but it
is lost after a deep sleep or an external reset input.

The implementation uses the system timer for `jshGetSystemTime()` and
related functions and uses the rtc timer only at start-up to initialize
the system timer to the best guess available for the current date-time.

From a JavaScript perspective, we can get and set the system time using
the JS functions called `getTime()` and `setTime()`.  These get and take
a time in seconds (float).

Flash map and access
--------------------
The esp8266 modules come in a number of forms with varying flash chip
sizes. The flash layout for each size is slightly different. There are
a number of random tidbits to know about flash layout:

- There are two binary formats in use: the non-OTA and the OTA update
format. The non-OTA has no 2nd stage bootloader, starts at 0x0000 in
flash, and has two binary blobs: one for data and one for instructions (+
read-only data). The OTA format has a 2nd stage bootloader at 0x0000 and
then a single binary blob for the first firmware image at 0x1000. There
is a 2nd binary blob up after the first one to provide the two firmware
images necessary for a safe OTA update. All this is described in the
Espressif IOT SDK User Manual.
- The hardware can memory-map 1MBytes of flash, but it has to be read
on word (4-byte) boundaries, it cannot be written as far as I know
- Every memory map has a 16KB "user param" area that is reserved for
applications to store non-volatile settings and such. This is used as the
"save to flash" area in Espruino. Currently the number of variables is
set to 1023, which uses 12KB and in addition the saved data is run-length
encoded. Therefore at most 12KB of this flash area really need to be
reserved. It is not known whether there's a chance to increase the number
of variables at this point.
- Every memory maps also has a 16KB "system param" area in which the
SDK stores settings, including RF parameters and wifi settings
- Finally there is an unused 4KB area just before the 2nd firmware in the
larger memory maps, this "mirrors" the bootloader area but is not used.

Flash size | FW size | FW#1 start | FW #2 start | Save to flash | System param | SPIFFs | Free
:---------:|--------:|-----------:|------------:|--------------:|-------------:|-------:| -----:
512KB      | 480KB   | 0x000000   | N/A         | 0x78000       | 0x7C000      | N/A    | N/A
1MB        | 492KB   | 0x001000   | 0x81000     | 0x7C000       | 0xFC000      | N/A    | 0x80000 (4KB)
2MB        | 492KB   | 0x001000   | 0x81000     | 0x7C000       | 0x1FC000     | 0x100000 (1MB) | 0x80000 (4KB)
4MB        | 492KB   | 0x001000   | 0x81000     | 0x7C000       | 0x3FC000     | 0x100000 (3MB) | 0x80000 (4KB)

Main loop processing
--------------------
Espruino has the concept of a "main loop" which is executed to perform
an iteration of work.  Since the ESP8266 SDK needs control to be returned to
itself to handle wifi, the current design and implementation returns to the SDK
whenever there is no JS work to be done.

By using a task queue, the SDK is asked to invoke the Espruino main loop again as soon as
possible. When the SDK does not have anything to do this takes about 200us. Ways to
improve this are being investigated.

One important effect of this overall strategy is that running javascript code
without any iterruption will starve the SDK Wifi processing and will cause a
chip reset.

WiFi
----
The ESP8266 can only support a finite number of concurrent TCP/IP connections
when performing the role of an access point.  The Espruino implementation is
configured to constrain this to 4.

Loading Espruino
----------------

Espruino can be loaded into the esp8266 using any of the flashing techniques applicable to the esp8266 itself.  A variety of tools are available to assist with this.

The Espruino ESP8266 firmware is still under heavy development, and is not yet distributed alongside all the other firmwares on the Espruino Website. Instead, you should pick up the latest builds from [Espruino Builds on GitHub](https://github.com/espruino/EspruinoBuilds)

Further reading
---------------

The esp8266 has its own [community](http://www.esp8266.com/), free books, videos and more.  For esp8266 questions not related to Espruino, it is recommended to research using those resources.
