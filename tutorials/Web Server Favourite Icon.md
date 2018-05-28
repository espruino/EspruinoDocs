<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Favourite Icon on Web Server
========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Web+Server+Favourite+Icon. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Wifi,Web Server
* USES: Internet,CC3000,Espruino Board

Introduction
-----------

If you create a webserver using Espruino and you write out the names of webpages that are requested, you'll find that usually the Web Browser requests two files:

```
/
/favicon.ico
```

`/` is the 'root' webpage, but `/favicon.ico` is the icon that appears in the Web Browser.

In this tutorial we'll just make sure we serve up two different webpages, the icon, and the main page.

You'll Need
----------

* One [Espruino Board](/Original)
* A [[CC3000]] WiFi module

Wiring Up
--------

* Follow [the instructions](/CC3000) for wiring up the CC3000 module

Software
-------

Connect to the Espruino, copy and paste this into the right-hand side of the Web IDE (replacing the Access point name and password with your WiFi Access Point's name and password), and then click the `Send to Espruino` button.

```
var counter = 1;

var favicon = "\0\0\x01\0\x01\0\x10\x10\x10\0\x01\0\x04\x00\xf0\0\0\0\x16\0\0\x00\x89PNG\x0d\x0a\x1a\x0a\0\0\0\x0dIHDR\0\0\0\x10\0\0\0\x10\x08\x06\0\0\0\x1f\xf3\xffa\0\0\x00\xb7IDAT8\x8d\xa5S\xc1\x0d\x03!\x0csN\xb7\x91w\xcaP\xde)3\xd1G\x09\x0a\x85\xab\xa8\xea\x0f\x02\x82c\x1b0\x92x\x82\xbb\xb7:\x8f\x08D\x84\xd5\xb5\x1b\x00H\xb6>N\x04uN\x12\x92\x10\x11S\xcd]\x0b\xbf\xa9\xe9\x8a\x00\xa0I\x1a*\x06A\x97\xb7\x90\xd4\x8e$A\x12\xee\xde\xb2vR\x90$\xc8q\xf6\x03\xbc\x15Ldw]\x88zpc\xab*\x8c\x08H\xb2A\x90\x1e\x97\xce\x1bd3\x00\xb8v\x9b\xa7p\xf7\xb6\x10\x9cb\xc9\xe0Wd\x06\x17\x80v\xe2\xfb\x09\x17\x00H\xfa\x8b\xc0\xba\x9c\xe3CU\xf1\xc8@\xd2\x08fW\xf8i3?U\x12\x18z\x16\xf5A\x9ddc_\xee\xbd~e{*z\x01|\xcdnfT\x03\x0an\0\0\0\x00IEND\xaeB`\x82";

function getPage(req,res) {
  console.log(req.url);
  if (req.url == "/favicon.ico") {
    res.writeHead(200, {'Content-Type': 'image/x-icon'});
    res.write(favicon);
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<html><head><meta http-equiv="refresh" content="5"></head><body><img src="favicon.ico"/>'+(counter++)+'</body></html>');
  }
  res.end();
}

var wlan;
function onInit() {
  wlan = require("CC3000").connect();
  wlan.connect( "AccessPointName", "WPA2key", function (s) { 
    if (s=="dhcp") {
      console.log("My IP is "+wlan.getIP().ip);
      require("http").createServer(getPage).listen(80);
    }
  });
}
onInit();
```

The CC3000 takes a while to initialise so you may have to wait a minute or two. When connected, Espruino will print its IP address. You can then connect to that with a web browser...

When you connect, you'll see a little Espruino icon and a number, which will increase when the webpage reloads every 5 seconds. In the title bar, you should see a little Espruino icon too.

So how did we do it?

In the getPage function, we look at `req.url` to see which file has been requested. If it's `\favicon.ico` we set the content type to icon, and send the random-looking string. Otherwise we sent a simple webpage.

The string was created using the [[File Converter]] page which takes a normal file and turns it into a string of characters that Espruino can use. You can create your own favourite icon in many different ways - for instance you could use [this online designer](http://www.favicon.cc/), download `favicon.ico` and then feed it into the [[File Converter]].
