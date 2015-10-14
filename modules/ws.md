<!--- Copyright (c) 2015 Gordon Williams & Sameh Hady. See the file LICENSE for copying permission. -->
WebSocket client
==============

* KEYWORDS: Module,websocket,ws,socket

This is a Websocket implementation on Espruino - it let you control your Espruino from the cloud without needing to know its IP. 
You will need to use it with a websocket server - for instance [one written in Node.js](https://www.npmjs.com/package/nodejs-websocket).

Limitations:

* The module only accept messages less than 127 character.
* This is only a WebSocket client implementation (not a server)

To use the [[ws.js]] module (assuming you are already connected to WiFi/Ethernet/etc - see [here](/Internet)):

```
var socket = require("ws").connect("Host", Port);

socket.on('connected', function() {
  console.log("Connected to server");
});

socket.on('handshake', function() {
  console.log("Handshake Success");
});
    
socket.on('message', function(msg) {
  console.log("MSG: " + msg);
  socket.send("Hello Back");
});

socket.on('close', function() {
  console.log("Connection closed");
});
```
