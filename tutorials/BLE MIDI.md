<!--- Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bluetooth LE MIDI
=================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/BLE+MIDI. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Modules,BLE,Bluetooth,MIDI,Web MIDI
* USES: Puck.js,BLE,Only BLE

This is for MIDI over Bluetooth. There's also a module for [Wired MIDI](/Midi).

Bluetooth Espruino devices like Puck.js can be programmed to appear as any type of Bluetooth LE device, and this
includes a Bluetooth LE MIDI controller.

[Joe Bowbeer](https://github.com/joebowbeer/PuckCC) and [George Mandis](https://github.com/georgemandis/puck-js-midi-clicker) did the original work on this.
However it's now been converted into the [[ble_midi.js]] module to make it easier to use.

You can simply use the module as follows:

```JS
var midi = require("ble_midi");
midi.init();

setWatch(function() {
  // When a button is pressed...
  digitalPulse(LED,1,10);
  // midi.send(channel, controller, value);
  midi.send(0, 60, 100);
}, BTN, { repeat:true, edge:"rising", debounce:10 });
```

Then when you next connect to your Puck.js device it will be treated
as a MIDI instrument. When you press the button, a MIDI command will be sent
using the `send` function.

You can then even use the [Web MIDI APIs](https://webaudio.github.io/web-midi-api/)
to receive the MIDI data inside a web page!

**Note:** Because of the way advertising data is modified to allow the long
BLE UUID to be transmitted, this will change the name of the Puck.js device to `PuckCC`.

**Note:** You may require a Mac for this work automatically.

`midi.send` sends  a 'control change' command. Often you'll want
to send a `midi.noteOn(0,note,velocity)` or `midi.noteOff(0,note,0)`
command instead.

Receiving MIDI
--------------

When notes are sent to the midi device, the raw MIDI message is output
in `midi` event which you can handle with `midi.on('midi', ...)`.

The example below echoes received MIDI events back one 5th higher,
as well as lighting LED3 if the note sent has any velocity value.

```JS
var midi = require("ble_midi");
midi.init();

midi.on('midi', function(data) {
  var cmd = data[2] & 0xF0; // command
  var chn = data[2] & 0x0F; // channel
  switch(cmd) {
    case 0x80: // noteOff
    case 0x90: // noteOn
      var num = data[3]; // note number
      var val = data[4]; // note velocity
      if (val) LED3.set(); else LED3.reset();
      midi.cmd(cmd+chn, num+7, val);
      break;
  }
});
```

Reference
---------

Channels sent to these functions are zero-based, so channel
`0` in a function call actually represents channel `1`.

* APPEND_JSDOC: ../modules/ble_midi.js
