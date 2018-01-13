<!--- Copyright (c) 2014 Luca S.G.de Marinis, loop23-at-gmail.com. See the file LICENSE for copying permission. -->
Midi
====

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Midi. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Midi,Serial,Music

This module uses the event emitter interface to let you choose what message you are
interested in handling; Some day it may do midi out too. It's quick and dirty hack,
but I hope you may find this useful or even fun.

Wiring a midi input could be done in two ways: One is getting an optocoupler (I've heard
that FOD260L are good for 3.3v based mcu's) and build a simple circuit. The other is
using some kind of midi-serial bridge (I'm currently using HairLess Midiserial on osx which talks
to a SPP bluetooth serial connection). This mostly affects the speed setting you have to use:
"real" midi is 31250, bridged is more likely to be 115200.

I wired mine like:

| Device Pin | Espruino |
| ---------- | -------- |
| (GND)      | GND      |
| (VCC)      | 3.3      |
| (TX)       | A3       |

Obviusly when the module will do midi-out you may want to add RX => A2, if you are using Serial2 like I do.

Software
-----

```
 var midi = require('Midi').setup(Serial2, 115200);
 midi.on('noteOn', function(i) {
   console.log('Music is in the air! note: ' + i.note + 
               ' on channel: ' + i.chan + 
               ' with velocity: ' + i.velocity);
 });
```

Supported events are:

  * noteOn
  * noteOff
  * ctrlChange
  * pitchBend
  * afterTouch
  * patchChange
  * channelPress

Using 
-----

* APPEND_USES: Midi
