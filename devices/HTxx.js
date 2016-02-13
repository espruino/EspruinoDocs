/* Copyright (C) 2016 Enchanted Engineering. See the file LICENSE for use. */
/*
Relative humidity and temp sensor interface module; uses 1 GPIO pin.
Derived from Spence Konde DHT22 module code...
  + streamlined conversion and structure that only exposes read()
    - ~48% memory use, faster conversion
  + DHTxx defines positive pulse 28us->0; 70us->1; tested logically as 0 <= 50us < 1
    - 2 leading dummy setup pulses from start edge ignored
  + makes callback (cb) with a JSON object having err, t, and rh keys
    - err = false if reading good; if true the bitstream bs is included
    - t and rh valid for all sensor types except DHT11 (RHT01)
  + attempts read 3 times (code carryover), but never seems to fail more than first time
    - added 500ms delay between tries based on datasheet
  + Tested for Espruino board 1v4 and DHT22, but should work for Pico and
    - DHT21 = RHT02 = AM2301 = HM2301
    - DHT22 = RHT03 = AM2302
    - DHT33 = RHT04 = AM2303
    - DHT44 = RHT05
  + not compatible with original module

// example...
function cb(e,js) {
	console.log("answer: "+(e!=0),JSON.stringify(js));
  }

var ht = new (require("HTxx"))(A0);
ht.read(cb);

*/


// Sensor object constructor
exports = HT = function HT(pin) { this.pin = pin; }

// sensor query method...
/** read sensor as either...
  read(callback);
  read(callback,number_of_trys); - default=3
  */
HT.prototype.read = function (cb,n) {
  n = (n===undefined)?3:n;
  if (n<1) {cb(1,{bs:this.bs}); return;}
  this.bs = "";
  var ht = this;
  pinMode(ht.pin);
  digitalWrite(ht.pin,0);
  this.watch = setWatch(function(t) { ht.bs += (((t.time-t.lastTime-0.00005)>0)?1:0);}, ht.pin, {edge:'falling',repeat:true} );
  setTimeout(function() {pinMode(ht.pin,'input_pullup');},1);
  setTimeout(function done() {
    clearWatch(ht.watch);
    if (ht.bs.length==42) {
      var b = [0,0,0,0,0];
      for(var i=0;i<5;i++) b[i]=parseInt(ht.bs.substr(2+8*i,8),2);
      var cks = b[0]+b[1]+b[2]+b[3];
      if (cks&&((cks&0xFF)==b[4])) return cb(0,{rh:((b[0]<<8)+b[1])*0.1,t:(((0x7F&b[2])<<8)+b[3])*((b[2]&0x80)?-0.1:0.1)});
      }
    setTimeout(function() {ht.read(cb,--n);},500);
    },6);
  };
