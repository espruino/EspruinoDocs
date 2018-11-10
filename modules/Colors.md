<!--- Copyright (c) 2018 Robin G. Cox  See the file LICENSE for copying permission -->
Colors
=====================

* KEYWORDS: Module,Neopixel,Colors,Color,Color Names,X11COLORS

Neopixel library of the standard X11COLORS referenced by color name.
Allows for the creation of a Color object by easy to remember name reference.
Used with accompanying NeopixelCore library for development of Neopixel projects.

Use the [Colors](/modules/Colors.js) ([About Modules](/Modules)) module for it.


Colors module usage:


```
  const RGB = require("Colors");
```

Reference a specific color by name

```
  var objMyColor = RGB.Coral;
```

Note that this is an RGB object that requires further processing by module Color{} to create a useful color object

See module: Color.js  [Color](/modules/Color.js) 







Methods
-------

none









  Reference
  ---------

  * APPEND_JSDOC: n/a

  For the complete list of X11COLORS by name and color swatch
  See: https://www.w3.org/TR/css-color-3/
  

  
  Using
  -----

  * APPEND_USES: Colors, Color, NeopixelCore, NeopixelEffects
  
  
  
  Last Updated
  ------------
  
  Sun 2018.10.28  rgc Created deployed to GitHub