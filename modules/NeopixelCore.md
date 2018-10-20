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


Params : Args
-------------

```
pinAryNeopixel
```
An array of output pin values for the specific device. Allows for multiple Neopixel strips. ex: [B5,B15]
Must be an SPI MOSI pin capable of addressing the WS2811/WS2812 device. See specific device. Ref Pico: http://www.espruino.com/Pico

```
pinAryNeopixelIdx
```
Index into array for the default start up value. Remember array starts at element [0]
 
```
rgbSeq
```
Constant RGB order identifier for the type of Neopixel device. Currently (circa Sept 2018) supported "RGB" for WS2811 and "GRB" for WS2812




Methods
-------

```
cleardata();
```
Remove previously created color data values from the data prep array

```
setdata(ary);
```
Copies the user defined array of color values to the data prep array. Must be a sequential set of RGB triplet values in RGB order.
See param rgbSeq for specific device


```
mapone(pixel,color);
```
Map a color object to a specific pixel for output. pixel must be a numerical value within the number of strip pixels, otherwise
no output change will be detected. color must be a Javascript object. See Class NeopixelColor for form 
See constant OPTION_BASE_ONE to reference elements starting at [1]




```
turnon(pixel,color);
```
See mapone()



```
buildRainbow()
```
Internal method used to create an eight element color palette array of gamma adjusted rainbow colors in the ROYGBIV color order.
Make sure option param useGamma is set to false





Reference
  ---------

  * APPEND_JSDOC:  NeopixelCore.js   https://github.com/espruino/EspruinoDocs/tree/master/tutorials/Neopixel/NeopixelCore.html
  
  Using
  -----

  * APPEND_USES: Color, Colors, NeopixelEffects
  