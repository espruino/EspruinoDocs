<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Internet (HTTP)
===============

* KEYWORDS: Internet,HTTP,Web,TCPIP,TCP/IP,TCP-IP,IP,TCP,Server,Client,Webserver,Built-In,Sockets,HTTPS,TLS

To use the internet in Espruino you need an internet connection. If you're using Espruino under Linux (for example Raspberry Pi or OpenWRT) then you're sorted and can use the examples below directly, otherwise you'll need a module to connect to the internet. Currently your choices are:

* EspressIf [[ESP8266]] WiFi Module
* TI [[CC3000]] WiFi Module
* [[WIZnet]] W5500 Wired Ethernet Module
* SIMCom [[SIM900]] GSM/GPRS Module

You'll need to follow the instructions on those pages first in order to get connected to the net.

Basic internet functionality is handled using the [`http`](/Reference#http), [`net`](/Reference#net) and [`tls`](/Reference#net) libraries.

Client
------

HTTP clients are like Web browsers - they request a webpage from (or submit information to) a web server.

For a simple HTTP client just use ```http.get```. Note that as the data from the webpage is sent in packets, you must register a handler to deal with each bit of data as it arrives.

The example below will just output the contents of the Espruino website:

```JavaScript
var http = require("http");
http.get("http://www.espruino.com", function(res) {
  res.on('data', function(data) {
    console.log(data);
  });
});
```

You can also handle the `close` event so that you can process with the contents of the webpage in one go - be careful you don't run out of RAM for larger webpages though!

```JavaScript
require("http").get("http://www.espruino.com", function(res) {
  var contents = "";
  res.on('data', function(data) { contents += data; });
  res.on('close', function() { console.log(contents); });
});
```

Server
------

HTTP servers are pretty easy. Just use ```http.createServer```, and then use the listen method to specify which port to listen on. The following example will just write 'Hello World' in your web browser if you connect to `http://your_device:8080`

`your_device` will probably be an IP address. Consult the instructions for the module you're using, but you can usually use either `eth.getIP()` or `wlan.getIP()` to find out what your IP address is.

```JavaScript
var http = require("http");
http.createServer(function (req, res) {
  res.writeHead(200);
  res.end("Hello World");
}).listen(8080);
```

Note that we're using port `8080` in these examples, because it works when running Espruino on Linux/Raspberry Pi (without superuser priviledges). If you're using a microcontroller you could just use port 80, which means that you can just connect to `http://your_device`.

### Pages

By itself this isn't too useful - but a simple way to control things from the webserver is to look at which webpage is requested. In the example here a simple webpage is displayed showing whether the button is on or off, and containing two links - labelled on and off.

When clicked, they request a webpage with the argument `?led=1` or `?led=0`, and the server detects this and turns LED1 on or off to match. `url.parse` converts the webpage's arguments into an easy to use form (see below).

```JavaScript
function onPageRequest(req, res) {
  var a = url.parse(req.url, true);
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<html><body>');
  res.write('<p>Pin is '+(BTN.read()?'on':'off')+'</p>');
  res.write('<a href="?led=1">on</a><br/><a href="?led=0">off</a>');
  res.end('</body></html>');
  if (a.query && "led" in a.query)
    digitalWrite(LED1, a.query["led"]);
}
require("http").createServer(onPageRequest).listen(8080);
```

We'd recommend that you use `url.parse` to work out more information about the HTTP request (such as the arguments). For instance the following:

```
function onPageRequest(req, res) {
  var a = url.parse(req.url, true);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(JSON.stringify(a));
}
require("http").createServer(onPageRequest).listen(8080);
```

Will return:

```JSON
// http://espruino:8080/
{"method":"GET","host":"","path":"/","pathname":"/","search":null,"port":80,"query":null}
// http://espruino:8080/hello/world
{"method":"GET","host":"","path":"/hello/world","pathname":"/hello/world","search":null,"port":80,"query":null}
// http://espruino:8080/hello?a=b&c=d&e
{"method":"GET","host":"","path":"/hello?a=b&c=d&e","pathname":"/hello","search":"?a=b&c=d&e","port":80,"query":{"a":"b","c":"d","e":""}}
```

You can easily use this to serve up different webpages:

```
function onPageRequest(req, res) {
  var a = url.parse(req.url, true);
  if (a.pathname=="/") {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("Index Page");
  } else if (a.pathname=="/hello") {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("Hello World");
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end("404: Page "+a.pathname+" not found");
  }
}
require("http").createServer(onPageRequest).listen(8080);
```

### Transferring files

You may want to serve up files from the SD card. The most obvious route would be to do something like this:

```
function onPageRequest(req, res) {
  var a = url.parse(req.url, true);
  var contents = require("fs").readFileSync(a.pathname);
  if (contents !== undefined) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(contents);
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end("404: Page "+a.pathname+" not found");
  }
}
require("http").createServer(onPageRequest).listen(8080);
```

**However** there's a problem with this - the file is loaded into memory first, so if it's too big to go into RAM then you won't be able to serve it up.
In fact, to serve a file up, you have to be able to load it into memory and then add it to the output buffer - meaning it will have to fit into memory twice over.

Instead, we'd suggest you use 'pipe' from the streaming file API:

```
function onPageRequest(req, res) {
  var a = url.parse(req.url, true);
  var f = E.openFile(a.pathname, "r");
  if (f !== undefined) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    f.pipe(res); // streams the file to the HTTP response
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end("404: Page "+a.pathname+" not found");
  }
}
require("http").createServer(onPageRequest).listen(8080);
```

This loads the file a section at a time, and even closes it and the HTTP connection once sending is complete.


### Transferring large amounts of data

In a similar way, you may have problems if you're trying to send a lot of data. For instance, you may have a 10,000 byte buffer of data and you want to send it as text.

It's possble that in text form this could take 40,000 bytes (eg. `100,101,102,103,...`), which wouldn't fit into memory.

Instead, you can send the data a chunk at at time, using the HTTP response's `drain` event (which is called when the output buffer is empty).

```
var history = new Uint8Array(10000);

// ...

function onPageRequest(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  var n = 0;
  res.on('drain',function() {
    for (var i=0;i<10;i++)
      res.write(history[n++]+",");
    if (n>=history.length) res.end(" ];");
  });
  res.write("var data = [");
}
require('http').createServer(onPageRequest).listen(8080);
```


Sockets
-------

Socket support is handled in a similar way to HTTP, you just use the `net` module instead:

For a server:

```
var server = require("net").createServer(function(c) {
  // A new client as connected
  c.write("Hello");
  c.on('data', function(data) {
    console.log(">"+JSON.stringify(data));
  }
  c.end();
});
server.listen(1234);
```

Or for a client:

```
var client = require("net").connect({host: "my.url.com", port: 1234}, function() {
  console.log('client connected');
  client.on('data', function(data) {
    console.log(">"+JSON.stringify(data));
  });
  client.on('end', function() {
    console.log('client disconnected');
  });
});
```


HTTPS
-----

The only boards currently supporting this are the Espruino [[Pico]] and [[WiFi]].
To use HTTPS simply use it in the URL of any normal HTTP request:

```
require("http").get("https://www.google.com", function(res) {
  res.on('data', function(data) { /* ... */ });
});
```

To specify keys and certificates, you can use an options object - see [`require('tls').connect(...)`](/Reference#l_tls_connect)


TLS
---

The only boards currently supporting this are the Espruino [[Pico]] and [[WiFi]].
Just use it as follows:

```
require("tls").connect("my.url.com:1234", function(c) {
  c.write("Hello");
  c.on('data', function(data) { /* ... */ });
});
```

See [`require('tls').connect(...)`](/Reference#l_tls_connect) for more information.


Related Pages
-----------

* APPEND_KEYWORD: Internet


Projects using an Internet Connection
--------------------------------------

* APPEND_USES: Internet
