<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
WIZnet WIZ550io/W5500 Ethernet module
================================

* KEYWORDS: Wireless,WIZnet,WIZ550io,W5500,Ethernet,Internet,LAN,Web Server,HTTP

![WIZnet WIZ550io module](module.jpg)

The [WIZnet WIZ550io module](http://wizwiki.net/wiki/doku.php?id=products:wiz550io:allpages) contains a W5500 chip - it implements TCP/IP on-chip, so you just plug an Ethernet cable in one end, and SPI into the other.

Support is provided in Espruino, but currently **you will have to use a special build of Espruino designed for it**. These should be available in [recent Espruino Git builds](www.espruino.com/binaries/git).

To build yourself, follow [the instructions here](www.github.com/espruino/Espruino) and build with:

```
WIZNET=1 RELEASE=1 ESPRUINO_1V3=1 make
```

Wiring Up
--------

Just wire up J1 as follows. J2 does not need wiring up.

| WIZ550io J1 | Name | Espruino |
|-------------|------|----------|
| 1 | GND |     |
| 2 | GND | GND |
| 3 | MOSI | B5 |
| 4 | MISO | B4 |
| 5 | SCK | B3 |
| 6 | CS | B2 |
| 7 | 3V3 | 3V3|
| 8 | 3V3 |   &nbsp; |

Software
-------

Just connect as follows:

```
var eth = require("WIZnet").connect();
```

You can check your IP with:

```
eth.getIP()
```

Create an HTTP server like this:

```
require("http").createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('Hello World');
  res.end();
}).listen(80);
```

And load a webpage like this:

```
require("http").get("http://192.168.1.50", function(res) {
    res.on('data', function(data) { console.log(data);	});
  });
```

Note that there is no DNS in the current WIZnet implementation so you'll have to supply the IP address of your server.

For more examples, please see the [[Internet]] page.

Using 
-----

* APPEND_USES: WIZnet

Buying
-----

You can buy this module [direct from WIZnet](http://shop.wiznet.eu/w5500-89.html)
