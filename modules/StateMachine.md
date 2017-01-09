<!--- Copyright (C) 2016 Enchanted Engineering. See the file LICENSE for use. -->

# Simple Finite State Machine

* KEYWORDS: Module, Espruino, state machine, state, finite state machine, FSM

## APPLICATION
Module for building and operating simple finite state machines (FSM) 
for Espruino program control. States can be added as needed and each may 
define **enter**, **signal**, and **exit** operations.

## MODULE REFERENCE
### Require
Create a state machine object by ...
```javascript
var sm = require("StateMachine").FSM();
```
### State Definition
The user may define states as needed to build the logic of the state machine. 
Each state definition requires a **name** and optional non-blocking callbacks 
for ...
  * **enter**: Called when entering a state to perform any setup actions. It 
    may return a state (and wait) to automatically advance to another state.
  * **signal**: Called for the current state for any event passed to the state
    machine signal method. It may return undefined/false for no action or 
    return a state (and optional wait time) to advance to another state. 
  * **exit**: Called when leaving a state to perform any cleanup actions.

Each callback is optional, but sensibly each state must define at least one.
A state with no enter or signal callback represents a dead state that can be 
entered, but not exited normally. Callbacks not defined are not called when 
changing states. The enter and exit callback signitures have no arguments 
and the signal callback recieves the event argument passed to the state 
machine signal function, which may be a string or object as the state excepts. 

The state machine makes callbacks with its context (i.e. *this* = state 
machine object). The variables *this.state* and *this.last* hold the current 
and last state names, respectively. The object *this.states[this.state]* 
references the current state or generically *this.states['state_name']* 
references the respective named state. 

Add states by calling the define method with an object defining the name and 
callbacks as ...
sm.define({name:'...', enter:[function], signal:[function], exit:[function], 
  data:{user_data}});

The state object (passed to define) may contain other information used by the 
callbacks, such as an event counter or context, passed as a *data* object 
field. Since the state machine context passes to the callbacks, they can 
access this info or any state information by referencing the respective 
current state. Contents of *this*, not explicitly defined by the user for 
callback use (i.e. this.state, etc), should be considered read-only. 

States may be removed by passing the state name only (i.e. string) to the 
define function as in 

```javascript
sm.define("stateToRemove");
```

After states have been defined, initialize the state machine by calling init
with the name of the initial state as in

```javascript
sm.init("initialStateName");
```

After initializing the state machine, state changes occur by calling the 
state machine's signal method, which will in turn call the 'signal' event 
handler for the current state, as in...

```javascript
sm.signal('event'); // --> sm.state.signal('event');
sm.signal(eventObj); // --> sm.state.signal(eventObj);
```

Individual state signal methods should not be called directly (as this 
may defeat the logic of the machine). The *event* passes directly to the 
state signal handler and so may take whatever form the handler expects 
from a simple scalar to a complex object.

The state signal method may return *undefined* (i.e.a false value) for no 
action in response to an event OR it may return an object with a *state* 
and optional *wait* keys to cause a change to a new state such as

```javascript
sm.signal('delay');
// internal call to sm.state.signal(event);
// some sm.state.signal logic...
return (event=='delay') ? {state:'Two', wait:500} : {state:'Two'};
```

Thus any state may change to any other as desired, immediately or after a 
specified delay. A new state change request first cancels any pending 
state change.

### Example

```javascript
// define state callbacks...
function enterOne() { console.log("Enter One..."); };
function signalOne(e) { return {state:'Two', wait:(e)?e:0}; };
function exitOne() { console.log("Exit One..."); };

function enterTwo() { console.log("Enter Two from "+this.last+"..."); };
function signalTwo(e) { return {state:'One'}; };
function exitTwo() { console.log("Exit Two..."); };

// create state machine object
var sm = require("StateMachine").FSM();
// populate states...
sm.define({name:'One', enter:enterOne, signal:signalOne, exit:exitOne});
sm.define({name:'Two', enter:enterTwo, signal:signalTwo, exit:exitTwo});
// initialize to start at state One
sm.init('One'); 

// make state changes (assuming starting from One defined above) such as...
sm.signal(500);         // Signal state One to change to state Two after 500ms
sm.signal('dont_care'); // Signal state Two to chagne to state One immediately    
sm.signal();            // Signal state One to change to state Two immediately
```

### Interactive Test Code Example

```javascript
// test Finite State Machine module...


// define state machine...
//var sm = new (require("StateMachine"))();
var sm = require("StateMachine").FSM();

// define state callbacks: enter, signal (handler), and exit...

// Initialization state automatically advances to One by return value
function smInit() {
  console.log("Initialized Zero! Moving automatically to state One!");
  return {state:'One'};
  }

// define method called when entering state
function enter1() { 
  console.log("Enter One...");
  //console.log("this: ", this); // shows state machine object
  }
// define method called to notify state of an event/change
function signal1(e) {
  console.log("Event One <-- ",e);
  //console.log("this: ", this);  // shows state machine object
  return {state:'Two'}; 
  }

// methods for another state, demonstrating "this" = state machine context
function enter2() {
  console.log("Enter Two from ",this.last,"...");
  }
function signal2(e) {
  console.log("Event Two <-- ",e);
  console.log("  Last State:",this.last);
  return {state:'Three'}; 
  }
function exit2() { 
  console.log("Exit Two...");
  }

// methods for another state demonstrating conditional & delayed state change
function enter3() { 
  console.log("Enter Three...");
  }
function signal3(e) {
  console.log("Event Three <-- ",e);
  if (this.pending!==undefined) {
    console.log("pending:",this.pending);
    return this.pending = clearTimeout(this.pending);
    }
  return {state:(Math.random()<0.5)?'One':'Two',wait:(e%2)?4000:0}; 
  }
function exit3() { 
  console.log("Exit 3...");
  }

// add states to machine...
sm.define({name:'Zero', enter:smInit});
sm.define({name:'One', enter:enter1, signal:signal1});
sm.define({name:'Two', enter:enter2, signal:signal2, exit:exit2});
sm.define({name:'Three', enter:enter3, signal:signal3, exit:exit3});
sm.define({name:'Four', data:'a dead state with no callbacks'});
console.log("sm: ", sm);
sm.define('Four');  // remove senseless state
console.log("sm: ", sm);

// initialize to a state
sm.init("Zero");

// --- END OF STATE MACHINE DEFINITION ---


// synthesize events for demo ...
//   manually by button press... or automatically fired by time...

// event synthesis callback
var e = 1;
function ee() {
  console.log("SIGNAL["+e+"] --> STATE["+sm.state+"]");
  sm.signal(e);  // send state machine an event
  e++;
  }

// NOTE: wait >4s between button presses as event3 may delay callback...
setWatch(ee, BTN1, {repeat:true, edge:"falling"});

//var t = setInterval(ee,1000);
//setTimeout(function() { clearInterval(t); },12000);
```

## Reference

Search Google for "finite state machine uml tutorial" for more info.

https://www.google.com/?q=finite%20state%20machine%20uml%20tutorial

## Using

* APPEND_USES: StateMachine.js
