/*<!-- Copyright (c) 2018 Davy Wybiral. See the file LICENSE for copying permission. -->
WiFi Websocket Server
=====================

* KEYWORDS: Websocket,ws,server
* USES: EspruinoWiFi,ws

This is an example of using WebSockets on an Espruino WiFi device for bidirectional communication.
Fill in the WiFi SSID and password to connect to your local network and then the Espruino
console will print out the IP address of your device which you can connect to with a web
browser.

[[https://youtu.be/xcecEODjxSE]]

*/

var wifi = require('Wifi');

var clients = [];

var WIFI_NAME = "[YOUR WIFI SSID HERE]";

var WIFI_OPTIONS = {
  password: "[YOUR WIFI PASSWORD HERE]"
};

print("connecting...");

// Connect to WiFi
wifi.connect(WIFI_NAME, WIFI_OPTIONS, err => {
  if (err !== null) {
    throw err;
  }
  // Print IP address
  wifi.getIP((err, info) => {
    if (err !== null) {
      throw err;
    }
    print("http://"+info.ip);
    startServer();
  });
});

// Create and start server
function startServer() {
  const s = require('ws').createServer(pageHandler);
  s.on('websocket', wsHandler);
  s.listen(80);
}

// Page request handler
function pageHandler(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.end(`<html>
<head>
<script>
window.onload = () => {
  var ws = new WebSocket('ws://' + location.host, 'protocolOne');
  var btn = document.getElementById('btn');
  var led = document.getElementById('led');
  ws.onmessage = evt => {
    btn.innerText = evt.data;
  };
  led.onchange = evt => {
    ws.send(led.value);
  };
};
</script>
</head>
<body>
  <p>Button: <span id="btn">up</span></p>
  <p>
    LED on:
    <select id="led">
      <option>off</option><option>on</option>
    </select>
  </p>
</body>
</html>`);
}

// WebSocket request handler
function wsHandler(ws) {
  clients.push(ws);
  ws.on('message', msg => {
    digitalWrite(LED1, msg == 'on');
  });
  ws.on('close', evt => {
    var x = clients.indexOf(ws);
    if (x > -1) {
      clients.splice(x, 1);
    }
  });
}

// Send msg to all current websocket connections
function broadcast(msg) {
  clients.forEach(cl => cl.send(msg));
}

// Watch for button events (rising and falling)
setWatch(evt => {
  broadcast(evt.state ? 'down' : 'up');
}, BTN, {repeat: true, edge: 'both'});
