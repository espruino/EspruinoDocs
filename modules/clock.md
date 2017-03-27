<!--- Copyright (c) 2014 Martin Green. See the file LICENSE for copying permission. -->
Clock Module
===========

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/clock. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Clock,Date,Calendar,RTC

This [[clock.js]] module implements a Clock for Espruino.  It uses the [[date]] module to store 
both time and date.

How to use the module:

```
  var Clock = require("clock").Clock;
  var clk=new Clock(2014,4,15,23,45,0,0);   // Initialise with specific date
  var clk=new Clock("Jun 23, 2014 12:18:02");   // ... or Initialise with specific date from a string

  // every time the button is pressed, print the current time..
  setWatch(function() {
    var d1=clk.getDate(); 
    print(d1.toString()); // prints "Thu May 15 2014 23:45:05" 
  }, BTN, { edge : "rising", repeat : true, debounce : 10 } );

  // You can also update the current time
  clk.setClock(Date.parse("Jun 23, 2014 12:18:02"));
```

Reference
--------------
 
* APPEND_JSDOC: clock.js

