/* Copyright (c) 2015 Sameh Hady, Gordon Williams. See the file LICENSE for copying permission. */
/*
 Simple WebSocket protocol wrapper for Espruino sockets.

 * KEYWORDS: Module,websocket,ws,socket

 Websocket implementation on Espruino, it let you control your Espruino from the cloud without the need to know it's IP.
 You will need to use it with a websocket server.

 Limitations: The module only accept messages less than 127 character.

 How to use the ws module:

 ```javascript
 // Connect to WiFi, then...

 // =============================== CLIENT
 var WebSocket = require("ws");
 var ws = new WebSocket("HOST",{
      port: 8080,
      protocolVersion: 13,
      origin: 'Espruino',
      keepAlive: 60  // Ping Interval in seconds.
    });

 ws.on('open', function() {
 console.log("Connected to server");
 ws.broadcast("New User Joined");
 });

 ws.on('message', function(msg) {
 console.log("MSG: " + msg);
 });

 ws.on('close', function() {
 console.log("Connection closed");
 });
 
 //Send message to server
 ws.send("Hello Server");
 
 //Broadcast message to all users
 ws.broadcast("Hello All");
 
 // Join a room
 ws.join("Espruino");
 
 //Broadcast message to specific room
 ws.broadcast("Hello Room", "Espruino");

 // =============================== SERVER
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
*/

/** Minify String.fromCharCode() call */
var strChr = String.fromCharCode;

function WebSocket(host, options) {
    this.socket = null;
    options = options || {};
    this.host = host;
    this.port = options.port || 80;
    this.protocolVersion = options.protocolVersion || 13;
    this.origin = options.origin || 'Espruino';
    this.keepAlive = options.keepAlive * 1000 || 60000;
}

WebSocket.prototype.initializeConnection = function () {
    require("net").connect({
        host: this.host,
        port: this.port
    }, this.onConnect.bind(this));
};

WebSocket.prototype.onConnect = function (socket) {
    this.socket = socket;
    var ws = this;
    socket.on('data', this.parseData.bind(this));

    socket.on('close', function () {
        ws.emit('close');
    });

    this.emit('open');
    this.handshake();
};

WebSocket.prototype.parseData = function (data) {
    // see https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers
    // Note, docs specify bits 0-7, etc - but BIT 0 is the MSB, 7 is the LSB
    // TODO: handle >1 data packet, or packets split over multiple parseData calls
    var ws = this;
    this.emit('rawData', data);

    // FIXME - not a good idea!
    if (data.indexOf('HSmrc0sMlYUkAGmm5OPpG2HaGWk=') > -1) {
        this.emit('handshake');
        var ping = setInterval(function () {
            ws.send('ping', 0x89);
        }, this.keepAlive);
    }

    var opcode = data.charCodeAt(0)&7;

    if (opcode == 0xA) {
        this.emit('pong');
        return
    }

    if (opcode == 0x9) {
        this.send('pong', 0x8A);
        return this.emit('ping');
    }

    // TODO: 0x08 -> close

    if (opcode == 1 /* text - all we're supporting */) {
        var dataLen = data.charCodeAt(1)&127;
        if (dataLen>126) throw "Messages >125 in length unsupported";
        var offset = 2;
        var mask = [ 0,0,0,0 ];
        if (data.charCodeAt(1)&128 /* mask */)
          mask = [ data.charCodeAt(offset++), data.charCodeAt(offset++),
                   data.charCodeAt(offset++), data.charCodeAt(offset++)];

        var message = "";
        for (var i = 0; i < dataLen; i++) {
            message += String.fromCharCode(data.charCodeAt(offset++) ^ mask[i&3]);
        }
        this.emit('message', message);
    }
};

WebSocket.prototype.handshake = function () {
    var socketHeader = [
        "GET / HTTP/1.1",
        "Upgrade: websocket",
        "Connection: Upgrade",
        "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==",
        "Sec-WebSocket-Version: " + this.protocolVersion,
        "Origin: " + this.origin,
        ""
    ];

    for (var index = 0; index < socketHeader.length; index++) {
        this.socket.write(socketHeader[index] + "\r\n");
    }
};

/** Send message based on opcode type */
WebSocket.prototype.send = function (msg, opcode) {
    opcode = opcode === undefined ? 0x81 : opcode;
    if(!JSON.parse(msg)) msg = JSON.stringify({msg:msg});
    this.socket.write(strChr(opcode, msg.length));
    this.socket.write(msg);
};

/** Broadcast message to room */
WebSocket.prototype.broadcast = function (msg, room) {
    room = room === undefined ? 'all' : room;
    this.send(JSON.stringify({room:room,msg:msg}));
};

/** Join a room */
WebSocket.prototype.join = function (room) {
    var newMsg = '{"join":"' + room +'"}';
    this.send(newMsg);
};

exports = function (host, options) {
    var ws = new WebSocket(host, options);
    if (options && options.serverResponse && options.serverRequest) { 
      ws.socket = options.serverResponse;
      options.serverRequest.on('data', ws.parseData.bind(ws) );
    } else { 
      ws.initializeConnection();
    }
    return ws;
};

exports.createServer = function(callback, wscallback) {
  var server = require('http').createServer(function (req, res) {
    if (req.headers.Connection=="Upgrade") {    
      var key = req.headers["Sec-WebSocket-Key"];
      var accept = btoa(E.toString(require("crypto").SHA1(key+"258EAFA5-E914-47DA-95CA-C5AB0DC85B11")));
      res.writeHead(101, {
          'Upgrade': 'websocket',
          'Connection': 'Upgrade',
          'Sec-WebSocket-Accept': accept,
          'Sec-WebSocket-Protocol': req.headers["Sec-WebSocket-Protocol"]
      });
      var ws = require("ws")(undefined,{
        serverRequest : req,
        serverResponse : res
      });
      server.emit("websocket", ws);
    } else callback(req, res);
  });
  return server;
};
