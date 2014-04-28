/* Copyright (c) 2014 Martin Green. See the file LICENSE for copying permission. */
/*
Date Module - subset of JS date object
*/

// Include this for testing 

//var exports={};	

var C = {
  YDAY : 365,
  LDAY : 366, 
  FDAY : 4*365+1,
  BASE_DOW :4,
  BASE_YEAR : 1970,

  MSDAY : 24*60*60*1000,

  DAYS : [0,31,59,90,120,151,181,212,243,273,304,334,365],
  LPDAYS : [0,31,60,91,121,152,182,213,244,274,305,335,366],

  YDAYS : [0,365,365*2,365*3+1],
  
  DAYNAME : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
  MONTHNAME : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
};

/** Constructor - support variable arguments
  * Zero arguments - initialise at 1970
  * 1 arguments - pass in a number of milliseconds since 1970 or a date.
  * 7 arguments - pass in year, month, day, hour, min, sec, ms */
function Date() {  
  switch(arguments.length)
    {
    case 0:
      this.setTime(0);	
      break;
    case 1:
      var arg=arguments[0];
      if (typeof arg === "number")
        {
        this.setTime(arg);
        }
      else if (typeof arg === "string")
        {
          print("Parsing string dates not implemented");
        }
      break;
    case 7:
      this.set(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5],arguments[6]);
      break;
    default:
      print("Called with wrong # args");
      break;
    }
}

// We do not want to recompute things every time, so we have a flag which is
// set if someone changes an important field...

Date.prototype.checkDSE=function() {
  if (this.epday===-1)
    {
    this.epday=this.getDaysSinceEpoch();
    this.dow=(this.epday+C.BASE_DOW)%7;
    }
};

// This is based on http://www.ethernut.de/api/gmtime_8c_source.html but
// via a LUA version on stackoverflow, modified quite a bit

// YDAY = days in a year
// LDAY = days in a leap year
// FDAY = days in a 4-year interval
// BASE_DOW = base day of week - 1970-01-01 was a Thursday
// BASE_YEAR = 1970 is the base year

// Return the number of days since the 1970 Epoch, allowing for leap years
// Only supports dates after 1970 or before 2100

// This is zero-based = Jan 1st 1970 is day 0.  (Hence -1 on end of return - 'day' is 1-based)

Date.prototype.getDaysSinceEpoch=function() {   
  var y=this.year-C.BASE_YEAR;
  var f=Math.floor(y/4);
  var yf=y-f*4;
  var mdays;

  var ydays=yf*C.YDAY;
  
  if (yf===2) {
    mdays=C.LPDAYS;
  } else {
    mdays=C.DAYS; 
  }
  
  if (yf>=2) {
    ydays=ydays+1;
  }

  var d=f*C.FDAY+C.YDAYS[yf]+mdays[this.month]+this.day-1;
  
  return d;
};

// First calculate the number of four-year-interval, so calculation
// of leap year will be simple. Btw, because 2000 IS a leap year and
// 2100 is out of range, the formlua is simplified

Date.prototype.setDaysSinceEpoch=function(d_in) {
  var y,j,m,w,h,n;
  var mdays=C.DAYS;
  var d=d_in;

  this.epday=d_in;
  
  y=Math.floor(d/C.FDAY);
  d=d-y*C.FDAY;
  y=y*4+C.BASE_YEAR;
  
  if (d>=C.YDAY)
    {
    y=y+1;                  // Second year in four - 1971
    d=d-C.YDAY;
    if (d>=C.YDAY)
      {
      y=y+1;				// Could be third or fourth year
      d=d-C.YDAY;
      if (d>=C.LDAY)
        {
        y=y+1;              // Definitly fourth
        d=d-C.LDAY;
        }
      else                  // Third - leap year
        {
        mdays=C.LPDAYS;
        }
      }
    }

  this.year=y;
  
  //Find the month

  m=0;
  while (mdays[m]<d+1)
  {
    m=m+1;
  }
  this.month=m-1;  
  this.day=d-mdays[this.month]+1;


  // Calculate day of week. Sunday is 0

  this.dow=(this.epday+C.BASE_DOW)%7;
};

