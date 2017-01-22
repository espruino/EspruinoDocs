/* Copyright (c) 2016 Patrick Van Oosterwijck. See the file LICENSE for copying permission. */
/*
This module provides an easy to use interface to send device updates and get
device commands from the Losant cloud service. It was developed on the
ESP8266 and does not use TLS, don't send private information with this module!
*/

var http = require('http');

// Example device ID and device auth structure
//
// var deviceid = '5793f96ee34f6e0170669c09';
// var deviceauth = {
//   key: 'e659d275-84be-42e4-8319-389d13962b9f',
//   secret: 'cd5020a074ececf81d8a87175a0d22e00cb3dd1c26113d22e2232d93181b26dd'
// };


/* Device constructor */
function LosantDevice(device, auth) {
  this.device = device;
  this.auth = auth;
}

/* Generic Losant request function */
function losantReq(method, path, authtoken, reqdata, callback) {
  if (typeof(callback) !== 'function') {
    callback = undefined;
  }
  var body = reqdata ? JSON.stringify(reqdata) : undefined;
  var reqopt = {
      host: 'api.losant.com',
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept' : 'application/json'
      }
    };
  if (body) {
    reqopt.headers['Content-Length'] = body.length;
  }
  if (authtoken) {
    reqopt.headers.Authorization = 'Bearer ' + authtoken;
  }
  var resbody = "";
  var req = http.request(reqopt, function (res) {
    res.on('data', function(resdata) {
      resbody += resdata;
    });
    res.on('close', function() {
      if (callback) callback(undefined, JSON.parse(resbody));
    });
    res.on('end', function() {
      if (callback) callback(undefined, JSON.parse(resbody));
    });
  });
  req.on('error', function (err) {
    if(callback) callback(err);
  });
  req.end(body);
}

/** Get authentication token for the device */
LosantDevice.prototype.getDeviceAuthToken = function (callback) {
  var reqdata = {
      deviceId: this.device,
      key: this.auth.key,
      secret: this.auth.secret
    };
  losantReq('POST', '/auth/device', undefined, reqdata, callback);
}

/** Update the device data */
LosantDevice.prototype.updateDeviceData = function (data, callback) {
  this.getDeviceAuthToken(function (err, auth) {
    if (err) {
      if (typeof(callback) === 'function') callback(err);
    } else {
      losantReq('POST', '/applications/' + auth.applicationId +
                '/devices/' + auth.deviceId + '/state',
                auth.token, { data: data }, callback);
    }
  });
}

/** Get the last 20 device commands */
LosantDevice.prototype.getDeviceCommand = function (since, callback) {
  this.getDeviceAuthToken(function (err, auth) {
    if (err) {
      if (typeof(callback) === 'function') callback(err);
    } else {
      losantReq('GET', '/applications/' + auth.applicationId +
                '/devices/' + auth.deviceId + '/command?limit=20' +
                (since !== undefined ? '&since=' + since : ''),
                auth.token, undefined, callback);
    }
  });
}

/** Setup function for the Losant device */
exports.setup = function (deviceId, auth) {
  return new LosantDevice(deviceId, auth);
}

