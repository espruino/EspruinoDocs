<!--- Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
AT Command Handler
================

* KEYWORDS: AT,Modem

[[AT.js]] handles sending AT-style commands to a Serial device and receiving their responses, while not blocking (allowing other JavaScript to execute in the background).

For real-world usage, check out the [[ESP8266]] and [[SIM900]] modules.

You can use it as follows:

```
var at = require("AT").connect(Serial2);  

// Return some debug data, but also enable debug mode.
// Debug mode prints out what is sent and received
at.debug();

// As soon as the line buffer starts with `+IPD`, call the function
at.register("+IPD", function() {
  return "What sound go in the line buffer now";
});
// don't do it any more
at.unregister("+IPD");

// As soon as we get a complete line `Foo`, execute the function
at.registerLine("Foo", function() { ... });
// Now don't listen
at.unregisterLine("Foo");

// Just write some data
at.write("Hello!\r\n");

// Send simple command with 1 second timeout
at.cmd("AT+EO\r\n", 1000, function(d) {
  if (d===undefined) ; // we timed out!
  // d is now the result
});

// Send command that returns multiple items
at.cmd("AT+FOO\r\n", 1000, function cb(d) {
  if (d===undefined) ; // we timed out!
  console.log(d);
  if (still_waiting_for_more_info) return cb;
});

// Are we waiting for the response to a command?
if (at.isBusy()) ...
```

Using 
-----

* APPEND_USES: AT
