<!--- Copyright (c) 2026 Jean-Philippe Rey. See the file LICENSE for copying permission. -->
BTHome Writable
===============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/BTHomeWritable. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Modules,BTHome,BTHomeWritable,Bluetooth,BLE,Home Assistant,HomeAssistant,Actuator,Writable,Downlink,GATT
* USES: BLE,Only BLE

[BTHome](/BTHome) is how an Espruino device tells [Home Assistant](https://www.home-assistant.io/)
what it has measured. This module adds the other direction: Home Assistant
writes a value **to** the device — a light, a setpoint, a line of text on a
display — in BTHome's own object format.

The device lists, in its ordinary BTHome advertising, the object types it
accepts writes for. A receiver connects briefly, writes **one BTHome object**
to that entry's own GATT characteristic, and disconnects. The write response is
the acknowledgement, and a writable value is never advertised.

```
advertising   40 00 09 01 61 FF 01 1E     battery, and "entry 1 accepts 0x1E"
write         1E 01  ->  2FAA0001         one object, one characteristic
```

Status
------

**This is a proposal, not yet part of BTHome.** Worth knowing before you build
something on it:

* the declaration uses **object ID `0xFF`, which BTHome has not assigned**. If
  they assign a different one, this module changes a constant and your receiver
  must change with it;
* the GATT UUIDs are provisional until the first release;
* **receiving it needs the
  [bthome-writable](https://github.com/yerpj/bthome-writable) custom
  integration** for Home Assistant, installable through HACS. Core BTHome is
  unaffected: it skips the declaration and goes on reading your sensors
  exactly as before, so adding this to a device breaks nothing that already
  works.

Everything else is BTHome's own — the object table, the encodings, and the
AES-CCM encryption. The design was worked out in the open in
[this discussion](https://github.com/orgs/espruino/discussions/8024).

Usage
-----

```JS
var bw = require("BTHomeWritable");

var lamp = false;

bw.setup({
  advertise : [
    { type:"battery", get:()=>E.getBattery(), interval:300000 },  // read it every 5 min
    { type:"light",   set:v=>{ lamp = v; digitalWrite(LED1, v); } }
  ],
  interval : 1000,
  onError : e => print("rejected:", e.code, e.message)
});

print("writable entries:", bw.plan().entryIds);  // [ 30 ], i.e. 0x1E
```

An entry with `get` only is an ordinary sensor, advertised as usual. An entry
with `set` is **writable**: it is listed in the declaration, gets characteristic
`2FAA0001`, `2FAA0002`… in entry order, and its value is never advertised.

Give a writable entry a `get` as well **if its value can change without a
write** — a knob, a physical button, a schedule. Its characteristic then
becomes readable, the device advertises BTHome's settings revision (`0x65`),
and you call `bw.changed()` whenever such a change happens so that receivers
know to read it again. Call it on every change and do not rate-limit it
yourself: a burst of calls is folded into one rebuild 250 ms later, which is
what a button being pressed ten times in a second needs.

```JS
setWatch(function() {
  lamp = !lamp;
  digitalWrite(LED1, lamp);
  bw.changed();          // tell receivers the value moved by itself
}, BTN, { repeat:true, edge:"rising", debounce:50 });
```

### Types BTHome cannot encode

Events and raw objects are declared by ID instead of by name:

```JS
{ id:0x3A, length:1, set:v=>print("button", v) }  // fixed length
{ id:0x3C, length:1, set:v=>print("dimmer", v) }  // an event code, not a value
{ id:0x54, variable:true, set:b=>print(b) }       // length-prefixed
{ id:0x3B, set:op=>print("command", op) }         // command: framing is fixed
```

Declaring one of these by name is refused with `writable_needs_id`: the module
works out an unnamed type's encoding by probing the BTHome module with 1 and 2,
which reads an event code or a raw object's first byte as something it is not.

Their `set` receives the value bytes, the event code, or a command's opcode.

Encryption
----------

Give `setup()` a `bindkey` and the device advertises, accepts writes and serves
reads encrypted, with BTHome v2's AES-CCM in both directions:

```JS
bw.setup({
  advertise : [ { type:"light", set:v=>digitalWrite(LED1,v) } ],
  interval : 1000,
  bindkey : "231d39c1d7cc1ab1aee224cd096db932",   // 32 hex characters
  counterReport : true
});
```

This needs the [AESCCM](/AESCCM) module, which the Web IDE will fetch for you.
It uses your firmware's own `AES.ccmEncrypt` where there is one — Bangle.js 2
builds it, Puck.js does not — and builds CCM out of `AES.encrypt` otherwise, so
you do not have to care which board you are on.

Encryption costs **8 bytes of service data** for the counter and the MIC, which
is a third of the packet. Plan for it.

`counterReport : true` is worth turning on. Without it the device resumes its
write counter ahead of the receiver after every restart, and silently refuses
commands until the receiver catches up; with it the receiver asks the device
where it is instead of guessing.

How much fits in one packet
---------------------------

The BTHome service data has about **24 bytes** to spend, and **16** once
encrypted. Against that:

| | |
|---|---|
| packet id | 2 bytes, always |
| settings revision | 2 bytes, if any writable entry is readable |
| the declaration | 2 bytes plus one per writable entry |
| each advertised sensor | its own object, 2 bytes and up |

**Writable values cost nothing on the air** beyond their one byte in the
declaration — they are read over GATT, not advertised. So five settable
parameters cost 7 bytes in total, and what overflows a packet is usually the
sensors.

If the radio refuses a packet, try `showName:false` first: the name shares the
same 31 bytes, and on some boards it takes most of them.

Reference
---------

### `setup(options)`

| Option | |
|---|---|
| `advertise` | the entry list, in order. Entry *k* is characteristic `2FAA000k` |
| `interval` | advertising interval in **milliseconds**, 20–10000 (default 2000). A per-entry `interval`, also in milliseconds, is how long that sensor's value may be reused before `get()` is called again; `0` reads on every packet |
| `fastInterval` | advertising interval in milliseconds while a receiver is around, floored at 100 (the default) |
| `fastTimeout` | milliseconds to keep advertising fast after a disconnect (default 30000) |
| `whenConnected` | keep advertising during a connection (default `true`) |
| `maxWriteLength` | largest accepted write, in bytes (default 128) |
| `bindkey` | 16-byte AES key, as 32 hex characters or an array. Anything else is refused at `setup()`: a key that is silently the wrong key has every receiver blaming a key that is not at fault |
| `showName` | put the device name in the advertising packet (default `true`) |
| `maxServiceData` | what your radio will really accept, in bytes. Set it and the packet is checked at `setup()` rather than at the first transmission |
| `counterReport` | offer the counter report at `2FAA1000` (default `false`, and only with a `bindkey`) |
| `onError` | called with a rejected write's error, which is the only place one shows |

### Methods

| | |
|---|---|
| `bw.update()` | re-read every sensor and rebuild the packet now |
| `bw.changed()` | a writable value changed by itself: bump the settings revision so receivers re-read it. Returns at once, and the work happens 250 ms later, once for however many calls arrive in that window |
| `bw.setAdvertisingInterval(ms)` | change the advertising interval, in milliseconds, without re-running `setup()` |
| `bw.setFastTimeout(ms)` | change how long the fast window lasts, in milliseconds |
| `bw.plan()` | what `setup()` worked out: `entryIds`, the writable entries and their UUIDs |

Notes
-----

**The packet is rebuilt when something changes, not on every interval.** The
module re-reads an advertised entry when that entry's own interval has elapsed,
and builds a new packet only if an encoded value has moved -- in which case the
packet id moves with it. That is what BTHome asks for: the packet id *"should
be increased on every change in data"*, a receiver *"should only process the
advertisement if the packet id is different compared to the previous one"*, and
*"this allows you to send multiple advertisements that are exactly the same"*.
It is also much cheaper. A rebuild is 26-38 ms of the one thread on an nRF52,
and on a device with a `bindkey` it is re-sealed with AES-CCM: rebuilding an
identical packet every second measured at over 100 uA of idle current for
nothing. `bw.update()` forces a rebuild, and `bw.changed()` is how a value that
moved on its own announces itself.

**It wakes when something falls due, and not otherwise.** There is no fixed
timer. Each wake re-reads whatever is due, publishes if anything moved, and
arms the next wake for the soonest entry still to come, plus 100 ms so that it
lands past the deadline rather than just short of it -- which is less rounding
than the fixed timer it replaces, where a 30 s entry inspected every second
was re-read every 31. A device whose entries are all slow wakes slowly --
`interval: 1000` with a battery at `interval: 300000` wakes once every five
minutes, not three hundred times -- and a device that advertises nothing it has
to read holds no timer at all. What this is worth on a current meter is honest
to state: next to nothing. An empty wake measured under 10 us on an nRF52, and
a module whose packet is already left alone idles within about 5 uA of one that
is not loaded. It is the right shape, not a saving.

**Changing how fast it advertises does not build a packet either.** A receiver
connecting, the quiet window after it expiring and `bw.setAdvertisingInterval()`
all change one field of the advertising options, so the module hands the radio
back the bytes already on air rather than building the same ones again: the
packet id stays where it is, and on a device with a `bindkey` so does the
advertising counter -- which is exactly the repetition the format allows. On a
nice!nano that takes one connect-and-disconnect cycle from two rebuilt packets
to two repeated ones, 189 ms of the one thread down to 7 with a `bindkey`.

**A burst of local changes costs one rebuild.** `bw.changed()` is meant to be
called from a `setWatch` handler, which is exactly where a burst arrives, and
the work it asks for is the most expensive thing the module does: a `get()` and
a seal per readable entry, then a whole packet rebuilt and re-sealed, 26 to 38
ms of the one thread. Ten presses in a second used to stack ten of those on a
thread already behind, which on an nRF52 reached `LOW_MEMORY` and a connection
the device still believed in after the central was gone. So a call arms a 250 ms
window and returns; calls inside the window are dropped, and the window ends in
one revision bump, one publication per readable entry and one rebuild, reading
the values then rather than when the first press came in. It is a rate limit and
not a debounce: the window is never extended, so a knob held for a minute still
publishes four times a second.

**A rejected write still looks delivered.** Espruino acknowledges a write
before your handler runs, so a device that refuses one cannot say so over the
air. `onError` is where it shows, and it is worth printing during development.

**One central at a time.** These boards serve a single connection, so a
receiver's write will fail while the Web IDE is connected — including, quietly,
while you are watching the console wondering why nothing happens.

**Keep the sketch in RAM while you are experimenting.** An advertising payload
the radio refuses throws inside `setup()`, the radio stops to reconfigure and
stays stopped, and a device that does not advertise cannot be connected to, so
it cannot be fixed over the air. A power cycle undoes a sketch in RAM; one
saved to flash repeats the problem at every boot.

References
----------

* [bthome-writable](https://github.com/yerpj/bthome-writable) — the protocol
  (`spec/PROTOCOL.md`), the Home Assistant integration, and a decision log
  giving the measurement behind each choice
* [Ten-minute replication](https://github.com/yerpj/bthome-writable/blob/main/docs/try-it.md)
  with a Puck.js
* [The design discussion](https://github.com/orgs/espruino/discussions/8024)
* [BTHome](/BTHome) — the uplink module this builds on
* [AESCCM](/AESCCM) — needed only when you set a `bindkey`
