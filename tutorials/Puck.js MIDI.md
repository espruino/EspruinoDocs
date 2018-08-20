<!--- Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Puck.js MIDI
============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Puck.js+MIDI. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Modules,BLE,Bluetooth,MIDI,Web MIDI
* USES: Puck.js,BLE,Only BLE

Puck.js can be programmed to appear as any type of Bluetooth LE device, and this
includes a Bluetooth LE MIDI controller.

[Joe Bowbeer](https://github.com/joebowbeer/PuckCC) and [George Mandis](https://github.com/georgemandis/puck-js-midi-clicker) did the original work on this.
However it's now been converted into the [[ble_midi.js]] module to make it easier to use.

You can simply use the module as follows:

```
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

**Note:** Because of the way advertising data is modified, this will
change the name of the Puck.js device to `PuckCC`.

**Note:** You may require a Mac for this work automatically.

`midi.send` sends  a 'control change' command. Often you'll want
to send a `midi.noteOn(0,note,velocity)` or `midi.noteOff(0,note,0)`
command instead.

Reference
---------

Channels sent to these functions are zero-based, so channel
`0` in a function call actually represents channel `1`.

* APPEND_JSDOC: ../modules/ble_midi.js
