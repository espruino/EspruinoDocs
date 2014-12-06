/* Copyright (c) 2014 allObjects. See the file LICENSE for copying permission. */
/**
Software Buttons - Many buttons from just one hardware button
SWBtn class - instances of SWBtn makes many buttons out of 
just one hardware button by detecting sequences of short and 
long presses and passing them on to a user defined, dispatching 
callback function.
For example, one long press turns LED1 on, and one long and 
one short turn it off. Two long presses and two long presses 
followd by a short one do the same to LED2, etc.
Each detected sequence is passed in form of a string of "S"s 
and "L"s to the user provided callback function. The callback 
function uses the string as a key to call assigned functions
like dispatcher.
Usage example:
require("SWBtn");
var mySWBtn = new SWBtn(function(k){
    console.log("BTN1 detected " + k); // log and/or dispatch
  });
*/
/**
SWBtn - SoftWare Butten 'class'
- constructor - accepts these arguments:
  - fnc - (optional) anonymous, one argument accepting dispatching callback function
  - btn - (optional) button/pin id - default is BTN1
  - d   - (optional) boolean interpreted disable flag - default false
          Allows button to be creted in disabled state in order 
          for (other) initializations to complete before being
          enabled with .disable(0) / .disable(false) / .disable()
          method invocation.
- instance properties:
  - f - storex passed or set dispatching callback function
  - b - storex button / pin id
  - d - stores disabled (status) of button
  - t - xgofdx timeout for sequence end / pause detection
  - k - stores build-up key store holding on to the "S"s and "L"s of a squence
  - w - stores hold on to the watch set with setWatch()
*/
function SWBtn(fnc,btn,d) {
  this.f = (fnc) ? fnc : function(){};
  this.b = (btn) ? btn : BTN1;
  this.t = null;
  this.k = null;
  this.w = null;
  this.disable(d);
 }
/**
.C - Constants / Configuration - defining the timings 
- shared by all instances of SWBtn:
  - B - integer - debounce [ms]
  - L - float   - min Long press [s]
  - P - integer - min Pause [ms]
  - D - integer - delay of fnc function invocation [ms]
  Pressing a button / keeping a pin low for .C.L seconds or more is detected
  as a long press when unpressed / released / pin turns high and and adds an 
  "L" to .k key (press sequnce) - otherwise a short press is detected and an 
  "S" is adde - and the .t timeout is set with .C.P Pause time and .e() ended
  call back for press sequence end detection and processing (invocation of
  user defined - ,k key decoding dispatch - function).
*/
SWBtn.prototype.C =
  { B: 20
  , L: 0.250
  , P: 220
  , D: 10
  };
/**
.disable(b) - disables/enables button
- method - accepts one argument
  - b - boolean - (optional) boolean interpreted disable flag - default false
  Used to (temporarily) disable the button (also used in constructor).
  It clears/sets the hardware / pin watch using clearWatch() / setWatch() functions.
  NOTE1: When button is disabled while press sequence is going on, sequence end is
    not detected, but partial sequence is still stored in .k key property (but does 
    not include an ongoing press / pin low). 
  NOTE2: The .k key propery is cleared (set to "") when button is (re-)enabled.
  NOTE3: any passed parameter that evaluates to false in an 'if (parameter)' and 
    omission of parameter enable the button: .disable(false), .disable(0),
    .disable(""), .disable(''), .disable(null), .disable(undefined), and .disable(),
    all these invocations enable the button... ;)
*/
SWBtn.prototype.disable = function(b) {
  if (b) {
    if (this.w) { 
      this.d = true;
      clearWatch(this.w);
      this.w = null; 
      if (this.t) {
        clearTimeout(this.t);
        this.t = null;
      }
    }
  } else {
    if (!this.w) {
      this.d = false;
      this.k = "";
      var _this = this;
      this.w = setWatch(function(e){ _this.c(e); }, this.b, { repeat:true, debounce:_this.C.B });
    }
  }
 };
/**
.c(e) - button/pin button/pin state change callback - invoked by Espruino's setWatch()
- method - accepts one e event argument (object) 
  Espruino reference for .setWatch() defines e event object as:
  - time     - float   - time of this state change [s]
  - lastTime - float   - time of last such state change [s]
  - state    - boolean - current state of the button / pin
  Notes button/pin status and - on unpress/release state - 
  appends "L"(ong) or "S"(short) to .k key (sequence) and 
  sets .t timeout to .C.P Pause for sequence end detection
*/
SWBtn.prototype.c = function(e){
  if (e.state) {
    if (this.t) {
      clearTimeout(this.t);
      this.t = null;
    }
  } else {
    this.k = this.k + ((e.time - e.lastTime < this.C.L) ? "S" :"L");
    var _this = this;
    this.t = setTimeout(function(){ _this.e(); }, this.C.P);
  }
 };
/**
.e() - sequence ended timeout callback - invoked by .t timout set in .c(e)
= method = accepts no arguments
  Marks detected end of press sequence and invekes user provided .f 
  callback function in a setTimeout() with .C.D delay.
*/
SWBtn.prototype.e = function() {
  this.t = null;
  var _k = this.k;
  if (_k.length > 0) {
    this.k = "";
    var _this = this;
    setTimeout(function(){ _this.f(_k); },this.C.D);
  }
 };
