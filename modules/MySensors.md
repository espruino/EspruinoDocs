<!--- Copyright (c) 2016 Steven Lazidis. See the file LICENSE for copying permission. -->
MySensors Client/Gateway
=====================

* KEYWORDS: Module,protocol,client

Module for devices running Espruino to connect to other software using Mysensors api.

See the MySensors API documentation: https://www.mysensors.org/download/sensor_api_20

**Usage:**
~~~~
var mys = require("MySensors").create(nodeid);
~~~~
Where serial is some sort of serial connection (physical serial, usb, socket. Something with a write command and a data event).

Nodeid is the MySensors id for the device. Use 255 for automatic address assignment (not supported yet though).

**Functions:**
~~~~
setMqttGW(mqtt,pubtopic,subtopic) - Set up gateway using mqtt. mqtt is a client connection object, pubtopic and subtopic are the prefixes for the mqtt topic.

setSerialGW(serial) - Set up gateway using a serial or socket connection.

present(sensorid,sensortype) - Send presentation message to controller for an attached sensor

newMessage(sensor,subtype)  -  Create new message object

send(message) - Send message to controller
~~~~
**Events:**
~~~~
on('presentation') - fires when controller requests presentation. Manually fire using mys.emit('presentation')

on('receive',function(msg){}) - fires when set/req message received
~~~~

**TCP Example:**
~~~~
var interval = {};var socket = {};var led = false;

// Create MySensors object
var mys = require("MySensors").create(3);

// Define how it presents
mys.on('presentation',function() {
  mys.present(0,3);
  console.log('presenting!');
});

// Define how to react to messages
mys.on('receive', function(msg) {
  if(msg.childSensorId === "0" && msg.messageType === "1") {
    led = (msg.payload == "1");
    console.log("LED is now " + (led ? "on" : "off"));
  }
});

// Connecting to socket, handling disconnects, passing socket to MySensors object
function connect() {
  interval = setInterval(function() {
    socket = require("net").connect({host: "192.168.1.35", port: 5003}, function() {

      console.log('client connected');

      clearInterval(interval);

      interval = setInterval(function() {
        var msg = mys.newMessage(0,2);
        msg.payload = led ? 1 : 0;
        mys.send(msg);
        console.log("LED is  " + (led ? "on" : "off"));
      },10000);

      mys.setSerialGW(socket);

      socket.on('end', function() {
        mys.disconnectGW();
        clearInterval(interval);
        console.log('client disconnected');
        connect();
      });
    });
  },5000);
}

E.on('init',function() {
  connect();
});
~~~~
