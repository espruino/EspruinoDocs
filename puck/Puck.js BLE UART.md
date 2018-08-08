<!--- Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bluetooth LE UARTs (NUS)
========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Puck.js+BLE+UART. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Modules,BLE,Bluetooth,NUS,Nordic UART,UART
* USES: Puck.js,BLE,Only BLE

By default, Bluetooth LE Espruino devices like [Puck.js](/Puck.js) present a
`Nordic UART` service that provides serial port-like access to the Espruino 
REPL. You can disable it with [NRF.setServices({},{uart:false})](/Reference#l_NRF_setServices) if needed.

The `puck.js` helper script allows you to access this UART from a Web Browser with
Web Bluetooth - see [the Web Bluetooth Guide](/Puck.js Web Bluetooth)

Writing
-------

If you want to connect to this UART service on one Espruino device from another Espruino device,
you can use the [[ble_simple_uart.js]] module to send data.

Just use as follows:

```
NRF.requestDevice({ filters: [{ namePrefix: 'Puck.js' }] }).then(function(device) {
  require("ble_simple_uart").write(device, "digitalPulse(LED3,1,1000)\n", function() {
    print('Done!');
  });
});
```

`require("ble_simple_uart").write` also returns a promise, which can be used
with `.then`:

```
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

```
var uart;
NRF.requestDevice({ filters: [{ namePrefix: 'Puck.js' }] }).then(function(device) {
  return require("ble_uart").connect(device);
}).then(function(u) {
  uart = u;
  return uart.eval('E.getTemperature()');
}).then(function(data) {
  print("Got temperature "+data);
  uart.disconnect();
});
```

However you can also use `on('data'` and `write` as you need to:

```
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
