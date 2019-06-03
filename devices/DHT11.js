/* Copyright (C) 2014 Spence Konde. See the file LICENSE for copying permission. */
/*
This module interfaces with a DHT11 temperature and relative humidity sensor.
Usage (any GPIO pin can be used):

var dht = require("DHT11").connect(C11);
dht.read(function (a) {console.log("Temp is "+a.temp.toString()+" and RH is "+a.rh.toString());});

*/

function DHT11(pin) {
  this.pin = pin;
}

DHT11.prototype.read = function (cb, n) {
  if (!n) n=10;
  var d = "";
  var ht = this;
  digitalWrite(ht.pin, 0);
  pinMode(ht.pin,"output"); // force pin state to output
  // start watching for state change
  this.watch = setWatch(function(t) {
    d+=0|(t.time-t.lastTime>0.00005);
  }, ht.pin, {edge:'falling',repeat:true} );
  // raise pulse after 1ms
  setTimeout(function() {pinMode(ht.pin,'input_pullup');pinMode(ht.pin);},20);
  // stop looking after 50ms
  setTimeout(function() {
    if(ht.watch){ ht.watch = clearWatch(ht.watch); }
    var cks =
        parseInt(d.substr(2,8),2)+
        parseInt(d.substr(10,8),2)+
        parseInt(d.substr(18,8),2)+
        parseInt(d.substr(26,8),2);
    if (cks&&((cks&0xFF)==parseInt(d.substr(34,8),2))) {
      cb({
        raw : d,
        rh : parseInt(d.substr(2,8),2),
        temp : parseInt(d.substr(18,8),2)
      });
    } else {
      if (n>1) setTimeout(function() {ht.read(cb,--n);},500);
      else cb({err:true, checksumError:cks>0, raw:d, temp:-1, rh:-1});
    }
  }, 50);
};

exports.connect = function(pin) {
    return new DHT11(pin);
};
