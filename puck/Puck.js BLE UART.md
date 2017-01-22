<!--- Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Puck.js and BLE UARTs
======================

* KEYWORDS: Module,Modules,BLE,Bluetooth,NUS,Nordic UART,UART
* USES: Puck.js

By default, Puck.js presents a `Nordic UART` service that provides
serial port-like access to the Espruino REPL. You can disable it with
[NRF.setServices({},{uart:false})](/Reference#l_NRF_setServices) if needed.

The 'puck.js' helper script allows you to access this UART with
Web Bluetooth - see [the Web Bluetooth Guide](/Puck.js Web Bluetooth)

If you want to connect to this UART service on one Puck from another Puck,
you can use the [[ble_simple_uart.js]] module.

Just use as follows:

```
NRF.requestDevice({ filters: [{ namePrefix: 'Puck.js' }] }).then(function(device) {
  require("ble_simple_uart").write(device, "digitalPulse(LED3,1,1000)\n", function() {
    print('Done!');
  });
});
```

You can write text as long as you like to the UART, and the module will automatically
split it into BLE packets and send them.

**However:** there is currently no way to receive data using this module.
