<!--- Copyright (c) 2016 Kim Bauters, Gordon Williams. See the file LICENSE for copying permission. -->
Espruino Web IDE
=================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Web+IDE. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Web IDE,Editor,IDE,Install,Tools
* USES: Espruino Board,Puck.js,Espruino Pico,Pico,Espruino WiFi

The Web IDE is the preferred way to program Espruino. It's got a syntax-highlighted editor as well as support for dynamically loading modules and for upgrading Espruino's Firmware. You might want to check out [other ways of programming Espruino devices](/Programming).

Installing
----------

### Online

The easiest way to use the Web IDE is [straight from the Web Browser](https://www.espruino.com/ide)

You'll need an up to date version of [Chrome](https://www.google.com/chrome/), Edge or Opera to get access to Web Bluetooth and
Web Serial options.

**Note:**

* Versions of Windows before Windows 10 don't support Web Bluetooth. You'll
need to install the Native application (below).
* Web Bluetooth and Web Serial may not be enabled in your Browser by default. Have a look
at the [Quick Start guide](/Quick+Start) for information on how to enable it.


### From the Chrome Web Store

You can install the IDE from the [Chrome Web Store](https://chrome.google.com/webstore/detail/espruino-web-ide/bleoifhkdalbjfbobjackfdifdneehpo)

This video is from the [[Quick Start]] page, which contains extra information on installing the Web IDE:

[[http://youtu.be/32mewNGxax4]]

**Note:**
* Google has deprecated the Chrome Web Store and will be removing it at some point, so this installation method may not be available soon.
* On Windows 8 and earlier, the Web IDE from the Chrome Web Store doesn't support Bluetooth Low Energy, needed for communicating with Bluetooth LE
Espruino device. If you're using Windows you'll need to use the Native Application (below).


### As a Native application

The Web IDE is available as:

* [Download for Windows 32 bit - 0.75.8](/files/espruino_ide_win32_0v75.8.exe)
* [Download for Windows 64 bit - 0.75.8](/files/espruino_ide_win64_0v75.8.exe)

Older versions of the IDE (not recommended) [are available here](http://www.espruino.com/files/)

#### For Windows 8.1 and later

The Native IDE is able to use Windows' own BLE drivers. The only configuration needed
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
