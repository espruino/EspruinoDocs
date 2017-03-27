<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Rotary Encoder
=============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Encoder. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Rotary,Encoder,Rotary Encoder

[Incremental Rotary Encoders](http://en.wikipedia.org/wiki/Rotary_encoder#Incremental_rotary_encoder) supported by this module use two 'switches', which change state in a [Gray Code](http://en.wikipedia.org/wiki/Gray_code). This allows them to detect either clockwise or anticlockwise movement.

The encoder should have 3 pins (one common, and two switched). The common should be connected to 3.3v, and the two switched pins should be connected to two pins on Espruino, which should be supplied to the module.

Rotary encoders are handled by the [[Encoder.js]] module. 

```
var step = 0;
require("Encoder").connect(A1,A2,function (direction) {
  step += direction;
  print(step);
});
```

Using 
-----

* APPEND_USES: Encoder
