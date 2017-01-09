<!--- Copyright (C) 2016 Enchanted Engineering. See the file LICENSE for use. -->

# Local Date Extensions

* KEYWORDS: Module, Espruino, Date, extensions, local, locale, format

## APPLICATION

This module defines a few Date object extensions to add local time support to Espruino. A simple declaration at the start of a program enables reporting date and time functions in local time as opposed to Espruino's default format of GMT+0000.

## MODULE REFERENCE

### Require

```javascript
  // At start of program, require and optionally set locale data:
  require('DateExt'); // uses defaults
  // Same as: 
  require('DateExt').locale({zone:['UTC','UTC'], offset:[0,0], dst:0, str:"UY-0M-0D'T'0h:0m:0s'Z'"});
  // Example for defining local time as US Mountain Time:
  require('DateExt').locale({zone:['MST','MDT'], offset:[420,360], dst:0, str:"T C 0D Y 0h:0m:0s z"});
```

locale parameters include:
  - **dst**: flag set to 0 or 1 to indicate whether daylight savings time is in effect.
  - **zone**: 2 element array of zone names to use for standard and daylight times, respectively.
  - **offset**: 2 element array of offset from UTC in minutes to use for standard and daylight times, respectively.
    Note: By ISO, offset uses a negative value, i.e. '-':zones ahead of UTC, '+':zones behind UTC
  - **str**: default format string for **as()** method. Set to ISO UTC Date Time format.

### Methods

Date Extensions provides two new Date methods in support of local dates and times.

#### Date.prototype.local(optionalLocaleDefinition)

Method to optionally set locale paramters and return a "local-adjusted" date object.

```javascript
  var d = new Date();
  console.log(d, d.local());
  d.local({dst:1}); // changes to daylight savings time (DST) until changed back
  console.log(d, d.local());
  d.local({dst:0}); // changes to standard time until changed to DST
  console.log(d, d.local());
```

#### Date.prototype.as(format)

Method to format Date as specified by optional format.

```javascript
  d.as()                // returns an object *represeting* the date, not the same a Date object!
  d.local().as()        // returns an object represeting the local date
  d.as().str            // returns just the str element (in default format) of the date
  d.as("T, D/M/Y").str  // returns a str for the date. See Date Specification.
```

### Date Specification
The **as()** method internally generates a *representative* date object used in formatting the output string (str) and returned by **as()**. The format string spec uses non-standard syntax (even though I'm not sure a standard exists as every language seems to do its own thing) in order to keep all fields to 1 character and simplify string parsing, given limited resources of Espruino. The representative date has the following fields; all but "tx", "dst", and "str" may be used in the format specification:

  - **U**:  Specifies to use UTC time, even if a local date provided. Must be first character!
  - **Y**:  FullYear
  - **V**:  2-digit Year
  - **M**:  Month, i.e. Jan=1
  - **C**:  3-letter text for "C"alendar Month
  - **D**:  Day of the Month 
  - **W**:  Day of the Week
  - **T**:  3-letter "T"ext for the Day of the Week
  - **h**:  Hours (24 hour format)
  - **i**:  Hours (12 hour format)
  - **m**:  Minutes 
  - **s**:  Seconds
  - **x**:  Milliseconds, fractional seconds, not same as [date].ms
  - **a**:  AM or PM
  - **z**:  Zone as specified by locale data, always UTC if frmt begins with U
  - **e**:  Unix epoch in seconds, valid for UTC or local dates
  - **tx**:  a record of time units suitable for creating a new date, useful for date arithmetic
  - **dst**:  Daylight Savings Time flag
  - **str**:  the resulting formatted time string
  
  Hint: upper case => Date values; lower case => time values; multicharacter => non-format
  
Also,

  - **0**: Prefixing M, D, W, h, i, m, s or x with zero pads result (i.e. for h=3, 0h=>03) 
     Note use 00x for milliseconds.
  - **' or "**: Quoted substrings, single or double, pass directly to output string (str)

### Example Test Code
    
```javascript
// dateExt.js test

// Define local time as US Mountain Time
require('DateExt').locale({zone:['MST','MDT'], offset:[420,360], dst:0, str:"T C 0D Y 0h:0m:0s z"});

// example to show UTC and MST equivalents
console.log('Some examples of the same date...');
var d = new Date();
console.log(d.as().str, d.local().as().str);
d.local({dst:1}); // permanently changes to daylight savings time (DST) until changed back
console.log(d.as().str, d.local().as().str);
d.local({dst:0}); // permanently changes to standard time until changed to DST
console.log(d.as().str, d.local().as().str, '\n', d.local().as(), '\n');

// all fields
console.log('All format fields...');
console.log(d.local().as("UC, YMD, W, T, h:m:s.00x 0i:0m:0s a z = e").str, '\n');
console.log(d.local().as("C, VMD, W, T, h:m:s.00x 0i:0m:0s a z = e").str, '\n');

// 4 cases of time
console.log('Four format cases...');
console.log("UTC date as UTC str:    ",d.as("U0h:0m:0s z").str);
console.log("UTC date as local str:  ",d.as("0h:0m:0s z").str);
console.log("Local date as UTC str:  ",d.local().as("U0h:0m:0s z").str);
console.log("Local date as local str:",d.local().as("0h:0m:0s z").str);

// toString() results
console.log('toString results...');
console.log(d.toString());
console.log(d.local().toString());
```

#### Example output for above test script...

```
Some examples of the same date...
Thu Dec 15 2016 14:27:07 MST Thu Dec 15 2016 14:27:07 MST
Thu Dec 15 2016 15:27:07 MDT Thu Dec 15 2016 15:27:07 MDT
Thu Dec 15 2016 14:27:07 MST Thu Dec 15 2016 14:27:07 MST
 { "U": false, "Y": 2016, "V": 16, "M": 12,
  "D": 17, "W": 6, "h": 14, "i": 2, "m": 8,
  "s": 37, "x": 242,
  "z": "MST",
  "e": 1482008917,
  "T": "Sat",
  "C": "Dec",
  "a": "PM",
  "tx": [ 2016, 11, 17, 14, 8, 37, 242 ],
  "dst": 0,
  "str": "Sat Dec 17 2016 14:08:37 MST"
 }
All format fields...
Dec, 20161215, 4, Thu, 21:27:7.016 09:27:07 PM UTC = 1481837227
Dec, 161215, 4, Thu, 14:27:7.016 02:27:07 PM MST = 1481837227
Four format cases...
UTC date as UTC str:     21:27:07 UTC
UTC date as local str:   14:27:07 MST
Local date as UTC str:   21:27:07 UTC
Local date as local str: 14:27:07 MST
toString results...
Thu Dec 15 2016 21:27:07 GMT+0000
Thu Dec 15 2016 14:27:07 MST
```

## Reference

[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date]

Useful for [Cron.js] module to base actions on local time.

## Using

* APPEND_USES: DateExt.js
