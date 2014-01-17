<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Internet (HTTP)
===============

* KEYWORDS: Internet,HTTP,Web,TCPIP,TCP/IP,TCP-IP,IP,TCP

To use the internet in Espruino you need an internet connection. If you're using Espruino under Linux (for example Raspberry Pi or OpenWRT) then you're sorted and can use the examples below directly, otherwise you'll need a module to connect to the internet. Currently your only choice is the TI [[CC3000]], however hopefully this will change in the future.

Basic internet functionality is handled using the Http class.

**NOTE:** Currently, if you call HTTP functions without having first initialised WiFi, Espruino will crash. We're working on this, but if you're using the Espruino board and want to use the internet, follow the instructions for the TI [[CC3000]] first.

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

Server
------

HTTP servers are pretty easy. Just use ```http.createServer```, and then use the listen method to specify which port to listen on. The following example will just write 'Hello World' in your web browser if you connect to http://localhost:8080

```JavaScript
var http = require("http");
http.createServer(function (req, res) {
  res.writeHead(200);
  res.end("Hello World"); 
}).listen(8080);
```

By itself this isn't too useful - but a simple way to control things from the webserver is to look at which webpage is requested. In the example here a simple webpage is displayed showing whether pin D25 is on or off, and containing two links - labelled on and off.

When clicked, they request the webpage /on or /off, and the server detects this and turns pin D7 on or off to match.

```JavaScript
var http = require("http");

function onPageRequest(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<html><body>');
  res.write('<p>Pin is '+(D25.read()?'on':'off')+'</p>');
  res.write('<a href="/on">on</a><br/><a href="/off">off</a>');
  res.end('</body></html>');
  if (req.url=="/on") digitalWrite(D7, 1);
  if (req.url=="/off") digitalWrite(D7, 0);
}
http.createServer(onPageRequest).listen(8080);
```
