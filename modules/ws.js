/* Copyright (c) 2015 Sameh Hady. See the file LICENSE for copying permission. */
/*
 Simple WebSocket protocol wrapper for Espruino sockets.

 * KEYWORDS: Module,websocket,ws,socket

 Websocket implementation on Espruino, it let you control your Espruino from the cloud without the need to know it's IP.
 You will need to use it with a websocket server.

 Limitations: The module only accept messages less than 127 character.

 How to use the ws module:

 ```javascript
 // Connect to WiFi, then...
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
 ```
 */

/** Minify String.fromCharCode() call */
function strChr(chr) {
    return String.fromCharCode(chr);
}

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
    var ws = this;
    this.emit('rawData', data);
    if (data.indexOf('HSmrc0sMlYUkAGmm5OPpG2HaGWk=') > -1) {
        this.emit('handshake');
        var ping = setInterval(function () {
            ws.send('ping', 0x89);
        }, this.keepAlive);
    }

    if (data.indexOf(strChr(0x8A)) > -1) {
        this.emit('pong');
    }

    if (data.indexOf(strChr(0x89)) > -1) {
        this.send('pong', 0x8A);
        this.emit('ping');
    }

    if (data.indexOf(strChr(0x0a)) > -1) {
        data = data.substring(1);
    }

    if (data.indexOf(strChr(0x81)) > -1) {
        var dataLen = data.charCodeAt(1);
        data = data.substring(2);
        var message = "";
        for (var i = 0; i < dataLen; i++) {
            message += data[i];
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
    this.socket.write(strChr(opcode));
    this.socket.write(strChr(msg.length));
    this.socket.write(msg);
};

/** Broadcast message to room */
WebSocket.prototype.broadcast = function (msg, room) {
    room = room === undefined ? 'all' : room;
    var newMsg = '{"room":"' + room + '", "msg":"' + msg + '"}';
    this.send(newMsg);
};

/** Join a room */
WebSocket.prototype.join = function (room) {
    var newMsg = '{"join":"' + room +'"}';
    this.send(newMsg);
};

exports = function (host, options) {
    var ws = new WebSocket(host, options);
    ws.initializeConnection();
    return ws;
};
