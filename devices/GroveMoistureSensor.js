/* Copyright (c) 2018 Marcos Placona, Twilio. See the file LICENSE for copying permission. */
/* Grove Moisture Sensor
------------------
Measures the volumetric content of water in soil and gives us the moisture level

Must be plugged into an analog socket

```
var r = new GroveMoistureSensor(WioLTE.A4[0]);
setInterval(function() {
  console.log(r.read());
}, 500);
```
*/
function GroveMoistureSensor(pin) {
  this.p = pin;
}
exports = GroveMoistureSensor;
/** Returns a number between 0 (dry) and 1 (wet) */
GroveMoistureSensor.prototype.read = function() { return analogRead(this.p); };


