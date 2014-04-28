<!--- Copyright (c) 2014 Martin Green. See the file LICENSE for copying permission. -->
Clock Module
=====================

* KEYWORDS: Module, clock

This module implements a Clock for Espruino.  It uses the Date module to hold a
time/date value with milliseconds. 

Use the [Clock](/modules/clock.js) ([About Modules](/Modules)) module for it.

How to use my module:

```
  var Clock = require("Clock").constructor;
  
  var clk=new Clock(2014,4,15,23,45,0,0);   // Initialise with specific date
  
  var d1=clk.getClockTime();      // Get current time
  print(d1.toString());
  
  for(var i=0;i<100000;i++);      // Waste time - sorry @Gordon :)
    
  d1=clk.getClockTime();          // Get current time
  print(d1.toString());
  
  
```
