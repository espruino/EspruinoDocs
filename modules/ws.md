<!--- Copyright (c) 2015 Gordon Williams & Sameh Hady. See the file LICENSE for copying permission. -->
WebSocket client
=====================

* KEYWORDS: Module,websocket,ws,socket

This is a Websocket implementation on Espruino - it let you control your Espruino from the cloud without needing to know its IP. 
You will need to use it with a websocket server - for instance [one written in Node.js](https://www.npmjs.com/package/ws).

Setting up and connecting:
-----------

First you need run a websocket server which is explained [here using Node.js](https://www.npmjs.com/package/ws). Then you will be able to use below sketch and point it to your websocket server's host and port.

Limitations:
-----------

* The module only accept messages less than 127 character.
* This is only a WebSocket client implementation (not a server)


To use the [[ws.js]] module (assuming you are already connected to WiFi/Ethernet/etc - see [here](/Internet)):


```js
var host = "192.168.0.10";
var WebSocket = require("ws");
    var ws = new WebSocket(host,{
      port: 8080,
      protocolVersion: 13,
      origin: 'Espruino',
      keepAlive: 60
    });
	
ws.on('connected', function() {
  console.log("Connected to server");
});

ws.on('message', function(msg) {
  console.log("MSG: " + msg);
});
```
Available callbacks
-----------

```js
socket.on('open', function() {
  console.log("Connected to server");
});
	
socket.on('message', function(msg) {
  console.log("MSG: " + msg);
});
	
socket.on('close', function() {
  console.log("Connection closed");
});
	
socket.on('handshake', function() {
  console.log("Handshake Success");
});
	
socket.on('ping', function() {
  console.log("Got a ping");
});
	
socket.on('pong', function() {
  console.log("Got a pong");
});

socket.on('rawData', function(msg) {
  console.log("RAW: " + msg);
});
```

Send Message
-----------

At any time during a session you can publish a message to the server.
```js
  var message = "hello world";
  ws.send(message);
```

