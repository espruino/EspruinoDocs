<!--- Copyright (C) 2016 Enchanted Engineering. See the file LICENSE for use. -->

# Simple Linux-like Cron system

* KEYWORDS: Espruino, module, cron, cronjob, task

## APPLICATION

This module defines a simple Linux-like Cron system for Espruino. It supports 
'*' wildcard and list formats, but in the interest of minimal footprint, it 
does not support modulo (/) and range (-) shortcut formats, nor does it 
support Cron keywords such as @year, @month, etc.

Intended to be a single instance to limit resources and timer overhead.
Multiple instances will all reference same job queue and timer, thus multiple 
instances will see the same jobs and init calls will supercede previous calls 
by other instances.

Works with DateExt (Date Extensions) module if used to match local time values. 
A second argument passed to the constructor, set to true, can be used to force 
UTC if so desired when DateExt has been included. This is only necessary if 
DateExt is included and you don't want to use local time.

## MODULE REFERENCE

### Require

```javascript
  // create a cron object with 1 min interval 
  var cron = require("Cron")(1); // omit "1" for default(=5)
```

### Jobs
Define jobs using the job method as

```javascript
  cron.job({id:'...', time:[...], cb:'...', cbThis: this, args:[...], n:#}); 
```
Where the cronjob object passed to job may contain:
  - **id**: Unique reference name for job and event signal name. See Job *id* Notes.
  - **time**: String or array that specifies the match time(s). See Time Notes.
  - **cb**: Optional callback to call instead of 'id' event
  - **cbThis**: Optional 'this' context for callback
  - **args**: Optional arguments for callback 
  - **n**: Optional number of times to run job; job deleted after n events
  
  Calling the job method with or without an object returns the current job list. Jobs triggering on the same time do not get processed in any particular guaranteed order.

#### Job *id* Notes
  - Cron uses the *id* as the reference key to store the job object and
    as the event-emitter event.
  - Defining a new job with same *id* replaces an existing job with that *id*
  - Specifying only a job *id* with no time spec removes that job from list
  - When the time spec matches the clock time...
    - If the callback (cb) is defined it is called.
    - Otherwise, the cron instance emits an *id* event 
  
#### Time Notes
  - The time record specifies in order [min,hr,day,month,dayOfWk]
    The time may be specified as a traditional cron-style string, for example,
    '5 0,12, * * 1' --> 5 min after midnight and noon Monday
  -- Alternately, the time may be specified as an array, for example,
    [5,[0,12],'*','*','1'] --> 5 min after midnight and noon Monday
  - Time fields may be integer, string values, array of integers or strings, or *
  - Cron supports wildcard (*) and comma delimited lists, but does not
    support modulo (/), range (-), and Cron keyword shortcut syntaxes.
  - Cron will use local time if a require('DateExt') call has been made 
    and utc (i.e. second constructor paramter) is false.

### Other Methods
#### init(<minutes>)
Enables or disables the Cron timer tick interval. Called with no parameter 
it starts or restarts the timer with the default time period set when the 
instance was defined, which defaults to 5 minutes if no given. Called with 
an integer minutes parameter, it starts or restarts the timer tick at that 
interval. When called with 0 it stops the internal timer tick. When started 
the timer delays by an offset (os) timeout to sync the tick with the 
closest time interval. That is, a 5 minute interval for example will fire at
0, 5, 10, ... minutes. The variable **cron.tmr** can be used to peek at the 
internal timer state, but should not be altered (i.e. treat as read-only). 
**cron.tmr** returns an object specifying dt: delta time in milliseconds,
os: initial timeout offset, t: timeout timer handle, i: interval timer handle,
and x: a string representing the last time match pattern. 
#### *private* tick()
Internal callback method that tests jobs records for match to current time 
and fires off jobs. This method is private and not exposed through the cron
instance.

### Example
    
```javascript
cron.job({id:"job1",time:'* * * * *'}); // define a job, time string format 
cron.job({id:"job2",time:[...]});   // define another cron job 
...
cron.on("job1", function() {...});  // event handler, where "job1"=job id
                                    // fires when cron job spec matches time,
                                    // only if no callback supplied.
...
cron.init(1);                       // start timer w/1 min update
cron.init();                        // start timer w/5 min (default) update
...
cron.job({id:"job2"});              // delete unneeded job named "job2"
...
cron.job({id:"job1",time:[...]});   // redefine existing "job1"
...
cron.init(0);                       // stop cron timer, can restart any time

```
### Test Code Example

