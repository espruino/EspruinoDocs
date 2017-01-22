/* Copyright (c) 2014 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 

Basic 4x4 font - only digits 0-9

Usage:

```
require("Font4x4").add(Graphics);
g.setFont4x4();
g.drawString("0123 4567 89");
```
*/

/*
var font = E.toString([
  0xFD,0xBF, // 0
  0x9F,0xF1, // 1
  0xBB,0xDD, // 2
  0x99,0xDF, // 3
  0xE6,0xFF, // 4
  0xDD,0xBB, // 5
  0xF5,0x57, // 6
  0x88,0xFF, // 7
  0x3F,0xBF, // 8
  0xEA,0xAF, // 9
]);*/
var font = atob("/b+f8bvdmd/m/9279VeI/z+/6q8=");

exports.add = function(graphics) {
  graphics.prototype.setFont4x4 = function() {
    this.setFontCustom(font, "0".charCodeAt(0), 4, 4);
  }
}




