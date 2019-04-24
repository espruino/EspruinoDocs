<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
USART / UART / Serial Port
=======================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/USART. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Peripheral,Peripherals,Serial,USART,UART,RS232,Built-In

See the [`Serial Class`](/Reference#Serial) and [`Serial.setup(...)`](/Reference#l_Serial_setup) in the Reference.


Choosing Pins
-------------

You can find out which pins to use by looking at [your board's reference page](/Reference#boards)
and searching for pins with the `UART`/`USART` markers. On some boards (for example
the nRF52 based Bluetooth Espruino boards) the UART can be used on any pin so won't
be explicitly marked, but others (such as the STM32 based Espruino boards) only
allow the UART on certain pins.

If not specified in `Serial.setup`, the default pins are used for `rx` and `tx`
(usually the lowest numbered pins on the lowest port that supports
this peripheral). `ck` and `cts` are not used unless specified.

If you specify an `rx` pin but *not* a `tx` pin (or `tx` but not `rx`) then
only that direction will be set up.


Usage
-----

To do a quick 'loopback' test, connect the RX and TX pins together on one of the serial ports (for example `Serial1`), and then run the following code:

```JavaScript
Serial1.setup(9600, {rx:serial_pin, tx:serial_pin});
Serial1.on('data', function (data) { print("<Serial> "+data); });
Serial1.print("Hello World");
```

This should display: `<Serial> Hello World`

Or more likely, something like:

```
<Serial> He
<Serial> ll
<Serial> o W
<Serial> orld
```

As the callback function is called whenever serial data is available. You can also use [`Serial.available()`](/Reference#l_Serial_available) and [`Serial.read()`](/Reference#l_Serial_read) but the `data` event is preferable.

Espruino can respond to any instance of the [`Serial Class`](/Reference#Serial) class - eg. serial ports, USB, Bluetooth, etc. If you're plugged in via USB, you can create a very simple command interpreter on the first serial port with the following code:

```JavaScript
var cmd="";
Serial1.setup(9600/*baud*/); // you may need to specify {rx:serial_pin, tx:serial_pin} on some boards
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

Most chips can also have the same Serial port on different pins, for example Serial1 TX is available on `A9` or `B`6 on the [Original Espruino Board](/Original) (look at the Espruino reference pages for the board you have). Espruino will choose the first available pins by default - if you wish to use an alternate set of pins, you can specify them when you set up the Serial port:

```JavaScript
Serial1.setup(9600, { tx:B6, rx:B7 });
```

For more information, please see the [reference](/Reference#boards) for your board.


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


Software serial
---------------

As of Espruino v2.00 you can set up 'software serial' using code like:

```
var s = new Serial();
s.setup(9600,{rx:a_pin, tx:a_pin});
// or just s.setup(9600,{tx:a_pin}); for transmit only
```

This can be used on any pin, and you can have multiple instances of Software serial ports. However software serial doesn't use `ck`, `cts`, `parity`, `flow` or `errors` parts of the initialisation object.

**NOTE:** As software serial doesn't use dedicated hardware there are some compromises:

* Baud rates significantly above 9600 baud are unlikely to be reliable
* Sending more than one or two characters will block execution of other JavaScript code until completion (hardware serial ports have a ~100 byte transmit buffer)
* Software serial reception will become increasingly unreliable the higher the CPU load.


<a name="ConsoleSerial"></a>
Console/REPL over serial
-------------------

By default, Espruino may end up using one of the Serial ports (usually `Serial1`) for the console (eg. the left-hand side of the IDE) when not connected to something else like USB or Bluetooth. When the console is on a port, a listener added with `SerialX.on('data', ...)` will no longer get called.

Check out the following for more information:

* [Espruino works when connected to a computer, but stops when powered from something else](/Troubleshooting#console)
* [My code works when I'm connected via Bluetooth but stops when I disconnect](/Troubleshooting+BLE#my-code-works-when-i-m-connected-via-bluetooth-but-stops-when-i-disconnect)


To avoid this behaviour, for example if you wish to use `Serial1` to talk to a device while disconnected from USB, explicitly set the console serial port using  [Serial.setConsole](/Reference#l_Serial_setConsole) during the [init event](Reference#l_E_init) which Espruino runs on boot.

```JavaScript
E.on('init', function() {
  USB.setConsole();
});
```

You can specify `USB.setConsole();` which will take effect until the next change in
connectivity (eg. a disconnect of USB), or you can supply `true` (`USB.setConsole(true);`)
to ensure the console stays on the given Serial device regardless of what happens.
