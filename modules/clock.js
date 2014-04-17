/* Copyright (c) 2014 Martin Green. See the file LICENSE for copying permission. */
/*
Clock Module
*/

//var exports={};

print("Clock: Loading Date");

var Date=require("date").constructor;

print("Clock: Done loading Date");

// Constructor

function Clock(arguments) {

    this.lastTime=0;
  
    Date.apply(this, arguments); 
}

Clock.prototype = new Date();          
Clock.prototype.constructor=Clock;       

Clock.prototype.setClock = function(dt) {
  
  var tm=dt.getTime();
  this.timeOffset=getTime()-tm;
  
  this.setTime(tm);
};

Clock.prototype.tick = function (t) {

    this.addTime(1000);
};

Clock.prototype.getClockTime = function () {

    var t=getTime();
    var diff=t-this.lastTime;
  
    this.addTime(diff*1000);
  
    this.lastTime=t;
  
    return(this);
};

exports.constructor = Clock;

print("Clock: Loaded.");


