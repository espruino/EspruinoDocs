/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Grove Light Sensor
------------------
Read the amount of light falling on the sensor

Must be plugged into an analog socket

```
var r = new GroveLightSensor([A0,A1]);
setInterval(function() {
  console.log(r.read());
}, 500);
```
*/
function GroveLightSensor(pins) {
  this.p = pins[0];
}
exports = GroveLightSensor;
/** Returns a number between 0 (dark) and 1 (bright) */
GroveLightSensor.prototype.read = function() { return analogRead(this.p); };


