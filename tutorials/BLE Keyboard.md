<!--- Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bluetooth LE HID Keyboards
==========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/BLE+Keyboard. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Modules,BLE,Bluetooth,Keyboard,Control,Mouse,HID,Human Interface Device,BLE HID,Bluetooth HID
* USES: Puck.js,BLE,Only BLE

Bluetooth LE HID (Human Interface Devices) are things like Keyboards, Mice,
and buttons. Puck.js can emulate these, so can simulate keys being pressed.

**Note:** You'll need at least firmware version 1v92 to pair on Windows (it needs the bonding functionality). Earlier firmwares can work as keyboards on Android, Mac OS and Chromebook, but we'd always recommend you're using the latest firmware.

**Note:** Bluetooth HID can't be enabled on an active connection. To make it work (if you're connected wirelessly) you need to upload the code, disconnect, and then reconnect with your Operating System's `Pair` functionality. Sending HID keypresses without HID enabled will throw an exception.

BLE HID can be enabled by providing a HID Report to [NRF.setServices](/Reference#l_NRF_setServices),
however we've provided common types of HID report in modules to make it easier:


Keyboards
---------

Keyboard support is from the [[ble_hid_keyboard.js]] module. Using it
is as simple as calling `NRF.setServices` with the HID report
provided by the module. You can then use the `.tap` method to
send a key tap, or can use `NRF.sendHIDReport` directly.

```JS
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

// Add 'appearance' to advertising for Windows 11
NRF.setAdvertising([
  {}, // include original Advertising packet
  [   // second packet containing 'appearance'
    2, 1, 6,  // standard Bluetooth flags
    3,3,0x12,0x18, // HID Service
    3,0x19,0xc1,0x03 // Appearance: Keyboard
        // 0xc2,0x03 : 0x03C2 Mouse
        // 0xc3,0x03 : 0x03C3 Joystick
  ]
]);
```

**As of around Sept 2023, Windows 11 has started filtering out any
Bluetooth LE device that does not include an `Appearance` element in its Bluetooth LE
advertisement.** To date, iOS, Android, Linux, Mac OS, Windows 10 all do not require it.

To allow pairing under Windows 11 you'll have to add a Bluetooth Appearance (`0x19`) to the
advertisement, using this code:

```JS
NRF.setAdvertising([
  {}, // include original Advertising packet
  [   // second packet containing 'appearance'
    2, 1, 6,  // standard Bluetooth flags
    3,3,0x12,0x18, // HID Service
    3,0x19,0xc1,0x03 // Appearance: 0x03C1 Keyboard
        // 0xc2,0x03 : 0x03C2 Mouse
        // 0xc3,0x03 : 0x03C3 Joystick
  ]
]);
```

Valid appearance numbers can be found at https://btprodspecificationrefs.blob.core.windows.net/assigned-numbers/Assigned%20Number%20Types/Assigned_Numbers.pdf
under `2.6.3 Appearance Sub-category values`

### LEDs

When a Keyboard LED (Caps Lock, Num Lock, etc) should be lit, a message
is sent to Espruino and is provided via the [`NRF.on('HID', ...)` event](http://www.espruino.com/Reference#l_NRF_HID).

* Bit 0: NUM lock
* Bit 1: CAPS lock
* Bit 2: SCROLL lock
* Bit 3: Compose
* Bit 4: Kana

For instance the following will light LED1 and LED2 depending on Num Lock and Caps Lock:

```JS
NRF.on('HID', function(v) {
  LED1.write(v&1);  
  LED2.write(v&2);
});
```

This way you can send messages/data back to an Espruino device without any
drivers or platform specific code, just by toggling the status of Caps Lock, Num Lock, and others.



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

Mouse
------

You can also use the [[ble_hid_mouse.js]] module to emulate a mouse. For example:

```
var mouse = require("ble_hid_mouse");
NRF.setServices(undefined, { hid : mouse.report });

function btnPressed() {
  mouse.send(0,0,mouse.BUTTONS.LEFT); // X movement, Y movement, buttons pressed
}

// trigger btnPressed whenever the button is pressed
setWatch(btnPressed, BTN, {edge:"rising",repeat:true,debounce:50});
```

Combination
------

If you find you require multiple HID defices at the same time (EG a keyboard and mouse combination) that is possible with more advanced custom HID reports. If you are looking for a quite complete keyboard and mouse combination implementation you can use the [[ble_hid_combo.js]] module.

```
var int = require("ble_hid_combo");
NRF.setServices(undefined, { hid : int.report });

function btnPressed() {
  int.scroll(10);         // Scroll down
  int.moveMouse(30, 0);   // Move mouse horizontally
  int.tapKey(int.KEY.Y);  // Also press the Y key
}

// trigger btnPressed whenever the button is pressed
setWatch(btnPressed, BTN, {edge:"rising",repeat:true,debounce:50});
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

You can find key codes at https://www.usb.org/sites/default/files/documents/hut1_12v2.pdf under the `Keyboard/Keypad page`, but for quick reference:

* `a`...`z` are 4..26
* `1`..`9` are 30..38
* `0` is 39
* Return is 40
* Space is 44


Uses
----

* APPEND_USES: ble_hid
