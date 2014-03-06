  /* Copyright (C) 2014 Spence Konde. See the file LICENSE for copying permission. */
  /*
This module interfaces with a DHT22 temperature and relative humidity sensor.
Usage (any GPIO pin can be used):

var dht = require("DHT22").connect(C11);
dht.read(function (a) {console.log("Temp is "+a.temp.toString()+" and RH is "+a.rh.toString());});

  */

exports.connect = function(pin) {
    return new DHT22(pin);
}

function DHT22(pin) {
  this.pin = pin;
  this.readfails=0;
}
DHT22.prototype.read = function (a) {
    this.onreadf=a;
    this.i=0;
    this.out=1;
    pinMode(this.pin);
    var dht = this;
    setTimeout(function() {digitalWrite(dht.pin,0);},2)
    setTimeout(function() {pinMode(dht.pin,'input_pullup');dht.watch=setWatch(function(t) {dht.onwatch(t);},dht.pin,{repeat:true});},5);
    setTimeout(function() {dht.onread(dht.endRead());},50);
};
DHT22.prototype.onread= function(d) {
    var dht=this;
    if (d.temp==-1) {
        dht.readfails++
        if(dht.readfails < 20) {
            dht.read(dht.onreadf);
        } else {
            dht.onreadf(d);
        }
    } else {
        dht.readfails=0;
        dht.onreadf(d);
    }
};
DHT22.prototype.onwatch = function(t) {
    if (t.state) {
        this.pstart=t.time;
    } else {
        var tt=t.time-this.pstart;
        this.out=(this.out<<1) | ((tt > 0.000044) && (tt < 0.0001));
        this.i++;
    }
};
//The base rightshift of 3 (ie 32-3) was empirically determined. 
DHT22.prototype.endRead = function() {
    clearWatch(this.watch);
    if (this.i > 32) {
        var rh=((this.out>>(this.i-13))&0x0FFF)*0.1;
        var temp=(this.out>>(this.i-29)&0x7FFF)*0.1;
        if (this.out>>(this.i-29)&0x8000) {
            temp=temp*-1;
        }
        if (rh < 100 ) {
            return {"temp":temp,"rh":rh};
        }
    }
    return {"temp":-1,"rh":-1};
};
