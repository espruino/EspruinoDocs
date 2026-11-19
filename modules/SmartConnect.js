/* Copyright (c) 2026 NopeCharon. See the file LICENSE for copying permission. */
/*
Connect to a characteristic on a Bluetooth LE device, stay connected while it
is being used, and disconnect automatically after a period of inactivity.
Reading or writing while disconnected reconnects automatically.

require("SmartConnect").connect({ name : "Puck.js abcd" }, {
  service : "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
  characteristic : "6e400002-b5a3-f393-e0a9-e50e24dcca9e",
  timeout : 10 // seconds
}).then(function(sc) {
  return sc.write("LED1.toggle()\n");
});
*/

function SmartConnect(filter, options) {
  this.filter = filter;
  this.options = options;
  this.timeout = (options.timeout===undefined) ? 10 : options.timeout;
  this.device = undefined;
  this.gatt = undefined;
  this.characteristic = undefined;
  this.timer = undefined;
  // Only one Bluetooth operation can be in progress at once, so every
  // operation is chained onto this Promise
  this.q = Promise.resolve();
}

SmartConnect.prototype.queue_ = function(fn) {
  // Run fn (which returns a Promise) after all other queued operations
  var sc = this;
  var p = sc.q.then(function() {
    if (sc.timer) clearTimeout(sc.timer);
    sc.timer = undefined;
    return fn();
  });
  sc.q = p.catch(function() {}).then(function() {
    if (sc.characteristic && sc.timeout>0)
      sc.timer = setTimeout(function() {
        sc.timer = undefined;
        sc.disconnect().catch(function() {});
      }, sc.timeout*1000);
  });
  return p;
};

SmartConnect.prototype.connect_ = function() {
  // Connect (if not already connected) and return a Promise for the characteristic
  var sc = this;
  if (sc.characteristic) return Promise.resolve(sc.characteristic);
  return (sc.device ? Promise.resolve(sc.device) :
    NRF.requestDevice({ filters : [sc.filter] }).then(function(device) {
      sc.device = device;
      device.on('gattserverdisconnected', function(reason) {
        if (sc.gatt && sc.gatt.connected) return; // we've already reconnected
        sc.gatt = sc.characteristic = undefined;
        if (sc.timer) clearTimeout(sc.timer);
        sc.timer = undefined;
        sc.emit("disconnect", reason);
      });
      return device;
    })
  ).then(function(device) {
    return device.gatt.connect(sc.options.connectOptions);
  }).then(function(gatt) {
    sc.gatt = gatt;
    return gatt.getPrimaryService(sc.options.service);
  }).then(function(service) {
    return service.getCharacteristic(sc.options.characteristic);
  }).then(function(characteristic) {
    sc.characteristic = characteristic;
    sc.emit("connect");
    return characteristic;
  }).catch(function(err) {
    // don't leave a half-made connection open
    var gatt = sc.gatt;
    sc.gatt = sc.characteristic = undefined;
    return Promise.resolve(gatt && gatt.connected && gatt.disconnect()).catch(function() {}).then(function() {
      throw err;
    });
  });
};

/** Write data to the characteristic, connecting first if needed. Returns a Promise */
SmartConnect.prototype.write = function(data) {
  var sc = this;
  return sc.queue_(function() {
    return sc.connect_().then(function(characteristic) {
      return characteristic.writeValue(data);
    });
  });
};

/** Read the characteristic's value, connecting first if needed. Returns a Promise that resolves to a DataView */
SmartConnect.prototype.read = function() {
  var sc = this;
  return sc.queue_(function() {
    return sc.connect_().then(function(characteristic) {
      return characteristic.readValue();
    });
  });
};

/** Disconnect now (after any queued reads/writes have finished). Returns a Promise */
SmartConnect.prototype.disconnect = function() {
  var sc = this;
  return sc.queue_(function() {
    var gatt = sc.gatt;
    sc.gatt = sc.characteristic = undefined;
    if (gatt && gatt.connected) return gatt.disconnect();
  });
};

/** Is there currently a connection to the characteristic? */
SmartConnect.prototype.isConnected = function() {
  return !!this.characteristic;
};

/** Create a SmartConnect instance and connect to the characteristic.

`filter` is a filter as used by `NRF.requestDevice`, eg `{ name : "Puck.js abcd" }`

`options` is an object containing:

```
{
  service : "...",        // UUID of the service
  characteristic : "...", // UUID of the characteristic
  timeout : 10,           // optional - seconds of inactivity before disconnecting (default 10, 0 = never)
  connectOptions : {...}  // optional - options passed to BluetoothRemoteGATTServer.connect
}
```

Returns a Promise that resolves to the SmartConnect instance once connected. */
exports.connect = function(filter, options) {
  var sc = new SmartConnect(filter, options);
  return sc.queue_(function() {
    return sc.connect_();
  }).then(function() {
    return sc;
  });
};
