/* Copyright (c) 2014 Martin Green. See the file LICENSE for copying permission. */

/** Clock constructor. Arguments to this
are in exactly the same form as those
to the built-in Date constructor. */
function Clock() {
  this.lastTime = getTime();  
  if (arguments.length>1)
    this.date = new Date(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5],arguments[6]);
  else if (arguments.length==1)
    this.date = new Date(arguments[0]);
  else
    this.date = new Date();
}
exports.Clock = Clock;

/** setClock(milliseconds since 1/1/1970) */
Clock.prototype.setClock = function(ms) {  
  this.lastTime = getTime();  
  this.date = new Date(ms);
};

/** Return the current clock time, as a date object.  We calculate the number
 of milliseconds since setClock or the constructor was called, and 
 add this to the date that was set at that time. */
Clock.prototype.getDate = function () {
  return new Date((getTime()-this.lastTime)*1000 + this.date.getTime());
};





