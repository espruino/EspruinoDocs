<!--- Copyright (c) 2016 MrTimcakes. See the file LICENSE for copying permission. -->
Ping
=============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Ping. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Ping

This is a simple module to allow 'pinging' from WiFi enabled devices. While not
true pinging, it opens a socket connection to the specified port and returns the
time it takes to establish the connection.

This Module allows both URLs and IP Addresses.


Functions
----------

#### ping(options, callback)

```options``` is an object, which may contain several properties:

* address (address to ping; defaults to ```localhost```)
* port (defaults to ```80```)
* timeout (in ms; defaults to 5s)
* attempts (how many times to measure latency; defaults to 5)

```callback``` should be a function with arguments in node convention - ```function(err, data)```.

Returned data is an object which looks like this:

```javascript
{
  "address": "google.com",
  "port": 80, "attempts": 5, "avg": 36.86366081237, "max": 54.41212654113, "min": 29.13498878479,
  "raw": [ 29.13498878479, 54.41212654113, 34.74617004394, 32.61685371398, 33.40816497802 ]
 }
```

Usage
----------

```javascript
var p = require("Ping");

p.ping({ address: 'google.com' }, function(err, data) {
  console.log(data);
});
```

Reference
----------

* APPEND_JSDOC: Ping.js

Using
-----

* APPEND_USES: Ping

