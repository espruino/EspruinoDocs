<!--- Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
DMX
===

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/DMX. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,DMX,DMX512,Digital Multiplex,Stage Lighting

DMX is a standard protocol that's commonly used for digital stage lighting. See the [Wikipedia article on DMX512](https://en.wikipedia.org/wiki/DMX512)

Here we're only going to cover reception of DMX. Head over to [the forums](http://forum.espruino.com/) if you're interested in transmission.

Wiring
------

DMX protocol uses the same logic levels as RS-485. You can get DMX shields for Arduino which you can wire up (make sure you buy one that can receive!), but you can also use a normal RS-485 converter chip such as the MAX485. Modules are available for just a few pounds on eBay.

## DMX Receive

Simply wire the receive wire from your level converter up to a pin on your Espruino that has a USART_RX peripheral (check the reference page for your board). If you're using a level converter with a 5v output make sure you're connecting to a 5v-capable pin (one that doesn't have `3.3v` by it in the pinout diagram). If you were wiring to the Espruino Pico you could use Pin `B7` (but watch out for [the console swapping to Serial when USB is disconnected](www.espruino.com/Troubleshooting#espruino-works-when-connected-to-a-computer-but-stops-when-powered-from-something-else)).

Software
--------

Using the module is easy. Simply call `require("DMX").connectRX` with the pin, the maximum amount of data you want, and a function to be called when the data is received.

The following example will light LED1 and LED2 based on DMX channels 1 and 2.

```
require("DMX").connectRX(pin, 6, function(data) {
  analogWrite(LED1, data[1]/256, {soft:true});
  analogWrite(LED2, data[2]/256, {soft:true});
  // or console.log(data.join(","));
});
```

**Note:** 

* Some DMX transmitters don't transmit the full 512 bytes of message
* Data comes in from DMX quite quickly. If you don't handle each packet quickly enough, the next packet could be corrupted.
* If you print the received data to the console (the commented out code), it make take so long to print it that the next packet gets corrupted.

Using 
-----

* APPEND_USES: DMX

