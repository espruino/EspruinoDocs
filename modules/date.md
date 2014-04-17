<!--- Copyright (c) 2014 Martin Green. See the file LICENSE for copying permission. -->
Date Module
=====================

* KEYWORDS: Module, date

This module implements a subset of the JS Date Object. At present you can construct
dates, convert them to strings, and add a number of milliseconds to a date.  It
supports dates from 1970 up to 2100, but does not handle >=2100.

Use the [Date](/modules/date.js) ([About Modules](/Modules)) module for it.

How to use my module:

```
  var Date = require("Date").constructor;
  
  var d1=new Date();        // Creates date using getTime() to initialise - not much use
  var d1=new Date(1234);    // Creates date and initialises to 1234 milliseconds from 1/1/1970
  var d1=new Date(2014,4,15,23,45,0,0);    // Creates date and initialises to a specific date including ms
  
```
