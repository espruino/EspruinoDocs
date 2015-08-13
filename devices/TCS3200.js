/* Copyright (c) 2015 Tomáš Juřena. See the file LICENSE for copying permission. */
/*
Simple three color (Red, Green, Blue) detector using TCS3200

Usage:

```
var sensor = require("TCS3200").connect(A0, A1, A2, A3, A4);
setInterval(function(){
  var c = sensor.getColor();
  digitalWrite(LED1, false);
  digitalWrite(LED2, false);
  digitalWrite(LED3, false);
  if(c == 'red')
    digitalWrite(LED1, true);
  else if(c == 'green')
    digitalWrite(LED2, true);
  else if(c == 'blue')
    digitalWrite(LED3, true);
  //print(c);
}, 200);
```
*/

/* Constructor  */
function TCS3200(S0, S1, S2, S3, OUT){
  this.s0 = S0;
  this.s1 = S1;
  this.s2 = S2;
  this.s3 = S3;
  this.out = OUT;
  digitalWrite(this.s0, false);
  digitalWrite(this.s1, true);
  this.filterColor(true, false);
  var counter = 0;
  var flag = 0;
  var tcs = this;
  setWatch(function() { counter++; },
           this.out,
           {"repeat":true,"edge":"rising"});
  setInterval(function() {
    if (flag == 0) {
      tcs.R = counter;
      tcs.filterColor(true, true);
      flag = 1;
    } else if (flag == 1) {
      tcs.G = counter;
      tcs.filterColor(false, true);
      flag = 2;
    } else {
      tcs.B = counter;
      tcs.filterColor(false, false);
      flag = 0;
    }
    counter = 0;
  }, 0.2*1000.0);
}

/* Switch color filter */
TCS3200.prototype.filterColor = function(s2, s3) {
  digitalWrite(this.s2, s2);
  digitalWrite(this.s3, s3);
};

/* Get colour as `{ red:..., green:..., blue:... }` */
TCS3200.prototype.getValue = function() {
  return { red:this.R, green:this.G, blue:this.B };
};

/* Get color as string */
TCS3200.prototype.getColor = function(){
  if(this.R > 100 || this.G > 100 || this.B > 100){
    if (this.R > this.G && this.R > this.B)
      return 'red';
    else if(this.G > this.R && this.G > this.B)
      return 'green';
    else if(this.B > this.R && this.B > this.G)
      return 'blue';
  }
  else
    return 'none';
};

/** This is 'exported' so it can be used with `require('TCS3200.js').connect(S0, S1, S2, S3, OUT)` */
exports.connect = function(S0, S1, S2, S3, OUT){
  return new TCS3200(S0, S1, S2, S3, OUT);
};
