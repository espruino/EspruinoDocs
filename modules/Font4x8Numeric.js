/* Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 

Basic 4x8 font - only digits 0-9

Usage:

```
require("Font4x8Numeric").add(Graphics);
g.setFont4x8Numeric();
g.drawString("0123 4567 89");
```
*/
var font = atob("/4H/AAD/AACPmfEAgZH/APAQ/wDxmY8A/5GfAICA/wD/kf8A8ZH/AA==");

exports.add = function(graphics) {
  graphics.prototype.setFont4x8Numeric = function() {
    this.setFontCustom(font, "0".charCodeAt(0), 4, 8);
  }
}
