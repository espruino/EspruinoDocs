/* Copyright (c) 2017 jose1711, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 
Usage:

```
require("Font4x4").add(Graphics);
g.setFont4x4();
g.drawString("Hello World");
```
*/
var font = atob("DQAMDAfg2wCw0K0ADAAHkAlwUlAnIBIAAi­ABABJAaWAE8AtQCWAOMA2wDzCLQKWgDeAFAAGgAl­AFUAUgC0CeQHpw/TBpkPlg/YD8gGkw8vCfkCHg9p­DxEPTw9DB5cPpAeWD6UAWgj4BxcGFgY2DS0MPAvZ­APkAQgnwAEhAEQhAAlcPUgJVAl8CdQegAXYPIQCw­AbAPJQAfAyMDIQJSB0ICRwA0AXQE9AMTAhICMgUl­BSQEcQBpAPAAlgAkA=");

exports.add = function(graphics) {
  graphics.prototype.setFont4x4 = function() {
    this.setFontCustom(font, 33, 4, 4);
  }
}
