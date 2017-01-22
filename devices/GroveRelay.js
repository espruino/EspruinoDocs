/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Grove Relay
------------------
A relay to help you turn other circuits on and off

```
var l = new GroveRelay([A0,A1]);
l.off();
l.pulse(1000, function() {
  console.log("Done!");
});
```
*/
function GroveRelay(pins) {
  this.p = pins[0];
}
exports = GroveRelay;
/** Turn relay on */
GroveRelay.prototype.on = function() { this.p.set(); };
/** Turn relay off */
GroveRelay.prototype.off = function() { this.p.reset(); };
/** Pulse the relay for the time specified in ms, or 500ms if nothing supplied */
GroveRelay.prototype.pulse = function(delay, callback) { 
  if (isNaN(delay) || delay<=0) delay = 500;
  digitalWrite(this.p,1);
  var p = this.p;
  setTimeout(function() {
    digitalWrite(p,0);
    if (callback) callback();
  }, delay);
};


