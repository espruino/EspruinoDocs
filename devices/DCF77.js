/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Module for decoding DCF77 time signals

```
require("DCF77").connect(B3, function(err, date) {
  if (err)
    console.log("Invalid time received: " + err);
  else
    console.log(date.toString());
});
```
*/

// Decode 4 bits into a number
function decode4(s) {
  return (0|s[0])*1 + (0|s[1])*2 + (0|s[2])*4 + (0|s[3])*8;
} 

// xor all items in s and return the result (for parity checks)
function xor(s) {
  var r = 0;
  for (var i=0;i<s.length;i++) r^=s[i];
  return r;
}

// decode the DCF77 time transmission
function decode(d, callback) {
  if (xor(d.substr(21,7))!=d[28])
    return callback("Bad minutes");

  var minute = decode4(d.substr(21,4)) + decode4(d.substr(25,3))*10;
  if (xor(d.substr(29,6))!=d[35]) 
    return callback("Bad hours");
  
  var hour = decode4(d.substr(29,4)) + decode4(d.substr(33,2))*10;
  if (xor(d.substr(36,22))!=d[58]) 
    return callback("Bad date");
  
  var day = decode4(d.substr(36,4)) + decode4(d.substr(40,2))*10;
  var doy = decode4(d.substr(42,3));
  var month = decode4(d.substr(45,4)) + decode4(d.substr(49,1))*10;
  var year = decode4(d.substr(50,4)) + decode4(d.substr(54,4))*10;
  //console.log(hour+":"+minute+", "+day+"/"+month+"/"+year);
  
  var date = new Date(2000+year, month-1, day, hour, minute, 0, 0);
  return callback(null, date, { CEST:!!d[17], CET:!!d[18] } );
}


exports.connect = function(dataPin, callback) {
  var dcf = {
    last : getTime(),
    bits : "",
    watchId: undefined
  };

  dcf.watchId = setWatch(function (e) {
    // Work out what bit we got
    var d = e.time-e.lastTime;
    var bit = (d<0.15)?0:1;
    // if we had a 2 sec gap then it's the beginning of a minute
    if (e.time - dcf.last > 1.5) {
      decode(dcf.bits, callback);
      dcf.bits = "";
    }
    dcf.last = e.time;  
    // now add this bit of data
    dcf.bits += bit;
    if (dcf.bits.length>59)
      dcf.bits = dcf.bits.substr(-59);
  }, dataPin, { edge:"falling", repeat:true, debounce:75 });

  return dcf;
};
