<!--- Copyright (c) 2018 Robin G. Cox  See the file LICENSE for copying permission -->
Color
=====================

* KEYWORDS: Module,Color,Colors,Color Names,X11COLORS,Neopixel

Class Color creates a color object given it's X11Color name. Returns in Javascript object notation the
 individual color values for easy individual color manipulation.

 
Neopixel library of the standard X11COLORS referenced by color name.
Allows for the creation of a Color object by easy to remember name reference.
Used with accompanying NeopixelCore library for development of Neopixel projects.

Use the [NeopixelColors](/modules/NeopixelColors.js) ([About Modules](/Modules)) module for it.


NeopixelColors module usage:


```
  var COLORS = new NeopixelColors();
```

Reference a specific color by name

```
  var myRGBCyan = COLORS.CYAN;
```

Note that this is an RGB object that requires further processing by NeopixelColor{} to create a useful color object
See module: NeopixelColor.js

 Although Camel case is used to store
 the name, matching is done by converting to lower case






Methods
-------

none









  Reference
  ---------

  * APPEND_JSDOC: Color.js

  For the complete list of X11COLORS by name and color swatch
  See: https://www.w3.org/TR/css-color-3/
  

  
  Using
  -----

  * APPEND_USES: Colors, Color, NeopixelCore, NeopixelEffects
  
  
  Last Updated
  ------------
  
  Sun 2018.10.28  rgc Created deployed to GitHub