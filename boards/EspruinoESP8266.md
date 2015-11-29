<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Espruino on ESP8266 WiFi
=====================

* KEYWORDS: ESP8266,ESP-12,ESP12,ESP01,ESP1,ESP-01,Espruino,Board,PCB,Pinout

**Note:** *This page documents running the Espruino firmware on the ESP8266 board.
To find out how to connect an ESP8266 board to another Espruino board (as a Wifi Adaptor)
[please see this page instead](/ESP8266)*

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
- No hardware [[SPI]], however, the software SPI works OK and it's not clear that there is any real
  benefit to the hardware SPI.
- [[PWM]] is in the works.
- No [[DAC]]: the esp8266 does not have a DAC.

Pinout
------

* APPEND_PINOUT: ESP8266_BOARD

<span style="color: red">**Note:** You need a good 3.3v regulator with a solid power supply.
If you get errors as soon as Wifi starts it's probably because the power is insufficient.
A 500-600mA regulator with at least 22uF capacitor is recommended.</span>

GPIO Pins
---------
The esp8266 GPIO pins support
[totem-pole](https://en.wikipedia.org/wiki/Push%E2%80%93pull_output#Totem-pole_push.E2.80.93pull_output_stages) and
[open-drain outputs](https://en.wikipedia.org/wiki/Open_collector),
and they support a weak internal
[pull-up resistor](https://en.wikipedia.org/wiki/Pull-up_resistor) (in the 20KOhm-50KOhm range).
The Espruino D0 through D15 pins map directory to GPIO0 through GPIO15 on
the esp8266. Remember that GPIO6 through GPIO11 are used for the external
flash chip and are therefore not really available. Also, GPIO0 and GPIO2
must be pulled-up at boot and GPIO15 must be pulled-down at boot.

The esp8266 ADC function is available on any pin
(D0-D15) but really uses a separate pin on the esp8266 (this should
be changed to an A0 pin).

GPIO16 is not currently supported in Espruino, it is not a normal GPIO
pin but rather is attached to the real-time-clock circuitry.

I2C Implementation
------------------
The I2C interface is implemented in software because the esp8266 does
not have hardware support for I2C (contrary to what the datasheet seems
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

System time
-----------
The esp8266 has two notions of system time implemented in the SDK by
`system_get_time()` and `system_get_rtc_time()`. The former has 1µs
granularity and comes off the CPU cycle counter, the latter has approx
57µs granularity and comes off the RTC clock. Both are
32-bit counters and thus need some form of roll-over handling in software
to produce a JsSysTime.

While the RTC clock may look attractive, it is not clear that it really is.
The RTC runs off an internal RC oscillator or something similar and the SDK
provides functions to calibrate it WRT the crystal oscillator. It does not
run off a 32khz crystal like a proper RTC. In addition, due to some smart
engineering a reset of the esp8266 chip resets the RTC, thus, even during
deep sleep, where the RTC wakes up the processor, the RTC counter is lost.
The conclusion is that it's about as close to worthless as it gets...

The implementation uses the system timer for `jshGetSystemTime()` and
related functions and uses the rtc timer only at start-up to initialize
the system timer to the best guess available for the current date-time.

From a JavaScript perspective, we can get and set the system time using
the JS functions called `getTime()` and `setTime()`.  These get and take
a time in seconds (float).

Flash map and access
--------------------
Note: if you are looking for a free flash area to use, call `ESP8266.getFreeFlash`,
which will return a list of available areas (see docs).

The esp8266 modules come with varying flash chip
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
on word (4-byte) boundaries, it cannot be written using the memory map.
- Every flash layout has a 16KB "system param" area in which the
SDK stores settings, including RF parameters and wifi settings
- The Espruino firmware uses over 400KB, which is far more than fits into
an OTA-capable flash layout on modules that have only 512KB of flash.
Therefore Over-The-Air upgrades of the Espruino firmware cannot be supported
on these modules.

In order to produce a single flash image for all esp8266 modules some
trickery has been used. The key concepts are:
- All modules use the OTA firmware format with a second-stage bootloader
and the two binary images allowing for upgrades (these are called user1.bin
and user2.bin by Espressif).
- On modules with 1MB of flash or more the standard OTA flash layout is used
with two 512KB application partitions. On modules with more than 1MB of flash,
the flash beyond 1MB can be used for a forthcoming spiffs filesystem.
- On modules with 512KB of flash, a somewhat tricked layout is used. The SDK
is told to use an OTA layout with two 256KB firmwares but in fact a single 400KB+
firmware is loaded and care is used not to conflict with the 2x256KB layout.

The result of all this is the following: 

Start    | Start  | Length | Function
--------:|-------:|-------:|:----------------------------------------
0x000000 |      0 |    4KB | Bootloader with flash type/size header
0x001000 |    4KB |  472KB | Espruino firmware, first partition
0x077000 |  476KB |    4KB | EEPROM emulation
0x078000 |  480KB |   12KB | Espruino save() area
0x07B000 |  492KB |    4KB | Espruino system and wifi settings
0x07C000 |  496KB |   16KB | 512KB flash: Espressif SDK system params, else unused
0x080000 |  512KB |    4KB | Unused
0x081000 |  516KB |  472KB | Espruino firmware, second partition
0x0F7000 |  988KB |    4KB | Unused
0x0F8000 |  992KB |   16KB | Unused
0x0FC000 |  996KB |   16KB | 1MB flash: Espressif SDK system params, else unused
0x100000 |    1MB |        | approx 1MB-3MB flash for SPIFFS on 2MB-4MB modules
0x1FC000 | 2032KB |   16KB | 2MB flash: Espressif SDK system params, else unused/SPIFFS
0x3FC000 | 4080KB |   16KB | 4MB flash: Espressif SDK system params, else unused/SPIFFS

The Espressif SDK system params area is composed of:

Offset   | Size   | Function
--------:|-------:|:---------
0x0000   |    4KB | RF parameter values (default in esp_init_data_default.bin)
0x1000   |    4KB | ?
0x2000   |    4KB | Wifi and other system parameters (clear using blank.bin)
0x3000   |    4KB | ?

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
Espruino can be loaded into the esp8266 using any of the flashing techniques applicable
to the esp8266 itself.  A variety of tools are available to assist with this.

The Espruino ESP8266 firmware is still under heavy development, and is not yet distributed
alongside all the other firmwares on the Espruino Website.
Instead, you should pick up the latest builds from
[Espruino Builds on GitHub](https://github.com/espruino/EspruinoBuilds)

Further reading
---------------
The esp8266 has its own [community](http://www.esp8266.com/), free books, videos and more.
For esp8266 questions not related to Espruino, it is recommended to research using those resources.
