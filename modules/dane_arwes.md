<!--- Copyright (c) 2020 OmegaRogue. See the file LICENSE for copying permission. -->
DANE Arwes Graphics
=====================

* KEYWORDS: Module,Comma,separated,list,of,search,words

A bit about my module. Use the [MOD123](/modules/MOD123.js) ([About Modules](/Modules)) module for it.

You can wire this up as follows:

| Device Pin | Espruino |
| ---------- | -------- |
| 1 (GND)    | GND      |
| 2 (VCC)    | 3.3      |
| 3 (SIGIN)  | A0       |
| 4 (SIGNOUT)| A1       |

How to use my module:

```
  var foo = require("MOD123").connect(A0,A1);
  foo.usingFoo();
```