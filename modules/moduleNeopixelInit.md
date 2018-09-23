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

Methods
-------

```
cleardata();
```
Remove previously created color data values from the prep array



Reference
  ---------

  * APPEND_JSDOC: NeopixelInit.js
  * APPEND_JSDOC: moduleNeopixelInit.js
  
  Using
  -----

  * APPEND_USES: NeopixelColor, NeopixelColors
  