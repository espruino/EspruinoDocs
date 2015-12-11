<!--- Copyright (c) 2015 Gordon Williams & Sameh Hady. See the file LICENSE for copying permission. -->
WebSockets
==========

* KEYWORDS: Module,websocket,ws,socket

This is a Websocket implementation on Espruino - it lets you:

* Control your Espruino from the cloud without needing to know its IP (When used as a client)
* Control Espruino in real-time from we web browser (When used as a server).

Limitations:
-----------

* The module only accepts messages of less than 127 characters.
* The module will not parse multiple websocket messages that arrive at once
* When sending, the library will only send JSON-formatted messages

To use the [[ws.js]] module, you must be connected to WiFi/Ethernet/etc - see [here](/Internet).

WebSocket Client
----------------

First you need run a websocket server which is explained [here using Node.js](https://www.npmjs.com/package/ws). 

Then you will be able to use the following and point it to your websocket server's host and port.

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

WebSocket Server
----------------

Just use `require('ws').createServer` like you would `require('http').createServer` and you can handle HTTP requests,
then use `.on('websocket', ...)` to register a function to handle websockets.

The code below serves up a Web Page which starts a websocket connection, then 

```
var page = '<html><body><script>var ws;setTimeout(function(){';
page += 'ws = new WebSocket("ws://" + location.host + "/my_websocket", "protocolOne");';
page += 'ws.onmessage = function (event) { console.log("MSG:"+event.data); };';
page += 'setTimeout(function() { ws.send("Hello to Espruino!"); }, 1000);';
page += '},1000);</script></body></html>';

function onPageRequest(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(page);
}

var server = require('ws').createServer(onPageRequest);
server.listen(8000);
server.on("websocket", function(ws) {
    ws.on('message',function(msg) { print("[WS] "+JSON.stringify(msg)); });
    ws.send("Hello from Espruino!");
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

