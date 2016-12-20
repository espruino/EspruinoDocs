/* (c) 2016 Enchanted Engineering. See the file LICENSE for copying permission. */

/*
Module for building and operating simple finite state machines (FSM) 
for Espruino program control. States can be added as needed and each may 
define enter, signal, and exit operations.

Create a state machine object by ...
var sm = require("StateMachine").FSM();

State Definition
The user may define states as needed to build the logic of the state machine.  
Each state definition requires a name and optional non-blocking callbacks 
for ...
   enter: Called when entering a state to perform any setup actions. It 
    may return a state (and wait) to automatically advance to another state.
   signal: Called for the current state for any event passed to the state
    machine signal method. It may return undefined/false for no action or 
    return a state (and optional wait time) to advance to another state. 
   exit: Called when leaving a state to perform any cleanup actions.

Each callback is optional, but sensibly each state must define at least one.
A state with no enter or signal callback represents a dead state that can be 
entered, but not exited normally. Callbacks not defined are not called when 
changing states. The enter and exit callback signitures have no arguments 
and the signal callback recieves the event argument passed to the state 
machine signal function, which may be a string or object as the state excepts. 

The state machine makes callbacks with its context (i.e. this = state 
machine object). The variables this.state and this.last hold the current 
and last state names, respectively. The object this.states[this.state] 
references the current state or generically this.states['state_name'] 
references the respective named state. 

Add states by calling the define method with an object defining the name and 
callbacks as ...
  sm.define({name:'...', enter:[function], signal:[function], exit:[function], 
    data:{user_data}});

The state object (passed to define) may contain other information used by the 
callbacks, such as an event counter or context, passed as a data object 
field. Since the state machine context passes to the callbacks, they can 
access this info or any state information by referencing the respective 
current state. Contents of this, not explicitly defined by the user for 
callback use (i.e. this.state, etc), should be considered read-only. 

States may be removed by passing the state name only (i.e. string) to the 
define function as in 
  sm.define("stateToRemove");

After states have been defined, initialize the state machine by calling init
with the name of the initial state as in
  sm.init("initialStateName");

After initializing the state machine, state changes occur by calling the 
state machine's signal method, which will in turn call the 'signal' event 
handler for the current state, as in...
sm.signal('event'); // --> sm.state.signal('event');
sm.signal(eventObj); // --> sm.state.signal(eventObj);

Individual state signal methods should not be called directly (as this 
may defeat the logic of the machine). The event passes directly to the 
state signal handler and so may take whatever form the handler expects 
from a simple scalar to a complex object.

The state signal method may return undefined (i.e.a false value) for no 
action in response to an event OR it may return an object with a state 
and optional wait keys to cause a change to a new state such as
  sm.signal('delay');
  // internal call to sm.state.signal(event);
  // some sm.state.signal logic...
  return (event=='delay') ? {state:'Two', wait:500} : {state:'Two'};

Thus any state may change to any other as desired, immediately or after a 
specified delay. A new state change request first cancels any pending 
state change.


Example...
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

*/


// change to the specified state, immediately or wait a time before changing
// any pending state change is first cancelled
function chgTo(to,wait) {
  var sm = this;
  if (sm.pending!==undefined) sm.pending = clearTimeout(sm.pending);
  if (wait) return sm.pending = setTimeout(function(){
    sm.pending=undefined;chgTo.call(sm,to);},wait);
  if (to!=sm.state && to in sm.states) {
    var s = sm.states[sm.state];
    if (s && 'exit' in s) s.exit.call(sm);
    sm.last.state = sm.state;
    sm.state = to;
    if ('enter' in sm.states[to]) {
      var auto = sm.states[to].enter.call(sm);
      if (auto) chgTo.call(sm,auto.state,auto.wait||0);   
      };
    };
  };

// add/remove states to machine and return the complete created state definition
// returns undefined if fails
function define(stObj) {
  if (typeof stObj=='string') return delete this.states[stObj];
  if ('name' in stObj) { 
    this.states[stObj.name] = stObj;
    return stObj;
    };
  return;
  };

// signal the current state passing it the given event (evt)
function signal(evt) {
  var s = this.states[this.state];
  if (s && 'signal' in s) {
    sm.last.event=evt;
    var action = s.signal.call(this,evt);
    if (action) chgTo.call(this,action.state,action.wait||0);
    }
  };

// state machine constructor...
exports.FSM = function FSM() {
  var sm={
    last: {state:'',event:null},
    state: '',
    pending: undefined,
    states: {},
    define: define,
    init: function(s){chgTo.call(sm,s);},
    signal: signal
    };
  return sm;
  };
