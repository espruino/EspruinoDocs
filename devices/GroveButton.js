/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*Calls the callback when the button is pressed or released.

Can be plugged in anywhere

```
var grove = require("GrovePico");
new (require("GroveButton"))(grove.D2, print);
```
*/
function GroveButton(pins, callback) {
  this.p = pins[0];
  this.w = setWatch(callback, this.p, {repeat:true, debounce:50});
}
exports = GroveButton;

/** Call this to stop callbacks */
GroveButton.prototype.disconnect = function() { clearWatch(w); };


