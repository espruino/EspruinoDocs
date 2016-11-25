/* Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*NRF.requestDevice({ filters: [{ services: ['1823'] }] }).then(function(device) {
  exports.httpRequest(device, "pur3.co.uk/hello.txt", function(d) { print("GET:",JSON.stringify(d)); })
});*/

exports.httpRequest = function(device, url, callback) {
  var device, service;
  return device.gatt.connect().then(function(d) {
    console.log("Connected");
    device = d;
    return d.getPrimaryService(0x1823);
  }).then(function(s) {
    console.log("Got service");
    service = s;
    return service.getCharacteristic(0x2AB6); // URI
  }).then(function(c) {
    console.log("Got characteristic");
    return c.writeValue(url);
  }).then(function() {
    console.log("Set URI");
    return service.getCharacteristic(0x2ABA); // control point
  }).then(function(c) {
    console.log("Got characteristic");
    return c.writeValue(1); // HTTP GET
  }).then(function() {
    console.log("Written GET");
    return new Promise(function(resolve) {
      setTimeout(resolve, 2000);
    });
  }).then(function() {
    return service.getCharacteristic(0x2AB9); // HTTP body
  }).then(function(c) {
    return c.readValue();
  }).then(function(d) {
    device.disconnect();
    console.log("Disconnected");
    if (callback) callback(d);
    return d;
  });
};
/*
// correct way
httpRequest = function(device, url, callback) {
  var device, service;
  device.gatt.connect().then(function(d) {
    console.log("Connected");
    device = d;
    return d.getPrimaryService(0x1823);
  }).then(function(s) {
    console.log("Got service");
    service = s;
    return service.getCharacteristic(0x2AB6); // URI
  }).then(function(c) {
    console.log("Got URI characteristic");
    return c.writeValue(url);
  }).then(function() {
    console.log("Set URI");
    return service.getCharacteristic(0x2AB8); // status code
  }).then(function(c) {
    console.log("Got status code characteristic");
    console.log(c);
//    c.handle_cccd = c.handle_decl;
    c.on('characteristicvaluechanged', function(d) {
      console.log("Characteristic value changed",JSON.stringify(d));
    });
    return c.startNotifications();
  }).then(function() {
    console.log("Started notifications");
    return service.getCharacteristic(0x2ABA); // control point
  }).then(function(c) {
    console.log("Got control point characteristic");
    return c.writeValue(1); // HTTP GET
  }).then(function() {
    console.log("Written GET");
    return new Promise(function(resolve) {
      //FIXME: Use characteristicvaluechanged
      setTimeout(resolve, 2000);
    });
  }).then(function() {
    return service.getCharacteristic(0x2AB9); // HTTP body
  }).then(function(c) {
    return c.readValue();
  }).then(function(d) {
    device.disconnect();
    console.log("Disconnected");
    if (callback) callback(d);
    return d;
  });
};*/
