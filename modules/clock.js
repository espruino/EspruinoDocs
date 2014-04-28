/* Copyright (c) 2014 Martin Green. See the file LICENSE for copying permission. */

/** Clock constructor.  Apply is used to pass all arguments to the Date
  * constructor */
function Clock() {
  this.lastTime = 0;  
  this.date = new (require("date").Date)();
  this.date.constructor.apply(this.date, arguments);
}

/**  setClock(milliseconds since 1/1/1970) */
Clock.prototype.setClock = function(ms) {  
  this.date.setTime(ms);
};

/** Return the current clock time, as a date.  We calculate the number
  * of milliseconds since last called, and add this to the current 
  * time.
  *
  * This approach is designed to save power - we don't use an interval
  * to increment a clock because this prevents deep sleep */
Clock.prototype.getClockTime = function () {
  var t = getTime();
  var diff = t-this.lastTime;
  
  this.date.addTime(diff*1000);
  
  this.lastTime = t;
  
  return this.date;
};

exports.Clock = Clock;



