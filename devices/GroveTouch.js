/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Grove Touch
------------------
Calls the callback when the area is pressed or released.

Can be plugged in anywhere

```
var grove = require("GrovePico");
new (require("GroveTouch"))(grove.D2, print);
```
*/
function GroveTouch(pins, callback) {
  this.p = pins[0];
  this.w = setWatch(callback, this.p, {repeat:true, debounce:50});
}
exports = GroveTouch;
/** Call this to stop callbacks */
GroveTouch.prototype.disconnect = function() { clearWatch(w); };


