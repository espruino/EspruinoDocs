/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
// RX
setTimeout(function() {
  require("433").rx(B13, console.log);
}, 100);

// TX
require("433").tx(B13, "Hello", 5, function() {
  console.log("Sent!");
});

*/
/* Sends and receives data over simple 433Mhz AM radio links */
function decode(w) {
  var l = w.data.length;
  var d = new Uint8Array((l+7)>>3);
  for (var i=0;i<l;i+=8)
    d[i>>3] = parseInt(w.data.substr(i,8),2);
  var data = new Uint8Array(d.buffer,0,d.length-1);
  var chksum = data.reduce(function(a,b){return a^b;},0);
  if (chksum == d[d.length-1])
    w.callback(data);
}

// The handler that gets called when the signal changes state. Ideally this would be compiled, but the Web IDE won't do that at the moment.
function sig(w,e) {
 //"compiled";
 var d = 0|10000*(e.time-e.lastTime);
 if (d<1 | d>4) {
  if (w.data.length>20) decode(w);
  w.data="";
 } else if (!e.state) w.data+=0|d>2;
}

/* Set up to receive, and call the callback with a Uint8Array when something
is received. */
exports.rx = function(pin, callback) {
  rcallback = callback;
  var w = {
    data : "",
    callback : callback,
    stop : function() { clearWatch(w.intr); }
  };
  // start listening for a change
  setTimeout(function() {
    // do it after a delay so it doesn't mess up the upload (if there's loads of noise)
    w.intr = setWatch(sig.bind(null,w), pin, {repeat:true, edge:"both"});
  }, 200);
  return w;
};

// transmit the data using the given pin, repeated the given amount of times (5 seems good)
exports.tx = function(pin, data, repeat, callback) {
  var pulses = [];
  var arr = E.toUint8Array(data);
  // compute checksum
  var chksum = arr.reduce(function(a,b){return a^b;},0);
  data = new Uint8Array(arr.length+1);
  data.set(arr);
  data[data.length-1]=chksum;
  // output data, MSB first
  data.forEach(function(byt) {
    for (var b=7;b>=0;b--) {
      pulses.push((byt&128)?0.3:0.1, 0.42);
      byt<<=1;
    }
  });
  // finish up with a 1ms 'finish' pulse
  pulses.push(1);
  // Transmit
  var msecs = E.sum(pulses)+1;  
  function send() {
    digitalPulse(pin,1,pulses);
    if (repeat-- > 0) {
      // random time gaps between retransmission
      setTimeout(send, msecs+2+Math.random()*10);
    } else if (callback) {
      setTimeout(callback, msecs);
    }
  }
  // one training pulse at the start
  digitalPulse(pin,1,[1]);
  // now start sending data
  setTimeout(send, 1.5);
};
