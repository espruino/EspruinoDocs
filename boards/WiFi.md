<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Espruino WiFi
=============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/WiFi. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Espruino,Official Board,Espruino WiFi,WiFi,Wireless,Internet,Radio,ESP8266,Board,PCB,Pinout

![Espruino WiFi](WiFi/angled.jpg)

**Espruino WiFi is a tiny USB and WiFi-enabled microcontroller that can be programmed in JavaScript**

Just plug it into your computer and get started in seconds with the
[Web IDE](/ide) - no software installation needed!

**Just got your Espruino WiFi? [Get started here!](/Quick+Start+USB)**

**Note:** Espruino WiFi provides an easy, well-supported way to get on the Internet, however it's not the only way to access a WiFi network from an Espruino board. [See here](/Internet#related-pages) for more information.

Contents
--------

* APPEND_TOC

Features
-------

* 30mm x 23mm (1.2 x 0.9 inch)
* On-board Micro USB connector
* 2 rows of 11 0.1" pins, with 2 extra 0.1" holes
* 21 GPIO pins : 8 Analog inputs, 20 PWM, 1 Serial, 3 SPI, 3 I2C
* Three on-board LEDs (2x user programmable, 1x WiFi activity) and one button.
* [STM32F411CEU6](/datasheets/STM32F411xE.pdf) 32-bit 100MHz ARM Cortex M4 CPU
* 512kb flash, 128kb RAM
* ESP8266 WiFi (802.11 b/g/n)
* All GPIO is 5 volt tolerant (Arduino compatible)
* RTC with external oscillator
* On-board 3.3v 250mA voltage regulator, accepts voltages from 3.5v to 5v (please see notes under [pinout](#pinout) below)
* Current draw in sleep: &lt; 0.05mA - over 2.5 years on a 2500mAh battery
* 500mA polyfuse on board

**Note:** We did mark the Espruino WiFi as discontinued during the pandemic because of the component shortage, but as parts
have become available we have started producing it again.

Pinout
------

* APPEND_PINOUT: ESPRUINOWIFI

<span style="color: red">**Note:** Unlike [Espruino Pico](/Pico) and the [original Espruino board](/Original), Espruno WiFi **doesn't** contain any
battery switchover circuitry. The `+`/`+VUSB` pin is connected straight to **USB 5V**, and shouldn't be used to power the
WiFi board while Micro USB is plugged in, unless it is via a diode from 5V.</span>

Information
-----------

* [Circuit Diagram](https://github.com/espruino/EspruinoBoard/blob/master/WiFi/pdf/espruino_wifi_sch.pdf)
* [Board Layout](https://github.com/espruino/EspruinoBoard/blob/master/WiFi/pdf/espruino_wifi_brd.pdf)
* [STM32F411CE Datasheet](/datasheets/STM32F411xE.pdf)
* [STM32F411CE Reference Manual](/datasheets/STM32F411xE_ref.pdf)


Using WiFi
----------

### Connecting to an AP

To use wifi, simply require the `Wifi` module and call `connect`. The following code
will connect and then request the page `http://www.pur3.co.uk/hello.txt`:

```
var WIFI_NAME = "";
var WIFI_OPTIONS = { password : "" };

var wifi = require("Wifi");
wifi.connect(WIFI_NAME, WIFI_OPTIONS, function(err) {
  if (err) {
    console.log("Connection error: "+err);
    return;
  }
  console.log("Connected!");
  getPage();
});

function getPage() {
  require("http").get("http://www.pur3.co.uk/hello.txt", function(res) {
    console.log("Response: ",res);
    res.on('data', function(d) {
      console.log("--->"+d);
    });
  });
}
```

For more information on HTTP requests/etc once connected, check
out [this Page on HTTP](http://www.espruino.com/Internet).

**Note:** If you want Espruino to connect at power on after you have
saved, make sure that you call the WiFi initialisation code inside an
`onInit` function - eg:

```
var WIFI_NAME = "";
var WIFI_OPTIONS = { password : "" };

var wifi;

function onInit() {
  wifi = require("Wifi");
  wifi.connect(WIFI_NAME, WIFI_OPTIONS, function(err) {
    if (err) {
      console.log("Connection error: "+err);
      return;
    }
    console.log("Connected!");
    getPage();
  });
}
```

### Access Point Mode

Espruino WiFi can be made into a WiFi access point with:

```
var wifi = require("Wifi");

wifi.startAP('EspruinoAP', { password: '0123456789', authMode: 'wpa2' }, function(err) {
  if (err) throw err;
  console.log("Connected!");
});
```

See the reference below for more information. `startAP` and `connect` can be used together to make Espruino become an access point while also connecting to another WiFi network. In that case, it'll have the DHCP-assigned IP address on the WiFi network it is connected to, and the IP address `192.168.4.1` on the access point it has created.

**Note:** In 2v06 and earlier, you must specify a dummy password in order to have a 'open' access point, eg. `wifi.startAP('EspruinoAP', { password: '0123456789', authMode: 'open' }, ...`. In 2v07 and later this is fixed, and even just `wifi.startAP('EspruinoAP', { }, ...` will create an open access point.

### WiFi events

You can also be notified on particular WiFi events:

```
wifi.on('associated',function() { console.log("We're connected to an AP"); });
wifi.on('connected',function() { console.log("We have an IP Address"); });
wifi.on('disconnected',function() { console.log("We disconnected"); });
```

Reference
---------

On Espruino firmwares version 1v96 and later, WiFi functionality is now
built in via the [`Wifi` module](http://www.espruino.com/Reference#Wifi)
accessed with `require("Wifi")`.

On earlier (pre-1v96) versions of the Espruino WiFi firmware, WiFi functionality
was implemented with the [`EspruinoWiFi` JS module](http://www.espruino.com/modules/EspruinoWiFi.js) which is accessed with
`require("EspruinoWiFi")`.

* APPEND_JSDOC: ../devices/EspruinoWiFi.js


Tutorials
---------

Tutorials using the Espruino WiFi Board:

* APPEND_USES: EspruinoWiFi

There aren't currently many tutorials specifically for the Espruino WiFi,
however it can be used just like the [Espruino Pico](/Pico), which has many
more tutorials available:

* APPEND_USES: Pico,-EspruinoWiFi

Hardware Limitations
------------------

* You can only have one watched pin of each number (Watching A0 and A1 is fine, but watching A1 and B1 isn't)
* When in Deep sleep, pin B9 cannot be used as a watch (as A9 is used to wake up on USB)


Troubleshooting
-------------

Please see the [[Troubleshooting]] section.


Firmware Updates
-----------------

We'd **strongly** recommend that you use the Web IDE to update the firmware
on this board - please see the [Firmware Update](/Firmware+Update#stm32) page for detailed instructions.

If you do manage to erase all your board's flash memory you can use the
on-chip bootloader though - see below.


Advanced Reflashing
-------------------

In very rare cases (if you are experimenting with writing to Flash Memory), you may be able to damage the bootloader, which will effectively 'brick' the Espruino WiFi.

To fix this, you'll have to use the hard-wired USB DFU (Device Firmware Upgrade) bootloader. You can also use this method for flashing non-Espruino firmwares to Espruino.

Just:

* Short out the `BOOT0/BTN` solder jumper on the back of the board - you can do this by drawing over it with a pencil.
* Install [ST's DFU utility](http://www.st.com/web/en/catalog/tools/FM147/CL1794/SC961/SS1533/PF257916) on Windows, or [dfu-util](http://dfu-util.sourceforge.net/) for Mac or Linux
* Download the latest Espruino WiFi binary from [espruino.com/binaries](http://www.espruino.com/binaries/)
* Hold down the Espruino WiFi's button while plugging it into USB
* Use the DFU tool to flash the firmware. Using the GUI on windows, or with the command `sudo dfu-util -a 0 -s 0x08000000 -D espruino_binary_file.bin` for `dfu-util` on Mac/Linux.
* Un-short the `BOOT0/BTN` jumper to re-use the original Espruino Bootloader. If you used a Pencil mark then you may need to use cleaning fluid and a small brush to totally clear out the graphite.

Updating ESP8266 firmware
---------------------------

Espruino WiFi contains and ESP8266 module to handle WiFi communications. It
ships with firmware 0v40, but it can be updated reasonably easily if needed:

* In the Web IDE, click `Settings`, `Flasher`
* Down the bottom of the screen, under `Espruino WiFi Firmware` click the
`Update WiFi module` button to update the firmware. This will take several
minutes, but will result in the firmware being updated.
* If you are unsure of your currently installed version, you can
click `Check version` to find out what is installed.


### Advanced ESP8266 Reflashing

You can also turn your Espruino WiFi's CPU into a USB-serial bridge, allowing
you to use your desktop PC to flash the Espruino WiFi.

**USE WITH CAUTION:** The unmodified `esptool.py` tool for updating firmware
sends packets of data that are too large, and will not be able to successfully
flash the ESP8266, leaving it bricked.

* First connect to your Espruino WiFi with the Web IDE - make a note of the Espruino
Path (usually `/dev/ttySomething` or `COMxx`) that is displayed in the connection screen.
* Ensure `Save on Send` mode in `Communication` settings is set to the default of `To RAM`.
* Upload the following code:

```
// Setup serial
Serial2.setup(74880, { rx: A3, tx : A2 });
// Bridge Serial and USB
Serial2.on('data',d=>USB.write(d));
USB.on('data',d=>Serial2.write(d));
// boot module in bootloader mode
digitalWrite(A14, 0); // make sure WiFi starts off
digitalWrite(A13, 0); // into of boot mode
digitalWrite(A14, 1); // turn on wifi
console.log("Now disconnect the IDE");
LoopbackA.setConsole();
```

* Now Disconnect the Web IDE

* Download `esptool` from https://github.com/espressif/esptool

* Check out tag `v2.0` with `git checkout v2.0`

* Modify `esptool.py` to change both `ESP_RAM_BLOCK` and `FLASH_WRITE_SIZE` to `0x100`

* Download the [ESP8266 1.5.4 firmware](/files/ESP8266_AT_1_5_4.zip)
(originally from [here](https://www.electrodragon.com/w/ESP8266_AT-Command_firmware))

* Run the following command. You'll need to replace `/dev/ttyACM0` with
the device path (see the first step)

```
./esptool.py --no-stub --port /dev/ttyACM0 --baud 74880 write_flash --flash_mode dio 0 AiThinker_ESP8266_DIO_32M_32M_20160615_V1.5.4.bin
```

* When complete, unplug the Espruno WiFi and re-plug it
* Now check firmware works with:

```
// Setup serial
Serial2.setup(74880, { rx: A3, tx : A2 });
// Bridge Serial and USB
Serial2.on('data',d=>USB.write(d));
USB.on('data',d=>Serial2.write(d));
// boot module in bootloader mode
digitalWrite(A14, 0); // make sure WiFi starts off
digitalWrite(A13, 1); // out of boot mode
digitalWrite(A14, 1); // turn on wifi
// Ask for version
setTimeout(_=>{
  Serial2.setup(115200, { rx: A3, tx : A2 });
  Serial2.print("AT+GMR\r\n");
}, 1000);
```

After a few seconds it should report something like:

```
>AT+GMR
AT version:1.1.0.0(May 11 2016 18:09:56)
SDK version:1.5.4(baaeaebb)
Ai-Thinker Technology Co. Ltd.
Jun 13 2016 11:29:20
OK
```

And the firmware is updated!


Other Official Espruino Boards
------------------------------

* APPEND_KEYWORD: Official Board