```javascript
// cron test example...

// optional support of local time...
require('DateExt').locale({zone:['MST','MDT'], offset:[420,360], dst:0, str:"Y-0M-0D'T'0h:0m:0s z"});

var cron = require("Cron")(); // a single instance
var d = new Date();

// callback function for job test4...
var color = 'blue';
function cb4(x) {
  var d = new Date().toString();
  console.log("test4 cb: ",this.color, color, x, d);
  this.color = color;
  color = x;
  //console.log("test4 this: ",this);
  }

// define a few jobs...
cron.job({id:"test",time:'* * * * *'});   // time string format
cron.job({id:"test2",time:[[0,15,30,45],'*','*','*','*']}); // time array format
var m=d.getMinutes()+5; var hr=d.getHours(); if (m>60) { m=m%60; hr++};
cron.job({id:"test3",time:[[m,m+2],hr,'*','*','*']});
/// change minute/hour times for test3 example to times appropriate when demo runs
cron.job({id:"test3",time:'57,59 16 * * *'}); // redefined, overrides above if run
cron.job({id:"test4",time:'* * * * *',cb:cb4,ths:this,args:'red',n:3}); // only runs 3 times

// define event handlers as aalternative to callbacks...
cron.on("test", function() {
  console.log("test: ",cron.tmr);
  });
cron.on("test2", function() {
  console.log("test2: ",new Date().toString());
  });
cron.on("test3", function() {
  console.log("test3: ",new Date().toString());
  });
cron.on("test4", function() {
  console.log("test4 err: ",new Date().toString());  // should never get called
  });

// display state of cron and time...
console.log("start: ",d.toString());
console.log("jobs:",cron.job());

// start things going...
cron.init(1);
//cron.init();  // runs at default 5 min time
console.log("tmr: ",cron.tmr);
// stop things after 10 minutes...
setTimeout(function() { cron.init(0); }, 10*60*1000);

/*
// example output for above test script...
tmr:  { "dt": 60000, "os": 37897, "t": 1, "i": null, "x": "" }
test4 cb:  undefined blue red Mon Dec 12 2016 16:55:00 GMT+0000
test:  { "dt": 60000, "os": 37897, "t": null, "i": 3, "x": "55,16,12,11,1" }
test4 cb:  blue red red Mon Dec 12 2016 16:56:00 GMT+0000
test:  { "dt": 60000, "os": 37897, "t": null, "i": 3, "x": "56,16,12,11,1" }
test4 cb:  red red red Mon Dec 12 2016 16:57:00 GMT+0000
test:  { "dt": 60000, "os": 37897, "t": null, "i": 3, "x": "57,16,12,11,1" }
test3:  Mon Dec 12 2016 16:57:00 GMT+0000
test:  { "dt": 60000, "os": 37897, "t": null, "i": 3, "x": "58,16,12,11,1" }
test:  { "dt": 60000, "os": 37897, "t": null, "i": 3, "x": "59,16,12,11,1" }
test3:  Mon Dec 12 2016 16:59:00 GMT+0000
test:  { "dt": 60000, "os": 37897, "t": null, "i": 3, "x": "0,17,12,11,1" }
test2:  Mon Dec 12 2016 17:00:00 GMT+0000
test:  { "dt": 60000, "os": 37897, "t": null, "i": 3, "x": "1,17,12,11,1" }
test:  { "dt": 60000, "os": 37897, "t": null, "i": 3, "x": "2,17,12,11,1" }
test:  { "dt": 60000, "os": 37897, "t": null, "i": 3, "x": "3,17,12,11,1" }
test:  { "dt": 60000, "os": 37897, "t": null, "i": 3, "x": "4,17,12,11,1" }
*/
```

## Reference

See Linux Cron and Crontab man pages for more info. See DateExt module for 
local time configuration.

Using
-----

* APPEND_USES: Cron.js
* APPEND_USES: DateExt.js
