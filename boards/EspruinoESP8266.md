<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Espruino on ESP8266 WiFi
========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/EspruinoESP8266. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: ESP8266,ESP-12,ESP12,ESP01,ESP1,ESP-01,Espruino,Board,PCB,Pinout,Internet,WiFi,Wireless,Radio

**Note:** *This page documents running the Espruino firmware on the ESP8266 board.
To find out how to connect an ESP8266 board to another Espruino board (as a Wifi Adaptor)
[please see this page instead](/ESP8266)*

**Warning:** Espruino on the ESP8266 defaults to 115200 baud on its serial interface. This means you
will need to adjust this setting in the IDE if you use that. (Other Espruino ports default to 9600 baud.)

Contents
--------

* APPEND_TOC

Quick links
-----------

* [Download the latest ESP8266 firmware release](http://www.espruino.com/Download)
* [Download 'cutting edge' ESP8266 firmwares](http://www.espruino.com/binaries/travis/master/) - these may not always work
* [Tutorial on flashing the esp8266](ESP8266_Flashing)<a name="firmware-updates"></a>
* [Espruino ESP8266 Forum](http://forum.espruino.com/microcosms/925/)
* [Using Wifi on the ESP8266](ESP8266_WifiUsage)
* [Gitter chat about Espruino](https://gitter.im/espruino/Espruino) (not focused on esp8266 but
lots of esp8266 chatter)

Features
-------

* 24mm x 16mm
* 17 GPIO pins (11 usable): 1 serial, 1 SPI, 1 I2C
* 1 Analog input (0..1V)
* None of the GPIO are 5 volt tolerant!
* Built-in Wifi
* 1600 JS variables

Build Content
-------------

content | espruino_1v98_esp8266 | espruino_1v98_esp8266_4mb
 :---  | :--- | :---
Modules | NET<br>TELNET<br><br>CRYPTO, only SHA1<br>NEOPIXEL | NET<br>TELNET<br>GRAPHICS<br>CRYPTO only SHA1<br>NEOPIXEL
JS variables| 1700| 1600
save pages| 4 x 4096 byte | 16 x 4096 byte
getState()| {"sdkVersion": "2.0.0(5a875ba)",<br>"cpuFrequency": 160, "freeHeap": 10560, "maxCon": 10,<br>"flashMap": "512KB:256/256",<br>"flashKB": 512,<br>"flashChip": "0xXX 0x4013"}|{"sdkVersion": "2.0.0(5a875ba)",<br>"cpuFrequency": 160, "freeHeap": 11888, "maxCon": 10,<br>"flashMap": "4MB:1024/1024",<br>"flashKB": 4096,<br>"flashChip": "0xXX 0x4016"}|
getFreeFlash()| n/a <br> use 'Storage' module to save data|[{ "addr": 2097152, "length": 1048576 },<br>{ "addr": 3145728, "length": 262144 },<br>{ "addr": 3407872, "length": 262144},<br>{ "addr": 3670016, "length": 262144 },<br>{ "addr": 3932160, "length": 262144 }]
chip_id and flash_size|4013-4015 use<br>--flash_size 512KB<br>|4016-4018 use<br>--flash_size 4MB-c1
max image size| 468 KB|812 KB

Limitations
-----------
The following features are only partially or not supported by Espruino on the ESP8266:

- No hardware [[I2C]], however, the software I2C works OK.
- [[PWM]] does not work, low speed software [[PWM]] is usable
- No [[DAC]]: the esp8266 does not have a DAC.
- No independently usable serial port (needs Espruino work)
- **GPIO16 is now supported in Espruino as a D16 without watch but with all software functiontions like PWM/I2C/SPI/etc**

The main limitations of Espruino on the esp8266 come from two factors:
- The esp8266 does not have rich I/O peripheral interfaces, this means protocols need to be run in software, which not only may
  be slower but keeps the CPU busy and not attending to other things. As a result, the esp8266 just cannot drive as man peripherals
  as a good ARM processor.
- The esp8266 uses FreeRTOS with non-preemptible tasks and has extremely limited code space for interrupt handlers, as a result,
  it is not possible to handle certain peripherals at interrupt time and a task has to be scheduled instead, which would be OK
  if tasks were pre-emptible, but they are not. This means that functions like digitalPulse have to use busy-waiting between
  edge transitions instead of being interrupt driven.

In general the above limitations can be overcome by writing C code and loading it into a custom Espruino build.
The current state of the esp8266 Espruino port could also certainly be improved and contributions are always appreciated!

Pinout
------

* APPEND_PINOUT: ESP8266_BOARD

<span style="color: red">**Note:** You need a good 3.3v regulator with a solid power supply.
If you get errors as soon as Wifi starts it's probably because the power is insufficient.
A 500-600mA regulator with at least 22uF capacitor is recommended.</span>

WiFi
----

The ESP8266's Wifi implementation supports both a simple access point mode and a station mode.
The station mode is highly recommended for normal operation as the access point mode is very
limited. It supports 4 stations max and offers no routing between stations.

The default initial configuration is for an access point with an SSID like `ESP_123ABC` to show
up.

Using the wifi is documented in the [Wifi library reference](http://www.espruino.com/Reference#Wifi).
The "getting started" is:
```
var wifi = require("Wifi");
wifi.connect(ssid, {password:password}, function(e) {
  if (e) {
    console.log('error during connect:',e);
    wifi.disconnect();
  } else {
    console.log('connected to',ssid);
    wifi.stopAP();
    //wifi.save();
  }
});
```
You may want to add `wifi.setHostname("espruino")`.
Once you're happy with your connection, you can use `wifi.save()` to persist it, so you don't have
to reconnect each time you reset your ESP8266.

Please see the [Using the ESP8266 with Wifi](ESP8266_WifiUsage) tutorial for the recommended
way to use the esp8266 with Wifi.

To make HTTP requests, use the [HTTP library](http://www.espruino.com/Reference#http).
Code for a simple get request can be found in the docs for the `get()` method.

In terms of power consumption, the esp8266 uses about 60mA minimum when in AP mode, with power
spikes in the 100-300mA range when transmitting. When in station mode and the station supports
power save (often visible as a "DTIM period" setting in the access point) then the esp8266
will bounce between ~15mA and ~60mA most of the time when not transmitting, if power-save is
enabled (see Wifi library), otherwise it will stay at ~70mA. If the Wifi is turned
off it will consume around 15mA. Lower power modes (e.g. sleeping) is not currently supported
in the Espruino port.

Beware that TCP connections can require a lot of memory for buffers, thus "your mileage may vary"
if you use many connections and/or receive a lot of data. The memory for these buffers comes out
of the heap using malloc, they are separate from the memory used by JavaScript. Thus you can
run out of JavaScript memory (Espruino prints "Out of memory!") and you can run out of heap
memory (the system tends to crash in those situations).

In order to reduce memory requirements,
Espruino uses LwIP configured with a MSS of 536, this means that all TCP packets can have at most
536 bytes of payload as opposed to the typical 1460 bytes. On the transmission end, LwIP seems
to allow for 3 packets to be in-flight (it has to keep data that is sent until it receives an
acknowledgment from the receiver). On the reception end, it advertises a TCP window of 4 times
the MSS, i.e. 2144 bytes, and Espruino tells LwIP to stop incoming data when it has two unconsumed
buffers. The net result is that up to 6\*536 = 3216 bytes may arrive and need to be buffered on
a connection. If multiple connections are active these buffer requirements can add up quickly!

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

GPIO16 is now supported in Espruino. **Do not use it if you use deep sleep**

### digitalPulse implementation

The `digitalPulse` function is implemented by busy-waiting between pulse transitions (unlike on other Espruino
boards where `digitalPulse` is asynchronous).

This means that if you specify a series of 10 500us pulses the esp8266 will busy-wait for 5ms in order to toggle
the output pin at the right moment. Other than the fact that your program will not do anything else during this
time, this also prevents Wifi processing and empirically, somewhere after 10ms-50ms
the watchdog timeout will kick in and reset the chip.

**Note:** This also means that `digitalPulse(D0,1,10);digitalPulse(D0,0,10);digitalPulse(D0,1,10);` will *not*
produce 10ms pulses, because the time taken to execute the JS code for the function calls will increase the
pulse length. Instead, you need to do `digitalPulse(D0,1,[10,10,10])`.

### setWatch implementation

The setWatch implementation uses interrupts to capture incoming pulse edges and queues them. The queue can hold 16 elements, so
setWatch will lose transitions if javascript code does not run promptly.

### analogRead implementation

The esp8266 ADC function is available on pin A0 or without a pin.
Using a digital pin will return NaN

Possible ways to call ananlogRead() and the returns:

```
analogRead(A0);
=0.0029296875

analogRead();
=0.0029296875

analogRead(D0);
=NaN

```


I2C Implementation
------------------

The I2C interface is implemented in software because the esp8266 does
not have hardware support for I2C (contrary to what the datasheet seems
to imply). The software implementation has the following limitations:
- operates at approx 300Khz
- is master-only
- support clock stretching since 1v92 (a method by which slaves can slow down the master)

The I2C interface can be bound to almost any pin pair, but you
should avoid GPIO15 because it needs to be pulled-down at boot time
and the I2C bus needs pull-up resistors. The pins chosen for I2C are
configured to be open-drain outputs and an external pull-up resistor
is required on each of the two pins. Remember that esp8266 pins are
not 5v compatible!

SPI Implementation
------------------

Both the software SPI and hardware SPI implementations can be used. The software SPI works on
any GPIO pins but operates at a fixed clock rate of about 1Mhz. The hardware SPI operates on
baud rates as low as 100kHz and as high as 4Mhz (this is limited by the way the clock dividers
are calculated, the HW is capable of going faster, but given the software overheads around it
there is not much point to it). The hardware SPI uses the pins shown in the board layout
(CLK:D14, MISO:D12, MOSI:D13, CS:D15).

Serial port
-----------

The esp8266 has two UARTS. UART0 (`Serial1`) uses gpio1 for TX and gpio3 for RX and is used by
the Espruino JavaScript console. It can be used for other things once the Espruino console
is moved to another device. For instance calling `LoopbackA.setConsole()` will move the console
to 'loopback' (where is can be accessed using `LoopbackB`), and will free up `Serial1` for
use like any normal Espruino Serial port.

UART1 (`Serial2`) uses gpio2 for TX and RX is not totally usable due to being used for the SDIO
flash chip. UART1 TX is used for debugging and can be used for application purposes, but RX is
not available.

Serial Numbers
--------------

The esp8266 does not have a serial number. It does have two mac addresses "burned-in", which one can use for identification purposes.
`getSerial()` returns the MAC address of the STA interface.

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

Saving code to flash
--------------------

Currently 12KB of flash are reserved to save JS code to flash using the
save() function. The total JS memory is larger (22400 bytes) so if you
filled up the JSvars you will need compression to work well. Some simple
tests show that "it should fit" but it's certainly possible that some
combinations of stuff doesn't. In that case you're a bit out of luck.

If the save() area contains something that crashes Espruino or otherwise
doesn't let you reset the system you can disable whatever is saved by
flashing blank.bin to the last 4KB block of the save area (0x7A000).

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
0x001000 |    4KB |  468KB | Espruino firmware, first partition
0x076000 |  472KB |    4KB | SDK RF calibration save area on 512KB modules
0x077000 |  476KB |    4KB | EEPROM emulation
0x078000 |  480KB |   12KB | Espruino save() area
0x07B000 |  492KB |    4KB | Espruino system and wifi settings
0x07C000 |  496KB |   16KB | 512KB flash: Espressif SDK system params, else unused
0x080000 |  512KB |    4KB | SDK RF calibration save area on 1MB and larger modules
0x081000 |  516KB |  472KB | Espruino firmware, second partition
0x0F7000 |  988KB |    4KB | Unused
0x0F8000 |  992KB |   16KB | Unused
0x0FC000 |  996KB |   16KB | 1MB flash: Espressif SDK system params, else unused
0x100000 |    1MB |        | approx 1MB-3MB flash unused on 2MB-4MB modules
0x1FC000 | 2032KB |   16KB | 2MB flash: Espressif SDK system params, else unused
0x3FC000 | 4080KB |   16KB | 4MB flash: Espressif SDK system params, else unused

The Espressif SDK system params area is composed of:

Offset   | Size   | Function
--------:|-------:|:---------
0x0000   |    4KB | RF parameter values (default in esp_init_data_default.bin)
0x1000   |    4KB | ?
0x2000   |    4KB | Wifi and other system parameters (clear using blank.bin)
0x3000   |    4KB | ?

Note that the SDK RF calibration save area was added with SDK1.5.4 patch 1.
The `ESP8266` library provides a `getFreeFlash` function that returns an array of free flash areas should you want to
use the EEPROM emulation class or read/write flash directly.

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

Performance
-----------

Espruino sets the esp8266 clock to 160Mhz by default, but this can be changed back to
the default 80Mhz from JavaScript using `require("ESP8266").setCPUFreq(80)`.
The benefits of the lower clock frequency are assumed to be lower power consumption
by the CPU and operation at lower voltages, but this has not been confirmed!

The table below shows some measurements taken using an esp-12 module on the mandelbrot and
qsort_4 benchmarks in the benchmarks directory and on some code that displays lots of characters
on a HD44780 display attached via an MCP23008 which involves a lot of I2C operations. In the table
`-Os` refers to the gcc compiler optimization level and `AI` refers to enabling the
Espruino ALWAYS_INLINE compiler attribute, which tries to guide which functions to inline, and
`NR` refers to a non-release build with asserts left in.
The conclusion is that builds with just -Os and 160Mhz clock frequency are the best.

Settings        | Mandelbrot | Quicksort | Display | Code Size
----------------|-----------:|----------:|--------:|-------:
-Os, 80Mhz      | 70ms       | 365ms     | 623ms   | 440KB
-Os, 160Mhz     | 38ms       | 191ms     | 354ms   |
-Os, 80Mhz, AI  | 74ms       | 469ms     | 693ms   | 477KB
-Os, 160Mhz, AI | 47ms       | 319ms     | 463ms   |
-O1, 80Mhz, AI  | 66ms       | 393ms     | 681ms   | 486KB
-O1, 160Mhz     | 39ms       | 241ms     | 444ms   |
-Os, 80Mhz, NR  | 90ms       | 494ms     | 886ms   | 454KB
-Os, 160Mhz, NR | 52ms       | 293ms     | 568ms   |

Loading Espruino
----------------

Espruino can be loaded into the esp8266 using any of the flashing techniques applicable
to the esp8266 itself.  A variety of tools are available to assist with this.

The Espruino ESP8266 firmware [is now distributed alongside all the other firmwares on the
Espruino Website](http://www.espruino.com/Download).

Power Consumption
-----------------

| Parameter | Typical | Unit |
| :-: | :-: | :-- |
| Tx 802.11b, CCK 11Mbps, Pout=+17dBm | 170 | mA |
| Tx 802.11g,OFDM 54Mbps,Pout=+15dBm | 140 | mA |
| Tx 802.11n, MCS7, Pout=+13dBm | 120 | mA |
| Rx 802.11b, 1024 bytes packet length, -80dBm | 50 | mA |
| Rx 802.11g, 1024 bytes packet length, -70dBm | 56 | mA |
| Rx 802.11n, 1024 bytes packet length, -65dBm | 56 | mA |
| Modem-Sleep | 15 | mA |
| Light-Sleep | 0.5 | mA |
| Power save mode DTIM 1 | 1.2 | mA |
| Power save mode DTIM 3 | 0.9 | mA |
| Deep-Sleep | 10 | uA |
| Power OFF | 0.5 | uA |

Currently ESP8266 can support three low power modes: Light Sleep, Modem Sleep and Deep Sleep.

Modem-Sleep requires the CPU to be working, as in PWM or I2S applications. According to 802.11 standards (like U-APSD), it saves power to shut down the Wi-Fi Modem circuit while maintaining a Wi-Fi connection with no data transmission.

During Light-Sleep, the CPU may be suspended in applications like Wi-Fi switch. Without data transmission, the Wi-Fi Modem circuit can be turned off and CPU suspended to save power according to the 802.11 standard (U-APSD).

Deep-Sleep does not require Wi-Fi connection to be maintained. For application with long time lags between data transmission, e.g. a temperature sensor that checks the temperature every 100s.
E.g. sleep 300s and waking up to connect to the AP (taking about 0.3~1s), the overall average current is less than 1mA.

Source: http://bbs.espressif.com/viewtopic.php?t=133

Open Issues
-----------

The authoritative list of open issues is
[on github](https://github.com/espruino/Espruino/issues?q=is%3Aopen+is%3Aissue+label%3AESP8266).
Some of the top-level issues at the time of writing are:
- Support sleep mode
- Provide more memory (either more JSvars, or store code in flash)

Further reading
---------------

The esp8266 has its own [community](http://www.esp8266.com/), free books, videos and more.
For esp8266 questions not related to Espruino, it is recommended to research using those resources.

Official Espruino Boards
-------------------------

* APPEND_KEYWORD: Official Board
