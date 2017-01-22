/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Grove LED (or LED Socket)
------------------
Turn an LED light on and off

```
var l = new GroveLED([A0,A1]);
l.on();
```
*/
function GroveLED(pins) {
  this.p = pins[0];
}
exports = GroveLED;
/** Turn LED on */
GroveLED.prototype.on = function() { this.p.set(); };
/** Turn LED off */
GroveLED.prototype.off = function() { this.p.reset(); };
/** Write to the LED, any number between 0 and 1 */
GroveLED.prototype.write = function(v) { 
  if (v<=0) this.p.reset();
  if (v>=1) this.p.set();
  analogWrite(this.p, v, { soft:true });
};
/** Flash for the time specified in ms, or 500ms if nothing supplied */
GroveLED.prototype.flash = function(delay, callback) { 
  if (isNaN(delay) || delay<=0) delay = 500;
  digitalWrite(this.p,1);
  var p = this.p;
  setTimeout(function() {
    digitalWrite(p,0);
    if (callback) callback();
  }, delay);
};


