<!--- Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bangle.js Troubleshooting
=========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Troubleshooting+Bangle.js. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Troubleshooting,Trouble,Problems,Help,Broken,Not Working,bank0,bank0 invalid

What follows is a quick list of potential problems and solutions. If your problem isn't covered here, please
[check out the Bangle.js Wiki's FAQ](https://github.com/espruino/BangleApps/wiki) and if you don't find an
answer there, post in the [Bangle.js Forum](http://forum.espruino.com/microcosms/1424/).

Please also check out the [Bluetooth specific troubleshooting page](http://www.espruino.com/Troubleshooting+BLE)

* APPEND_TOC


### I can't connect to my Bangle.js

First, you can check your computer is capable of Web Bluetooth by [going to the Web IDE](https://www.espruino.com/ide/),
clicking the connect icon up the top right, then the `Status` link in the menu that pops up.

In addition:

* If you paired Bangle.js in the Bluetooth settings of any of your devices, make sure to unpair it.
* Ensure `HID` is `Off`, and `BLE` and `Programmable` are set to `On` in the `Settings` screen.
* On Bangle.js 1: Hold `BTN1` and `BTN2` for 5 seconds to force a full software reset of Bangle.js: https://www.espruino.com/Bangle.js#resetting
* On Bangle.js 2: Hold `BTN1` for 6 seconds until the screen changes to show blocky text to force a full software reset of Bangle.js: https://www.espruino.com/Bangle.js2#resetting
* On Mac OS Big Sur, it may help to go to your Mac's Bluetooth Widget (in the toolbar), choose `Bluetooth Preferences`, then remove the Bangle.js from the list of devices if it has appeared in there.

Then go to https://banglejs.com/apps and connect using the window provided by the Web Browser.


### My Bangle.js isn't charging

Is the charge lead the wrong way around? With Bangle.js facing away from you (so you're looking at the heart rate monitor) and the buttons are to the left, the USB cable should exit from the **left** side of the watch.


### My Bangle.js no longer boots to the clock

This may be because the JS bootloader has been overwritten, which can
be done if you use `Save to Flash` to write code in the IDE.

* Go to https://banglejs.com/apps
* Connect (top right) then click to uninstall and reinstall the [`Bootloader` app](https://banglejs.com/apps/?id=boot)
* If that fails, you can click `More... -> Install default apps` which will erase everything and return Bangle.js to default


### I can't get a GPS fix / GPS doesn't seem to be working

When you get the Bangle (or after it has run out of battery and been recharged) the GPS is in a 'fresh' state. It has no idea of the time or where it is in the world. It can take 5-10 minutes with a GPS app running **outside** or on a windowsill in order to get a fix. After having got an initial fix the GPS will be significantly faster at getting a fix next time.

You can use the [Assisted GPS Updater](https://banglejs.com/apps/?id=assistedgps) from the App Loader which will pre-load GPS position/correction information that will stay valid for a few days. This will drastically reduce the time taken to get a GPS lock.

**Why?** Phones and internet-connected GPS devices use AGPS (A=Assisted). They use the time and rough location info from mobile phone masts to help them get a fix much faster. Since Bangle.js doesn't have that info it's working from first principles and it can take a while to get a lock (just like any other standalone GPS device).


### What is the difference between an app, a clock, a widget?

An app is a piece of code which is launched manually or triggered by another app. Only one app runs at the same time.

Clock is a specific app which is launched at startup. The clock app could be selected in settings menu.

A widget is a piece of code which could run in background like a pedometer. Several widgets can run at the same time in addition to an app.


### I did a firmware update and now Bangle.js hangs showing `BANK0 INVALID`

This means that the firmware update has failed and the Bangle's firmware is broken.

It's easy enough to fix though - the bootloader still works, so just follow the instructions on https://www.espruino.com/Firmware+Update#nrf52 to perform a DFU update.


### I have another problem

Please [check out the Bangle.js Wiki's FAQ](https://github.com/espruino/BangleApps/wiki) for more suggestions, or failing that post in the [Bangle.js Forum](http://forum.espruino.com/microcosms/1424/)

