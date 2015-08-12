/* Copyright (c) 2015 Tomáš Juřena. See the file LICENSE for copying permission. */
/*
Simple three color (Red, Green, Blue) detector using TCS3200
*/
/*Usage:
var sensor = require("TCS3200").connect(A0, A1, A2, A3, A4);
setInterval(function(){
  var c = sensor.getColor();
  digitalWrite(LED1, false);
  digitalWrite(LED2, false);
  digitalWrite(LED3, false);
  digitalWrite(LED4, false);
  if(c == 'red')
    digitalWrite(LED3, true);
  else if(c == 'green')
    digitalWrite(LED2, true);
  else if(c == 'blue')
    digitalWrite(LED4, true);
  else
    digitalWrite(LED1, true);
  //print(c);
}, 200);
*/

var s0 = A0;
var s1 = A1;
var s2 = A2;
var s3 = A3;
var out = A5;
var counter = 0;
var R = 0;
var G = 0;
var B = 0;
var flag = 1;

/* Switch color filter */
function FilterColor(s2, s3) {
  digitalWrite(this.s2, s2);
  digitalWrite(this.s3, s3);
}

/* Timer handler */
function timerHandler() {
  if (flag == 1) {
    R = counter;
    FilterColor(true, true);
  } else if (flag == 2) {
    G = counter;
    FilterColor(false, true);
  } else if (flag == 3) {
    B = counter;
    FilterColor(false, false);
    flag = 0;
  }
  counter = 0;
  flag = (typeof flag == 'number' ? flag : 0) + 1;
}

/* Constructor  */
function TCS3200(S0, S1, S2, S3, OUT){
  this.s0 = S0;
  this.s1 = S1;
  this.s2 = S2;
  this.s3 = S3;
  this.out = OUT;
  digitalWrite(this.s0, false);
  digitalWrite(this.s1, true);
  FilterColor(true, false);
  setWatch(function() {
           this.counter = (typeof this.counter == 'number' ? this.counter : 0) + 1;},
           this.out,
           {"repeat":true,"edge":"rising"});
  setInterval(function() {
    timerHandler();
 }, 0.2*1000.0);
}

/* Get color */
TCS3200.prototype.getColor = function(){
  //print(R + ' ' + G + ' ' + B);
  if(R > 100 || G > 100 || B > 100){
    if (R > G && R > B)
      return 'red';
    else if(G > R && G > B)
      return 'green';
    else if(B > R && B > G)
      return 'blue';
  }
  else
    return 'none';
};

/** This is 'exported' so it can be used with `require('TCS3200.js').connect(S0, S1, S2, S3, OUT)` */
exports.connect = function(S0, S1, S2, S3, OUT){
  return new TCS3200(S0, S1, S2, S3, OUT);
};
