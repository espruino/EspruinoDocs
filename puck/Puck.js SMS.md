<!--- Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Puck.js with SMS control
=========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Puck.js+SMS. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Puck.js,BLE,Bluetooth,Light,SMS,GSM,LTE,AWOX
* USES: Puck.js,SIM800,SIM900,ATSMS,BLE,Only BLE

This video shows you how use [Puck.js](/Puck.js) and a GSM modem
to control devices via SMS text messages.

[[http://youtu.be/xvX2k5vRkg0]]

The video further down shows how to read data from BLE devices
within range and then send that as an SMS text message response.

**Note:** You'll need the latest firmware as of Sept 2017 on your Puck.js device for this. That
means at least 1v95 (when released) or a 'cutting edge' build (http://www.espruino.com/Download).

You'll need
-----------

* A [Puck.js](/Puck.js) device (or other [Espruino board](/Order) if you don't need Bluetooth LE
* A [SIM800 or SIM900](/SIM900) module. The one I'm using is designed for a 5v input (if yours isn't you'll need to change the wiring accordingly)
* A 3.3v voltage regulator (LD1117AV33) if you're not going to use Puck.js's battery
* A 5v power source
* A [[Breadboard]] and patch wires if you're planning on assembling as in the video


Wiring Up
---------

Connect as follows:

#### LD1117AV33

| Pin        | Connection |
|------------|------------|
| 1 (GND)    | GND on everything else |
| 2 (Output) | Puck.js 3V |
| 3 (Input)  | 5v Input |

#### Puck.js

| Pin        | Connection |
|------------|------------|
| GND        | GND on everything else |
| 3V         | Puck.js 3V |
| D28        | SIM800 RXD |
| D29        | SIM800 TXD |

#### SIM800

| Pin        | Connection |
|------------|------------|
| GND        | GND on everything else |
| 5V         | 5v Input |
| SIM800 RXD | Puck.js D28 |
| SIM800 TXD | Puck.js D29 |


Software
--------

#### Controlling Puck.js's LED from an SMS

```
Bluetooth.setConsole(1);
Serial1.setup(115200, { rx: D29, tx : D28 });
var ATSMS = require("ATSMS");
var sms = new ATSMS(Serial1);

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

sms.on('message', function(msg) {
  console.log("Got message #",msg);
  sms.get(msg, function(err, msg) {
    if (err) throw err;
    print("Read message", msg);
    var txt = msg.text.toLowerCase();
    if (txt=="on") LED1.set();
    if (txt=="off") LED1.reset();
    // delete all messages to stop us overflowing
    sms.delete("ALL");
  });
});
```

#### Controlling an Awox BLE Lightbulb

```
Bluetooth.setConsole(1);
Serial1.setup(115200, { rx: D29, tx : D28 });
var ATSMS = require("ATSMS");
var sms = new ATSMS(Serial1);

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

sms.on('message', function(msg) {
  console.log("Got message #",msg);
  sms.get(msg, function(err, msg) {
    if (err) throw err;
    print("Read message");
    var txt = msg.text.toLowerCase();
    if (txt=="on") setLight(1);
    if (txt=="off") setLight(0);
    // delete all messages to stop us overflowing
    sms.delete("ALL");
  });
});

function setLight(isOn) {
  var gatt;
  NRF.connect("98:7b:f3:61:1c:22").then(function(g) {
    //         ^^^^^^^^^^^^^^^^^  your light's address here
    gatt = g;
    return gatt.getPrimaryService("33160fb9-5b27-4e70-b0f8-ff411e3ae078");
  }).then(function(service) {
    return service.getCharacteristic("217887f8-0af2-4002-9c05-24c9ecf71600");
  }).then(function(characteristic) {
    return characteristic.writeValue(isOn ? 1 : 0);
  }).then(function() {
    gatt.disconnect();
    console.log("Done!");
  });
}
```

#### Returning temperature

[[http://youtu.be/As2dqUOpEvU]]

The code on the [Puck.js](/Puck.js) sending the temperature is:

```
setInterval(function() {
  NRF.setAdvertising({
    0x1809 : [Math.round(E.getTemperature())]
  });
}, 30000);
```

and the full source is:

```
Bluetooth.setConsole(1);
Serial1.setup(115200, { rx: D29, tx : D28 });
var ATSMS = require("ATSMS");
var sms = new ATSMS(Serial1);

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

sms.on('message', function(msg) {
  console.log("Got message #",msg);
  sms.get(msg, function(err, msg) {
    if (err) throw err;
    print("Read message", msg);
    var txt = msg.text.toLowerCase();
    if (txt=="on") LED1.set();
    if (txt=="off") LED1.reset();
    if (txt=="get") getTemp(msg.oaddr);
    // delete all messages to stop us overflowing
    sms.delete("ALL");
  });
});

function getTemp(number) {
  console.log("Getting temp");
  NRF.findDevices(function(devs) {
    devs.forEach(function(dev) {
      if (dev.name=="Puck.js 5736") { // <--- change this to the name of your Puck.js
        console.log("Got temp");
        var message = "Temp is "+dev.serviceData["1809"][0];
        sms.send(number,message, function() {
          print("Sent text!");
        });
      }
    });
  });
}
```

Buying
------

See the [Puck.js Lightbulb page](/Puck.js+and+Bluetooth+Lightbulbs)
for links to where to find the Awox lights for sale.

The [SIM900](/SIM900) page has links to where to find the SIM900 module.

[Puck.js](/Puck.js) devices can be [ordered from here](/Order#puckjs)
