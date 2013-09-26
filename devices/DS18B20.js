/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 
Module for the DS18B20 temperature sensor

```
var sensor = require("Encoder").connect(hardware,A1);
console.log(sensor.getTemp());
```
*/
exports.connect = function(hardware,pin) {
  var ow = new OneWire(pin); 
  ow.device = ow.search()[0];
  if (ow.device==undefined) {
    print("No OneWire devices found");
    return undefined;
  }
  ow.getTemp = function () { 
    this.reset();
    this.select(this.device); 
    this.write(0x44, true); // convert
    this.reset();
    this.select(this.device);
    this.write(0xBE);                                    
    var temp = this.read() + (this.read()<<8);
    if (temp > 32767) temp -= 65536;
    return temp / 16.0;
  }
  return ow;
}
