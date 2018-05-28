<!--- Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Ways of Programming Espruino
============================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Programming. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Programming,Communication,Communicating,USB,Serial,UART,BLE,Bluetooth

When you've got your Espruino board, there are several different ways you can
program it - they're detailed below:

Connection Types
-----------------

### USB

Normal Espruino boards have a USB connector, and when you plug this into
your PC the board appears as a USB Serial device, which you can then connect
to.

This is what we'd suggest programming Espruino devices with.

### Bluetooth LE

[Puck.js](/Puck.js) devices present themselves as as Bluetooth LE 'Nordic UART'
device, and can be connected to and programmed through that. It's the suggested
method of connection for [Puck.js](/Puck.js).

Adafruit make a [Bluetooth LE UART board](https://www.adafruit.com/product/2479)
that can be used to add Bluetooth LE UART capability to other Espruino devices.

### Serial / UART

When not connected to a computer by USB, Espruino boards usually open up a serial
port on two of their pins at 9600 baud so that they can be programmed via Serial.
The pins used for this are detailed in the Pinout section of your board's specific
reference page (eg [the Pico](/Pico#pinout), where they're marked with `!`).

To save power, [Puck.js](/Puck.js) only powers up the serial port if it detects
a voltage on the RX pin at boot time. See [Puck.js](/Puck.js#serial-console)

### Bluetooth UART

The [Original Espruino Board](/Original) has a footprint on the back for 
an [HC-05/HC-06 Bluetooth Module](/Bluetooth). Once soldered, it uses the
standard Serial port (detailed above) for communication. For more information
[see here](/Bluetooth).

Standard Bluetooth is not the same as Bluetooth LE, and can't be used to
communicate from a Website.

### WiFi/Ethernet

Currently Espruino boards don't come with Telnet support out of the box.
If you're running Espruino on [an ESP8266](/EspruinoESP8266) then Telnet is
enabled.

On other boards, once you have a network connection established you can run:

```
require("net").createServer(function (connection) {
  connection.pipe(LoopbackA);
  LoopbackA.pipe(connection);
  LoopbackB.setConsole();
}).listen(23);
```

However, using `reset()` will break your connection.

### Headphone Jack

Yes, it is even possible to program Espruino from your headphone jack with a
few external components! [See here!](/Headphone)


Applications
------------

### Espruino Web IDE

This is what we'd suggest you use for programming Espruino. It comes in a few
flavours:

* [Chrome Web App](http://www.espruino.com/Web+IDE#from-the-chrome-web-store) -
we'd suggest this for USB Espruino devices, and it's nice and easy to install.
* [Online](http://www.espruino.com/Web+IDE#online) - should be used for Bluetooth
LE based Espruinos ([Puck.js](/Puck.js)). It is amazingly easy to use (just [go here](https://www.espruino.com/ide)
in Chrome), however it doesn't yet work on Windows without ([some effort](https://github.com/urish/web-bluetooth-polyfill)).
It does however support using your [headphone jack!](/Headphone)!
* [Native App](http://www.espruino.com/Web+IDE#as-a-native-application) is needed
to communicate with Bluetooth LE devices like [Puck.js](/Puck.js) on Windows.
* [Locally hosted](https://github.com/espruino/EspruinoHub) IDE can be run on a Raspberry Pi, and can allow you to program [Puck.js](/Puck.js) devices through any Web Browser that has access to your local network.

Despite being called a 'Web IDE', the IDE itself (including the fully online version)
can function without an internet connection. If you're using modules you may need to
download 'offline data' under settings first though!

### Espruino Command-line tool

If you have [node.js](https://nodejs.org/en/) with [npm](https://www.npmjs.com/)
you can install the Espruino command-line tools with `npm install -g espruino`.

These support USB, Serial, Bluetooth UART (once paired), Bluetooth LE, and Telnet.

You can:

```
# List what ports are available
espruino --list

# Connect to Espruino and provide a REPL (Ctrl-C exits)
espruino -p your_port

# Connect to Espruino and upload a file
espruino -p your_port code.js

# Connect to Espruino, provide a REPL, and upload the file whenever it changes
espruino -p your_port -w code.js
```

And much more besides! [Full information is here](https://www.npmjs.com/package/espruino)

### Third party tools

There are also several third party tools for Espruino available.
Some of these may not provide some of the features (like module loading) that are
used by tutorials and example code on the Espruino website, and may refuse
to upload code that isn't formatted in a K&R style.

* [DroidScript](http://droidscript.org/) lets you control/program an Espruino from an Android phone
* [espruino-cli](https://www.npmjs.com/package/node-espruino) is a node.js command-line tool for Espruino
* [espruino-cli](https://www.npmjs.com/package/espruino-cli) is another node.js command-line tool for Espruino. It may not work on newer versions of Node.js

### Serial Terminals

You can even program Espruino directly from a Terminal application (if using Serial or Telnet),
you'll just be lacking some of the code upload features. See [Alternative Terminal Apps](Alternative+Terminal+Apps)
for more information.
