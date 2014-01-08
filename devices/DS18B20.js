/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Module for the DS18B20 temperature sensor

```
var sensorBus = require("DS18B20").connect(A1);
console.log(sensorBus.getTemp());
var kitchen = sensorBus.getSensors()[2];
console.log(sensorBus.getTemp(kitchen));
```
*/
function Bus(pin) {
  this._ow = new OneWire(pin);
}
Bus.prototype.getSensors = function () {
  return this._ow.search();
};
Bus.prototype.getTemp = function (device) {
  var sensors = this._ow.search();
  if (device === undefined && sensors.length) {device = sensors[0];}
  var temp = null;
  if (sensors.contains(device)) {
    this._ow.reset();
    this._ow.select(device);
    this._ow.write(0x44, true);
    this._ow.reset();
    this._ow.select(device);
    this._ow.write(0xBE);
    temp = this._ow.read() + (this._ow.read() << 8);
    if (temp > 32767) {temp -= 65536;}
    temp = temp/16.0;
  }
  return temp;
};

exports.connect = function(pin) {return new Bus(pin);};