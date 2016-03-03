/* Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Module for the DS18B20 temperature sensor

```
var ow = new OneWire(A1);
var sensor = require("DS18B20").connect(ow);
sensor.getTemp(function (temp) { console.log("Temp is "+temp+"°C"); });
sensor.setRes(9);
sensor.getTemp(function (temp) { console.log("Temp is "+temp+"°C"); });
var sensor2 = require("DS18B20").connect(ow, 1);
var sensor3 = require("DS18B20").connect(ow, -8358680895374756824);
```
*/

var C = {
  CONVERT_T: 0x44,
  COPY: 0x48,
  READ: 0xBE,
  WRITE: 0x4E
};

function DS18B20(oneWire, device) {
  this.bus = oneWire;
  if (device === undefined) {
    this.sCode = this.bus.search()[0];
  } else {
    if (parseInt(device).toString()==device && device >= 0 && device <= 126) {
      this.sCode = this.bus.search()[device];
    } else {
      this.sCode = device;
    }
  }
  if (!this.sCode) throw new Error("No DS18B20 found");
  // device type
  this.type=parseInt(this.sCode[0]+this.sCode[1]);
}

/** For internal use - read the scratchpad region */
DS18B20.prototype._r = function() {
  var b = this.bus;
  b.select(this.sCode);
  b.write(C.READ);
  return b.read(9);
};

/** For internal use - write to the scratchpad region */
DS18B20.prototype._w = function (th, tl, conf) {
  var b = this.bus;
  b.select(this.sCode);
  b.write([C.WRITE,th,tl,conf]);
  b.select(this.sCode);
  b.write(C.COPY);
  b.reset();
};

/** Set the sensor resolution in bits. From 9 to 12.
    This setting is stored in device's EEPROM so it persists even after the sensor loses power. */
DS18B20.prototype.setRes = function (res) {
  var spad = this._r();
  res = [0x1F, 0x3F, 0x5F, 0x7F][E.clip(res, 9, 12) - 9];
  this._w(spad[2], spad[3], res);
};

/** Return the resolution in bits. From 9 to 12 */
DS18B20.prototype.getRes = function () {
  return [0x1F, 0x3F, 0x5F, 0x7F].indexOf(this._r()[4]) + 9;
};

/** Return true if this device is still connected to the OneWire Bus */
DS18B20.prototype.isPresent = function () {
  return this.bus.search().indexOf(this.sCode) !== -1;
};


/** Get a temperature reading in degrees C. If callback is supplied,
it will be called with the current temperature. If it isn't the *last*
temperature will be returned and a new reading will be started. This
means that with no callback, the first call to getTemp will return
an invalid temperature. If the CRC fails, 'null' will be returned */
DS18B20.prototype.getTemp = function(callback) {
  function read(me) {
    var s = me._r();
    var c = 0;
    // do the CRC
    for (var i=0;i<8;i++) {
      c^=s[i];
      for (var j=0;j<8;j++)
        c=(c>>1) ^ 0x8C*(c&1);
    }
    var temp = null;
    if (c == s[8]) {
      temp = s[0] + (s[1]<<8);
      if (temp & 32768) temp -= 65536;
      temp = temp / ((me.type==10)?2:16);
    }
    if (callback) callback(temp);
    return temp;
  }
  this.bus.select(this.sCode);
  this.bus.write(C.CONVERT_T, true);
  if (!callback) return read(this); // if no callback, read now - we'll get the last temperature 
  var tim = {9:94, 10:188, 11:375, 12:750}; // Thermometer Resolution (bit) : Max Conversion Time (ms)
  setTimeout(read, tim[this.getRes()], this);
}

/** Return a list of all DS18B20 sensors with their alarms set */
DS18B20.prototype.searchAlarm = function() { 
  return this.bus.search(0xEC); 
};

/** Set alarm low and high values in whole degrees C - see DS18B20.prototype.searchAlarm. 
  If the temperature goes below `lo` or above `hi` the alarm will be set. */
DS18B20.prototype.setAlarm = function(lo,hi) {
  lo--; // DS18B20 alarms if (temp<=lo || temp>hi), but we want (temp<lo || temp>hi)
  if (lo<0) lo+=256;
  if (hi<0) hi+=256;
  var spad = this._r();
  this._w(hi,lo,spad[4]);
};

/** Initialise a DS18B20 device. Use either as:
  connect(new OneWire(pin)) - use the first found DS18B20 device
  connect(new OneWire(pin), N) - use the Nth DS18B20 device
  connect(new OneWire(pin), ID) - use the DS18B20 device with the given ID
 */
exports.connect = function(oneWire, device) {
    return new DS18B20(oneWire, device);
};
