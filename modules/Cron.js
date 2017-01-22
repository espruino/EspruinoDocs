/* (c) 2016 Enchanted Engineering. See the file LICENSE for copying permission. */
/*
simple Linux-like cron job system for Espruino...
Example...
  // create a cron object with 1 min interval (default = 5)
  var cron = require("Cron")(1);

NOTE: Intended to be a single instance to limit resources and timer overhead. 
Multiple instances will all reference same job queue and timer, thus multiple 
instances will see the same jobs and init calls will supercede previous calls 
by other instances. Works with DateExt module if used to match local time 
values. A second argument passed to the constructor, set to true, can be used 
to force UTC if so desired. This is only necessary if DateExt is included and 
you don't want to use local time.

Jobs defined using job method as in ...
  cron.job({id:'...', time:[...], cb:'...', cbThis: this, args:[...], n:#}); 
    - id: unique reference name for job and event signal name.
      - new job with same id replaces existing job with that id
      - job with id and no time removed from list
      -'id' event emitted when job time matches clock time if cb not defined
      - if cb defined it is called when time matches
    - time: record that specifies [min,hr,day,month,dayOfWk]; * = wildcard
      - time fields may be integer, string values, array of integers, or *
        i.e. [5,[0,12],'*','*','1'] --> 5 min after midnight and noon Monday
      - time may also be specified as a cron-style string
        i.e. '5 0,12, * * 1'
      - time does not support modulo (/) and range (-) shortcut formats
    - cb: optional callback to call instead of 'id' event
    - cbThis: optional 'this' context for callback
    - args: optional arguments for callback    
    - n: optional number of times to run job; job deleted after n events
    - returns current job list when called without (or with) a job definition 
Jobs not processed in any particular guaranteed order.

cron.job({id:"job1",time:'* * * * *'}); // define a job, time string format 
cron.job({id:"job2",time:[...]});   // define another cron job 
...
cron.init(1);                       // start timer w/1 min update
cron.init();                        // start timer w/5 min (default) update
...
cron.job({id:"job2"});              // delete unneeded job named "job2"
...
cron.job({id:"job1",time:[...]});   // redefine existing "job1"
...
cron.init(0);                       // stop cron timer, can restart any time
...
cron.on("job1", function() {...});  // event handler, where "job1"=job id
                                    // fires when cron job spec matches time,
                                    // only if no callback supplied.
*/

// intensionally treated as a module level queue and timer for all instances
// of cron to minimize resources and timer overhead.
var jobs = {};                                // queue for cronjobs
var tmr = {dt:0,os:0,t:null,i:null,x:''};     // timer handles and parameters
// addition to default local date call to UTC if DateExt module not used
if (!new Date().local) Date.prototype.local = function() { return this; };

// cron update "ping function" called at "tmr.dt"...
function tick() {
  var c = this;
  var d = c.utc ? new Date() : new Date().local();
  var dt = [d.getMinutes(),d.getHours(),d.getDate(),d.getMonth(),d.getDay()];
  tmr.x = dt.toString();
  for (var id in jobs) {
    var j = jobs[id];
    var jt = j.time;
    var match = true;
    for (var i = 0;i<jt.length;i++) {
      if (jt[i]=="*") continue;
      if (typeof jt[i]=='number'&&(jt[i]==dt[i])) continue;
      if (Array.isArray(jt[i])&&jt[i].indexOf(dt[i])!=-1) continue;
      match = false; break;
      }
    if (match) {
      if ('cb' in j) {j.cb.call(j.cbThis||c,j.args);} else {c.emit(id);};
      if ('n' in j) {if (--j.n<1) delete jobs[id];};
      };
    };
  };

// adds (defines) or removes a cron job, see notes above ...
function job(j) {
  j = j||{};
  if (j.id&&j.time) {
    if (typeof j.time=='string') j.time = j.time.split(' ');
    for(var i in j.time){
      if (j.time[i]=="*") continue;
      if (typeof j.time[i]=='string'&&j.time[i].indexOf(',')!=-1) {
        j.time[i] = j.time[i].split(',');
        };
      if (Array.isArray(j.time[i])) {
        for (var k in j.time[i]) j.time[i][k] = parseInt(j.time[i][k],10);
        }
      else {
        j.time[i] = parseInt(j.time[i],10);
        };
      };
    jobs[j.id] = j;
    }
  else if (j.id) {
    delete jobs[j.id];
    };
  return jobs;
  };

// cron timer ping initialization: tp default 5 min; 0 disables ping
function init(tp){
  var th = this;
  tmr.dt = (tp===undefined?th.tp:tp)*60000;
  if (tmr.t) tmr.t = clearTimeout(tmr.t);
  if (tmr.i) tmr.i = clearInterval(tmr.i);
  if (tmr.dt!==0) {
    tmr.os = Math.floor(tmr.dt-((getTime()*1000)%tmr.dt));
    tmr.t = setTimeout(function(){tmr.t = null; tmr.i = setInterval(
      function() {tick.call(th);},tmr.dt);tick.call(th);},tmr.os);
    };
  };

// Cron constructor, tp defaults to 5 min...  
exports = function (tp,utc) {
  var c = {
    utc: utc ? true : false,  // force utc time if DateExt local used
    tp: tp||5,  // default tick interval
    init: init, // function to enable/disable tick
    job: job,   // function to define jobs
    tmr: tmr    // informational, reference to timer handles and parameters
    };
  return c;
  };
