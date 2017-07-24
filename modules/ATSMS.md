<!--- Copyright (c) 2017 Gordon Williams. See the file LICENSE for copying permission. -->
SMS Send and Receive
====================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/MQTT. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,SIM800,SIM900,AT,SMS,GSM
* USES: AT

The [ATSMS](/modules/ATSMS.js) module uses standard AT commands


Wiring
------

See the [[SIM900]] page for wiring instructions - the only connections you need to the Espruino device are: VCCMCU/VIO, GND, RX and TX.


Software
--------

The software's pretty eay. All you need to remember is to call
all the initialisation code from `onInit` if you're wanting to
initialise the modem at power on - and be aware that the modem
may take a few seconds to boot.


```
// Connect to serial device
Serial1.setup(115200, { rx: B7, tx : B6 });
var ATSMS = require("ATSMS");
var sms = new ATSMS(Serial1);
//Use sms.at.debug(); here if you want debug messages

sms.init(function(err) {
  if (err) throw err;
  console.log("Initialised!");
  
  sms.list("ALL", function(err,list) {
    if (err) throw err;
    if (list.length)
      console.log(list);
    else
      console.log("No Messages");
  });

  // and to send a message: 
  //sms.send('+441234567890','Hello world!', callback)
});

sms.on('message', function() {
  console.log("Got a message!");
});
```


Reference
----------

* APPEND_JSDOC: ATSMS.js

Using
-----

* APPEND_USES: ATSMS
