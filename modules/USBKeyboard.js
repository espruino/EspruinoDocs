/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 

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

*/
E.setUSBHID({
  reportDescriptor : [
        0x05, 0x01,          // Usage Page (Generic Desktop),
        0x09, 0x06,          // Usage (Keyboard),
        0xA1, 0x01,          // Collection (Application),
        0x75, 0x01,          //   Report Size (1),
        0x95, 0x08,          //   Report Count (8),
        0x05, 0x07,          //   Usage Page (Key Codes),
        0x19, 0xE0,          //   Usage Minimum (224),
        0x29, 0xE7,          //   Usage Maximum (231),
        0x15, 0x00,          //   Logical Minimum (0),
        0x25, 0x01,          //   Logical Maximum (1),
        0x81, 0x02,          //   Input (Data, Variable, Absolute), ;Modifier byte
        0x95, 0x01,          //   Report Count (1),
        0x75, 0x08,          //   Report Size (8),
        0x81, 0x03,          //   Input (Constant),                 ;Reserved byte
        0x95, 0x05,          //   Report Count (5),
        0x75, 0x01,          //   Report Size (1),
        0x05, 0x08,          //   Usage Page (LEDs),
        0x19, 0x01,          //   Usage Minimum (1),
        0x29, 0x05,          //   Usage Maximum (5),
        0x91, 0x02,          //   Output (Data, Variable, Absolute), ;LED report
        0x95, 0x01,          //   Report Count (1),
        0x75, 0x03,          //   Report Size (3),
        0x91, 0x03,          //   Output (Constant),                 ;LED report padding
        0x95, 0x06,          //   Report Count (6),
        0x75, 0x08,          //   Report Size (8),
        0x15, 0x00,          //   Logical Minimum (0),
        0x25, 0x68,          //   Logical Maximum(104),
        0x05, 0x07,          //   Usage Page (Key Codes),
        0x19, 0x00,          //   Usage Minimum (0),
        0x29, 0x68,          //   Usage Maximum (104),
        0x81, 0x00,          //   Input (Data, Array),
        0xc0                 // End Collection
  ]
});

  // 1 = modifiers
  // 2 = ?
  // 3..8 = key codes currently down


var MODIFY = {
  CTRL        : 0x01,
  SHIFT       : 0x02,
  ALT         : 0x04,
  GUI         : 0x08,
  LEFT_CTRL   : 0x01,
  LEFT_SHIFT  : 0x02,
  LEFT_ALT    : 0x04,
  LEFT_GUI    : 0x08,
  RIGHT_CTRL  : 0x10,
  RIGHT_SHIFT : 0x20,
  RIGHT_ALT   : 0x40,
  RIGHT_GUI   : 0x80
 };
var KEY = {
  A           : 4 ,
  B           : 5 ,
  C           : 6 ,
  D           : 7 ,
  E           : 8 ,
  F           : 9 ,
  G           : 10,
  H           : 11,
  I           : 12,
  J           : 13,
  K           : 14,
  L           : 15,
  M           : 16,
  N           : 17,
  O           : 18,
  P           : 19,
  Q           : 20,
  R           : 21,
  S           : 22,
  T           : 23,
  U           : 24,
  V           : 25,
  W           : 26,
  X           : 27,
  Y           : 28,
  Z           : 29,
  1           : 30,
  2           : 31,
  3           : 32,
  4           : 33,
  5           : 34,
  6           : 35,
  7           : 36,
  8           : 37,
  9           : 38,
  0           : 39,
  ENTER       : 40, 
  "\n"        : 40, 
  ESC         : 41,
  BACKSPACE   : 42, 
  "\t"        : 43,
  " "         : 44, 
  "-"         : 45,
  "="         : 46,
  "["         : 47,
  "]"         : 48,
  "\\"        : 49,
  NUMBER      : 50,
  ";"         : 51,
  "'"         : 52,
  "~"         : 53,
  ","         : 54,
  "."         : 55,
  "/"         : 56,
  CAPS_LOCK   : 57,
  F1          : 58,
  F2          : 59,
  F3          : 60,
  F4          : 61,
  F5          : 62,
  F6          : 63,
  F7          : 64,
  F8          : 65,
  F9          : 66,
  F10         : 67,
  F11         : 68,
  F12         : 69,
  PRINTSCREEN : 70,     
  SCROLL_LOCK : 71,     
  PAUSE       : 72,
  INSERT      : 73, 
  HOME        : 74,
  PAGE_UP     : 75,
  DELETE      : 76,
  END         : 77,
  PAGE_DOWN   : 78, 
  RIGHT       : 79,
  LEFT        : 80,
  DOWN        : 81,
  UP          : 82,
  NUM_LOCK    : 83,
  PAD_SLASH   : 84, 
  PAD_ASTERIX : 85, 
  PAD_MINUS   : 86, 
  PAD_PLUS    : 87, 
  PAD_ENTER   : 88, 
  PAD_1       : 89,
  PAD_2       : 90,
  PAD_3       : 91, 
  PAD_4       : 92, 
  PAD_5       : 93, 
  PAD_6       : 94, 
  PAD_7       : 95, 
  PAD_8       : 96, 
  PAD_9       : 97, 
  PAD_0       : 98,     
  PAD_PERIOD  : 99
};

exports.KEY = KEY;
exports.MODIFY = MODIFY;

var modifiers = 0;

exports.setModifiers = function(m, callback) {
  modifiers = m;
  E.sendUSBHID([modifiers,0,0,0,0,0,0,0]);
  if (callback) setTimeout(callback, 10);
}

exports.tap = function(key, callback) {
  E.sendUSBHID([modifiers,0,key,0,0,0,0,0]);
  setTimeout(function() { 
    E.sendUSBHID([modifiers,0,0,0,0,0,0,0]); 
    if (callback) setTimeout(callback, 10);
  }, 10);
}

exports.type = function(txt, callback) {
  var intr = setInterval(function() {
    if (!txt.length) {
      clearInterval(intr);
      if (callback) callback();
    } else {
      if (txt[0] in KEY) exports.tap(KEY[txt[0]]);
      txt = txt.substr(1);
    }
  }, 20);
}
