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

exports.connect = function (pin) {
  var interval, currentPos;

  return {move:function(pos, time, callback) {
    if (time===undefined) time = 1000;
    var amt = 0;
    if (currentPos===undefined) currentPos = pos;
    if (interval)
      clearInterval(interval);
    var initial = currentPos;
    interval = setInterval(function() {
      if (amt>1) {
        clearInterval(interval);
        interval = undefined;
        amt = 1;
        if (callback) callback();
      }
      currentPos = pos*amt + initial*(1-amt);
      digitalPulse(pin, 1, 1+E.clip(currentPos,0,1));
      amt += 1000.0 / (20*time);
    }, 20);
  }};
};
