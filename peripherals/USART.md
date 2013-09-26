<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
USART / UART / Serial Port
=======================

Espruino can respond to information on serial ports or USB. If you're plugged in via USB, you can create a very simple command interpreter on the first serial port with the following code:

```JavaScript
var cmd="";
Serial1.setup(9600/*baud*/);
Serial1.onData(function (e) { 
  Serial1.print(e.data); 
  if (e.data=="r") { 
    var s = "'"+cmd+"' = "+eval(cmd); 
    print(s);
    Serial1.println(s);
    cmd="";
  } else cmd+=e.data;
});
```
 
Or you can do a quick 'loopback' test. Connect the RX and TX pins together for one of the serial ports (maybe Serial4), and then do:

```JavaScript
Serial4.setup(9600);
Serial4.onData(function (e) { print("<Serial4> "+e.data); });
Serial4.print("Hello World");
```
 
STM32 chips can have the same Serial port on different pins, for example Serial4 TX is available on A0 or C10 on the STM32F4 (look at the datasheets for the board you have). Espruino will choose the first available pins by default - if you wish to use an alternate set of pins, you can specify them when you set up the Serial port:

```JavaScript
Serial4.setup(9600, {rx:C11,tx:C10});
```

For more information, please see the reference.
