<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Espruino on ESP32
=================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/ESP32. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: ESP32,ESP32C3,ESP32S3,Espruino,Board,PCB,Pinout,Internet,WiFi,Wireless,Radio,Bluetooth,BLE,Bluetooth LE

**Note:** *This page documents running the Espruino firmware on the ESP32 board.

**Warning:** Espruino on the ESP32 defaults to 115200 baud on its serial interface. This means you
will need to adjust this setting in the IDE if you use that. (Other Espruino ports default to 9600 baud.)

Contents
--------

* APPEND_TOC

## Overview

The ESP32 family includes several chips with different processor architectures and peripheral capabilities. The following table compares the four targets covered by this documentation.

| Chip | Architecture |
|---|---|
| ESP32 | Xtensa LX6 (dual-core) |
| ESP32-S3 | Xtensa LX7 (dual-core) |
| ESP32-C3 | RISC-V (single-core) |
| ESP32-P4 ^[1] | RISC-V (dual-core) |

<sup>1</sup> *The ESP32-P4 implementation is planned for Q1 2027.*

This documentation is intended for those who want to run JavaScript on any ESP32 microcontrollers.
It will describe how to flash the ESP32 with the latest firmware, connect to Wifi and get the other pins going.

---

### Quick links

* [Online ESP32 Espruino Flashing tool](https://www.espruino.com/Espressif+Flash)
* [Download the latest ESP32 firmware release](https://www.espruino.com/Download)
* [Download 'cutting edge' ESP32 firmware](https://www.espruino.com/binaries/travis/master/) - these may not always work
* [Espruino ESP32 Forum](https://forum.espruino.com/microcosms/1086/) - Main support forum
* [ESP32 Forum](https://www.esp32.com)
* [Developer chat for Espruino ESP32](https://gitter.im/espruino/esp32) - Focuses on development issues.

### ESP32 Features

| Feature | ESP32 | ESP32S3 | ESP32C3 | ESP32P4 |
| :--- | :---: | :---: | :---: | :---: |
| CPU architecture | Xtensa LX6 | Xtensa LX7 | RISC-V | RISC-V |
| CPU cores | 2 | 2 | 1 | 2 |
| Maximum CPU frequency | 240 MHz | 240 MHz | 160 MHz | 400 MHz |
| RAM (SRAM) | 520 KB | 512 KB | 400 KB | 768 KB |
| Wi-Fi | 2.4 GHz | 2.4 GHz | 2.4 GHz | — |
| Bluetooth Classic | Yes | No | No | No |
| Bluetooth LE | 4.2 | 5.0 | 5.0 | No |
| GPIOs (maximum) | 34 | 45 | 22 | 55 |
| UART controllers | 3 | 3 | 2 | 5 |
| General-purpose SPI controllers | 2 | 2 | 1 | 4 |
| I2C controllers | 2 | 2 | 1 | 2 |
| I2S controllers ^[2]| 2 | 2 | 1 | 3 |
| PWM | 16 channels | 8 channels | 6 channels | Yes |
| ADC | 12-bit | 12-bit | 12-bit | 12-bit |
| DAC | 2 × 8-bit | — | — | — |
| Capacitive touch | Yes | Yes | No | Yes |
| Hall sensor | Yes | — | — | — |
| External flash | Yes | Yes | Yes | Yes |
| PSRAM | Optional | Optional | — | Supported |
| Strapping GPIOs | GPIO0, GPIO2, GPIO5, GPIO12, GPIO15 | GPIO0, GPIO3, GPIO45, GPIO46 | GPIO2, GPIO8, GPIO9 | GPIO34, GPIO35, GPIO36, GPIO37, GPIO38 |

<sup>2</sup> *not included*

### Limitations / Work in Progress

Supported by Espruino on the ESP32:
* onewire
* hardware SPI
* hardware I2C
* DAC
* ADC
* Serial
* WIFI - as a client and access point
* Bluetooth LE - BLE

Not supported by Espruino on the ESP32 (yet):

* No Over-The-Air (OTA) firmware updates.
* Bluetooth Classic

### Known Issues

* Espruino Web IDE had issues with the ESP32 back in 2017, see [below](#espruino-web-ide).

---

## Getting Started

### Installing drivers

Depending on the board and operating system you have, you might need to install the FTDI or Silicon Labs USB driver:

* [FTDI](http://www.ftdichip.com/Drivers/D2XX.htm)
* [Silicon Labs CP210x](https://www.silabs.com/products/development-tools/software/usb-to-uart-bridge-vcp-drivers)

### Flashing<a name="firmware-updates"></a>

If your device is not already flashed, below are the instructions.  Flashing involves downloading the latest firmware to your PC and then copying via USB cable to the microcontroller.

#### Easy Online Flashing

If you have a Chromium-based web browser it's possible to flash your ESP32 device direct from the browser! [Click here to flash Espruino to your board](https://www.espruino.com/Espressif+Flash)

If that fails you'll have to install it manually (see below)

#### Writing Firmware

Download [esptool](https://github.com/espressif/esptool) if you haven't downloaded it already.

To flash the ESP32 we use `esptool.py`.  Before you run `esptool.py`, make sure
you know the flashing procedure for the board you have.  Some boards have a flash
button, that you press when you are running the flash utility.  For boards such
as the Dev Kit C board - The DTS and RTS lines are used and put the board into bootloader mode automatically

##### PyCom boards
for [PyCom boards](https://www.pycom.io/) with the ESP32 microcontroller you need to:
 1. connect the ESP32 board to your PC using the USB cable.
 2. hold pin G23 to GND;
 3. run the following command; and then
 4. press the reset button.

##### ESP-WROOM-32 (plain, no dev board)
1. connect pins as follows
```
VCC -> VCC(3.3V)
GND -> GND
EN -> VCC
TX -> RX (on usb controller)
RX -> TX (on usb controller)
IO0 -> GND (only for flash)
```
2. run the following command; and then
3. leave IO0 floating (not connected) and reset chip

##### ESP-WROOM-32 (dev board)

Flashing can be done by USB, no special actions on pins are needed.

##### Flashing command
The following command will write the flash to the ESP32.  Note you need to
select the correct port, on Windows it will be something like `COM3`.

###### Initial flash

```sh
esp-idf/components/esptool_py/esptool/esptool.py    \
        --chip esp32                                \
        --port /dev/ttyUSB0                         \
        --baud 921600                               \
        --after hard_reset write_flash              \
        -z                                          \
        --flash_mode dio                            \
        --flash_freq 40m                            \
        --flash_size detect                         \
        0x1000 bootloader.bin                       \
        0x8000 partitions_espruino.bin              \
        0x10000 espruino_esp32.bin
```

If the `bootloader.bin` and `partitions_espruino.bin` files are not
included from the same source you acquired the `espruino_esp32.bin` build,
they should be available in the corresponding `espruino_1v92.*_esp32.tgz`
package of the [Travis cutting-edge builds](https://www.espruino.com/binaries/travis/master/).


###### Subsequent updates

This example is to replace existing Espruino firmware after a new release:

```shell
esp-idf/components/esptool_py/esptool/esptool.py    \
        --chip esp32                                \
        --port /dev/ttyUSB0                         \
        --baud 921600                               \
        --before esp32r0                            \
        --after hard_reset write_flash              \
        -z                                          \
        --flash_mode dio                            \
        --flash_freq 40m                            \
        --flash_size detect                         \
        0x10000 espruino_esp32.bin
```

You should see something like the following:

```text
esptool.py v2.0-beta1
Connecting........................
Uploading stub...
Running stub...
Stub running...
Changing baud rate to 921600
Changed.
Attaching SPI flash...
Configuring flash size...
Auto-detected Flash size: 4MB
Compressed 894288 bytes to 517230...
Wrote 894288 bytes (517230 compressed) at 0x00010000 in 8.4 seconds (effective 848.5 kbit/s)...
Hash of data verified.

Leaving...
Hard resetting...
```

Your device is flashed.




## Building Firmware

You can get the Espruino firmare from the [cutting-edge builds](https://www.espruino.com/binaries/travis/master/).
Get the file ending in `_esp[32|32c3|32s3].[bin|tgz]`.

You can also build the Espruino firmware yourself:

The following work in a bash shell environment, you will need git, and other essential build tools (e.g. on Ubuntu run `sudo apt-get install build-essential`).

```shell
# Get the Espruino source code
$ git clone https://github.com/espruino/Espruino.git
$ cd Espruino
# Download and set up the toolchain ('source' is important here)
$ source scripts/provision.sh ESP32
# Clean and rebuild
make clean && RELEASE=1 BOARD=[ESP32|ESP32C3|ESP32C3] make
```

You will have a file called `espruino_esp32.bin` in folder bin. This is your ESP32 firmware.

See [Building](https://github.com/espruino/Espruino/blob/master/README_Building.md) for more information.

### Espruino Web IDE

The [Espruino Web IDE](https://www.espruino.com/Web+IDE) is a basic development environment
that allows you to write your code and deploy it to the ESP32.

#### minicom / CuteCom

There are other methods to connect to your ESP32, not just Espruino Web IDE.  Two
very basic tools are [minicom](https://en.wikipedia.org/wiki/Minicom),
[CuteCom](http://cutecom.sourceforge.net/),
and [screen](https://www.gnu.org/software/screen/) which may already be installed
on your system.
Another cross platform terminal program with a friendly interface is [CoolTerm](http://freeware.the-meiers.org/).

*screen* is usually used for multiplexing terminals, keeping terminal sessions
alive while you're logged out, and so forth. However, it will also function as
a serial terminal

```shell
screen /dev/ttyUSB0 115200
```

*Minicom* is a basic console based tool that allows you to connect to a serial
device, such as the ESP32.  Below is the command to get you connected to the
ESP32.

```
minicom --baudrate 115200 --device /dev/ttyUSB0
```

*CuteCom* is also a basic GUI tool that allows you to connect to a serial device.
Run CuteCom and connect via the correct port.

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

### Creating a basic web server

Once you have wifi going you will be able to create a simple web server.

```JavaScript
var ssid = 'YOUR_SSID';
var password = 'YOUR_SSID_PASSWORD';
var port = 80;

function processRequest (req, res) {
  res.writeHead(200);
  res.end('Hello World');
}

wifi.connect(ssid, {password: password}, function() {

    var http = require('http');
    http.createServer(processRequest).listen(port);

    console.log(`Web server running at http://${wifi.getIP().ip}:${port}`)
});
```

This will output something like `Web server running at http://10.42.0.119` and you will be able to browse to that address.

## Wi-Fi

### Station Mode

If your board with the ESP32 has an antenna connection point, connect your Wifi antenna.  Many
boards have an in-built antenna so this may not be required.

```JavaScript
var ssid = 'YOUR_SSID';
var password = 'YOUR_SSID_PASSWORD';

var wifi = require('Wifi');
wifi.connect(ssid, {password: password}, function() {
    console.log('Connected to Wifi.  IP address is:', wifi.getIP().ip);
    wifi.save(); // Next reboot will auto-connect
});
```

Additional commands:
 * `wifi.save()`: This will save the Wifi details such that the ESP32 will reconnect to the wifi
   after a reboot.
 * `wifi.scan((ap) => { console.log(ap) })`: List all the access points seen by the ESP32.
 * `wifi.setHostname('myESP32')`: set the hostname. (Not currently implemented.)

**Note:** The ESP32's Wifi implementation supports both a simple access point mode and a station mode.
The station mode is highly recommended for normal operation as the access point mode is very
limited. It supports 4 stations max and offers no routing between stations.

<span style="color: red">**Note:** You need a good 3.3v regulator with a solid power supply.
If you get errors as soon as Wifi starts it's probably because the power is insufficient.
A 500-600mA regulator with at least 22uF capacitor is recommended.</span>

### Access Point Mode

The source document notes that the ESP32 Wi-Fi implementation supports access point mode, with up to four stations and no routing between connected stations. A dedicated AP setup example is not yet documented.

### Station and AP

The source document mentions station and access point modes, including simultaneous operation where supported by the target and ESP-IDF configuration. A tested simultaneous-mode example is not yet documented.

### HTTPS Client

The ESP32 can access HTTPS resources when the firmware
includes TLS support. 
The HTTP module can be used for both HTTP and HTTPS requests.

Example:

    var wifi = require("Wifi");

    wifi.connect("YOUR_SSID", {
      password: "YOUR_PASSWORD"
    }, function(err) {
      if (err) {
        console.log("WiFi error:", err);
        return;
      }

      require("http").get(
        "https://example.com/",
        function(res) {
          console.log("HTTP status:", res.status);

          res.on("data", function(data) {
            console.log(data);
          });

          res.on("close", function() {
            console.log("Request finished");
          });
        }
      );
    });

Certificate and server authentication settings depend
on the TLS configuration.

See:

- [Internet / HTTPS](https://www.espruino.com/Internet)
- [HTTP reference](https://www.espruino.com/Reference#http)
- [TLS reference](https://www.espruino.com/Reference#tls)

### Bluetooth

See [https://www.espruino.com/BLE+Communications](https://www.espruino.com/BLE+Communications)

## GPIO

### Pin Mapping

The ESP32 has 40 GPIO pins.  These are available in Espruino as the variables D0 to D40, each of
these variables are instances of the Pin class.

* APPEND_PINOUT: ESP32

For example, connect GPIO25 and D14 with a wire.  Then run the following code.

```JavaScript
D14.mode('output');
D25.mode('input');
console.log('Before: ', D25.read());
D14.set();                  // Set the D14 pin to output a HIGH value.
console.log('After: ', D25.read());
```

This will output:

```text
Before:  false
After:  true
```

**Note:** The ESP32 GPIO pins support
[totem-pole](https://en.wikipedia.org/wiki/Push%E2%80%93pull_output#Totem-pole_push.E2.80.93pull_output_stages) and
[open-drain outputs](https://en.wikipedia.org/wiki/Open_collector),
and they support a weak internal
[pull-up resistor](https://en.wikipedia.org/wiki/Pull-up_resistor) (in the 20KOhm-50KOhm range).
The Espruino D0 through D32 pins map directory to GPIO0 through GPIO32 on
the ESP32. Remember that GPIO6 through GPIO11 are used for the external
flash chip and are therefore not available. Also, GPIO0 and GPIO2
must be pulled-up at boot and GPIO15 must be pulled-down at boot.

The ESP32 ADC function is available on any pin (D0-D15) but really uses a separate pin on the ESP32
(this should be changed to an A0 pin).

### setWatch()

External GPIO interrupts are supported on the following pins:

- D0
- D12-D19
- D21-D22
- D25-D27
- D34-D39

Other pins can still be used for normal digital input/output,
but cannot necessarily be used with `setWatch()`.

Example:
```js
    setWatch(function(e) {
      console.log("Input changed:", e.state);
    }, D34, {
      repeat: true,
      edge: "both"
    });
```

## Hardware Peripherals

### Digital Read / Write

PWM on most pins. True DAC on GPIO25 and GPIO26.

First version of PWM uses ledc driver. Usually, this matches needs for frequency much more than sigmadelta. Mapping of PWM channel to timer is done in a special way.
There are 5 channel usable, as long as 5Khz are ok for frequency. Channels are internally controlled. If you try to use more than 5, you will get a message.
Left 3 channels are designed to support a frequency of your choice, as long as it is between 1hz and 78 Khz. If you try to use a 4th channel with a frequency, other than 5Khz you will a meesage.

#### Problem

Handling of PWM with those 5/3 method is not always easy to follow. As long as we don't have a better solution, its better to have this than nothing.
Limitation of frequency is boring, but as long as we use it for analog output, it should be acceptable.
Please have in mind, PWM via analog always need a lowpass filter, usually a simple RC.

### PWM

PWM on most pins. True DAC on GPIO25 and GPIO26.

First version of PWM uses ledc driver. Usually, this matches needs for frequency much more than sigmadelta. Mapping of PWM channel to timer is done in a special way.
There are 5 channel usable, as long as 5Khz are ok for frequency. Channels are internally controlled. If you try to use more than 5, you will get a message.
Left 3 channels are designed to support a frequency of your choice, as long as it is between 1hz and 78 Khz. If you try to use a 4th channel with a frequency, other than 5Khz you will a meesage.

#### Problem

Handling of PWM with those 5/3 method is not always easy to follow. As long as we don't have a better solution, its better to have this than nothing.
Limitation of frequency is boring, but as long as we use it for analog output, it should be acceptable.
Please have in mind, PWM via analog always need a lowpass filter, usually a simple RC.

### ADC

There are two ADC channels but only ADC-1 is support at the moment. The ADC-1 channel is accessible through `IO35` and `IO36`(`VP_SENSOR`).
ADC PINs should not be connected to a voltage higher than VCC - if a higher input voltage is needed, a resistor should be added between the input and the ADC and then the real voltage could be calculated by including the resistor's voltage drop in the equation.

usage example: reading analog voltage from IO35

```JavaScript
var reading = analogRead(D35);
// reading is a float between 0 and 1
var estimatedInputVoltage = reading * 3.3;
```
more information on espruino [ADC docs](https://www.espruino.com/ADC) and [analogRead method](https://www.espruino.com/Reference#l__global_analogRead)

### DAC

The original ESP32 provides two 8-bit DAC outputs on GPIO25 and GPIO26. DAC support is chip-dependent; do not assume that these outputs or the original ESP32 DAC implementation are available on ESP32-S3, ESP32-C3 or ESP32-P4.

### Touch

TODO: Document capacitive-touch support and the Espruino API for each supported target.

### NeoPixel

Espruino supports NeoPixel-compatible LED strips through the standard `neopixel` module. This implementation is shared across supported Espruino platforms and does not require an ESP32-specific API.

Use `require("neopixel").write(pin, data)` to send RGB data to a LED strip.

See the [Espruino NeoPixel reference](https://www.espruino.com/Reference#neopixel) and the [WS2811/WS2812 documentation](https://www.espruino.com/WS2811) for further details.

### I2C

See the [I2C class](https://www.espruino.com/Reference#I2C) for further details.

### Hardware I2C

The ESP32 supports hardware I2C. The SDA and SCL pins can be
configured using `I2C.setup()`.

Unlike some microcontrollers, the ESP32 GPIO matrix allows
I2C signals to be routed to different GPIO pins.

For more information see the [I2C reference](https://www.espruino.com/Reference#I2C).

### SPI

It uses the [SPI class](https://www.espruino.com/Reference#SPI).

#### Hardware SPI

The ESP32 provides hardware SPI controllers. SPI pins can be configured using the GPIO matrix.

For more information see the [SPI reference](https://www.espruino.com/Reference#SPI).

##### Native SPI IOMUX Pin Mapping by Chip

Espressif renamed the user-available SPI buses starting with the S2/C3 generation (`VSPI`/`HSPI` became `SPI2`/`SPI3` or `FSPI`/`HSPI`). Using native IOMUX pins allows maximum bus speed (up to 80 MHz) without GPIO matrix latency.

| Signal | ESP32 `VSPI` (SPI3) | ESP32 `HSPI` (SPI2) | ESP32-C3 `FSPI` (SPI2) | ESP32-S3 `FSPI` (SPI2) | ESP32-P4 `SPI2` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SCK** | GPIO18 | GPIO14 | GPIO6 | GPIO12 | GPIO9 |
| **MISO** | GPIO19 | GPIO12 | GPIO2 | GPIO13 | GPIO10 |
| **MOSI** | GPIO23 | GPIO13 | GPIO7 | GPIO11 | GPIO8 |
| **CS (CS0)** | GPIO5 | GPIO15 | GPIO10 | GPIO10 | GPIO7 |

**Notes:**
* On the **ESP32-S3** and **ESP32-P4**, `SPI3` has no dedicated IOMUX pins and always routes via the GPIO matrix.
* The **ESP32-C3** only has one user-accessible SPI controller (`SPI2`).


#### Compatibility & Pin Constraints by Chip

| Chip | User SPI Buses | Max Clock (IOMUX / Matrix) | Reserved / Off-Limits Pins | Espruino Implementation Notes |
| :--- | :--- | :--- | :--- | :--- |
| **ESP32** | `SPI2` (HSPI), `SPI3` (VSPI) | 80 MHz / 26 MHz | **GPIO6–11** (SPI Flash/PSRAM), **GPIO34–39** (Input-only; cannot use for SCK/MOSI/CS) | Full-duplex SPI over the GPIO matrix is capped at ~26 MHz due to input delay. |
| **ESP32-C3** | `SPI2` (FSPI) only | 80 MHz / 40 MHz | **GPIO11–17** (SPI Flash), **GPIO18–19** (USB Serial/JTAG), **GPIO2, 8, 9** (Strapping pins) | Only 22 GPIOs total (0–21). Only 1 user SPI peripheral exists in hardware. |
| **ESP32-S3** | `SPI2` (FSPI), `SPI3` (HSPI) | 80 MHz / 40 MHz | **GPIO19–20** (USB OTG / JTAG), **GPIO26–32** (SPI Flash/PSRAM), **GPIO33–37** (If Octal Flash/PSRAM is used) | `SPI3` (`SPI3_HOST`) works on any free GPIO via the GPIO matrix. |
| **ESP32-P4** | `SPI2`, `SPI3` | 80 MHz / 40 MHz | **GPIO24–27** (USB 2.0 OTG / PHY), **GPIO34–38** (Strapping pins; GPIO35 = Boot) | Flash/PSRAM use dedicated internal buses (`SPI0`/`SPI1`), leaving standard GPIOs free. On P4 DevKits, GPIO7–10 may be wired to onboard peripherals (e.g., I2C or C6 Wi-Fi SDIO). |

### UART

There are two serial ports (UARTs) available for use on the ESP32 with Espruino.  These are accessed
throught the [Serial](https://www.espruino.com/Reference#Serial) class.  The `Serial1` and `Serial2`
functions are available for use.  Note that if you are accessing the ESP32 via serial terminal
`Serial1` may already be used, hence it's not available (use Telnet if this is an issue).


*Note:* The ESP32 has two UARTS. UART0 (`Serial1`) uses `GPIO10` for TX and `GPIO32` for RX and is used by
the Espruino JavaScript console. It can be used for other things once the Espruino console
is moved to another device. For instance calling `LoopbackA.setConsole()` will move the console
to 'loopback' (where is can be accessed using `LoopbackB`), and will free up `Serial1` for
use like any normal Espruino Serial port.

### RMT / digitalPulse

There are 8 channel available. Each one with is connected to a pin. Timimg goes down to micro secs.
Implemented with the esp-idf RMT driver. 

## Storage and Flash

for details see the [Storage Libray](https://www.espruino.com/Reference#t_Storage) and [Flash Libray](https://www.espruino.com/Reference#t_Flash)

### Flash Map

The ESP32 uses external SPI flash for firmware, configuration,
saved JavaScript code and filesystem storage.

The available flash layout depends on the firmware build,
partition table and physical flash size.

To find available flash areas, use:

    var Flash = require("Flash");
    console.log(Flash.getFree());

Do not assume that a particular flash address is available
for application data.

The standard ESP32 partition layout used by Espruino is
defined in `partitions_espruino.csv` in the
EspruinoBuildTools repository.

The following table describes the traditional 4 MB layout.
Always check the partition table of the firmware actually
installed on your device before accessing flash directly.

| Start    | Length | Function |
|----------|--------|----------|
| 0x000000 | 4 KB | Reserved boot area |
| 0x008000 | 4 KB | Bootloader |
| 0x009000 | 16 KB | NVS |
| 0x00D000 | 8 KB | OTA metadata |
| 0x010000 | 960 KB | Factory firmware |
| 0x100000 | 64 KB | Saved JavaScript code |
| 0x200000 | 1024 KB | OTA partition |
| 0x300000 | 1024 KB | FAT filesystem |

The FAT filesystem can be accessed through the standard
Espruino `fs` module.

Initialize the filesystem on first use:

    try {
      fs.readdirSync();
    } catch (e) {
      console.log("Formatting filesystem");
      E.flashFatFS({format:true});
    }

Files can then be accessed normally:

    fs.writeFileSync(
      "hello.txt",
      "Hello ESP32!"
    );

    console.log(fs.readFileSync("hello.txt"));

Formatting the filesystem deletes its existing contents.
Only perform this operation when necessary.

---

### Saving Code

Currently 64KB of flash are reserved to save JS code to flash using the
save() function. This area is also used for `E.saveBootCode()`

If the save() area contains something that crashes Espruino or otherwise
doesn't let you reset the system you can disable whatever is saved by
flashing blank.bin to 0x100000.

### Filesystem

The ESP32 flash filesystem can be accessed through the standard Espruino `fs` module. See the filesystem initialization and file access examples in the Flash Map section above. Formatting deletes existing contents, so only format when necessary.



## Limitations / Work in Progress

The following features are supported by Espruino on ESP32 targets, depending on the chip, ESP-IDF version and firmware configuration.

**Supported:**

- OneWire
- Software & Hardware SPI and I2C
- DAC (only on chips providing hardware DAC, such as ESP32)
- ADC (including ESP32-C3 support)
- Hardware Serial (UART)
- WiFi:
  - Station mode (client)
  - Access Point mode
  - Station and Access Point modes where supported by the target and ESP-IDF configuration
- Bluetooth Low Energy (BLE):
  - BLE advertising
  - BLE scanning
  - BLE peripheral mode (GATT server)
  - BLE central mode (GATT client)
  - BLE UART service
  - Reading and writing characteristics
  - Notifications

**Not supported or not fully implemented:**

- Bluetooth Classic (BR/EDR). Espruino releases the Bluetooth Classic controller memory and uses BLE only.
- Complete OTA firmware update functionality through WiFi or BLE. OTA partition handling and firmware rollback support are available, but this should not be confused with a complete OTA update mechanism.
- Some advanced BLE features remain unimplemented, including parts of bonding, RSSI monitoring and whitelist management.

**Target-specific limitations:**

- ESP32-S3, ESP32-C3 support BLE but not Bluetooth Classic.
- ESP32-P4 has no integrated WiFi or Bluetooth radio and requires an external connectivity solution.
- DAC availability depends on the chip. Do not assume that the original ESP32 DAC API is available on all variants.
- Peripheral availability also depends on the selected ESP-IDF version and firmware build configuration.

For current implementation details, see the [Espruino ChangeLog](https://www.espruino.com/ChangeLog) and the [ESP32 target source code](https://github.com/espruino/Espruino/tree/master/targets/esp32).



### Saving code to flash

Currently 64KB of flash are reserved to save JS code to flash using the
save() function. This area is also used for `E.saveBootCode()`

If the save() area contains something that crashes Espruino or otherwise
doesn't let you reset the system you can disable whatever is saved by
flashing blank.bin to 0x100000.


### Flash map and access

Note: if you are looking for a free flash area to use, call `require( "Flash").getFree()`,
which will return a list of available areas (see docs).

Current ESP32 modules are 4Mb.

The result of all this is the following:

|    Start | Length | Function                                                            |
|---------:|-------:|:--------------------------------------------------------------------|
| 0x000000 |    4KB | Secure Boot                                                         |
| 0x008000 |    4KB | Bootloader                                                          |
| 0x009000 |   16KB | nvs - esp-idf non-volatile storage area                             |
| 0x00d000 |    8KB | otadata - esp-idf keeps track on which the current firmware to boot |
| 0x010000 |  960KB | factory - the initial espruino firmware.                            |
| 0x100000 |   64KB | js_code - the saved espruino interpreter and `E.setBootCode()`      |
| 0x200000 | 1024KB | ota_0 - area for ota updates (not yet implemented)                  |
| 0x300000 | 1024KB | 1Mb Flash Fat Filesystem                                            |

This is defined in partitions_espruino.csv in the EspruinoBuildTools repository

The last 1Mb has been defined as a flash FAT filesystem. It needs to be initialised for first use - this does it in a safe way that won't delete existing files:

```JavaScript
try {
  fs.readdirSync();
 } catch (e) { //'Uncaught Error: Unable to mount media : NO_FILESYSTEM'
  console.log('Formatting FS - only need to do once');
  E.flashFatFS({ format: true });
}
```

you can then use the filesystem with fs or File objects:

```JavaScript
fs.writeFileSync('hello world.txt', 'This is the way the world ends\nHello World\nnot with a bang but a whimper.\n');
fs.readFileSync('hello world.txt');
```

---

### Further reading

**TODO: Add additional resources not already covered**.

## Troubleshooting

#### Guru Meditation Error
**Symptom:**
```
Guru Meditation Error of type InstrFetchProhibited occurred on core  0. Exception was unhandled.
Register dump:
PC      : 0xffffffff  PS      : 0x00060c30  A0      : 0x8008e036  A1      : 0x3ffd54b0
A2      : 0x3f400148  A3      : 0x3ffb6952  A4      : 0x00000008  A5      : 0xffffffe8
A6      : 0xffffffa4  A7      : 0x3ffb1fa0  A8      : 0xffffffff  A9      : 0x3ffd54c0
A10     : 0x00000000  A11     : 0x00000002  A12     : 0x5fff0007  A13     : 0x00000000
A14     : 0x00000000  A15     : 0x00000000  SAR     : 0x00000000  EXCCAUSE: 0x00000014
EXCVADDR: 0xfffffffc  LBEG    : 0x4000c2e0  LEND    : 0x4000c2f6  LCOUNT  : 0x00000000
```
**Cause:** if it happens whenever wifi tries to connect then the chip is not getting enough power.
**Solution:** use a designated power source (not the USB serial adapter), add capacitors to the power line

## Further Reading

**TODO: Add additional resources not already covered**.

Official Espruino Boards
-------------------------

* APPEND_KEYWORD: Official Board
