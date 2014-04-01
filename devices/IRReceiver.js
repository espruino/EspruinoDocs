/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 
Infrared Remote Control Receiver

```
require("IRReceiver").connect(A0, function(code) {
  if (code==351861118902700) ...
  if (code==351861118886252) ...
});
```  

You can optionally specify `{usePulseLength:true}` as a third argument to use pulse length rather than the gap between pulses.

*/
exports.connect = function(pin, callback, options) {
  var pulseGap = true;
  if (options instanceof Object) {
    if (options.usePulseLength)
      pulseGap = false;
  }
  // pullup on the pin - most IR receivers don't have this 
  pinMode(pin,"input_pullup");
  // the actual code
  var code;
  // the timeout that will trigger the callback after the last bit
  var timeout;
  // set our callback to happen whenever pin goes low (eg, whenever pulse starts)
  setWatch(function(e) {
    var d = e.time-e.lastTime;
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
    if (d>0.04) { // a gap between transmissions
      if (code!==undefined) callback(code);
      code = undefined;
    } else {
      code = (code<<1) | (d>0.0008);
      // queue a timeout so after we stop getting bits, we execute the callback
      timeout = setTimeout(function() {
        timeout = undefined;
        if (code!==undefined) callback(code);
        code = undefined;
      }, 50);
    }
  }, pin, { repeat:true, edge:pulseGap ? "falling" : "rising" });
};

