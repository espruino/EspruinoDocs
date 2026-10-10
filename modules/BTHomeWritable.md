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
know to read it again.

```JS
setWatch(function() {
  lamp = !lamp;
  digitalWrite(LED1, lamp);
  bw.changed();          // tell receivers the value moved by itself
}, BTN, { repeat:true, edge:"rising", debounce:50 });
```

### Types BTHome cannot encode

Button events and raw objects are declared by ID instead of by name:

```JS
{ id:0x3A, length:1, set:v=>print("event", v) }   // fixed length
{ id:0x54, variable:true, set:b=>print(b) }       // length-prefixed
{ id:0x3B, set:op=>print("command", op) }         // command: framing is fixed
```

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
| `bindkey` | 16-byte AES key, as 32 hex characters or an array |
| `showName` | put the device name in the advertising packet (default `true`) |
| `maxServiceData` | what your radio will really accept, in bytes. Set it and the packet is checked at `setup()` rather than at the first transmission |
| `counterReport` | offer the counter report at `2FAA1000` (default `false`, and only with a `bindkey`) |
| `onError` | called with a rejected write's error, which is the only place one shows |

### Methods

| | |
|---|---|
| `bw.update()` | re-read every sensor and rebuild the packet now |
| `bw.changed()` | a writable value changed by itself: bump the settings revision so receivers re-read it |
| `bw.setAdvertisingInterval(ms)` | change the advertising interval, in milliseconds, without re-running `setup()` |
| `bw.setFastTimeout(ms)` | change how long the fast window lasts, in milliseconds |
| `bw.plan()` | what `setup()` worked out: `entryIds`, the writable entries and their UUIDs |

Notes
-----

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
