<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
USART / UART / Serial Port
=======================

* KEYWORDS: Serial,USART,UART,RS232,Built-In

[Serial Class](/Reference#Serial) in the Reference.

Espruino can respond to information on serial ports or USB. If you're plugged in via USB, you can create a very simple command interpreter on the first serial port with the following code:

```JavaScript
var cmd="";
Serial1.setup(9600/*baud*/);
Serial1.on('data', function () { 
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
 
Or you can do a quick 'loopback' test. Connect the RX and TX pins together for one of the serial ports (maybe Serial4), and then do:

```JavaScript
Serial4.setup(9600);
Serial4.on('data', function (data) { print("<Serial4> "+data); });
Serial4.print("Hello World");
```
 
Most chips can also have the same Serial port on different pins, for example Serial1 TX is available on A9 or B6 on the Espruino Board (look at the datasheets for the board you have). Espruino will choose the first available pins by default - if you wish to use an alternate set of pins, you can specify them when you set up the Serial port:

```JavaScript
Serial1.setup(9600, {tx:B6,rx:B7});
```

For more information, please see the [reference](/Reference) for your board.
