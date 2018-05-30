/*<!-- Copyright (c) 2018 Gordon Williams. See the file LICENSE for copying permission. -->
Pixl.js Bluetooth to Ethernet MQTT Bridge
=========================================

* KEYWORDS: Bridge,IoT,MQTT
* USES: Pixl.js,BLE,Only BLE,Ethernet,W5100,MQTT,arduino-5100

![Pixl.js BLE Ethernet Bridge](Pixl.js BLE Ethernet Bridge.jpg)

This is just a very simple example of using Puck.js to send received
Bluetooth LE advertising packets over MQTT to an server.

Just wire up an Arduino WIZnet adaptor [as shown on this page](/arduino-w5100)
then upload the following code with the `MQTTSERVER` variable set to the
IP address of a server running a (non-HTTPS) MQTT server.

To view the received packets, you can run a command such as this if you
have the Mosquitto tools installed on your PC:

```
mosquitto_sub -h 192.168.1.70 -v -t "/advertise"
```

**NOTE:** This is a simple example and isn't designed to deal with a large
volume of advertising packets. To make this more robust you might want to
consider adding a whitelist of BLE addresses that will be forwarded.

*/

var MQTTSERVER = "192.168.1.70";
var eth, mqtt;
var packets = 0;
var infoInterval;

function onInit() {
  Terminal.println("\n\n"); // add some clear lines
  Terminal.println("Ethernet setup");
  SPI1.setup({ mosi:D11, miso:D12, sck:D13 });
  eth = require("WIZnet").connect(SPI1, D10 /*CS*/);
  eth.setIP({mac:"00:08:dc:ab:cd:ef"});
  eth.setIP(); // DHCP
  Terminal.println("Ethernet ok, "+eth.getIP().ip);
  Terminal.print("MQTT...");
  mqtt = require("MQTT").connect({
    host: MQTTSERVER,
  });
  mqtt.on('connected', function() {
    Terminal.println("Connected!");
    startScan();
  });
  mqtt.on('disconnected', function() {
    Terminal.println("MQTT disconnected");
    stopScan();
  });
}

function startScan() {
  infoInterval = setInterval(function() {
    Terminal.println((packets/10)+" adverts/sec");
    packets = 0;
  }, 10000);
  NRF.setScan(function(dev) {
    delete dev.data; // we don't want to send the RAW data
    mqtt.publish("/advertise", JSON.stringify(dev));
    packets++;
  });
}

function stopScan() {
  clearInterval(infoInterval);
  NRF.setScan(); // stop scanning
}

onInit();
