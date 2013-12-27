<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
NRF24L01+ Wireless Module
======================

* KEYWORDS: Module,NRF,NRF24L01,NRF24L01P,NRF24L01+,Wireless

The Nordic [NRF24L01+](http://www.nordicsemi.com/eng/Products/2.4GHz-RF/nRF24L01P) transceiver is very popular and works well with Espruino. It is sold in very inexpensive wireless modules that interface via SPI. They can easily be obtained via [eBay](http://www.ebay.com/sch/i.html?_nkw=NRF24L01%2B) and many other places for prices as low as $2.

A driver for it is available in the [[NRF24L01P.js]] module.

Just do the following for a Slave:

```
SPI1.setup({sck:A5, miso:A6, mosi:A7});
var nrf = require("NRF24L01P").connect( SPI1, C4, C5 );
nrf.init([0,0,0,0,1], [0,0,0,0,2]);
setInterval("nrf.slaveHandler()",50);
```

And the following for a Master:

```
SPI1.setup({sck:A5, miso:A6, mosi:A7});
var nrf = require("NRF24L01P").connect( SPI1, C4, C5 );
nrf.init([0,0,0,0,2], [0,0,0,0,1]);
setInterval("nrf.masterHandler()",50);
```

Note the two addresses that are given to init - one is the transmit address, one is a receive address. On a Master all you have to do is use nrf.sendString to send a command to the Slave Espruino, and in a few milliseconds the result will appear:

```JavaScript
nrf.sendString("1+2", function(r) { print("=="+r); });
==3

nrf.sendString("analogRead(A0)", function(r) { print("=="+r); });
==0.356694

nrf.sendString("LED2.set()", function(r) { print("=="+r); });
==undefined
```

To communicate with another Espruino, all you need to do to is to call ```nrf.setTXAddr([1,2,3,4,5])``` on the master, giving the address that you have to the Slave Espruino's nrf.init function.

The usage of ```slaveHandler``` and ```masterHandler``` is not required - if you want, you can call methods such as ```send``` and ```dataReady``` directly.
