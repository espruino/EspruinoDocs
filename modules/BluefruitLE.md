<!--- Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bluefruit LE app interface
==========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/BluefruitLE. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Adafruit,Bluefruit,Bluefruit LE,App
* USES: Only BLE

The Adafruit Bluefruit LE Connect app is an application made by Adafruit that
makes it easy to use your phone or tablet to control Adafruit Bluetooth LE devices.

* [iPhone/iPad App](https://itunes.apple.com/gb/app/adafruit-bluefruit-le-connect/id830125974)
* [Android App](https://play.google.com/store/apps/details?id=com.adafruit.bluefruit.le.connect)

While the app is designed for [Adafruit's Bluefruit LE](https://www.adafruit.com/?q=bluefruit%20le)
series of boards, most of the functionality uses the standard 'Nordic UART' Bluetooth
characteristics, which Espruino also uses for communication with the IDE.


Controller Mode
---------------

Connect to your Bluetooth Espruino device and upload the following code:

```
var fruit = require("BluefruitLE").connect();
```

The `fruit` variable will then emit the following events:

* `button` - A button on the controller is pressed or released: `{button,state:1/0}`
* `color` - A color from the color chooser: `{r,g,b}`
* `quaternion` - The angle of the phone: `{x,y,z,w}`
* `acc` - The phone's accelerometer in newtons: `{x,y,z}`
* `gyro` - The phone's gyro: `{x,y,z}`
* `mag` - The phone's magnetometer: `{x,y,z}`
* `location` - The phone's location from GPS: `{lat,long,alt}`

For instance if you want to turn an LED on or off based on button 1 in the 'Controller'
section of the app, just do:

```
var fruit = require("BluefruitLE").connect();
fruit.on('button',function(e) {
  if (e.button==1) LED.write(e.state);
});
```

The `BluefruitLE` module will detect whether the IDE or Bluefruit app is
connecting and will only enable itself if the app is connecting, so you can
still connect as normal with the IDE.

Once you've uploaded your code:

* Open the Bluefruit app
* Click on your device in the device chooser
* Click `Controller`
* Choose the type of data - for the example above scroll down and click `Control Pad`, then in the control pad menu pressing the `1` button will control `LED1`


UART Mode
---------

The Bluefruit app also supports UART mode, which will communicate directly
with Espruino's REPL without needing the `BluefruitLE` module.

* Open the Bluefruit app
* Click on your device in the device chooser
* Click `UART`
* In the text area type `LED.set()` and click `SEND`
* The LED should light up

So you can just enter JavaScript commands directly and they will be executed.

If you want to interpret the commands yourself you can do:

```
// when a device first connects, move the REPL out the way
NRF.on('connect', function(addr) {
LoopbackA.setConsole();
});
// Handle data from Bluetooth
Bluetooth.on('data', function(d) {
  if (d=="\x03") {
    // probably a Ctrl-C sent by the IDE - move the console back
    Bluetooth.setConsole();
    return;
  }

  // Handle the command here
});
```

Other modes
-----------

Other Bluefruit LE modes could be used as most of them still rely on the UART,
but the `BluefruitLE` module doesn't support them.
