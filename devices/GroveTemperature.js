/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Grove Temperature Sensor
------------------

```
var grove = require("GrovePico");
var r = new (require("GroveTemperature"))(grove.A0);
console.log(t.get());
```
*/
function GroveTemperature(pins) {
  this.B=3975; // B value of the thermistor
  this.p = pins[0];
}
exports = GroveTemperature;
// Get the temperature in degrees C
GroveTemperature.prototype.get = function() {
  var a = analogRead(this.p)*3.3/5;
  // get the resistance of the sensor;
  var resistance=(1-a)*10000/a; 
  // convert to temperature via datasheet 
  var temperature=1/(Math.log(resistance/10000)/this.B+1/298.15)-273.15;
  return temperature;
};


