<!--- Copyright (c) 2016 Kim Bauters, Gordon Williams. See the file LICENSE for copying permission. -->
Espruino Web IDE
=================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Web+IDE. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Web IDE,Editor,IDE,Install
* USES: Espruino Board,Puck.js,Espruino Pico,Pico,Espruino WiFi

The Web IDE is the preferred way to program Espruino. It's got a syntax-highlighted editor as well as support for dynamically loading modules and for upgrading Espruino's Firmware. You might want to check out [other ways of programming Espruino devices](/Programming).

Installing
----------

### From the Chrome Web Store

The easiest way to install the Web IDE is to do so via the [Chrome Web Store](https://chrome.google.com/webstore/detail/espruino-web-ide/bleoifhkdalbjfbobjackfdifdneehpo)

This video is from the [[Quick Start]] page, which contains extra information on installing the Web IDE:

[[http://youtu.be/32mewNGxax4]]

**Note:** On Windows, the Web IDE from the Chrome Web Store doesn't
support Bluetooth Low Energy, needed for communicating with Bluetooth LE
Espruino device. If you're using Windows you'll need to use the Native Application (below).

### Online

If you're only using [Puck.js](/Puck.js) on a Web Bluetooth-capable computer, you
can use the Web IDE straight from your Web Browser.

Just follow [this link to the Online Web IDE](https://www.espruino.com/ide)

**Note:**

* Windows doesn't fully support Web Bluetooth yet, so this won't work. You'll
need to install the Native application (below).
* Due to security restrictions, the online Web IDE can't access USB
devices, so you'll be unable to use it with USB Espruino boards (you need the
Native or Web Store versions).
* Web Bluetooth may not be enabled in your Browser. Have a look
at the [Puck.js Quick Start guide](/Puck.js Quick Start) for information
on how to enable it.

### As a Native application

The Web IDE is available as:

* [Download for Windows 32 bit - 0.70.4](/files/espruino_ide_win32_0v70.4.exe)
* [Download for Windows 64 bit - 0.70.4](/files/espruino_ide_win64_0v70.4.exe)

Older versions of the IDE (not recommended) [are available here](http://www.espruino.com/files/)

#### For Windows 8.1 and later

The IDE is able to use Windows' own BLE drivers. The only configuration needed
is for you to go to your system's Bluetooth settings and to click `Connect` (`Pair` on Windows 10)
on your Puck.js device. This exposes it to the system and makes sure it
shows up in the Web IDE.

#### <a id="zadig"></a>For Windows earlier than 8.1

Since Windows versions earlier than 8.1 don't support Web Bluetooth in the OS,
[noble](https://www.npmjs.com/package/noble) (which the Espruino IDE uses) has
to be able to access the BLE adaptor directly - so you have to make sure the
`WinUSB` driver is loaded for it (as opposed to a manufacturer-specific driver).

* Download [Zadig](http://zadig.akeo.ie/) and run it - it's just an executable
* Go to `Options` -> `List all Devices`
* Choose your BLE adaptor (mine is `CSR8510 A10`)
* Make sure `WinUSB` is set as the driver
* Now when you next run the Native Web IDE and click 'connect' in the top left,
you should see a list of connectable BLE devices.

#### Native applications for other platforms

If you require a native version of the IDE for other platforms, you can install
the Development version from GitHub (below):

### Locally hosted version

If you have a Raspberry Pi, you can install the [EspruinoHub](https://github.com/espruino/EspruinoHub)
software on it, which will allow you to program any Bluetooth LE Espruino devices within range
of the Pi straight from a Web Browser on any network-connected computer.

### Development version

We only update the Web IDE when we're sure that everything is working. If you want the 'Cutting Edge' version then you can [get it directly from GitHub](https://www.github.com/espruino/EspruinoWebIDE). There are detailed instructions on how to get started on that page.
