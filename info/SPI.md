<!--- Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
SPI - Serial Peripheral Interface
=============================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/SPI. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Peripheral,Peripherals,Serial Peripheral Interface,SPI,Built-In

The [Serial Peripheral Interface](http://en.wikipedia.org/wiki/Serial_Peripheral_Interface_Bus) is a Serial Bus for peripherals that uses Clock, Data In, and Data Out (and often a Chip Select pin).

See [SPI Class](/Reference#SPI) in the reference

Hardware SPI
------------

On most boards there are hardware SPI peripherals. Check out the
pin diagram on the reference page for your board and look for
pins marked with an `SPI` tag.

You can use it as follows.

```
// set up SPI
SPI1.setup({mosi:B5, miso:B4, sck:B3});

// write data without a response
SPI1.write([1,2,3,4])

// write data with a response
var d = SPI1.send([1,2,3,4]);
```

See the reference for [SPI.setup](/Reference#l_SPI_setup) for more information on
the arguments that can be passed in.

Software SPI
------------

If you don't have access to your board's pins, you can also emulate
SPI in software:

```
// set up SPI
var spi = new SPI();
spi.setup({mosi:B5, miso:B4, sck:B3});

// write data without a response
spi.write([1,2,3,4])

// write data with a response
var d = spi.send([1,2,3,4]);
```

Speed (baud rate)
----------------

Pretty much all SPI devices are guaranteed to support 100kBits/sec transfer
speed, so that is the default in Espruino. However you can specify
higher speeds with `bitrate` in [SPI.setup](/Reference#l_SPI_setup) if your
device supports it, eg:

```
SPI1.setup({ mosi:B5, miso:B4, sck:B3, baud: 400000 });
```

**Note:** baud rate is **ignored** for software SPI - it will always
send as fast as possible.


Using SPI
---------------

* APPEND_KEYWORD: SPI
