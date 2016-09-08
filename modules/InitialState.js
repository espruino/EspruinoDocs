/* Copyright (c) 2016 Patrick Van Oosterwijck. See the file LICENSE for copying permission. */
/*
This module provides an easy to use interface to send events to the
InitialState cloud platform. It was developed on the ESP8266 and does not
use TLS, don't send private information with this module!
*/

var http = require('http');

/* Converts regular { key1: value1, key2: value2 } style objects to
  InitialState's array of [{ key: key1, value: value1 },
  { key: key2, value: value2 }] format
*/
function convData(obj) {
  if (Array.isArray(obj)) {
    return obj;
  } else {
    var arr = [];
    for (var property in obj) {
      if (obj.hasOwnProperty(property)) {
        arr.push({ key: property, value: obj[property] });
      }
    }
    return arr;
  }
}

/** Send events insecurely to the specified InitialState bucket.

  Usage: sendEventsInsecure(bucket, events, [more events], [callback])
  
  "bucket" is an object with the following properties:
  var bucket = {
      bucketId: 'Your bucket ID from InitialState',
      accessId: 'Your access ID for the bucket from InitialState'
  };
  
  "events" is one or more parameter in one of two possible formats.
  One possible format is the array format that InitialState specifies:
  [
    { key: key1, value: value1 },
    { key: key2, value: value2 }
  ]
  The other possible format is a simple object with key/value pair:
  {
    key1: value1,
    key2: value2
  }
  This format will automatically be converted to the array format
  expected by InitialState.
  
  "callback" is an optional callback function of the following format:
  function (err, resp) {}
  "err" is a possible error object, "resp" is the parsed response from
  InitialState.
*/
exports.sendEventsInsecure = function () {
  if (arguments.length < 2) {
    callback({ message: 'Not enough arguments' });
    return;
  }
  var bucket = arguments[0];
  var callback = arguments[arguments.length - 1];
  var eventmax = arguments.length - 1;
  if (typeof(callback) !== 'function') {
    callback = undefined;
    eventmax++;
  }
  var events = [];
  for (var i = 1; i < eventmax; i++) {
    events = events.concat(convData(arguments[i]));
  }
  var body = JSON.stringify(events);
  var reqopt = {
      host: 'insecure-groker.initialstate.com',
      path: '/api/events',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept' : 'application/json',
        'X-IS-BucketKey': bucket.bucketId,
        'X-IS-AccessKey': bucket.accessId,
        'Content-Length': body.length
      }
    };
  var resbody = "";
  var req = http.request(reqopt, function (res) {
    res.on('data', function(resdata) {
      resbody += resdata;
    });
    function endHandler() {
      if (callback) {
        callback(undefined, resbody ? JSON.parse(resbody) : undefined);
      }
    };
    res.on('close', endHandler);
    res.on('end', endHandler);
  });
  req.on('error', function (err) {
    if(callback) callback(err);
  });
  req.end(body);
}

