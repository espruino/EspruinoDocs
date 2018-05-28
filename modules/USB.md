<!--- Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
USB and USB HID
=============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/USB. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: USB,HID,Human Interface Device,VCP,CDC,Mouse,Keyboard,Joystick

Both the [Espruino Board](/Original) and the [[Pico]] have USB ports. When connected to a PC, they appear as a Virtual Communications Port (VCP) - as if you plugged in a USB-Serial converter dongle. On that port there's the console interface, which allows you to write code on Espruino using nothing more than a simple serial terminal.

However Espruino [[Pico]] **also contains** a [USB HID mode](http://en.wikipedia.org/wiki/USB_human_interface_device_class). This means that when set up, it can appear to be a USB Human Interface device such as a Mouse, Keyboard, or Joystick in addition to a Virtual Com Port.

To set this up, you need to use the [`E.setUSBHID`](/Reference#l_E_setUSBHID) function to set up the USB report descriptor for the USB HID device you want to emulate. In order to make this less painful, we've provided some modules to handle this for you.

**Note:** To use USB HID, you must unplug the Espruino board and then plug it back in. This means you'll need to run the `save()` command to save the code to your Espruino first, so that it isn't lost when the power goes off.

Keyboard
-------

Handled by the [[USBKeyboard.js]] module.

```
var kb = require("USBKeyboard");

setWatch(function() {
  kb.setModifiers(kb.MODIFY.SHIFT, function() {
    kb.type("HELLO WORLD", function() {
      kb.setModifiers(0, function() {
        kb.tap(kb.KEY.ENTER); 
      });
    });
  });
}, BTN, {debounce:100,repeat:true, edge:"rising"});
```

You could for instance store temperature readings, and then output them as keypresses when the button is pressed:

```
var kb = require("USBKeyboard");

var data = [];

setInterval(function() {
  if (data.length>=40) data = data.slice(-39);
  data.push(E.getTemperature());
}, 1000);

function outputData() {
  var i = 0;
  function outputLine() {
    if (i>=data.length) return;
    var s = data[i++].toFixed(2) + ",\n";
    kb.type(s, outputLine);
  }
  outputLine();
}

setWatch(outputData, BTN, {debounce:100,repeat:true, edge:"rising"});
```

Mouse
-----

Handled by the [[USBMouse.js]] module.

```
var mouse = require("USBMouse");

// When the button is pressed, move the mouse south-east by 20px
setWatch(function() {
  mouse.send(20, 20, mouse.BUTTONS.NONE); // X movement, Y movement, buttons pressed
}, BTN, {debounce:100,repeat:true, edge:"rising"});
```


Tablet
-----

Handled by the [[USBTablet.js]] module.

```
var tab = require("USBTablet");

// When the button is pressed, mouse the cursor in a circle around the screen
setWatch(function() {
  var p = 0;
  var intr = setInterval(function() {
    tab.send((Math.sin(p)+1)/2, (Math.cos(p)+1)/2, tab.BUTTONS.NONE);
    p += 0.02;
    if (p>Math.PI*2) clearInterval(intr);
  }, 10);
}, BTN, {debounce:100,repeat:true, edge:"rising"});
```


Other devices
------------

Other USB HID input devices can be emulated by providing the correct USB Report Descriptor (which you will have to find out or create). See the modules above for examples, as well as the [USB.org HID page](http://www.usb.org/developers/hidpage).

Note that USB MIDI is an Audio device - not a USB HID device - and so currently it is not supported.
