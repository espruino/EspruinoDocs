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
* Hold `BTN1` and `BTN2` for 5 seconds to force a full software reset of Bangle.js: https://www.espruino.com/Bangle.js#resetting
* On Mac OS Big Sur, it may help to go to your Mac's Bluetooth Widget (in the toolbar), choose `Bluetooth Preferences`, then remove the Bangle.js from the list of devices.

Then go to https://banglejs.com/apps and connect using the window provided by the Web Browser.


### My Bangle.js isn't charging

Is the charge lead the wrong way around? With Bangle.js facing away from
you (so you're looking at the shiny back) and the `CE Rohs` text the right way
up, the USB cable should exit from the **left** side of the watch.


### I can't upload apps, and the IDE just says `-> Terminal` when connected

On Firmwares shipped on KickStarter Bangle.js there was a bug. Please leave `Debug Info` set to `Hide` (the default) in Bangle.js's `Settings`, then update to the latest Bootloader version using https://banglejs.com/apps (which will allow everything to work even with `Debug Info` set to `Show`).


### My Bangle.js no longer boots to the clock

This may be because the JS bootloader has been overwritten, which can
be done if you use `Save to Flash` to write code in the IDE.

* Go to https://banglejs.com/apps
* Click `More... -> Install default apps` which will erase everything and return Bangle.js to default (or try installing just `Bootloader` from library)


### My Bangle shows `Searching for GPS Time` for a second after a hard reboot.

This is expected. If you do a hard reset (BTN1 + BTN2) or the battery goes flat, Bangle.js loses the time. However, if you've ever had a GPS lock in the past, as long as the battery didn't go flat the GPS receiver will still have the correct time.

So when Bangle.js starts it sees the time isn't set, then it asks the GPS receiver if it has the time, and if it does, it uses it to set the time up. If the GPS receiver didn't have the time then your clock will stay set at midnight, 1970.


### My Bangle is stuck showing `Searching for GPS Time`

This may seem like a GPS issue, but the culprit is usually that an app/widget on the Bangle either has an error or that the Bangle runs out of memory.

* Force a [reset of Bangle.js without loading code](https://www.espruino.com/Bangle.js#resetting-without-loading-any-code)
* Go to https://banglejs.com/apps
* Click `More... -> Install default apps` which will erase everything and return Bangle.js to default


### Settings won't change / Welcome screen keeps appearing

This is a known issue with the 2v05 firmware that Bangle.js initially shipped with. The filesystem could occasionally get corrupted and the contents of files can not be changed.

* `More... -> Install default` from https://banglejs.com/apps will temporarily fix the problem
* However installing [the latest firmware](https://www.espruino.com/Bangle.js#firmware-updates) will stop it from happening again
* You'll still have to 'Install default apps' after installing new firmware


### I can't get a GPS fix / GPS doesn't seem to be working

When you get the Bangle (or after it has run out of battery and been recharged) the GPS is in a 'fresh' state. It has no idea of the time or where it is in the world. It can take 5-10 minutes with a GPS app running **outside** or on a windowsill in order to get a fix. After having got an initial fix the GPS will be significantly faster at getting a fix next time.

You can now install the [AGPS App](https://banglejs.com/apps/#agps) from the App Loader which will pre-load GPS position/correction information that will stay valid for a few days. This will drastically reduce the time taken to get a GPS lock.

**Why?** Phones and internet-connected GPS devices use AGPS (A=Assisted). They use the time and rough location info from mobile phone masts to help them get a fix much faster. Since Bangle.js doesn't have that info it's working from first principles and it can take a while to get a lock (just like any other standalone GPS device).

### Bangle.js keeps entering the Launcher or Settings menu

The Launcher is entered from the Clock if you press `BTN2`. Since by default
`BTN2` wakes Bangle.js up, simply pressing it twice in quick succession will enter
the Launcher. Since `Settings` is usually the first menu item, a third click of
`BTN2` will bring you to `Settings`.

To stop this, go to `Settings`, then `LCD`, then `Wake on BTN2` and turn it to `Off`.
You can also turn off `Wake on Twist` as well.

Now, the only way to get to settings is to press `BTN1` or `BTN3` to wake the clock,
and then `BTN2` - which is much less likely to happen accidentally.

### What is the difference between an app, a clock, a widget?

An app is a piece of code which is launched manually or triggered by another app. Only one app runs at the same time.

Clock is a specific app which is launched at startup. The clock app could be selected in settings menu.

A widget is a piece of code which could run in background like a pedometer. Several widgets can run at the same time in addition to an app.

### I did a firmware update and now Bangle.js hangs showing `BANK0 INVALID`

This means that the firmware update has failed and the Bangle's firmware is broken.

It's easy enough to fix though - the bootloader still works, so just follow the instructions on https://www.espruino.com/Firmware+Update#nrf52 to perform a DFU update.
