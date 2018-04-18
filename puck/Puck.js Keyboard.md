<!--- Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Puck.js and HID Keyboards
=========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Puck.js+Keyboard. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Modules,BLE,Bluetooth,Keyboard,Control,Mouse,HID,Human Interface Device
* USES: Puck.js,BLE,Only BLE

Bluetooth LE HID (Human Interface Devices) are things like Keyboards, Mice,
and buttons. Puck.js can emulate these, so can simulate keys being pressed.

**Note:** You'll need at least firmware version 1v92 to pair on Windows (it needs the bonding functionality). Earlier firmwares can work as keyboards on Android, Mac OS and Chromebook, but we'd always recommend you're using the latest firmware.

**Note:** Bluetooth HID can't be enabled on an active connection. To make it work (if you're connected wirelessly) you need to upload the code, disconnect, and then reconnect with your Operating System's `Pair` functionality.

BLE HID can be enabled by providing a HID Report to [NRF.setServices](/Reference#l_NRF_setServices),
however we've provided common types of HID report in modules to make it easier:


Keyboards
---------

Keyboard support is from the [[ble_hid_keyboard.js]] module.

```
var kb = require("ble_hid_keyboard");
NRF.setServices(undefined, { hid : kb.report });

function btnPressed() {
  // Send 'a'
  kb.tap(kb.KEY.A, 0, function() {
    // Followed by capital 'A'
    kb.tap(kb.KEY.A, kb.MODIFY.SHIFT);
  });
}

// trigger btnPressed whenever the button is pressed
setWatch(btnPressed, BTN, {edge:"rising",repeat:true,debounce:50});
```


Multimedia Keys
---------------

However, the multimedia keys on keyboards (play/stop/volume/etc) are treated
as a completely separate device by USB and BLE.

Support for this is from the [[ble_hid_controls.js]] module.

```
var controls = require("ble_hid_controls");
NRF.setServices(undefined, { hid : controls.report });

// Play/stop music
controls.playpause();

// Send 'volume up' twice
controls.volumeUp(function() {
  controls.volumeUp();
});

// Other options:
//controls.next();
//controls.prev();
//controls.stop();
//controls.mute();
//controls.volumeDown();
```


Low Level control
------------------

You can emulate a wide variety of other devices by providing your own HID report:

```
report = new Uint8Array([
  ]);
NRF.setServices(undefined, { hid : report });
```

You can then call `NRF.sendHIDReport` to send data. For Keyboards it must be an array of the form:

```
[modifier, reserved, key1, key2, key3, key4, key5, key6 ]
```

You can easily look up keyboard key codes, but for example
to send the 'a' key, send `[0,0,4,0,0,0,0,0]`. To release
it, send `[0,0,0,0,0,0,0,0]`

**Note:** The modifiers are defined in `require("ble_hid_keyboard").MODIFY` and
common keys are in `require("ble_hid_keyboard").KEY`

The modifiers are as follows:

```
1   : left control
2   : left shift
4   : left alt
8   : left GUI
16  : right control
32  : right shift
64  : right alt
128 : right GUI
```

So to send capital `A`, send `[2,0,4,0,0,0,0,0]` followed by `[0,0,0,0,0,0,0,0]`.

```
NRF.sendHIDReport([2,0,4], function() {
  NRF.sendHIDReport([0,0,0])
})
```

You can find key codes at http://www.usb.org/developers/hidpage/Hut1_12v2.pdf
under the `Keyboard/Keypad page`, but for quick reference:

* `a`...`z` are 4..26
* `1`..`9` are 30..38
* `0` is 39
* Return is 40
* Space is 44
