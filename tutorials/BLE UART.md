<!--- Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bluetooth LE UARTs (NUS)
========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/BLE+UART. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Modules,BLE,Bluetooth,NUS,Nordic UART,UART,6e400001-b5a3-f393-e0a9-e50e24dcca9e,Bluetooth UART
* USES: Puck.js,BLE,Only BLE

By default, Bluetooth LE Espruino devices like [Puck.js](/Puck.js) present a
`Nordic UART` service (`6e400001-b5a3-f393-e0a9-e50e24dcca9e`) that provides serial port-like access to the Espruino
REPL. You can disable it with [NRF.setServices({},{uart:false})](/Reference#l_NRF_setServices) if needed.

The `puck.js` helper script allows you to access this UART from a Web Browser with
Web Bluetooth - see [the Web Bluetooth Guide](/Puck.js Web Bluetooth), but this
page shows how you can access the

Finding Devices
---------------

Nordic UART devices often advertise the Nordic UART Service UUID `6e400001-b5a3-f393-e0a9-e50e24dcca9e`
but they may not. Espruino devices advertise the UUID but in a Scan Response packet, so active scanning
is required, and in devices with heavy Bluetooth traffic it might take a while to receive it.

If you know the device you want to connect to by some other method (eg it's name or MAC address) then
it may be best to connect using that (we use the name in the examples below), but if you wish to find
all devices advertising that Nordic UART service then you can use the following:

```JS
NRF.findDevices(function(devices) {
  print(devices);
}, { filters: [{ services: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] }], timeout: 2000, active:true });
```

Writing
-------

If you want to connect to this UART service on one Espruino device from another Espruino device,
you can use the [[ble_simple_uart.js]] module to send data.

Just use as follows:

```JS
NRF.requestDevice({ filters: [{ namePrefix: 'Puck.js' }] }).then(function(device) {
  require("ble_simple_uart").write(device, "digitalPulse(LED3,1,1000)\n", function() {
    print('Done!');
  });
});
```

`require("ble_simple_uart").write` also returns a promise, which can be used
with `.then`:

```JS
NRF.requestDevice({ filters: [{ namePrefix: 'Puck.js' }] }).then(function(device) {
  return require("ble_simple_uart").write(device, "digitalPulse(LED3,1,1000)\n");
}).then(function() {
  print('Done!');
});
```

You can write text as long as you like to the UART, and the module will automatically
split it into BLE packets and send them.

Receiving / Evaluating
----------------------

[[ble_simple_uart.js]] just transmits. However [[ble_uart.js]] can receive
as well. To do this, it keeps the connection **open** and you must manually
close it with `disconnect` when you're done.

We've provided a utility function called `eval` that will evaluate an
expression on the remote device, transfer it back as JSON, and then
parse it:

```JS
var uart;
NRF.requestDevice({ filters: [{ namePrefix: 'Puck.js' }] }).then(function(device) {
  return require("ble_uart").connect(device);
}).then(function(u) {
  uart = u;
  // Optional - wait 0.5 second for any data in the BLE buffer
  // to be sent - otherwise it may interfere with the result from
  // eval
  return new Promise(function(r) { setTimeout(r, 500); });
}).then(function() {
  return uart.eval('E.getTemperature()');
}).then(function(data) {
  print("Got temperature "+data);
  uart.disconnect();
});
```

However you can also use `on('data'` and `write` as you need to:

```JS
NRF.requestDevice({ filters: [{ namePrefix: 'Puck.js' }] }).then(function(device) {
  return require("ble_uart").connect(device);
}).then(function(uart) {
  uart.on('data', function(d) { print("Got:"+JSON.stringify(d)); });
  uart.write("digitalPulse(LED,1,10);\n"); // .then(...)
  setTimeout(function() {
    uart.disconnect();
    console.log("Disconnected");
  }, 2000);
});
```

**Note:** the code above will print something like:

```
Got:"digitalPulse(LED,1,1"
Got:"0);\r\n=undefined\r\n>"
```

This is because by default the JavaScript console (REPL) echoes back,
evaluates, and outputs each command sent to it. To stop that, you
can prefix the command with `\x10` (or you can move the console
away and handle any data sent yourself).
