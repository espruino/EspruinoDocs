<!--- Copyright (c) 2019 Stefan Fröhlich. See the file LICENSE for copying permission. -->
RcSwitch
=====================

* KEYWORDS: 433Mhz,315Mhz,433,SC5262,SC5272,HX2262,HX2272,PT2262,PT2272,EV1527,RT1527,FP1527,HS1527

Module for operate 433/315Mhz devices like power outlet sockets, relays, etc.. Use the [MOD123](/modules/RcSwitch.js) module for it.

### Todo:
- [x] Write support
- [ ] Read support

You can wire this up as follows:

| Device Pin | Espruino |
| ---------- | -------- |
| 1 (GND)    | GND      |
| 2 (VCC)    | BAT      |
| 3 (DATA)   | A0       |


How to use my module:

![Brennstuhl rc settings](/devices/RcSwitch/switch_settings.jpg)

```javascript
  // 1 = Protocol
  // D13 = Pin
  // 10 = Repeat
  var sw = require("RcSwitch").connect(1, A0, 10);
  var sw = exports.connect(1, D13, 10);
  var on = false;
  function toggle() {
    on = !on;
    if (on) {
        sw.switchOn("11110", "10000");
        console.log("switchOn");
        }
    else{
        sw.switchOff("11110", "10000");
        console.log("switchOff");
    }
  }
  setInterval(toggle, 5000);
```