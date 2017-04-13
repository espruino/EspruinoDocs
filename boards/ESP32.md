Espruino on the ESP32
=====================

The [ESP32](https://espressif.com/en/products/hardware/esp32/overview) is a dual core Tensilica LX6
microcontroller with 520 KB SRAM, integrated Wifi, Bluetooth, and more.  [Espruino](https://github.com/espruino/Espruino)
is a very light weight JavaScript interpreter that runs on the ESP32, and other microcontrollers.

This documentation is intended for those who want to run JavaScript on any ESP32 microcontrollers.
It will describe how to flash the ESP32 with the latest firmware, connect to Wifi and get the
other pins going.

There are a few different boards that contain the ESP32 mincrocontroller.  These instructions below
should be generic enough for all boards, but you may have to adapt the instructions in places.

---

## Overview

### Quick links

* [Download 'cutting edge' ESP32 firmwares](http://www.espruino.com/binaries/travis/master/) - these may not always work
* [Tutorial on flashing the ESP32]()
* [Espruino ESP32 Forum](http://forum.espruino.com/microcosms/1086/) - Main support forum
* [ESP32 Forum](https://www.esp32.com)
* [Developer chat for Espruino ESP32](https://gitter.im/espruino/esp32) - Focuses on development issues.


### ESP32 Features

* 240 MHz dual core Tensilica LX6 microcontroller
* Built-in Wifi and Bluetooth (classic and BLE)
* 2.2V to 3.6V operating voltage
* 32 GPIO pins:
  - 3x UARTs, including hardware flow control
  - 3x SPI
  - 2x I2S
  - 12x ADC input channels
  - 2x DAC
  - 2x I2C
  - PWM/timer input/output available on every GPIO pin
  - Supports external SPI flash up to 16 MB
  - SD-card interface support
* Sensors: Ultra-low noise analog amplifier, Hall sensor, 10x capacitive touch interface, 32 kHz crystal oscillator


### Limitations / Work in Progress

**TODO: Need to verify these items (they have been lifted from the ESP2866 docs) and add further ones**

The following features are only partially or not supported by Espruino on the ESP32:

* No hardware [[I2C]], however, the software I2C works OK.
* [[PWM]] does not work, low speed software [[PWM]] is usable
* No [[DAC]]: the ESP32 does not have a DAC.
* No independently usable serial port (needs Espruino work)
* No Over-The-Air (OTA) firmware updates.

### Known Issues

**TODO: Add issues here that are bugs and not feature requests (as listed above)**


## Getting Started

### Flashing

If your device is not already flashed, below are the instructions.

**TODO: Flashing instructions**

### Espruino Web IDE

**TODO: Describe Espruino Web IDE**


### Other methods

#### Telnet

#### minicom / cutecom

### Running some basic JavaScript

Once you have the espruino console running you will be able run JavaScript directly
in the console.  You should see a `>` character with a flashing cursor, this
indicates that espruino is waiting for input.  If you don't see it press the enter key.

Type the following:

```JavaScript
console.log('Hello ESP32!');
```

It will output the following:
```text
Hello ESP32!
=undefined
```

You should have expected the "`Hello ESP32!`" text, but probably didn't expect
"`=undefined`".  This is normal and it indicates the result of the last operation, which in this case is the return value of `console.log`, which is always `undefined`.


### Connecting to Wifi

If your board with the ESP32 has an antenna connection point, connect your Wifi antenna.  Many
boards have an in-built antenna so this may not be required.

```JavaScript
var ssid = 'YOUR_SSID';
var password = 'YOUR_SSID_PASSWORD';

var wifi = require('Wifi');
wifi.connect(ssid, {password: password}, function() {
    console.log('Connected to Wifi.  IP address is:', wifi.getIP());
});
```

Additional commands:
 * `wifi.save()`: This will save the Wifi details such that the ESP32 will reconnect to the wifi
   after a reboot.
 * `wifi.scan((ap) => { console.log(ap) })`: List all the access points seen by the ESP32.
 * `wifi.setDHCPHostname('myESP32')`: set the hostname.

**Note:** The ESP32's Wifi implementation supports both a simple access point mode and a station mode.
The station mode is highly recommended for normal operation as the access point mode is very
limited. It supports 4 stations max and offers no routing between stations.


### Creating a basic web-server

Once you have wifi going you will be able to create a simple web server.

```JavaScript
var ssid = 'YOUR_SSID';
var password = 'YOUR_SSID_PASSWORD';

const port = 8080;
wifi.connect(ssid, {password: password}, function() {

    var http = require('http');
    http.createServer(function (req, res) {
        res.writeHead(200);
        res.end('Hello World');
    }).listen(port);

    console.log(`Web server running at ${wifi.getIP()}:${port}`)
});
```

### Bluetooth

**TODO: Describe how to get Bluetooth classic / BLE going**


## Pins

Each pin on the ESP32 maps to a variable in JavaScript.  The map below describes the pins and
how the are mapped.

**TODO: List all pins and there purpose**


## GPIO Pins

**TODO: This has been lifted from the ESP2866 docs, is it still valid??**

The ESP32 GPIO pins support
[totem-pole](https://en.wikipedia.org/wiki/Push%E2%80%93pull_output#Totem-pole_push.E2.80.93pull_output_stages) and
[open-drain outputs](https://en.wikipedia.org/wiki/Open_collector),
and they support a weak internal
[pull-up resistor](https://en.wikipedia.org/wiki/Pull-up_resistor) (in the 20KOhm-50KOhm range).
The Espruino D0 through D15 pins map directory to GPIO0 through GPIO15 on
the ESP32. Remember that GPIO6 through GPIO11 are used for the external
flash chip and are therefore not really available. Also, GPIO0 and GPIO2
must be pulled-up at boot and GPIO15 must be pulled-down at boot.

The ESP32 ADC function is available on any pin
(D0-D15) but really uses a separate pin on the ESP32 (this should
be changed to an A0 pin).

### I2C Example

**TODO: Need a simple example here**

### SPI Example

**TODO: Need a simple example here**

**TODO: The text below has been lifted from the ESP2866 docs, is it still valid??**

Both the software SPI and hardware SPI implementations can be used. The software SPI works on
any GPIO pins but operates at a fixed clock rate of about 1Mhz. The hardware SPI operates on
baud rates as low as 100kHz and as high as 4Mhz (this is limited by the way the clock dividers
are calculated, the HW is capable of going faster, but given the software overheads around it
there is not much point to it). The hardware SPI uses the pins shown in the board layout
(CLK:D14, MISO:D12, MOSI:D13, CS:D15).

### Serial port / UART Example

**TODO: Need a simple example here**

**TODO: The text below has been lifted from the ESP2866 docs, is it still valid??**

The ESP32 has two UARTS. UART0 (`Serial1`) uses gpio1 for TX and gpio3 for RX and is used by
the Espruino JavaScript console. It can be used for other things once the Espruino console
is moved to another device. For instance calling `LoopbackA.setConsole()` will move the console
to 'loopback' (where is can be accessed using `LoopbackB`), and will free up `Serial1` for
use like any normal Espruino Serial port.

UART1 (`Serial2`) uses gpio2 for TX and RX is not totally usable due to being used for the SDIO
flash chip. UART1 TX is used for debugging and can be used for application purposes, but RX is
not available.

### Digital Read / Write Example

**TODO: Need a simple example here**

### Analog Read / Write Example

**TODO: Need a simple example here**


### Unique Identifier for the ESP32

**TODO: The text below has been lifted from the ESP2866 docs, is it still valid??**

The ESP32 does not have a serial number. It does have two mac addresses "burned-in", which one can
use for identification purposes. `getSerial()` returns the MAC address of the STA interface.


### System time

**TODO: How do we set the system time?**

**FIXME: It seems setTime on the ESP32 does not work as expected**

From a JavaScript perspective, we can get and set the system time using
the JS functions called `getTime()` and `setTime()`.  These get and take
a time in seconds (float).

### digitalPulse implementation

**TODO: This has been lifted from the ESP2866 docs, is it still valid??**

The `digitalPulse` function is implemented by busy-waiting between pulse transitions (unlike on other Espruino
boards where `digitalPulse` is asynchronous).

This means that if you specify a series of 10 500us pulses the ESP32 will busy-wait for 5ms in order to toggle
the output pin at the right moment. Other than the fact that your program will not do anything else during this
time, this also prevents Wifi processing and empirically, somewhere after 10ms-50ms
the watchdog timeout will kick in and reset the chip.

**Note:** This also means that `digitalPulse(D0,1,10);digitalPulse(D0,0,10);digitalPulse(D0,1,10);` will *not*
produce 10ms pulses, because the time taken to execute the JS code for the function calls will increase the
pulse length. Instead, you need to do `digitalPulse(D0,1,[10,10,10])`.

### setWatch implementation

**TODO: This has been lifted from the ESP2866 docs, is it still valid??**

The setWatch implementation uses interrupts to capture incoming pulse edges and queues them. The queue can hold 16 elements, so
setWatch will lose transitions if javascript code does not run promptly.


---

## Detailed Instructions

**TODO: Do we really need this section or link to it under "Further reading"?**

This last section has more detailed instructions for the ESP32.

### Saving code to flash

**TODO: The text below has been lifted from the ESP2866 docs, is it still valid??**

Currently 12KB of flash are reserved to save JS code to flash using the
save() function. The total JS memory is larger (22400 bytes) so if you
filled up the JSvars you will need compression to work well. Some simple
tests show that "it should fit" but it's certainly possible that some
combinations of stuff doesn't. In that case you're a bit out of luck.

If the save() area contains something that crashes Espruino or otherwise
doesn't let you reset the system you can disable whatever is saved by
flashing blank.bin to the last 4KB block of the save area (0x7A000).


### Flash map and access

**TODO: The text below has been lifted from the ESP2866 docs, is it still valid??**

Note: if you are looking for a free flash area to use, call `ESP32.getFreeFlash`,
which will return a list of available areas (see docs).

The ESP32 modules come with varying flash chip
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

In order to produce a single flash image for all ESP32 modules some
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
The `ESP32` library provides a `getFreeFlash` function that returns an array of free flash areas should you want to
use the EEPROM emulation class or read/write flash directly.


### Further reading

**TODO: Add additional resources not already covered**.
