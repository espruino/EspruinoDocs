<!--- Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
About Bluetooth LE (BLE)
========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/About+Bluetooth+LE. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Puck.js,About,BLE,Bluetooth,Bluetooth LE
* USES: Puck.js,BLE,Only BLE

What follows is a really quick Bluetooth LE intro - for more
details we'd suggest that you check out the links on the
[Bluetooth LE Wikipedia Page](https://en.wikipedia.org/wiki/Bluetooth_low_energy).

Bluetooth LE works at the same frequency as normal Bluetooth (2.4Ghz), but is
designed to be cheaper to implement, and to use much less power.

There are two distinct types of device (Puck.js can be both):

* **Central** is usually something like a Phone or PC, that will connect to another device.
* **Peripheral** is a device that gets connected to, like a fitness band.


TL;DR - Super-quick summary
----------------------

Puck.js provides a UART (serial) connection over Bluetooth LE where you can send
and receive characters. You can use this to control your Puck however you want
(for example using our [`Puck.js` library for Web Bluetooth](Puck.js Web Bluetooth)).

You can even use one Puck to control another [like this](Puck.js BLE UART)

Bluetooth LE itself is more complex - so if you want to control other devices,
or want to control your Pucks in a more secure way, keep reading!


Advertising
-----------

The normal mode of operation for Puck.js is advertising. This means it broadcasts
a few bytes of information every second or so (it's configurable). It's not
engaging in any two-way communication.

By default it broadcasts its name, and the services that it implements (Nordic UART -
we'll get to that later).

Some devices, like [Eddystone Beacons](/Puck.js Eddystone) don't generally broadcast
a name, but send a URL (which can be read by your phone) and perhaps their battery level.

**Note:** See [`NRF.setAdvertising(...)`](/Reference#l_NRF_setAdvertising) for examples
of how to set up advertising on Puck.js. You can also use [`NRF.findDevices(...)`](/Reference#l_NRF_findDevices)
and [`NRF.setScan(...)`](/Reference#l_NRF_setScan) to scan for advertising packets
broadcast by other beacons.

To see how to receive advertising data in your own application, [check out this tutorial](/Puck.js+Advertising).


Connecting (Puck as Peripheral)
--------------------------------

When a central device connects to Puck.js as a peripheral it can Pair and Bond.
Pairing is just exchanging information about security features and deciding on
what to use - but it's just for the life of the connection.

By contrast, Bonding saves the information (for example encryption keys) and can
use them for subsequent connections. Puck.js doesn't support this (in 1v89), but
it will do with a later firmware update.

**Note:** When connected, the power usage of Puck.js raises from 20uA to 200uA.
As a result it's recommended that you don't leave a connection to Puck.js open,
but only connect when you need to send or receive commands.


Services and Characteristics
----------------------------

Once a Central device is connected, it gets access to the [Services](https://www.bluetooth.com/specifications/gatt/services) and
[characteristics](https://www.bluetooth.com/specifications/gatt/characteristics) that a Peripheral (eg. Puck.js) has. This is called [GATT - the
Generic Attribute Profile](https://www.bluetooth.com/specifications/generic-attributes-overview).

We give services and characteristics names, but they are defined by a
Universally Unique ID (UUID). You get 16 bit ones which are unique because
[the Bluetooth SIG defines them](https://www.bluetooth.com/specifications/gatt/services),
and you get 128 bit ones which are free to use and unique because as long as
you come up with a random one, the chances of it being the same as someone
else's are minute.

Services are really just groups of Characteristics, and each characteristic
represents one type of data. There are 3 main operations that can be performed
with a characteristic:

* **READ** - the central device sends a request, and the peripheral responds with the current value of the characteristic.
* **WRITE** - the central device sends a data and a request to write, and the peripheral updates the value of the characteristic (depending on the type of write it might respond to say everything's ok)
* **NOTIFY / INDICATE** - a central device can ask to receive notifications. Then, when the value of the characteristic on the peripheral changes, it will 'push' data to the central, without it having to check. This is the best way to send data. For example you may want to send two identical values - you can easily do this with notify, but would be difficult to do with repeated reads. Notify and Indicate are very similar, but not identical. See [here](https://devzone.nordicsemi.com/question/310/notificationindication-difference/) for an explanation - but basically you should always try and use notify, *not* indicate.


**Note:** A characteristic can have any combination of those 3 types. In fact it's very common to have a characteristic that cannot be read, but that has **notify** so a central device can be notified when something changes.

For example you might have:

* A `Light` service, which has 2 writable (and perhaps readable) characteristics for `brightness` and `hue`.
* A `Button` service, which has a readable and notifyable characteristic for Button State
* A `Motion` service, which has just a notifyable characteristic that is sent data when motion occurs

It's really helpful to install the `nRF Connect` app on your phone. You can then
browse (and change) services and characteristics on different devices so you can get
an idea what they're like.

**Note:** See [`NRF.setServices(...)`](/Reference#setServices) for examples
of how to set up services and characteristics on Puck.js.


The Puck's Services
-------------------

By default, Puck.js has a `Nordic UART` service (UUID `6e400001-b5a3-f393-e0a9-e50e24dcca9e`)
that allows you to communicate with the JS interpreter. This service offers two
way communications. It has two Characeristics, `RX` and `TX`:

* The `TX` characteristic (UUID `6e400002-b5a3-f393-e0a9-e50e24dcca9e`) lets you send data to Puck.js. You can write up to
20 bytes of data to it, and each time you write, the characters you send go
straight to the JS interpreter.
* The `RX` characteristic (UUID `6e400003-b5a3-f393-e0a9-e50e24dcca9e`) lets you get data back from Puck.js. It can't be read,
but you can subscribe to `notify`, and so can receive any characters as they get
sent.

If you want to light an LED on a Puck, you can just connect and write
`LED.set()` and a newline to the `TX` characteristic, and the command will
be executed! This works for functions that you've previously defined too.

**Note:** Exposing the JS interpreter to the world isn't remotely secure.
You can add a password with [`E.setPassword(...)`](/Reference#l_E_setPassword),
or can use [`NRF.setServices(...)`](/Reference#setServices) to completely
remove it.



What happens internally?
------------------------

A Bluetooth LE device has an internal table of characteristics (and other things
like [descriptors](https://www.bluetooth.com/specifications/gatt/descriptors)).

If a Central device wants to access a characteristic it must first find out from
the peripheral where in the table a characteristic is. This is called the `handle`,
and it'll be a simple integer like maybe `11`.

Once it's got that, it can read and write from the characteristic using just that
handle, saving it having to send a potentially 128-bit UUID each time.

To get notifications, the central device has to find the 'descriptor' for the
relevant characteristic. It'll then be able to set the `NOTIFY` or `INDICATE`
bit in that characteristic, which will cause it to be sent a message whenever
it changes.


Connecting (Puck as Central)
-----------------------------

To connect to another device from Puck.js, you need its address. Addresses are
of the form `aa:bb:cc:dd:ee` like the MAC address you might get on your WiFi -
however they can also be 'public' (meaning there will never be two the same in
the world) or 'random' (meaning you can only really rely on them being unique
  in a specific location). Pucks advertise as 'random'.

**Note:** Pretty much all actions when you are a central device take time -
sometimes 100ms, sometimes 2 seconds or more if connecting. This means that
the functionality in Pucks works using Callbacks or [Promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise).
If you call a function it will most likely return immediately, and will
call the function you supplied at a later date.

An easy way to see what devices are around is to use [`NRF.findDevices(...)`](/Reference#l_NRF_findDevices):

```
var devices;
NRF.findDevices(function(d) {
  devices = d;
  console.log(devices);
}, 1000);
```

Will scan for 1 second (1000ms), and will print the devices it finds in range,
as `BluetoothDevice` objects:

```
[
  BluetoothDevice {
    "id": "e7:e0:57:ad:36:a2 random",
    "rssi": -45,
    "services": [  ],
    "data": new ArrayBuffer([ ... ]),
    "name": "Puck.js 36a2"
   },
  BluetoothDevice {
    "id": "c0:52:3f:50:42:c9 random",
    "rssi": -65,
    "services": [  ],
    "data": new ArrayBuffer([ ... ]),
    "name": "Puck.js 8f57"
   }
 ]
```

You can then call [`BluetoothDevice.gatt.connect(...)`](/Reference#l_BluetoothRemoteGATTServer_connect)
on the device that `findDevices` returned, and can then use promises to find a service, characteristic, write to it,
and finally disconnect:

```
devices[0].gatt.connect().then(function(g) {
  gatt = g;
  return gatt.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
}).then(function(service) {
  return service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
}).then(function(characteristic) {
  return characteristic.writeValue("LED1.set()\n");
}).then(function() {
  gatt.disconnect();
  console.log("Done!");
});
```

The example above will connect to a Puck, send some text to turn an LED on, and
will disconnect.

If you were trying to put this all together you'd need to put the connect
in the `findDevices` callback, like this:

```
NRF.findDevices(function(devices) {
  if (devices.length<1) throw new Error("Nothing found!");
  devices[0].gatt.connect().then(function(g) {
    gatt = g;
    return gatt.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
  }).then(function(service) {
    return service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
  }).then(function(characteristic) {
    return characteristic.writeValue("LED1.set()\n");
  }).then(function() {
    gatt.disconnect();
    console.log("Done!");
  });
}, 1000);
```

There are nicer ways of doing this though - see below.

**Note:** The only way to disconnect from a device is to call disconnect on the
[`BluetoothRemoteGATTServer`](/Reference#BluetoothRemoteGATTServer) object returned
by `NRF.connect`.


### Other connection methods

* There's [an easy utility module](/Puck.js BLE UART) that makes the process of writing to another Puck really easy.
* You can use [`NRF.connect(...)`](/Reference#l_NRF_connect) to connect directly
using just an address (which you can find in `id` returned from `findDevices`).
This is useful if you always want to connect to the same device.
* You can also use [`NRF.requestDevice`](/Reference#l_NRF_requestDevice) instead
of `NRF.findDevice()`. It's modelled on the Web Bluetooth function [`navigator.bluetooth.requestDevice`](),
and will allow you to connect to any device of a certain type or name.
