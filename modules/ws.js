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
 });

 ws.on('message', function(msg) {
   console.log("MSG: " + msg);
 });

 ws.on('close', function() {
   console.log("Connection closed");
 });
 
 //Send message to server
 ws.send("Hello Server");
 
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

    var opcode = data.charCodeAt(0)&15;

    if (opcode == 0xA)
        return this.emit('pong');

    if (opcode == 0x9) {
        this.send('pong', 0x8A);
        return this.emit('ping');
    }

    if (opcode == 0x8) {
        // connection close request
        this.socket.end();
        // we'll emit a 'close' when the socket itself closes
        return;
    }

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
        "",""
    ];

    this.socket.write(socketHeader.join("\r\n"));
};

/** Send message based on opcode type */
WebSocket.prototype.send = function (msg, opcode) {
    opcode = opcode === undefined ? 0x81 : opcode;
    this.socket.write(strChr(opcode, msg.length));
    this.socket.write(msg);
};

/** Create a WebSocket client */
exports = function (host, options) {
    var ws = new WebSocket(host, options);
    ws.initializeConnection();
    return ws;
};

/** Create a WebSocket server */
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
      res.write(""); /** Completes the webSocket handshake on pre-1v85 builds **/

      var ws = new WebSocket(undefined, {});
      ws.socket = res;
      req.on('data', ws.parseData.bind(ws) );
      req.on('close', function() {
        // if srvPing is undefined, we already emitted a 'close'
        clearInterval(ws.srvPing);
        ws.srvPing = undefined;
        // emit websocket close event
        ws.emit('close');
      });
      /** Start a server ping at the keepAlive interval  **/
      ws.srvPing = setInterval(function () {
          ws.emit('ping', true); // true: indicates a server ping
          ws.send('ping', 0x89);
      }, ws.keepAlive);
      server.emit("websocket", ws);
    } else callback(req, res);
  });
  return server;
};
