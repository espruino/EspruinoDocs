/* Copyright (c) 2021 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*

```
var media = require("USBMedia");

setWatch(function() {
  media.playpause(()=>{console.log("playpause");});
}, BTN, {debounce:100,repeat:true, edge:"rising"});
```

*/

E.setUSBHID({
  reportDescriptor : [
  0x05, 0x0c,  // USAGE_PAGE (Consumer Devices)
  0x09, 0x01,  // USAGE (Consumer Control)
  0xa1, 0x01,  // COLLECTION (Application)
               // -------------------- common global items
  0x15, 0x00,  //   LOGICAL_MINIMUM (0)
  0x25, 0x01,  //   LOGICAL_MAXIMUM (1)
  0x75, 0x01,  //   REPORT_SIZE (1)    - each field occupies 1 bit
               // -------------------- misc bits
  0x95, 0x05,  //   REPORT_COUNT (5)
  0x09, 0xb5,  //   USAGE (Scan Next Track)
  0x09, 0xb6,  //   USAGE (Scan Previous Track)
  0x09, 0xb7,  //   USAGE (Stop)
  0x09, 0xcd,  //   USAGE (Play/Pause)
  0x09, 0xe2,  //   USAGE (Mute)
  0x81, 0x06,  //   INPUT (Data,Var,Rel)  - relative inputs
               // -------------------- volume up/down bits
  0x95, 0x02,  //   REPORT_COUNT (2)
  0x09, 0xe9,  //   USAGE (Volume Up)
  0x09, 0xea,  //   USAGE (Volume Down)
  0x81, 0x02,  //   INPUT (Data,Var,Abs)  - absolute inputs
               // -------------------- padding bit
  0x95, 0x01,  //   REPORT_COUNT (1)
  0x81, 0x01,  //   INPUT (Cnst,Ary,Abs)
  0xc0         // END_COLLECTION
  ]
});

function p(c, cb) {
  E.sendUSBHID([c]);
  setTimeout(function() {
    E.sendUSBHID([0]);
    cb();
  },100);
}

exports.next = function(cb) { p(0x1,cb) };
exports.prev = function(cb) { p(0x2,cb) };
exports.stop = function(cb) { p(0x4,cb) };
exports.playpause = function(cb) { p(0x8,cb) };
exports.mute = function(cb) { p(0x10,cb) };
exports.volumeUp = function(cb) { p(0x20,cb) };
exports.volumeDown = function(cb) { p(0x40,cb) };
