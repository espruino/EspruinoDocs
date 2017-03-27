<!--- Copyright (c) 2017 Pablo Rodiz Obaya. See the file LICENSE for copying permission. -->
Vizibles
========

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Vizibles. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Vizibles,Module,IoT,cloud,API

Read this in other languages: [English](/Vizibles), [Español](/Vizibles.es)

The [Vizibles module](/modules/Vizibles.js) provides an easy to use
interface to share device state variables to and get commands from
the [Vizibles](https://www.vizibles.com/) cloud IoT platform.
This module depends on having a ESP8266 connected to your Espruino
board, and the module must run the
[AT firmware for Vizibles](https://github.com/Enxine/ViziblesArduino/releases).
This module is only a simplification of the AT API to ease its use in Javascript.
The use of a full client on the ESP8266 allows us to include fully SSL encrypted
communications while leaving the resources of Espruino free for your application.

API
---

#### Constructor

The module exports an `init` function to create a Vizibles cloud device object:

```
exports.init = function(usart, startedCallback)
```

`usart` is the serial port where the ESP8266 module can be found, for example:
```
var cloud = require('Vizibles');
Serial2.setup(9600, { rx: A3, tx : A2 });
var cloud.init(Serial2);
```

`startedCallback` is a callback function to be called once the module is set up and running.

#### connect

Connect the thing with the platform.

```
connect = function(options, callback, connectionCb, disconnectionCb)
```

`options` is an object containing key/value pairs for configuring the connection
```
{
    'keyID': 'YOUR_KEY_ID',
    'keySecret' : 'YOUR_KEY_SECRET',
    'id' : 'light-bulb'
}
```
As basic options you will need `keyID` and `keySecret` as authentication for the platform and and `id` of the thing.

`callback` is an optional function which will be called when the connection command ends,  following the format:
```
function (resp) {}
```
where `resp` can be `Ok` or `Error` depending on the result of the command.
But keep in mind that the end of the connection command does not mean the thing is connected to the cloud, but only that the parameters were read correctly.
For this objective, knowing when the thing is connected, is the third parameter, an optional callback, `connectionCb` without parameters which will be called
once the connection process is finished correctly.
There is also a fourth optional parameter, `disconnectionCb`, a function, also without parameters to be called when the connection is lost.

#### setOptions

The `options` parameter in the `connect` function is also optional. We can not start a connection before setting up the parameters. But this task can be done with the `setOptions` function before calling `connect`.
Remember connection options can not be changed once the connection is established. If you need to change anything disconnect and reconnect for the change to take effect.

```
setOptions = function(options, callback)
```

Again `options` is an object containing key/value pairs for configuring the connection and  

`callback` is an optional function which will be called when the command finishes following the format:
```
function (resp) {}
```
where `resp` can be `Ok` or `Error` depending on the result of the command.

#### disconnect

Stop all communications with the Vizibles cloud platform.
```
disconnect = function(callback, disconnectionCb)
```

`callback` is an optional function which will be called when the command finishes following the format:
```
function (resp) {}
```
where `resp` can be `Ok` or `Error` depending on the result of the command.

`disconnectionCb`, a function without parameters to be called when the connection is lost.

#### update

Send values of thing's state variables to the Vizibles cloud platform.
```
update = function(variables, callback)
```

`variables` is an object containing key/value pairs for those state variables, for example
```
{
    'temperature': '27',
    'humidity' : '50'
}
```

`callback` is an optional function which will be called when the command finishes following the format:
```
function (resp) {}
```
where `resp` can be `Ok` or `Error` depending on the result of the command.

#### expose

This call will create a function that can be invoked either from the cloud or from other thing. In other words, it creates an action.

```
expose = function(fName, cbFunction, callback)
```

`fName` will be the name to refer to call this function, so the name we will use to create controls or rules on the cloud.  

`cbFunction` is the function itself. This is the code that will be run each time the function is invoked. The callback must have the format
```
function (parameters) {}
```
where `parameters` will be an array of strings containing all received parameters. First of them is the function name.

`callback` is an optional function which will be called when the command finishes following the format:
```
function (resp) {}
```
where `resp` can be `Ok` or `Error` depending on the result of the command.

#### getMAC

Read the MAC address of the WiFi interface.

```
getMAC = function(callback)
```

`callback` is a function to be called when the command finishes following the format:
```
function (resp) {}
```
where `resp` will be the MAC address value or `Error` depending on the result of the command.

#### getIP

Read the IP address of the WiFi interface. Remember the IP address is assigned when WiFi is connected to an access point.

```
getIP = function(callback)
```

`callback` is a function to be called when the command finishes following the format:
```
function (resp) {}
```
where `resp` will be the IP address value or `Error` depending on the result of the command.

#### WiFiConnect

Connect to a WiFi access point.

```
WiFiConnect = function(SSID, passwd, callback)
```

`SSID` must be a string with the SSID of the WiFi AP we want to connect.

`passwd` is a string with the password for the SSID in the first parameter.

`callback` is an optional function which will be called when the command finishes following the format:
```
function (resp) {}
```
where `resp` can be `Ok` or `Error` depending on the result of the command. The reception of an `Ok` means the WiFi connection is up and working.

#### version

Get firmware version of the code running on the WiFi module. This AT command shares syntax with other AT firmwares, being implemented by calling `AT+GMR` on the serial port. So it becomes a useful tool to check if we burned the right firmware to the ESP8266 module.  

```
version = function (callback)
```

`callback` is a function to be called when the command finishes following the format:
```
function (resp) {}
```
where `resp` will be the firmware version signature or `Error` depending on the result of the command.

#### reset

Restart the ESP8266 module.

```
reset = function(callback)
```

`callback` is an optional function which will be called when the command finishes following the format:
```
function (resp) {}
```
where `resp` can be `Ok` or `Error` depending on the result of the command.

#### debug

Activate debug output to console of all character traffic exchanged through the serial connection with the WiFi module

```
debug = function()
```

Examples
--------

Below you will find two examples of how to use this module in practice on Espruino Pico with the shim board for the ESP8266 ESP-01 module. In both examples remember tho change `keyID` and `keySecret` for your own or you will not be able to access the data of your board from the cloud. And of course change also the SSID and password of your WiFi network or you will not be able to connect.

An easy one, just updating a variable each time the switch on the pico board is pushed:
```
Serial2.setup(9600, { rx: A3, tx : A2 });

var state = 'off';

var update = function () {
  if (state=='off') state = 'on';
  else state = 'off';
  cloud.update({'state' : state});
}

setWatch(function() {
  update();
}, BTN, { repeat: true, debounce : 50, edge: "rising" });

var cloud = require('Vizibles').init(Serial2, function (d) {
  cloud.WiFiConnect("<YOUR SSID>","<YOUR PASSWORD>",function(d) {
    if(d=='Ok') {
      cloud.setOptions({
		  'keyID': 'Gp2naLrsSpFE',
		  'keySecret' : 'wGyFTwIHvYwGCBDJyA7j',
          'id' : 'light-switch'
        }, function(d) {
        if(d=='Ok'){
        cloud.connect(null, null, connected);
        }   
      });  
    }
  });
});

//Reset ESP8266 module on Pico's shim
digitalWrite(B9,1);
digitalWrite(A10,0); // pulse reset
digitalWrite(A10,1);
```

And a more complex example, emulating a light bulb, that can be on or off, and that exposes the ability to be switched to the cloud

```
Serial2.setup(9600, { rx: A3, tx : A2 });

var exposeFunctions = function(d) {
   cloud.expose('lightOn', lightOn, function(d){
     if(d=='Ok'){
       cloud.expose('lightOff', lightOff, function(d){
         if(d=='Ok'){
         } else {
            exposeFunctions();
         }
       });
     } else {
       exposeFunctions();
     }
  });
};

var connected = function() {
  cloud.update({status : 'off'}, function(d) {
    if(d=='Ok'){
       exposeFunctions();
    }  
  });

};

var lightOn = function(d) {
  digitalWrite(LED2,1);
  cloud.update({status : 'on'});
};

var lightOff = function(d) {
  digitalWrite(LED2,0);
  cloud.update({status : 'off'});
};

var cloud = require('Vizibles').init(Serial2, function (d) {
  cloud.WiFiConnect("<YOUR SSID>","<YOUR PASSWORD>",function(d) {
    if(d=='Ok') {
      cloud.setOptions({
		  'keyID': 'Gp2naLrsSpFE',
		  'keySecret' : 'wGyFTwIHvYwGCBDJyA7j',
          'id' : 'light-bulb'
        }, function(d) {
        if(d=='Ok'){
        cloud.connect(null, null, connected);
        }   
      });  
    }
  });
});

//Reset ESP8266 module on Pico's shim
digitalWrite(B9,1);
digitalWrite(A10,0); // pulse reset
digitalWrite(A10,1);
```

Reference
---------

[Vizibles online help](https://developers.vizibles.com/en/)
