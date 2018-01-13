/* Copyright (c) 2017 jose1711, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 
Usage:

```
require("Font4x4").add(Graphics);
g.setFont4x4();
g.drawString("Hello World");
```
*/
var font = atob("DQAMDAfg2wCw0K0ADAAHkAlwUlAnIBIAAiABABJAaWAE8AtQCWAOMA2wDzCLQKWgDeAFAAGgAlAFUAUgC0CeQHpw/TBpkPlg/YD8gGkw8vCfkCHg9pDxEPTw9DB5cPpAeWD6UAWgj4BxcGFgY2DS0MPAvZAPkAQgnwAEhAEQhAAlcPUgJVAl8CdQegAXYPIQCwAbAPJQAfAyMDIQJSB0ICRwA0AXQE9AMTAhICMgUlBSQEcQBpAPAAlgAkA=");

exports.add = function(graphics) {
  graphics.prototype.setFont4x4 = function() {
    this.setFontCustom(font, 33, 4, 4);
  }
}