// Get the number of milliseconds since 1970 epoch for this date object

Date.prototype.getTime=function() {
    this.checkDSE(); 

    return( ((this.hour*60+this.min)*60+this.sec)*1000+this.epday*C.MSDAY+this.ms);
};

// Set the date/time given time in milliseconds since 1970 epoch

Date.prototype.setTime=function(t) {
    var d=Math.floor(t/C.MSDAY);
    var ms=t-d*C.MSDAY;
    var s=Math.floor(ms/1000);

    this.ms=ms-s*1000;
    this.hour=Math.floor(s/3600);
    s=s-this.hour*3600;
    this.min=Math.floor(s/60);
    this.sec=s-this.min*60;

    this.setDaysSinceEpoch(d);
};

// JS Date Object API

Date.prototype.getMilliseconds=function(){return(this.ms);};
Date.prototype.getSeconds=function(){return(this.sec);};
Date.prototype.getMinutes=function(){return(this.min);};
Date.prototype.getHours=function(){return(this.hour);};

Date.prototype.getDate=function(){return(this.day);};
Date.prototype.getDay=function(){this.checkDSE(); return(this.dow); };
Date.prototype.getFullYear=function(){return(this.year);};
Date.prototype.getMonth=function(){return(this.month);};

Date.prototype.setMilliseconds=function(m){this.ms=m;};
Date.prototype.setSeconds=function(s){this.sec=s;};
Date.prototype.setMinutes=function(m){this.min=m;};
Date.prototype.setHours=function(h){this.hour=h;};

Date.prototype.setDate=function(d){this.day=d;this.epday=-1;};
Date.prototype.setMonth=function(m){this.month=m;this.epday=-1;};
Date.prototype.setFullYear=function(y){this.year=y;this.epday=-1;};

Date.prototype.set=function(y,m,d,h,min,s,ms){
  this.year=y;this.month=m;this.day=d;this.hour=h;this.min=min;this.sec=s;this.ms=ms;this.epday=-1;this.checkDSE();
};

function lz2(x) { return (x < 10) ? ("0" + x) : x; }

Date.prototype.toDateString=function(){return(C.DAYNAME[this.dow]+" "+C.MONTHNAME[this.month]+" "+this.day+" "+this.year);};
Date.prototype.toTimeString=function(){return(lz2(this.hour)+":"+lz2(this.min)+":"+lz2(this.sec));};
Date.prototype.toString=function(){return(this.toDateString()+" "+this.toTimeString());};

// Add a number of miliseconds to a date object.  Written to be quicker if the number being
// added is smaller. This is designed to be used by a clock function.  When a caller wants
// to know the time, they call getTime, find how many milliseconds have elapsed and then
// update the clock date/time.  

Date.prototype.addTime=function(t) {
  var s=Math.floor(t/1000);
  var ms=t-s*1000;

  this.ms=this.ms+ms;
  if (this.ms>1000) {
    this.ms-=1000;
    s=s+1;
  }

  if (s>0) {
    var min=Math.floor(s/60);
    s=s-min*60;

    this.sec=this.sec+s;
    if (this.sec>60) {
      this.sec-=60;
      min=min+1;
    }

    if (min>0) {
      var hr=Math.floor(min/60);
      min=min-hr*60;

      this.min=this.min+min;
      if (this.min>60) {
        this.min-=60;
        hr+=1;
      }

      if (hr>0) {
        var d=Math.floor(hr/24);
        hr=hr-d*24;

        this.hour=this.hour+hr;
        if (this.hour>24) {
          this.hour-=24;
          d+=1;
        }

        if (d>0) {
          this.checkDSE();
          this.setDaysSinceEpoch(this.epday+d);
        }
      }
    }
  }
};

exports.Date=Date;
