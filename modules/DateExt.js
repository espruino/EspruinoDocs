/* DateExt.js (c) 2016-2017 Enchanted Engineering, MIT license */

/*
Date Object Extensions to support local times...
At start of program, require and optionally set locale data:
  require('DateExt'); // uses defaults
  
Same as: 
  require('DateExt').locale({zone:['UTC','UTC'], offset:[0,0], dst:0, str:"UY-0M-0D'T'0h:0m:0s'Z'"});

US Mountain Time Exmaple:
  require('DateExt').locale({zone:['MST','MDT'], offset:[420,360], dst:0, str:"Y-0M-0D'T'0h:0m:0s z"});

locale parameters...
  dst: flag set to 0 or 1 to indicate whether daylight savings time is in effect
  zone: 2 element array of zone names to use for standard and daylight times, respectively
  offset: 2 element array of offset from UTC in minutes to use for standard and daylight times, respectively
    Note: By ISO, offset uses a negative value, i.e. '-':zones ahead of UTC, '+':zones behind UTC
  str: default format string for as() method.
  
Date.prototype.local(optionalLocaleDefinition)
Method to optionally set locale paramters and return a "local-adjusted" date object
  var d = new Date();
  console.log(d, d.local());
  d.local({dst:1}); // changes to daylight savings time (DST) until changed back
  console.log(d, d.local());
  d.local({dst:0}); // changes to standard time until changed to DST
  console.log(d, d.local());
  
Date.prototype.as(format);
Method to format Date as specified by optional format
  d.as()                // returns an object "represeting" the date, not the same a Date object!
  d.local().as()        // returns an object represeting the local date 
  d.as().str            // returns just the str element (in default format) of the date
  d.as("T, D/M/Y").str  // returns a str for the date. See Date parsing spec 
  
Date Spec
The as() method internally generates a "representative" date object used in 
formatting the output string (str) and returned by as(). The format string 
spec uses non-standard syntax (even though I'm not sure a standard exists as 
every language seems to do its own thing) in order to keep all fields to 1 
character and simplify string parsing, given limited resources of Espruino. 
The representative date has the following fields; all but "tx", "dst", and 
"str" may be used in the format specification:
  U: Specifies to use UTC time, even if a local date provided. Must be first character!
  Y: FullYear
  V: 2-digit year
  M: Month, i.e. Jan=1
  C: 3-letter text for "C"alendar Month
  D: Day of the Month 
  W: Day of the Week
  T: 3-letter "T"ext for the Day of the Week
  h: Hours (24 hour format)
  i: Hours (12 hour format)
  m: Minutes 
  s: Seconds
  x: Milliseconds, fractional seconds, not same as [date].ms
  a: AM or PM
  z: Zone as specified by locale data, always UTC if frmt begins with U
  e: Unix epoch in seconds, valid for UTC or local dates
  tx: a record of time units suitable for creating a new date, useful for date arithmetic
  dst: Daylight Savings Time flag
  str: the resulting formatted time string
Also,  
  0: Prefixing M, D, W, h, i, m, s or x with zero pads result (i.e. for h=3, 0h=>03) 
     Note use 00x for milliseconds.
  ' or ": Quoted substrings, single or double, pass directly to output string (str)
*/

// sets date prototype locale info
function locale (lclDef) {
  if (lclDef) for (var k in lclDef) Date.prototype.locale[k] = lclDef[k];
  return Date.prototype.locale;
}

// default locale data...
Date.prototype.locale = {zone:['UTC','UTC'], offset:[0,0], dst:0, str:"UY-0M-0D'T'0h:0m:0s'Z'"};

// Method to set locale and a retrieve local date.
Date.prototype.local = function (lclDef) {
  locale(lclDef); // set locale if definition provided (in whole or part)
  if (this.lcl) return this;  // already a local date value so return
  // otherwise make a local date value
  var d = new Date(this.valueOf()-this.locale.offset[this.locale.dst]*60000);
  d.lcl = true;                 // flag as a local date
  d.toString = function() { return d.as().str; };    // fix string conversion
  return d;
};

Date.prototype.as = function(frmt) {
  // default the format, use UTC date if frmt begins with 'U', and strip U character
  frmt = frmt||this.locale.str; 
  var utc = (frmt && frmt.charAt(0).toUpperCase()=='U');
  frmt = utc ? frmt.substr(1) : frmt;
  // figure out if local or UTC date and set appropriately...
  var d = this;
  if (this.lcl||false==utc) d = (utc) ? new Date(d.valueOf()+d.locale.offset[d.locale.dst]*60000): d.local();
  // build the date definition...
  var dx = {
    U: utc,
    Y: d.getFullYear(),
    V: d.getFullYear()%100,
    M: d.getMonth()+1, 
    D: d.getDate(), 
    W: d.getDay(),
    h: d.getHours(),
    i: d.getHours()%12,
    m: d.getMinutes(), 
    s: d.getSeconds(),
    x: d.getMilliseconds(),
    z: utc ? 'UTC' : d.locale.zone[d.locale.dst],
    e: Math.round((utc ? d.valueOf() : d.valueOf()+d.locale.offset[d.locale.dst]*60000)*0.001)
    };
  // add-ons that require dx to first be defined...
  dx.T = 'SunMonTueWedThuFriSat'.substr(3*dx.W,3);
  dx.C = 'JanFebMarAprMayJunJulAugSepOctNovDec'.substr(3*(dx.M-1),3),
  dx.a = dx.h>12 ? 'PM':'AM';
  // non-format values...
  dx.tx = [dx.Y,dx.M-1,dx.D,dx.h,dx.m,dx.s,dx.x];
  dx.dst=this.locale.dst;
  dx.str='';
  // format the output string...
  var ch=''; var q=''; var z=0;
  for (var i in frmt) {
    ch = frmt[i];
    if (q) { if (ch!=q) {dx.str+=ch;} else {q=''}; continue; }; // quoted strings
    if (ch=='"'||ch=="'") { q=ch; continue; };                  // mark quote start
    if (ch=='0') { z++; continue; };                            // zero padding
    // (padded) format ch or non-format ch
    dx.str += ('YVMDTWChimsxaze'.indexOf(ch)!=-1) ? (z ? ('000'+dx[ch]).slice(-z-1) : dx[ch]) : ch;
    z=0;
  }
  return dx;
};

// export the locale function for calling at time of require
exports.locale = locale;
