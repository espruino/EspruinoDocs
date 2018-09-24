<!--- Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Troubleshooting (Bluetooth LE)
==============================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Troubleshooting+BLE. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Troubleshooting,Trouble,Problems,Help,Broken,Not Working,BLE,Bluetooth LE,Web Bluetooth

What follows is a quick list of potential problems and solutions for Bluetooth connection
issues. **For more general problems, please look at [the main Troubleshooting page](/Troubleshooting+BLE)**

If your problem isn't covered, please post in the [Forum](http://forum.espruino.com).

* APPEND_TOC

Getting Connected
-----------------

### Web Bluetooth doesn't appear in my Web IDE connection options

* Try following [these instructions](Quick+Start+BLE#with_web_bluetooth)
* Do you have an up to date version of Chrome? (`Help` -> `About Google Chrome`) - it should be at least version 51
* You need a Bluetooth LE-capable adaptor (at least Bluetooth 4.0). If your PC doesn't have one, you can [buy one for well under $10](Quick+Start+BLE#requirements)
* **Android** needs to be at least version 6 (or version 5 with recent builds of Chromium)
* **Windows** Web Bluetooth isn't currently supported by Chrome. Check out the [Quick Start Guide](Quick+Start+BLE#windows) for more information.
* **Linux** needs Bluez 5.41 or above - [see here for instructions on how to install it](/Web Bluetooth On Linux)
* **MacOS** needs OS X Yosemite or later. Older hardware will [need an external USB dongle](Quick+Start+BLE#requirements) though - check that `Low Energy` supported in `About this Mac` -> `System Report`/`Bluetooth`  
* **Chrome OS** should work fine as long as it is up to date

### I clicked `COMx` in Windows and it's connecting but I get no response

Bluetooth LE Serial devices (Nordic UART Service) like Espruino are not treated as serial port devices by Windows. If the IDE's connection menu shows devices beginning with the word `COM` (eg. `COM5`), they are not your device and connecting to them won't work.

Check out the [Quick Start Guide](Quick+Start+BLE#windows) for more information.

### I can't see my device in the IDE in Windows

* Are you sure some other device isn't connected to it? See the next item.
* Are you **sure** you're using the [native Espruino IDE](http://www.espruino.com/Quick+Start+BLE#with-an-application) as opposed to the IDE Website or Chrome App?
* **On Windows 10**, have your paired your Puck using the built-in Windows Bluetooth menu? You need that before the IDE can see it. If you can't pair then your PC may not support Bluetooth LE (even if it supports normal Bluetooth) and you may need an exernal Bluetooth dongle.
* **On Windows 7** you'll need a [supported Bluetooth dongle](Quick+Start+BLE#requirements) that [may need setting up with Zadig](/Web+IDE#zadig)

### I can't see my device any more

Espruino BLE devices can only accept one incoming connection at a time. When a device is connected
to it, it stops advertising and so cannot be connected to until the first device disconnects.

As a result, if you can't see your device advertising then it is probably because
some other device that is connected. It may even be *an application on the same device*.

Some BLE apps on phones automatically reconnect, as do most devices if you've configured
Espruino as a [BLE HID device](Puck.js+Keyboard)).

### I can no longer connect to my device from Android

Have you been running one of the `Nordic`/`nRF` applications? If so, make sure
it is closed (Click the square icon to get to the application chooser, and swipe
the application to the left or right)


### I can't reconnect to my device on Mac OS

This often happens if you've turned your Espriuno into a [HID device](/Puck.js+Keyboard) and paired it with your Mac.

* Close the Web Browser window that had the Web IDE in it
* Hold the `option` key down while clicking on the Bluetooth icon in the top right menu bar.
* You should see something like `Puck.js abcd` in bold on the drop-down list
* Click on it, and you'll see menu options for `Disconnect` and `Remove`
* Click `Remove`
* Open up the [Web IDE](/ide) in Chrome and try connecting again


### I can't connect to my device with Chrome on Linux

First, make sure you have an up to date version of Bluez installed - see [the Web Bluetooth on Linux page](/Web+Bluetooth+On+Linux)

Web Bluetooth on Chrome for Linux isn't officially supported by Google, so
it can be a bit unstable.

* **If you can connect but can't receive any data**, disconnect, then run
`sudo /etc/init.d/bluetooth restart` and try and reconnect.
* **If you can't find any devices via Web Bluetooth** click on the Bluetooth
notification icon in Linux so that a window pops up showing devices within
range. This is often enough to Web Bluetooth to find your devices.


### I can see the device, but can't connect to it.

[Update your device's firmware](#how-do-i-update-the-firmware-)
to the most recent version - the very first firmware versions
for Puck.js especially could have issues with some computers.

**Note:** Non-Puck.js devices ship with much later firmware (1v90 and later) so
are less likely to have these problems. It's always an idea to use the
latest firmware though.

Also see below:

### I used to be able to connect, but now I can't

* Check out "[I can't see my device any more](#i-can-t-see-my-device-any-more)"
* Is your device battery powered? Check the battery voltage! Often a flat battery can provide
enough power to advertise a Bluetooth LE device, but not enough to sustain a connection.
* Check out "[I saved some code and my device no longer works](#i-saved-some-code-and-my-device-no-longer-works)"

Device-specific
---------------

### How do I update the firmware?

Check out the specific instuctions on your device's page:

* [Puck.js](/Puck.js#firmware-updates)
* [Pixl.js](/Pixl.js#firmware-updates)
* [MDBT42Q](/MDBT42Q#firmware-updates)
* [Thingy:52](/Thingy52#firmware-updates)
* [nRF52832DK](/nRF52832DK#firmware-updates)
* [RuuviTag](/RuuviTag#firmware-updates)

### I can't get the battery out

If using a device like Puck.js or Pixl.js with a CR2032 battery, poke it with
something nonconductive from behind, like a matchstick.

If you just want to reset your Puck.js you can also lift the battery away from the PCB
slightly with a fingernail (although this doesn't work on [Pixl.js](/Pixl.js)).


[Puck.js](/Puck.js)
-------

### My Puck.js is not working when it arrives

Puck.js is assembled with a **clear plastic tab** between the battery
and PCB to keep it turned off.

See [here](/Puck.js#turning-puck-js-on) for instructions on removing it.

### When I insert the battery the green light comes on

This is because you're pressing the button down while putting it in. Try inserting the battery without the button pressed.

### When I insert the battery the red light comes on

You're in bootloader mode. You get to this when you press the button while inserting the battery and then release it.

To get out, just take the battery out and re-insert it without pressing the button.

### I disassembled my Puck.js and now the button won't click

Take it apart again, and place the area on the back with the text `Puck.js`
against the ledge on the plastic case (the dimples in the case should
align with the holes in the PCB).

[Pixl.js](/Pixl.js)
-------

### I'm no longer seeing text I print on the LCD

Anything from `print` or `console.log` is printed to the current console
device (set with `TheDevice.setConsole()`. By default, this will be the LCD
(eg. `Terminal.setConsole()`).

However:

* If you're connected to Pixl.js via Bluetooth, the console will automatically
move to the Bluetooth connection.
* If a (serial port has been detected at boot)[/Pixl.js#serial-console], the
console will automatically be moved to that.

To force the console back to the LCD you can use `Terminal.setConsole()`
(eg. in the `onInit` function) which will keep the console on the LCD
until something (like a Bluetooth connection) changes it. Otherwise you
can use `Terminal.setConsole(true)` which will keep the console on the LCD
regardless of what happens. This second method will mean that you are
unable to reprogram the device until it is reset or the console is set
to the device you're programming it from.

If you just want to write to the Terminal regardless of where the console is,
use `Terminal.println(...)`


Using your device
-----------------

### When I disconnect the battery or reset, my code is lost. How do I save it?

It's as easy as typing `save()` in the left-hand side of the IDE. When power is re-applied Espruino will resume where it left off, remembering timers, watches, and even pin state. For certain things (like initialising connected hardware like displays) you'll want to run some code when Espruino starts up, in which case you can just add a function called `onInit()` or a listener for `E.on('init', ...)` - it will then be executed each time Espruino starts.

For more information, see the [page on Saving](/Saving).

### I saved some code and my device no longer works

The easiest solution for this is to perform a Hard Reset, as firmware updates
may not clear out saved code:

* [Puck.js Hard Reset](/Puck.js#hard-reset)
* [Pixl.js Hard Reset](/Pixl.js#hard-reset)
* [MDBT42Q Hard Reset](/MDBT42Q#hard-reset)

On most boards booting with BTN1 held down will usually boot without loading
the saved code. However it won't have deleted your saved code. To do that,
you'll need to log in and:

* On 1v99 and later firmware type `reset(true)` to clear out any saved code
* On old firmwares type `save()` after a fresh boot to save a 'fresh' state
* You can also type `require("Storage").eraseAll()`, as this will
clear any saved code, but will also remove any data that your code
may have saved using the [Storage Library](/Reference#Storage)

### How can I change my Device's name?

Check out the reference pages for [NRF.setAdvertising](https://www.espruino.com/Reference#l_NRF_setAdvertising)...

You can simply call `NRF.setAdvertising({},{name:"My Name"});` to change your Puck's advertised name!


<a name="console"></a>
### My code works when I'm connected via Bluetooth but stops when I disconnect

Are you using `Serial1`? Perhaps to connect to a GSM/LTE, WiFi, or GPS?  When disconnected from Bluetooth, Espruino's REPL/'console' (what's on the left-hand side of the Web IDE) gets moved over to `Serial1` *if it has been initialised*. If you've got a [Serial](/USART) device on those pins then it will then stop working.

To fix this, right at the top of your code that runs on initialisation (eg. the `onInit` function or `E.on('init', ...)` event), add the line `Bluetooth.setConsole()`, which will force the console onto Bluetooth. After `Bluetooth.setConsole()`, the console can still automatically move back to `Serial1` if there is some event that forces it (Bluetooth connect and disconnect), so you can *force* the console to stay on Bluetooth regardless with `Bluetooth.setConsole(true)` instead.



Something else is wrong!
-------------------------

Check out the [main Troubleshooting page](/Troubleshooting) and also the [Espruino Forums](http://forum.espruino.com/)
