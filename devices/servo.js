/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Servo motor utility module

```
var s = require("servo").connect(C7);

s.move(0); // move to position 0 over 1 second
s.move(1); // move to position 1 over 1 second
s.move(0.5, 3000); // move to position 0.5 over 3 seconds

// move to position 0 over 1 second, then move to position 1
s.move(0, 1000, function() {
  s.move(1, 1000);
});
```
*/

exports.connect = function (pin,options) {
  var interval, currentPos;
  var offs = 1, mul = 1;
  if (options && options.range) {
    mul = options.range;
    offs = 1.5-(mul/2);
  }
  return {move:function(pos, time, callback, options) {
    if (typeof time === 'function') {
      callback = time; time = undefined;
    }
    if (typeof time !== 'number') time = 1000;
    
    var amt = 0;
    if (currentPos===undefined) currentPos = pos;
    if (interval)
      clearInterval(interval);
    var initial = currentPos;
    interval = setInterval(function() {
      currentPos = pos*amt + initial*(1-amt);
      digitalPulse(pin, 1, offs+E.clip(currentPos,0,1)*mul);
      if (amt >= 1 ) {
        if((options && options.soft !== false) || !options) {
          clearInterval(interval);
          interval = undefined;
        }
        if (callback) callback();
      } else {
        amt += 1000.0 / (20*time);
      }
    }, 20);
  }};
};
