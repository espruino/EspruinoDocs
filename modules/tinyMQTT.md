<!--- Copyright (c) 2018 Ollie Phillips. See the file LICENSE for copying permission. -->
Tiny MQTT Client (tinyMQTT)
===========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/tinyMQTT. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,MQTT,protocol,client,Internet,small,mini,tiny

Stripped out JavaScript [MQTT](http://mqtt.org/) module that does basic PUB/SUB, by [@olliephillips](https://github.com/olliephillips). Espruino also contains [a more complete MQTT module](/MQTT) , but it uses substantially (3x) more memory.

- Supports QoS 0 only.
- Supports authentication on username and password.
- 127 byte publishing length limit (the sum of the length of the topic + the length of the data must not be more than 127 characters).
- Retain flag is set on published messages.

## How to use

Using the Espruino Web IDE you can just require the module directly:

```
var mqtt = require("tinyMQTT");
```

### No config options

```
var mqtt = require("tinyMQTT").create(server);
mqtt.connect(); // Connects on default port of 1883
```
### With config options

```
var mqtt = require("tinyMQTT").create(server, {
	username: "username",
	password: "password",
	port: 8883
});
mqtt.connect();
```

## Example

```
var mqtt = require("tinyMQTT").create("test.mosquitto.org");

mqtt.on("connected", function(){
	mqtt.subscribe("espruino/test");
});

mqtt.on("message", function(msg){
	console.log(msg.topic);
	console.log(msg.message);
});

mqtt.on("published", function(){
	console.log("message sent");
});

mqtt.on("disconnected", function(){
	console.log("disconnected");
});

var wifi = require("Wifi");
wifi.connect("username", {password:"mypassword"}, function(){
	mqtt.connect();
});
```

## Reconnection

If you want to reconnect in event of broker disconnection or wifi outage add ```mqtt.connect();``` to the disconnected event listener. Reconnection will be attempted indefinitely, by default at 2 second intervals (though this can be configured). Once reconnected publishing should restart, and subscriptions will be honoured.

```
mqtt.on("disconnected", function(){
	console.log("disconnected");
	mqtt.connect();
});

```

## Too long message

tinyMQTT only supports short messages. The length of the topic plus the length of the payload must be less than 128 characters. If it's longer, the library throws a `tMQTT-TL` exception.

## Credits

@gfwilliams, @tve, @HyGy, @MaBecker, @gulfaraz, @The-Futur1st, @wanglingsong and @AkosLukacs. Thanks for the advice, tips, testing and pull requests!
