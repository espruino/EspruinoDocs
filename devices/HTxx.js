/* Copyright (C) 2016 Enchanted Engineering. See the file LICENSE for use. */
/*
Generic Relative humidity and temp sensor interface module; uses 1 GPIO pin.
Derived from Spence Konde DHT22 module code...
  + streamlined conversion and structure that only exposes read()
    - ~70% memory use, faster conversion
  + DHTxx defines positive pulse 28us->0; 70us->1; tested logically as 0 <= 50us < 1
    - 2 leading dummy setup pulses from start edge ignored
  + makes callback (cb) with a JSON object having err, t, t11, rh, rh11, and raw keys
    - err = false if reading good; if true raw included
    - t and rh valid for all sensor types except DHT11 (RHT01)
    - t11 and rh11 valid for DHT11 (RHT01) only 
    - raw hold the 5 bytes read from sensor
  + attempts read 3 times (code carryover), but never seems to fail more than first time
    - added 500ms delay between tries based on datasheet
  + Tested for Espruino board 1v4 and DHT22, but should work for Pico and
    - DHT11 = RHT01
    - DHT21 = RHT02 = AM2301 = HM2301
    - DHT22 = RHT03 = AM2302
    - DHT33 = RHT04 = AM2303
    - DHT44 = RHT05

// example...
function cb(js) {
	console.log(JSON.stringify(js));
  }

var ht = require("HTxx").init(A0);
ht.read(cb);

*/


// Sensor object constructor
function HT(pin) {
  this.pin = pin;
  }

// sensor query method...
/** read sensor as either...
  read(callback);
  read(callback,number_of_trys); - default=3
  */
HT.prototype.read = function (cb,n) {
  n = (n===undefined)?3:n;
  this.bb = this.bb||[0,0,0,0,0];
  if (n<1) {cb({err:true, raw:this.bb}); return;}
  this.i = -2;
  var ht = this;
  pinMode(ht.pin);
  digitalWrite(ht.pin,0);
  this.watch = setWatch(function(t) {
    var dt = t.time-t.lastTime-0.00005;
    if (ht.i>=0) {
      var b = ht.i>>3;
      ht.bb[b] = (ht.bb[b]<<1)|((dt>0)?1:0);
      }
    ht.i++;
    }, ht.pin, {edge:'falling',repeat:true} );
  setTimeout(function() {pinMode(ht.pin,'input_pullup');},1);
  setTimeout(function done() {
    clearWatch(ht.watch);
    var cks = ht.bb[0]+ht.bb[1]+ht.bb[2]+ht.bb[3];
    if (cks&&((cks&0xFF)==ht.bb[4])) {
      var rh = ((ht.bb[0]<<8)+ht.bb[1])*0.1;
      var t = (((0x7F&ht.bb[2])<<8)+ht.bb[3])*((ht.bb[2]&0x80)?-0.1:0.1);
      cb({err:false,rh:rh,t:t,rh11:ht.bb[0],t11:ht.bb[2],raw:ht.bb});
      }
    else {
      setTimeout(function() {ht.read(cb,--n);},500);
      }
    },6);
  };

// export module constructor instance from initialization call...
/** Initialize a device as in 
  var ht = require(HTxx").init(pin); 
  */
exports.init = function(pin) {return new HT(pin);};
