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
	
ws.on('open', function() {
  console.log("Connected to server");
});

ws.on('message', function(msg) {
  console.log("MSG: " + msg);
});
```
Available callbacks
-----------

```js
ws.on('open', function() {
  console.log("Connected to server");
});
	
ws.on('message', function(msg) {
  console.log("MSG: " + msg);
});
	
ws.on('close', function() {
  console.log("Connection closed");
});
	
ws.on('handshake', function() {
  console.log("Handshake Success");
});
	
ws.on('ping', function() {
  console.log("Got a ping");
});
	
ws.on('pong', function() {
  console.log("Got a pong");
});

ws.on('rawData', function(msg) {
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

Broadcast a message to all connected users. ( `must be used with the ws node.js server example provided` )
```js
  var message = "hello world";
  ws.broadcast(message);
```

Broadcast a message to specific room. ( `must be used with the ws node.js server example provided` )
```js
  var message = "hello world";
  var room = "Espruino";
  ws.broadcast(message, room);
```

Join a room. ( `must be used with the ws node.js server example provided` )
```js
  var room = "Espruino";
  ws.join(room);
```

Node.js server.
-----------

First you need to install the node.js `ws` module ( `assuming you already have node.js installed` )

```js
npm install ws
```

Now you can run this server example that is needed for broadcasting and joining a room.
```js
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: 8080
    });

wss.on('connection', function connection(ws) {
    ws.room = [];
    ws.send("User Joined");

    ws.on('message', function(message) {
        message = JSON.parse(message);
        if (message.join) {
            ws.room.push(message.join);
        }
        if (message.room) {
            broadcast(message);
        }
        if (message.msg) {
            console.log("Server got: " + message.msg);
        }
    });

    ws.on('error', function(er) {
        console.log(er);
    })


    ws.on('close', function() {
        console.log('Connection closed')
    })
});

function broadcast(message) {
    wss.clients.forEach(function each(client) {
        if (client.room.indexOf(message.room) > -1 || message.room == 'all') {
            client.send(message.msg);
        }
    });
}
```

