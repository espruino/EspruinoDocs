<!--- Copyright (c) 2026 NopeCharon. See the file LICENSE for copying permission. -->
Bluetooth LE Smart Connect
==========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/SmartConnect. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,BLE,Bluetooth,Connect,Central,Characteristic,Timeout,Disconnect,Reconnect
* USES: Only BLE

Often you want an Espruino device to send data to another Bluetooth LE device every so often. Making a new connection each time is slow, but staying connected all the time uses more power and stops anything else from connecting to the other device.

The `SmartConnect` module solves this. It connects to a characteristic on another device and stays connected while you're using it. After a set time with no reads or writes (10 seconds by default) it disconnects. If you read or write again after that, it reconnects automatically.

It also:

* Queues reads, writes and disconnects so that only one Bluetooth operation runs at a time. You don't need to wait for one write to finish before starting the next.
* Scans for the device only on the first connection, then reconnects straight to it.
* Closes the connection if it can't find the service or characteristic, so no half-made connection is left open.

Usage
-----

```JS
require("SmartConnect").connect({ name : "Puck.js abcd" }, {
  service : "6e400001-b5a3-f393-e0a9-e50e24dcca9e", // Nordic UART service
  characteristic : "6e400002-b5a3-f393-e0a9-e50e24dcca9e", // UART TX
  timeout : 10 // disconnect after 10 seconds of inactivity
}).then(function(sc) {
  // Toggle the other Puck.js's LED every time our button is pressed
  setWatch(function() {
    sc.write("LED1.toggle()\n").catch(function(e) {
      console.log("Write failed", e);
    });
  }, BTN, { edge : "rising", repeat : true, debounce : 50 });
});
```

The first argument is a filter for [`NRF.requestDevice`](/Reference#l_NRF_requestDevice), for example `{ name : "..." }`, `{ namePrefix : "..." }` or `{ services : ["..."] }`.

The second argument is an object containing:

* `service` - the UUID of the service
* `characteristic` - the UUID of the characteristic
* `timeout` - (optional) seconds of inactivity before disconnecting. The default is 10. Use `0` to stay connected.
* `connectOptions` - (optional) options passed to [`BluetoothRemoteGATTServer.connect`](/Reference#l_BluetoothRemoteGATTServer_connect), eg `{ minInterval : 7.5, maxInterval : 7.5 }`

`connect` returns a Promise that resolves to the `SmartConnect` instance once the first connection is made. If the device can't be found or connected to, the Promise is rejected and you can call `connect` again later.

The instance has these methods:

* `sc.write(data)` - write to the characteristic (connecting first if needed). Returns a Promise.
* `sc.read()` - read the characteristic's value (connecting first if needed). Returns a Promise that resolves to a `DataView`.
* `sc.disconnect()` - disconnect once any queued reads and writes have finished. Returns a Promise.
* `sc.isConnected()` - returns `true` if currently connected to the characteristic.

It also emits these events:

* `sc.on("connect", function() { ... })` - a connection to the characteristic has been made.
* `sc.on("disconnect", function(reason) { ... })` - the Bluetooth connection was closed. This happens after the timeout, after `sc.disconnect()`, or when the other device disconnects or goes out of range. `reason` is the reason code reported by [`gattserverdisconnected`](/Reference#l_BluetoothDevice_gattserverdisconnected).

**Note:** Each `write` is passed straight to `writeValue`, so it must fit into a single Bluetooth packet (20 bytes, unless a bigger MTU has been negotiated).

Reference
---------

* APPEND_JSDOC: SmartConnect.js

Using
-----

* APPEND_USES: SmartConnect
