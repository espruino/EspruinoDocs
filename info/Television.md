<!--- Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
TV Out
=====

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Television. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Peripheral,Peripherals,TV,Television,Composite,S-Video,PAL,NTSC,VGA,DVI,HDMI,Graphics Driver

Espruino provides the ability to output black and white [PAL Television](http://en.wikipedia.org/wiki/PAL) or [VGA](http://en.wikipedia.org/wiki/Video_Graphics_Array) signals via the [TV Module](http://www.espruino.com/Reference#tv). This capability is currently only available in 'official' Espruino boards.

Composite (PAL)
--------------

### Wiring

You'll need a single [RCA Connector](http://en.wikipedia.org/wiki/RCA_connector)

* Connect GND on the RCA connector to GND on Espruino
* Attach a 1k Ohm resistor between pin A6 and the signal pin on the RCA connector
* Also attach a 470 Ohm resistor between pin A7 and the signal pin on the RCA connector

![Composite PAL Connections](Television/Composite.png)

### Software

```
var g = require('tv').setup({ type : "pal",
  video : A7, // Pin - SPI MOSI Pin for Video output (MUST BE SPI1)
  sync : A6, // Pin - pin to use for video sync
  width : 384,
  height : 270, // max 270
});

g.drawLine(0,0,100,100);
```

VGA
---

### Wiring

The VGA specification requires that the video signal is 0.7v peak-to-peak (Hsync and Vsync are 5v). The signals that come out of Espruino will be 3.3v peak to peak, so if you don't want to risk damage your VGA display then you will need to use resistors to reduce the voltage of the video (monitors will be fine with the 3.3v Hsync and Vsync signals).

You'll need:

* A VGA connector (or old VGA cable)
* 1x 100 Ohm resistor
* 1x 330 Ohm resistor

Connect:

* A7 to one end of a 330 Ohm resistor, and the other end to VGA pin 1,2, or 3 (or all 3 - these are the Red, Green and Blue wires). Also connect this to GND via the 100 Ohm resistor.
* All the grounds (pins 5,6,7,8,9) together, and to Espruino's ground.

![VGA Connections](Television/VGA.png)


### Software

Full resolution:

```
var g = require('tv').setup({ type : "vga",
  video : A7, // Pin - SPI MOSI Pin for Video output (MUST BE SPI1)
  hsync : A6, // Pin - pin to use for video horizontal sync
  vsync : A5, // Pin - pin to use for video vertical sync
  width : 220,
  height : 480,
  repeat : 1, // amount of times to repeat each line
});

g.drawLine(0,0,100,100);
```

Or line doubling:

```
var g = require('tv').setup({ type : "vga",
  video : A7, // Pin - SPI MOSI Pin for Video output (MUST BE SPI1)
  hsync : A6, // Pin - pin to use for video horizontal sync
  vsync : A5, // Pin - pin to use for video vertical sync
  width : 220,
  height : 240,
  repeat : 2, // amount of times to repeat each line
});

g.drawLine(0,0,100,100);
```

**Note:**

* At the moment the horizontal refresh rate is fixed, which means that heights other than 480 may not be accepted by your monitor.
* The idle state of the video signal currently depends on the last byte that is transmitted. In order to get the best video signal it's worth making sure you leave the last 8 columns of the graphics buffer blank.


Using TV Out
----------

* APPEND_USES: Television
