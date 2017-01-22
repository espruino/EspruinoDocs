/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*Allows you to read the rotation of the knob

Must be plugged into an analog socket

```
var grove = require("GrovePico");
var r = new (require("GroveRotation"))(grove.A0);
setInterval(function() {
  console.log(r.read());
}, 500);
```
*/
function GroveRotation(pins) {
  this.p = pins[0];
}
exports = GroveRotation;
/** Returns a number between 0 and 1 depending on rotation */
GroveRotation.prototype.read = function() { return analogRead(this.p); };


