<!--- Copyright (c) 2018 Robin G. Cox  See the file LICENSE for copying permission -->
Colors
=======

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Colors. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Neopixel,Colors,Color,Color Names,X11COLORS

The [Colors module](/modules/Colors.js) is a library containing the standard X11COLORS referenced by color name.
Allows for the creation of a Color object by an easy to remember name reference.

It can be used with the [NeopixelCore](/NeopixelCore) library for development of Neopixel projects.

Colors module usage:

```
const RGB = require("Colors");
```

Reference a specific color by name

```
var objMyColor = RGB.Coral;
// obyMyColor = "FF7F50"
```

Note that the RGB String returned requires further processing by the [Color](/Color) module to create a useful color object.

For the complete list of X11COLORS by name and color swatch, see: https://www.w3.org/TR/css-color-3/


Using
-----

* APPEND_USES: Colors, Color, NeopixelCore, NeopixelEffects
