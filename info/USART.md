<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
USART / UART / Serial Port
=======================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/USART. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Peripheral,Peripherals,Serial,USART,UART,RS232,Built-In

[Serial Class](/Reference#Serial) in the Reference.

Espruino can respond to information on serial ports or USB. If you're plugged in via USB, you can create a very simple command interpreter on the first serial port with the following code:

```JavaScript
var cmd="";
Serial1.setup(9600/*baud*/);
Serial1.on('data', function (data) {
  Serial1.print(data);
  cmd+=data;
  var idx = cmd.indexOf("\r");
  while (idx>=0) {
    var line = cmd.substr(0,idx);
    cmd = cmd.substr(idx+1);
    var s = "'"+line+"' = "+eval(line);
    print(s);
    Serial1.println(s);
    idx = cmd.indexOf("\r");
  }
});
```

Or you can do a quick 'loopback' test. Connect the RX and TX pins together for one of the serial ports (for example Serial4 on some boards), and then do:

```JavaScript
Serial4.setup(9600);
Serial4.on('data', function (data) { print("<Serial4> "+data); });
Serial4.print("Hello World");
```

Most chips can also have the same Serial port on different pins, for example Serial1 TX is available on A9 or B6 on the Espruino Board (look at the datasheets for the board you have). Espruino will choose the first available pins by default - if you wish to use an alternate set of pins, you can specify them when you set up the Serial port:

```JavaScript
Serial1.setup(9600, { tx:B6, rx:B7 });
```

For more information, please see the [reference](/Reference) for your board.

USARTs (CK pin)
---------------

Some of the UARTs have a `CK` pin - this is an optional clock that can be generated alongside the normal serial output. It is not enabled by default but you can use it by specifying it when initialising:

```JavaScript
Serial1.setup(9600, { tx:B6, rx:B7, ck:A8 });
```

Parity/Framing errors
---------------------

If there are parity errors (if parity is enabled), you can get notified of them with the
following event listener if `errors:true` was set when initialising the serial device:

```
  Serial1.setup(9600, { parity:"e", errors:true } );
  Serial1.on('parity', function() {
    console.log("Oh no!");
  });
```

You can also get notified of framing errors (when the START and STOP bits are not correct)
with the following (`errors:true` is also required):

```
  Serial1.on('framing', function() {
    console.log("Oh no!");
  });
```

<a name="ConsoleSerial"></a>Console over serial
-------------------

Espruino will by default connect its interactive console to the `Serial1` port, or to the USB serial port if you are connected to a computer. When the console is on a port, a listener added with `SerialX.on('data', ...)` will no longer get called. See [this troubleshooting post](/Troubleshooting#console) for more information.

To avoid this behaviour, for example if you wish to use `Serial1` to talk to a device while disconnected from USB, explicitly set the console serial port using  [Serial.setConsole](/Reference#l_Serial_setConsole) during the [init event](Reference#l_E_init) which Espruino runs on boot.

```JavaScript
E.on('init', function() {
  USB.setConsole();
});
```
