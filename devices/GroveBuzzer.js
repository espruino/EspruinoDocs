/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*Returns an object with the following methods:

Can be plugged in anywhere

```
var grove = require("GrovePico");
var b = new (require("GroveBuzzer"))(grove.D2);
b.beep(100);
```
*/
function GroveBuzzer(pins) {
  this.p = pins[0];
}
/** Beep for the time specified in ms, or 500ms if nothing supplied */
GroveBuzzer.prototype.beep = function(delay, callback) { 
  if (isNaN(delay) || delay<=0) delay = 500;
  digitalWrite(this.p,1);
  var p = this.p;
  setTimeout(function() {
    digitalWrite(p,0);
    if (callback) callback();
  }, delay);
};
exports = GroveBuzzer;

/** Play at the specified frequency for the time specified in ms, or 500ms if nothing supplied */
GroveBuzzer.prototype.freq = function(freq, delay) { 
  if (isNaN(delay) || delay<=0) delay = 500;
  analogWrite(this.p,0.1,{freq:freq, soft:true});
  var p = this.p;
  setTimeout(function() {
    digitalWrite(p,0);
    if (callback) callback();
  }, delay);
};


