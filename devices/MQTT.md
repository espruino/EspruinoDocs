<!--- Copyright (c) 2014 Lars Toft Jacobsen (boxed.dk). See the file LICENSE for copying permission. -->
MQTT Client
=====================

* KEYWORDS: Module,MQTT,protocol,client

A very simple [MQTT](http://mqtt.org/) client implementation for Espruino based on the original socket example by Gordon in this [forum post](http://forum.espruino.com/conversations/258515/). MQTT is a lightweight publish-subscribe protocol built for reliable machine-2-machine communication with a very small footprint. It provides efficient and robust communication mechanisms as well as QOS. This module is however a work-in-progress and only a subset of the protocol is implemented. Likewise there's no guarantee that the implementation complies 100% with the MQTT specification. As of now only QOS 0 (at most once) is truly supported. Encryption and authentication is not supported. The module has been tested with Mosquitto-1.3.5. Use the [MQTT](/modules/MQTT.js) ([About Modules](/Modules)) module for it.

The module exports the function create(server, options) that returns a new MQTT object using the provided arguments. The server argument is the MQTT broker ip address, and options is an optional object that can used to pass non-default parameters: client_id, keep_alive, port, and clean_session. If not provided these will default to, a random GUID, 60 s, 1883 and true respectively. Provide a hard-coded client id to ensure the Espruino will always present itself using the same id after a reset.

Setting up and connecting:

First of load the module and create a MQTT object using ```require("MQTT").create(server)```. The module can only be used with a network connection. In the example below th CC3000 is used to setup a network connection and get a DHCP address. Upon a successful connection connect to the MQTT broker by calling ```connect()```. This will open a socket connection to the server and establish MQTT communications. The client will ping the server every 40 seconds to keep the connection alive in case no other control packets are sent. The connected event can be used to set up subscriptions etc. upon sucessful connection.

```
  var server = "192.168.1.10"; // the ip of your MQTT broker
  var mqtt = require("MQTT").create(server);

  mqtt.on('connected', function() {
    mqtt.subscribe("test");
  });

  var wlan = require("CC3000").connect();
  wlan.connect( "AccessPointName", "WPA2key", function (s) { 
    if (s=="dhcp") {
      console.log("My IP is "+wlan.getIP().ip);
      mqtt.connect();
    }
  });
```

### Connection Options

The options you can pass to `MQTT#connect` are as follows.

```js
mqtt.connect({
  keep_alive: 60, // keep_alive[seconds]
  port: 1883, // port number
  clean_session: 1883, // port number
  username: "username", 
  password: "password", 
  protocol_name: "MQTT", // or MQIsdp, etc..
  protocol_level: 4, // protocol_level
  });
```

Disconnect
-----------

If for some reason you want to disconnect and close the socket use the ```disconnect()``` function.

```
  mqtt.disconnect();
```

Publish
-----------

At any time during a session you can publish a message to the broker. A topic must be provided to allow the broker to deliver the message to any client with a subscription that matches that topic.
```
  var topic = "test/espruino";
  var message = "hello, world";
  mqtt.publish(topic, message);
```

Subscribe/Unsubscribe
-----------

Subscriptions are managed using the ```subscribe(topic_filter)``` and ```unsubscribe(topic_filter)```functions. A topic filter can be just a specific topic or contain wildcards that matches groups and/or sub-groups of topics. An event, publish, is fired whenever a message is recieved by the client. The event emitter calls the listener with an object containin all the relevant packet information: topic, message, (dup, qos and retain).

```
  mqtt.subscribe("test/espruino");

  mqtt.on('publish', function (pub) {
    console.log("topic: "+pub.topic);
    console.log("message: "+pub.message);
  });

  mqtt.unsubscribe("test/epruino");
```

