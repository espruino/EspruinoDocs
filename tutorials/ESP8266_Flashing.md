<!--- Copyright (c) 2015 Thorsten von Eicken, Pur3 Ltd. See the file LICENSE for copying permission. -->
Flashing and using the ESP8266 with Espruino
============================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/ESP8266_Flashing. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

This tutorial provides a little intro into getting going with the ESP8266 and Espruino, and then
using it without serial wires going forward. For reference documentation about the esp8266 port
of Espruino, please see the [reference section](/EspruinoESP8266).

__WARNING__: while everything described here works, the tutorial has not been tested much.

__Windows users__: Flashing instructions using esptool seem to work.
Check [Initial flashing on windows](#initial-flashing-on-windows) below.

This tutorial has the following steps:
- Set a band new esp8266 module up and perform the first flashing using a serial port or
  FTDI adapter.
- Configure the wifi on the esp8266 so you can use it with the Espruino IDE over Wifi. I.e.,
  update and run your sketch.
- Save your work so Espruino runs your sketch every time it starts.
- Update the Espruino firmware to a new version over Wifi (OTA upgrade)

It is assumed that you have downloaded an Espruino for esp8266 tgz archive. At the time of writing
the latest download for the esp8266 can be found in
[this forum thread](http://forum.espruino.com/conversations/279176).
The archive should have a name like
`espruino_1v84.tve_master_8bb4202_esp8266.tgz`, where "1v84" is the base Espruino version,
"tve\_master" is the name of the branch, and "8bb4202" is the SHA of the git commit used for
this build.

Initial flashing
----------------

There are many different __types of esp8266 modules__ and daughter boards, ranging from bare esp-01 or
esp-12 modules, to Adafruit's Huzzah or Sparkfun's Thing. You will have to use your module's
description for getting it into the flash mode as some have buttons, others don't, and yet others
have USB integrated. Here are a few tips.

__Use esp-12 modules__ if at all possible, avoid esp-01 modules: the esp-12 has all the I/O pins
brought out, has 4MBytes of flash, and has a much better RF section. The esp-01 has barely any usable
I/O, only has 512KB flash, and the RF is 10dB worse (that's a factor of 8x!). Esp-07, esp-13,
and wroom-02 modules are good too.

You need a good power supply: typically powering from a USB FTDI type adapter doesn't suffice.
A typical symptom is that flashing works but the esp crashes as soon as you try to run it afterwards.

__To get into flash mode__ you need to pull-up gpio2, and pull down gpio0 and gpio15. Afterwards
to run the flashed firware you need to pull-up gpio0 and gpio2, and pull down gpio15 (i.e. gpio0
changes).
To issue a reset, you briefly pull either reset or ch\_en (chip-enable) low. A pull-up resistor is
recommended on both (reset has a weak internal pull-up, which is OK if you're not connecting
any wires to the pin, ch\_en does not have any internal pull-up and you can hard-wire it to
3.3v). It is not recommended to hard-wire any of the gpio pins to gnd or 3.3v because this can
cause high currents if the pin is driven to a different value. You're not likely to burn out the
chip doing that (always possible, though), but you'll cause extra strain on the power supply,
which can prevent other things from working properly. In particular, during flashing the 26Mhz
clock is output on gpio0, so you definitely don't want to hard-ground that pin! Use anything from
4.7Kohm to 10Kohm for pull-ups, and about 1Kohm-3.3Kohm for pull-downs.

Connect your FTDI's TX to the esp's RX and FTDI RX to esp's TX. If your FTDI adapter cannot be
set to 3.3v then you need to deal with the fact that __the esp8266 is not 5v tolerant__. That means
you need to do something about the FTDI TX -> esp RX connection. A quick hack is to add a 2.2Kohm
to 4.7Kohm resistor in series. A simple nicer solution is to add a diode such that the FTDI can
only pull the esp's RX pin low and use a pull-up for the 1's (see the Adafruit Huzzah schematics).
Finally, you can add a proper level shifter.

The flashing needs to perform the following functions:
- flash the bootloader (this is a second stage bootloader that runs after the ROM bootloader)
- flash the Espruino firmware
- clear the SDK's settings
- clear the SDK's hardware config
- configure the correct SPI flash parameters (few tools do this)

On linux, it is highly recommended to __use esptool.py__ because it performs the last step
correctly. Download it from [github](https://github.com/themadinventor/esptool),
and run it as follows using the files from the Espruino download tgz. Here you need to know
what size flash chip you have, if you guess wrong, Espruino will tell you at boot time and
things will work until you try to save or upgrade, so you can make a best guess and then
tray again later to fix it.

For a 4MByte flash chip (e.g. esp-12): [FIXME: need to get radio init and check addresses]
```
$ /path/to/esptool/esptool.py --port /dev/ttyUSB0 --baud 115200 \
  write_flash --flash_freq 80m --flash_mode qio --flash_size 32m \
  0x0000 "boot_v1.6.bin" 0x1000 espruino_esp8266_user1.bin \
  0x3FC000 esp_init_data_default.bin 0x3FE000 blank.bin
```

For a 512KB flash chip (e.g. esp-01):
```
$ /path/to/esptool/esptool.py --port /dev/ttyUSB0 --baud 115200 \
  write_flash --flash_freq 40m --flash_mode qio --flash_size 4m \
  0x0000 "boot_v1.6.bin" 0x1000 espruino_esp8266_user1.bin \
  0x7C000 esp_init_data_default.bin 0x7E000 blank.bin
```

The `--flash_size 4m --flash_freq 40m' options say 4Mbits and 40Mhz as opposed to 32Mbits
at 80Mhz for the 4MByte flash modules. Note the different addresses for esp_init_data_default.bin
and blank.bin:
the SDK stores its wifi settings near the end of flash, so it changes with flash size.

Initial flashing on windows
---------------------------

Esptool seems to work just fine on windows. These instructions assume that git and
python available from commandline.
Checked on Windows 7, git version 1.9.5.msysgit.0, Enthought Canopy Python 2.7.6, nodemcu dev board v.0.9.

Start a command line, clone esptool, and run `python setup.py install` in esptool's
directory (this step needs to be done only once):
```
> git clone https://github.com/themadinventor/esptool.git
Cloning into 'esptool'...
remote: Counting objects: 268, done.
emote: Total 268 (delta 0), reused 0 (delta 0), pack-reused 268
Receiving objects: 100% (268/268), 99.66 KiB | 0 bytes/s, done.
Resolving deltas: 100% (142/142), done.
Checking connectivity... done.

> cd esptool

> python setup.py install
running install
...
...
...
Finished processing dependencies for esptool==0.1.0
```

Download and unzip the latest binary package, and start a commandline
in that directory. The command to run is pretty much the same, the next
command assumes that esptool is available in a subdirectory of the parent
directory. Adjust the COM port, if you don't have the ESP on COM12. 460800
baud worked just fine for me, writing at ~260kbit/s instead of ~80kbit/s.
```
>python "../esptool/esptool.py" --port COM12 --baud 115200 write_flash \
  --flash_freq 80m --flash_mode qio --flash_size 32m \
  0x0000 boot_v1.6.bin 0x1000 espruino_esp8266_user1.bin \
  0x3FC000 esp_init_data_default.bin 0x3FE000 blank.bin
Connecting...
Erasing flash...
Wrote 3072 bytes at 0x00000000 in 0.3 seconds (79.8 kbit/s)...
Erasing flash...
Wrote 438272 bytes at 0x00001000 in 43.4 seconds (80.7 kbit/s)...
Erasing flash...
Wrote 1024 bytes at 0x003fc000 in 0.1 seconds (83.6 kbit/s)...
Erasing flash...
Wrote 4096 bytes at 0x003fe000 in 0.4 seconds (83.4 kbit/s)...

Leaving...
```

After the flashing, you should be able to connect to the serial port at 115200 baud and be
at the Espruino prompt. A simple commandline program you can use to check
is `screen /dev/ttyUSB0 115200`. For example:
```
$ screen /dev/ttyUSB0 115200
>process.memory()
process.memory()
={ "free": 1279, "usage": 121, "total": 1400, "history": 37 }
>reset()
reset()
=undefined

 _____                 _
 |   __|___ ___ ___ _ _|_|___ ___
 |   __|_ -| . |  _| | | |   | . |
 |_____|___|  _|_| |___|_|_|_|___|
           |_| http://espruino.com
 1v84.tve_master_b603c8a Copyright 2015 G.Williams
WARNING: the esp8266 port is in beta!
Flash map 4MB:512/512, manuf 0xe0 chip 0x4016

>
```

The last "Flash map..." line tells you that I have my module configured for 4MBytes of flash
and that the actual flash chip is from manufacturer 0xe0 and code 0x4016. You can look up most
codes at http://code.coreboot.org/svn/flashrom/trunk/flashchips.h and Espruino will complain
if the config doesn't match the chip for some common chips.

Erase flash
-----------

It is important to erase the flash before upgrade to a new version to avoid undefined situations like can't load saved code or endless reboot loops..... 

```
$ /path/to/esptool/esptool.py --port /dev/ttyUSB0 --baud 115200 erase_flash
```

Configuring the Wifi
--------------------

To configure the Wifi you will need an access point to which you can connect, you will need to
tell Espruino to connect to it, you will then need to give it a hostname and finally
you will want to save the Wifi settings so it automatically connects after a reset.

The wifi configuration is done using the Wifi library (docs are
available in the [reference section](http://www.espruino.com/Reference#Wifi)). Use the
following snippet with the appropriate substitutions:
```
>var wifi = require("Wifi");
=function () { [native code] }
>wifi.connect("my-ssid", {password: "my-password"},
   function(err){if(err)console.log(err);else console.log("connected!");})
=undefined
```
And after anywhere from 1-15 seconds you should see:
```
connected!
>
```

You can get more info about the status using:
```
>wifi.getStatus()
={
  "mode": "sta",
  "station": "connected",
  "ap": "disabled",
  "phy": "11n",
  "powersave": "ps-poll",
  "savedMode": "off"
 }
> wifi.getIP()
={
  "ip": "192.168.0.106",
  "netmask": "255.255.255.0",
  "gw": "192.168.0.1",
  "mac": "5c:cf:ff:06:c0:db"
 }
```
Note the IP address of you Espruino module, you may need it below!

Now set the hostname of your module (__WARNING__: this currently only sets the DHCP hostname,
so whether it gets propagated to DNS depends on your access point and DNS set-up, this will be
fixed using mDNS soon).
```
>wifi.setDHCPHostname("espruino");
```

At this point, assuming you are happy with your Wifi settings you can save them so they are used
automatically at power-up:
```
>wifi.save()
```

Note that the esp8266 can also act as a simplistic access point. It has its limitations, such as
4 clients max and no routing between clients, but in a pinch it works. To use the access point
functionality, you can simply do:
```
> wifi.startAP("my-ssid")
=undefined
> wifi.getAPIP()
={
  "ip": "192.168.4.1",
  "netmask": "255.255.255.0",
  "gw": "192.168.4.1",
  "mac": "5e:cf:ff:06:c0:db"
 }
```
Note the Espruino IP address (192.168.4.1) for the steps below.

Using the IDE over Wifi
-----------------------

You can now connect directly from the IDE to your Espruino over Wifi. First make sure that you
really have connectivity. You can try `ping espruino`, or `ping espruino.local`,
or `ping 192.168.0.106` (with the correct IP address, of course).

You can also use a terminal window (xterm, iterm,
putty, ...) to connect to port 23 of Espruino and verify that you have the Espruino prompt.
Here I'm using command-line netcat for this:
```
$ nc espruino 23
>process.memory()
process.memory()
={ "free": 1279, "usage": 121, "total": 1400, "history": 37 }
>
```

Now on to the IDE. In the settings, pull up the communications section and in the
"Connect over TCP Address" box put the hostname and port you successfully used
with the terminal window or `nc`, e.g., `espruino.local:23`. Close the settings and connect
and you should be right there at the prompt!

If you have the default IDE configuration, it will issue a `reset()` when it connects [VERIFY]
and you may wonder how come you're still connected if it resets.
Well, `reset()` is a soft reset and does not touch the wifi.
It will close all sockets that your sketch creates, reset all pin modes, and clear memory,
but it does not touch the
socket used by the TCP connection from the IDE (or a terminal window).

Using the IDE or a terminal window you can now upload Javascript code and try out your sketch.
Once you are happy and want Espruino to start your sketch automatically at boot time, you can
use `save()` to save the sketch code (note that this is separate from `wifi.save()`, which saves
the wifi settings in a separate flash area. For a more in-depth explanation of saving your
Javascript code so it starts automatically see
[this forum thread](http://forum.espruino.com/conversations/278526).

Updating the Espruino firmware over Wifi
----------------------------------------

When a new version of Espruino becomes available you can also update the firmware itself over
Wifi assuming your esp8266 module has at least 1Mbytes of flash (i.e. this does not work
using the esp-01). The upgrade uses a small shell script provided in the [download](http://www.espruino.com/Download) zip which
performs a few HTTP requests using `curl` to upload the fresh firmware and reboot the esp8266.
Although this script is designed to be ran from a Linux command line Windows users can install [Git](https://git-scm.com/downloads) and select "Use Git and optional Unix tools from the windows command prompt" during the  installation which will allow them to run this bash script just like in linux.

Execution looks as follows (all files needed are in the downloaded zip):

```
$ sh wiflash.sh espruino.local:88 espruino_esp8266_user1.bin espruino_esp8266_user2.bin
Flashing user2.bin
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  435k    0     0  100  435k      0  42456  0:00:10  0:00:10 --:--:-- 53886
Rebooting into new firmware
Waiting for ESP8266 to come back
Success, took 16 seconds
```

Note the port 88 in `espruino.local:88` and please use the hostname or IP address you used
with the IDE or terminal program. This flashing does not wipe the wifi settings, so you should
be able to reconnect with the IDE right away. (Most of the time the IDE doesn't notice that
it got disconnected, so you probably have to disconnect and then connect again.)

Troubleshooting
---------------

Of course things never just work... Please provide feedback in the
[espruino forum](http://forum.espruino.com/conversations/279330/)
or on [gitter](https://gitter.im/espruino/Espruino)
about this tutorial and the mishaps you've had so it can be improved!
