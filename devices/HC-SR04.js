/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Module for the Ultrasonic Distance Sensor HC-SR04

```
var sensor = require("HC-SR04").connect(A0,A1,function(dist) {
  console.log(dist+" cm away");
});
setInterval(function() {
  sensor.trigger(); // send pulse
}, 500);
```
*/
exports.connect = function(/*=PIN*/trig, /*=PIN*/echo, callback) {
  var riseTime = 0;
  setWatch(function(e) { // check for rising edge
    riseTime=e.time;
  }, echo, { repeat:true, edge:'rising'  });
  setWatch(function(e) { // check for falling edge
    callback(((e.time-riseTime)*1000000)/57.0);
  },  echo, { repeat:true, edge:'falling' });
  return {
    trigger : function() {
      digitalPulse(trig, 1, 0.01/*10uS*/);
    }
  };
};
