<!--- Copyright (c) 2014 Lars Toft Jacobsen (boxed.dk), Gordon Williams. See the file LICENSE for copying permission. -->
MQTT Client
===========

* KEYWORDS: Module,MQTT,protocol,client,Internet

A very simple [MQTT](http://mqtt.org/) client implementation for Espruino. MQTT is a lightweight publish-subscribe protocol built for reliable machine-2-machine communication with a very small footprint. It provides efficient and robust communication mechanisms as well as QOS. This module only implements a subset of the MQTT protocol. As of now only QOS 0 (at most once) is truly supported. Encryption and authentication is not supported. The module has been tested with Mosquitto-1.3.5. Use the [MQTT](/modules/MQTT.js) ([About Modules](/Modules)) module for it.

The module exports the function `create(server, options)` that returns a new MQTT object using the provided arguments. The server argument is the MQTT broker ip address, and options is an optional object that can used to pass non-default parameters - see the code below for the parameters and their options.

Setting up and connecting
---------------------------

First off load the module and create a MQTT object using ```require("MQTT").create(server)```. In the example below the CC3000 is used to set up a network connection and get a DHCP address. Upon a successful connection connect to the MQTT broker by calling ```connect()```. This will open a socket connection to the server and establish MQTT communications. The client will ping the server every 40 seconds to keep the connection alive in case no other control packets are sent. The connected event can be used to set up subscriptions etc upon sucessful connection.

```js
  var server = "192.168.1.10"; // the ip of your MQTT broker
  var options = { // all optional - the defaults are below
    client_id : "random", // the client ID sent to MQTT - it's a good idea to define your own static one based on `getSerial()`
    keep_alive: 60, // keep alive time in seconds
    port: 1883, // port number
    clean_session: true,
    username: "username", // default is undefined
    password: "password",  // default is undefined
    protocol_name: "MQTT", // or MQIsdp, etc..
    protocol_level: 4, // protocol level
  };
  var mqtt = require("MQTT").create(server, options /*optional*/);

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

### Calling `connect` directly

You can skip the `create` and `connect` steps and call connect directly,
but you must already have a network connection.

**Note:** This is `require("MQTT").connect` and not `mqtt.connect`.

```js
require("MQTT").connect({
  host: "192.168.1.10",
});

// or specify more options

require("MQTT").connect({
  host: "192.168.1.10",
  username: "username",
  password: "password"
});
```

### Connecting without TCP/IP

In some cases (for example when transmitting MQTT over radio) you may not
want to use the built-in TCP/IP functionality and will want to define your
own methods to send and receive data.

You can do this as follows:

```js
var mqtt = require("MQTT").create(server, options);
var client = {
  write : function(data) { /* write data as string */ },
  end : function() { /* close connection */ }
};
mqtt.connect(client);

// call client.emit('data', "received_data")
// and client.emit('end') when connection closed
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
