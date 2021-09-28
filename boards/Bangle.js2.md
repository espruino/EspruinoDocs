<!--- Copyright (c) 2019 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bangle.js 2
============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bangle.js2. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Espruino,Official Board,nRF52832,nRF52,Nordic,Board,Bluetooth,BLE,Bluetooth LE,Graphics,Bangle.js,Bangle,Banglejs,Smartwatch,Watch

Bangle.js is the successor to [Bangle.js](/Bangle.js), and is based on the
[SMA Q3](https://hackaday.io/project/175577-hackable-nrf52840-smart-watch).

**[Bangle.js 2 is now on KickStarter!](https://www.kickstarter.com/projects/gfw/banglejs-2-the-open-smart-watch)** 

------------------------

[Development versions of Bangle.js 2 are now available in our shop](https://shop.espruino.com/banglejs2-dev)

------------------------

[![](Banglejs2/main.jpg)](https://www.kickstarter.com/projects/gfw/banglejs-2-the-open-smart-watch)

**Bangle.js 2 is an open, hackable smartwatch**

You can easily install new apps from the web or develop your own using JavaScript or a graphical programming language (Blockly). All you need is a Web Browser (Chrome, Edge or Opera) and you can upload apps or write code to run on your watch wirelessly! Bangle.js is waterproof and AI enabled and comes with Bluetooth Low Energy, GPS, a heart rate monitor, accelerometer and more.


Features
--------

* IP67 Waterproof (up to 1 meter for 30 minutes)
* Nordic 64MHz nRF52840 ARM Cortex-M4 processor with Bluetooth LE
* 256kB RAM 1024kB on-chip flash, 8MB external flash
* 1.3 inch 176x176 always-on 3 bit colour LCD display (LPM013M126)
* Full touchscreen
* GPS/Glonass receiver (AT6558)
* Heart rate monitor (Vcare VC31)
* 3 Axis Accelerometer (Kionix KX023)
* 3 Axis Magnetometer
* Air Pressure/Temperature sensor (Bosch BMP280)
* Vibration motor
* 200mAh battery, 2 weeks standby time
* 36mm x 43mm x 12mm watch body, with standard 20mm watch straps


Pre-release hardware
--------------------

This is pre-release hardware at the moment and there are a few things you should be aware of:

* The 'Developer Edition' Bangle.js devices **are not water resistant**
* Many Bangle.js 1.0 apps don't work yet. Many apps will be updated, and the app loader will eventually ask which device you're using and filter accordingly, but for now use the search keyword `b2` to find apps known to work: https://banglejs.com/apps/#b2
* The standard `notify` library does not work on Bangle.js 2 as it uses features specific to Bangle.js 1's LCD driver. To make `Gadgetbridge` function you'll need to install `Gadgetbridge` then uninstall `Notifications` (`notify`) and install `Fullscreen Notifications` (`notifyfs`)


Quick Usage Notes
-----------------

There are a few things to know that'll really help you get started quickly:

* Long-pressing the one button will take you back to the default clock app
* The touchscreen is only active when the lock symbol isn't displayed in the top left hand corner. Unlocking can be configured in several ways but the easiest is just to press the button.
* In the default launcher, drag the screen to scroll, and tap the icon you want to launch
* **In text menus, you don't need to tap on the text line to select it.** Instead, drag your finger up and down to change the selected entry, and then **tap anywhere** to select.


Power Consumption
-----------------

* Idle, accelerometer on 12.5Hz - 0.9mA
* Idle, accelerometer on 1.25Hz - 0.75mA (default if not moved)
* BLE Connected in high bandwidth mode - 1.25mA
* Compass on - 1.0mA (+0.1mA)
* Heart rate monitor on - 5.5mA (+4.5mA)
* 100% CPU usage running JavaScript - 4.1mA (+3mA)
* GPS on - 26mA (+25mA)
* LCD touchscreen enabled (unlocked) - 3.8mA (+2.5mA)
* LCD backlight on - 17mA (+16mA)
* Turned off - 0.04mA

Right now you can expect around 10 days of battery life with a clock that
updates once a minute. 

**Note:** These figures are based on latest Bangle.js firmware and power usage 
when idle **will** decrease substantially in the future.


Charging
--------

The supplied charge cable connects to a USB port to charge Bangle.js (despite there
being 4 wires, those are for SWD programming and there is no USB data connection).

**The cable is magnetic and the wires are connected directly to USB power.** Do
not leave your cable plugged in or it might attract itself to the nearest
magnetic (probably conductive) object and short out.


Powering off
------------

* Enter the launcher by pressing the button to unlock, then pressing it again to enter the launcher (while showing a clock)
* Tap on `Settings`
* Scroll down to `Turn off` and tap again


Apps
----

Apps are provided by the [same Bangle.js app loader](https://banglejs.com/apps/#b2) as for Bangle.js 1.

Right now compatible apps are tagged with `b2` and incompatible apps are tagged with `nbo2`. You can use the link `https://banglejs.com/apps/#b2` to see apps which are designed to work on Bangle.js 2.


Resetting
----------

* Long-press the button for about 6 seconds until the screen displays some pixellated text on the top line
* Release the button
* Bangle.js will boot as if it just turned on normally

If you the button too late you'll enter bootloader mode, in
which case you need to wait for 30 seconds for the watch to
automatically exit.


Resetting without loading any code
-----------------------------------

If you uploaded some code that runs at startup and breaks Bangle.js you may need to do this.

It won’t delete anything, so unless you fix/remove the broken code (see "Deleting all Code") Bangle.js will remain broken next time it restarts.

* Hold the button down. After around 6 seconds the screen goes blank and displays some pixellated text
* Keep pressing the button while `====` goes across the screen
* Keep holding the button while Bangle.js boots
* You should now have the Bangle.js logo, version, and MAC address on screen, and you can release the button


Deleting all code
-----------------

You can do this either while your watch is in its normal state, or
if you have reset it without loading any code (above).

### Either:

* Go to https://banglejs.com/apps
* Click `About -> Install default apps`

This will erase everything and install just the default apps.

### Or:

* Go to https://banglejs.com/apps
* Go to `About -> Remove All Apps`
* Re-install `Bootloader` and a `Clock` from `Library`


Deleting apps
-------------

* If you can access the menus on your device and the `App Manager` app is installed, you can delete apps using the `App Manager`
* You can go to https://banglejs.com/apps and click `Connect`. Under `My Apps` your installed apps are listed, and you can click the 'Bin' icon next to them to remove them
* If you hit any issues with installed apps and can't access the menus on your device, then follow the instructions above for "Resetting without loading any code" above.


Tutorials
--------

In general, most tutorials related to Bangle.js 1 should work on Bangle.js 2,
as long as you're aware that you only have one button and the screen resolution
is different - see below under `Information`.

Upon release, specific Bangle.js 2 tutorials will be added here.

* For general help with Bangle.js, see the [Bangle.js Getting Started Guide](/Bangle.js+Getting+Started)
* To get your computer connected, check out the [Espruino Getting Started Guide](/Quick+Start+BLE#banglejs)
* To get started with development see the [Bangle.js Development page](/Bangle.js+Development)
* There is more technical information below about using the [LCD](#lcd) and [onboard peripherals](#onboard)

Tutorials using Bangle.js:

* APPEND_USES: Bangle.js

Tutorials using Bluetooth LE:

* APPEND_USES: Only BLE,-Bangle.js

Tutorials using Bluetooth LE and functionality that may not be part of Bangle.js:

* APPEND_USES: BLE,-Only BLE,-Bangle.js

There are [many more tutorials](/Tutorials) that may not be specifically for
you device but will probably work with some tweaking. [Try searching](/Search)
to find what you want.

Information
-----------

* For detailed technical information about Bangle.js, check out [the Bangle.js Technical Information page](/Bangle.js+Technical)
* There's a [Bangle.js API reference here](https://banglejs.com/reference) - however this is currently missing some Bangle.js 2 functionality
* Links to [CE](/files/Bangle.js-CE.pdf), [FCC ID 2AILG-F18](/files/Bangle.js-FCC.pdf) and [RoHS](/files/Bangle.js-RoHS.pdf) Certifications
* Links to shipping documentation: [Classification](/files/Bangle.js-shipping.pdf), [Battery UN38.3](/files/Bangle.js-UN38.3.pdf) and [Battery MSDS](/files/Bangle.js-MSDS.pdf)


<a name="lcd"></a>LCD Screen
---------------------------------

Bangle.js displays the REPL (JavaScript console) if `Debug Info: show` has
been set in settings. If enabled, any calls like `print("Hello")` or `console.log("World")` will output
to the LCD when there is no computer connected via Bluetooth. Any errors generated when there is no
connection will also be displayed on the LCD.

### Graphics

You can output graphics on Bangle.js's display via the global variable `g`
that is an instance of the [Graphics class](/Reference#Graphics). Unlike Bangle.js 1,
the display is buffered so changes to the display will only take effect when you call
`g.flip()` *or* your code finishes executing and Bangle.js returns to idle.

```
// Draw a pattern with lines
g.clear();
for (i=0;i<64;i+=7.9) g.drawLine(0,i,i,63);
g.drawString("Hello World",30,30);
```

### Menus

Bangle.js comes with a built-in menu library that can be accessed with the [`E.showMenu()`](/Reference#l_E_showMenu) command.

[`E.showPrompt()`](/Reference#l_E_showPrompt) and [`E.showMessage()`](/Reference#l_E_showMessage) can also be used for simple
prompts and full-screen messages.

```
// Two variables to update
var boolean = false;
var number = 50;
// First menu
var mainmenu = {
  "" : {
    "title" : "-- Main Menu --"
  },
  "Beep" : function() { Bangle.beep(); },
  "Buzz" : function() { Bangle.buzz(); },
  "Submenu" : function() { E.showMenu(submenu); },
  "A Boolean" : {
    value : boolean,
    format : v => v?"On":"Off",
    onchange : v => { boolean=v; }
  },
  "A Number" : {
    value : number,
    min:0,max:100,step:10,
    onchange : v => { number=v; }
  },
  "Exit" : function() { E.showMenu(); },
};
// Submenu
var submenu = {
  "" : {
    "title" : "-- SubMenu --"
  },
  "One" : undefined, // do nothing
  "Two" : undefined, // do nothing
  "< Back" : function() { E.showMenu(mainmenu); },
};
// Actually display the menu
E.showMenu(mainmenu);
```

See http://www.espruino.com/graphical_menu for more detailed information.



### Terminal

Bangle.js's LCD acts as a VT100 Terminal. To write text to the LCD regardless of
connection state you can use `Terminal.println("your text")`. Scrolling
and simple VT100 control characters will be honoured.

You can even move the JavaScript console (REPL) to the LCD while connected
via Bluetooth, and use your bluetooth connection as a simple keyboard using
the following commands:

```
Bluetooth.on("data",d=>Terminal.inject(d));
Terminal.setConsole();
```

<a name="onboard"></a>On-device Peripherals
------------------------------------------------------

Most peripherals on the device are accessible via fields
and events on the [Bangle](https://banglejs.com/reference#t_Bangle) object.

### Touchscreen

Bangle.js 2 has a full touchscreen.

`Bangle.on('touch', function(zone,e) { ... });` will call the function
with `e` as an object containing `{x,y}` every time the screen is tapped (when unlocked).

`Bangle.on('drag', function(e) { ... });` will call the function
with `e` as an object containing `{x,y,dx,dy,b}` whenever a finger
is dragged over the screen. `b` is 0 when the finger is lifted
or `1` when pressed.

### LED

There are two 'fake' LED variables called `LED1` and `LED2` that create red and
green fake LEDs at the top of the watch screen - these serve no purpose other
than to allow tutorials for existing Espruino boards to be used.

If you want to control the backlight LED use `Bangle.setLCDBrightness`.


### Vibrate

`Bangle.buzz()` will make Bangle.js's vibration motor turn on. It takes optional
time and strength arguments, and returns a promise. [See the reference](http://www.espruino.com/Reference#l_Bangle_buzz).

For example:

```
Bangle.buzz().then(()=>{
  return new Promise(resolve=>setTimeout(resolve,500)); // wait 500ms
}).then(()=>{
  return Bangle.buzz(1000);
}).then(()=>{
  console.log("Done");
});
```

Will do a short buzz followed by a long buzz and will print `Done` when finished.

### Sound

You can use `Bangle.beep()` in much the same way as `.buzz` above to make sounds. [See the reference](http://www.espruino.com/Reference#l_Bangle_beep).

To output an entire scale of notes, you could do:

```
Bangle.beep(200,207.65*8).then(
()=>Bangle.beep(200,220.00*8)).then(
()=>Bangle.beep(200,246.94*8)).then(
()=>Bangle.beep(200,261.63*8)).then(
()=>Bangle.beep(200,293.66*8)).then(
()=>Bangle.beep(200,329.63*8)).then(
()=>Bangle.beep(200,369.99*8)).then(
()=>Bangle.beep(200,392.00*8)).then(
()=>Bangle.beep(200,440.00*8));
```

**Note:** Bangle.js 2 does not contain a piezo speaker, but instead uses the
vibration motor for sound. This means that while you can get some sound,
it is extremely weak.

### Buttons

There is just one button on Bangle.js - called `BTN` or `BTN1` in code.

* You can access a button's state with `digitalRead(BTN1)` or `BTN1.read()`
(the two commands are identical). `BTN` is also defined, and is the same as `BTN1`.
* Polling to get the button state wastes power, so it's better to use `setWatch`
to call a function whenever the button changes state:

```
setWatch(function() {
  console.log("Pressed");
}, BTN, {edge:"rising", debounce:50, repeat:true});
```


### Accelerometer

The accelerometer runs all the time and produces `accel` events on the
`Bangle` object.

```
Bangle.on('accel', function(acc) {
  // acc = {x,y,z,diff,mag}
});
```

See [the reference](https://banglejs.com/reference#t_l_Bangle_accel) for
more information.

#### Gestures

When a sudden movement is detected, the accelerations in it are recorded
and a [`gesture` event](https://banglejs.com/reference#l_Bangle_gesture)
is created.

If `.tfmodel` and `.tfnames` files are created in storage, Tensorflow
AI will be run on the model with the gesture information and an
[`aiGesture`](https://banglejs.com/reference#l_Bangle_aiGesture) event
will be created with the name of the detected gesture.

### Compass

The compass can be turned on with `Bangle.setCompassPower(1)` and when
enabled, `mag` events are created 12.5 times a second:

```
Bangle.setCompassPower(1)
Bangle.on('mag', function(mag) {
  // mag = {x,y,z,dx,dy,dz,heading}
});
```

See [the reference](https://banglejs.com/reference#t_l_Bangle_mag) for
more information.

### Barometer / air pressure sensor

To use the barometer, you can either request one pressure value:

```
Bangle.getPressure().then(print)
// prints this after ~1 sec
// { "temperature": 23.03918464465, "pressure": 1005.56287398937, "altitude": 64.19805781010 }
```

Or can request to be notified on each new reading:

```
Bangle.setBarometerPower(true)
Bangle.on('pressure', print)
// prints...
{ "temperature": 23.14690527655, "pressure": 1005.79911673786, "altitude": 62.21919777595 }
{ "temperature": 23.14200888113, "pressure": 1005.84599901953, "altitude": 61.82653852506 }
{ "temperature": 23.14200888113, "pressure": 1005.79091150423, "altitude": 62.28792165657 }
{ "temperature": 23.14690527655, "pressure": 1005.79911673786, "altitude": 62.21919777595 }
```

See [the reference](https://banglejs.com/reference#t_l_Bangle_getPressure) for
more information.

### GPS

The GPS can be turned on with `Bangle.setGPSPower(1)` and when
enabled, `GPS` events are created once a second:

```
Bangle.setGPSPower(1)
Bangle.on('GPS', function(gps) {
  // gps = {lat,lon,alt,speed,etc}
});
```

`GPS-raw` events are also created containing a String for each
NMEA line that comes from the GPS receiver. These contain far more
detailed information from the GPS.

See [the reference](https://banglejs.com/reference#l_Bangle_GPS) for
more information.


Hardware SWD
------------

Bangle.js 2 has the hardware SWD pin brought out on the back of the watch along with the charging pins:

![](Banglejs2/SWD.jpg)

This can be connected to an SWD programmer. We'd recommend using an [nRF52 DK](https://www.nordicsemi.com/Products/Development-hardware/nrf52-dk) (or nRF52840DK). 
When using the nRF52DK you'll need to short the `GND DETECT` pin to `GND` to tell it you're programming the Bangle.js and not the on-board nRF52.

![](Banglejs2/nRF52DK.jpg)

The easiest way to connect to these is to use the provided USB charge cable and to wire up a USB type A socket:

| Pin # | Connect |
|-------|---------|
| 1     | 5v (not required) |
| 2     | SWDIO   |
| 3     | SWDCLK  |
| 4     | GND     |



Other Official Espruino Boards
------------------------------

* APPEND_KEYWORD: Official Board
