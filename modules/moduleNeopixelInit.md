<!--- Copyright (c) 2018 Robin G. Cox  See the file LICENSE for copying permission -->
Neopixel Init
=====================

* KEYWORDS: Module,Neopixel,WS2812,WS2811,5050,RGB,LED

Neopixel library for Espruino tm using WS2811 and WS2812
Enables rapid development of Neopixel projects providing underlying methods for color and palettes


Use the [NeopixelInit](/modules/NeopixelInit.js) ([About Modules](/Modules)) module for it.


NeopixelInit module usage:

```
  var options = { 'pinLedTest':[A5]
    ,'pinAryNeopixel':[B5,B15],'pinAryNeoIdx':1
    ,'useGamma':true,'brightness':70 };
  var n = new NeopixelInit( options );
  n.alloff();
  var aryRB = n.buildRainbow();
  n.setdata( aryRB );
  n.update();
```


Params
------

```
pinAryNeopixel
```
An array of output pin values for the specific device. Allows for multiple Neopixel strips.
Must be an MOSI pin capable of addressing the WS2812 device. See specific device. Ref Pico: http://www.espruino.com/Pico

```
pinAryNeopixelIdx
```
Index into array for the default start up value. Remember array starts at element [0]
 


Methods
-------

```
cleardata();
```
Remove previously created color data values from the prep array



Reference
  ---------

  * APPEND_JSDOC: NeopixelInit.js, moduleNeopixelInit.js
  
  Using
  -----

  * APPEND_USES: NeopixelColor, NeopixelColors
  