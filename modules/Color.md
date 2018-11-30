<!--- Copyright (c) 2018 Robin G. Cox  See the file LICENSE for copying permission -->
Color
=======

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Color. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Color,Colors,Color Names,X11COLORS,Neopixel

The [Color module](/modules/Color.js) creates a color object given it's X11Color name.
You can then access R,G,B and A values individually.

It can be used with the [NeopixelCore](/NeopixelCore) library for development of Neopixel projects.

Color module usage:


```
// Create locally the Color class definition
var Color = require("Color");

// Create a color object using X11COLORS name
var colorDkCyan = new Color("DarkCyan");
```


Although Camel case is used to store the name, matching is done by converting to lower case.


Reference
---------

* APPEND_JSDOC: Color.js

For the complete list of X11COLORS by name and color swatch
See: https://www.w3.org/TR/css-color-3/



Using
-----

* APPEND_USES: Colors, Color, NeopixelCore, NeopixelEffects
