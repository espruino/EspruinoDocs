/* Copyright (c) 2016 MrTimcakes. See the file LICENSE for copying permission. */
/*
var p = require("Ping");

p.ping({ address: 'google.com' }, function(err, data) {
  console.log(data.avg);
});
*/


var net = require('net');

exports.ping = function(options, callback) {
  if (typeof options != "object") options = {};
  options.address = options.address || 'localhost';
  options.port = options.port || 80;
  options.attempts = options.attempts || 5;
  options.timeout = options.timeout || 5000;
  var curAttempts = 0;
  data = [];

  function ping(options, callback){
    var startTime = getTime();
    var socket = net.connect({host: options.address, port: options.port}, function(){
      var latency = (getTime() - startTime) * 1e3;
      socket.end();
      curAttempts++;
      data.push(latency);
      clearTimeout(timeout);
      repeat(options, callback);
    });
    var timeout = setTimeout(function(){
      socket.end();
      curAttempts++;
      data.push(options.timeout + 1);
      repeat(options, callback);
    }, options.timeout);
  }

  function repeat(options, callback){
    if (curAttempts < options.attempts){
      ping(options, callback);
    }else{
      var sum = data.reduce(function(a, b) { return a + b; });
      var avg = sum / data.length;

      if (avg > options.timeout){
        callback(Error("Timeout"), undefined);
      }else{
        callback(undefined, {
          address: options.address,
          port: options.port,
          attempts: options.attempts,
          avg: avg,
          max: Math.max.apply(null, data),
          min: Math.min.apply(null, data),
          raw: data
        });
      }
    }
  }

  ping(options, callback);
};
