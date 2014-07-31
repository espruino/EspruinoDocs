  /* Copyright (C) 2014 Spence Konde. See the file LICENSE for copying permission. */
  /*
This module interfaces with a DHT11 temperature and relative humidity sensor.
Usage (any GPIO pin can be used):

var dht = require("DHT11").connect(C11);
dht.read(function (a) {console.log("Temp is "+a.temp.toString()+" and RH is "+a.rh.toString());});

3/4/2014 - Code cleanup based on DHT22 work. 

  */

exports.connect = function(pin) {
    return new DHT11(pin);
}

function DHT11(pin) {
  this.pin = pin;
  this.readfails=0;
  this.tout=0;
  this.hout=0;
  this.cks=0; 
}
DHT11.prototype.read = function (a) {
    if (this.watch) return;
    this.onreadf=a;
    this.i=0;
    this.tout=0;
    this.hout=0;
    this.cks=0; 
    pinMode(this.pin);
    var dht = this;
    digitalWrite(this.pin,0);
    this.watch=setWatch(function(t) {dht.onwatch(t);},dht.pin,{repeat:true});
    setTimeout(function() {pinMode(dht.pin,'input_pullup');},3);
    setTimeout(function() {dht.onread(dht.endRead());},30);
};
DHT11.prototype.onread= function(d) {
    var dht=this;
    if (d.temp==-1) {
        dht.readfails++
        if(dht.readfails < 20) {
            dht.read(dht.onreadf);
        } else {
            dht.onreadf(d);
            dht.readfails=0;
        }
    } else {
        dht.readfails=0;
        dht.onreadf(d);
    }
};
DHT11.prototype.onwatch = function(t) {
    if (t.state) {
        this.pstart=t.time;
    } else {
        var tt=t.time-this.pstart;
        if (tt < 0.0002) {
            this.recbit(tt,this.i);
            this.i++;
        }
    }
};
DHT11.prototype.recbit = function(plen,bit) {
    if (bit==0){} else if (bit < 17) {
        this.hout=(this.hout<<1) | (plen > 0.000035);
    } else if (bit < 33) {
        this.tout=(this.tout<<1) | (plen > 0.000035);
    } else {
        this.cks=(this.cks<<1) | (plen > 0.000035);
    }
}
DHT11.prototype.endRead = function() {
    if (this.watch) clearWatch(this.watch);
    this.watch = undefined;
    var tcks = this.hout&0xFF;
    tcks+= (this.hout>>8)&0xFF;
    tcks+= (this.tout&0xFF);
    tcks+= (this.tout>>8)&0xFF;
    tcks=tcks&0xFF;
    if (this.cks==tcks) {
        var rh=(this.hout>>8)&0xFF;
        var temp=(this.tout>>8)&0xFF;
        if (rh < 100 && rh > 0) {
            return {"temp":temp,"rh":rh};
        }
    }
    return {"temp":-1,"rh":-1};
};
