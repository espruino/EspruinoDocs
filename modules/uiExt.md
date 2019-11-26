<!--- Copyright (c) 2019 allObjects, Pur3 Ltd. See the file LICENSE for copying permission. -->
UI input field module
==================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/uiExt. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,UI,Graphics,User Interface

UI input module extends ui base module with input field ui element.

**Note:** requires uiExt(ension) module (see uiExt.js module)

### Enable ui with uiInp element functions:

```
var ui = require("ui")       // load ui base module
      .adx(require("iuExt")) // add module into base and remove from cache
      .adx(require("uiInp")) // add module into base and remove from cache
      ;
```

### Create and add to ui an active(2), visible(1) =(3) input field at x/y

(left/top: 45/7) of size width/height (195/28), turkis border color (3),
white. Callback clears content when tap lasted longer than 550ms and there
is content. Not checking for content runs into stack overflow, because `.u(e,"")`
triggers again a callback because it is a change of value...

Colors are bit-coded with 3-bit color-depth according ui.clrs=[...] setup.

```
//    0  1     2       3   4   5   6   7   8  9       10  11
// flgs  clazz id      x   y   w   h  bc  fc  valObj  cb   ls (arr of label ([[..],..]))
//       btn                ->x2->y2                  callback clears on tap > 550ms
ui.c( 3,"inp","i1"  , 45,  7,195, 28,  3,  7,"modular UI"
       ,function(i,v,_,e){ if (getTime()-_.tt>0.55   // [0] fs tc    x  y  mxLen typ fmt
                           && v.length) _.u(e,""); } // [1] fs tc    x  y  label text
                                                         ,[[13, 0,   5, 6, 16,   0,  0]
                                                          ,[13, 7,-233, 6, "Field"    ]
                                                          ]);
```

Callback cb is called on release (untouch) and change and provides
`id, v, ui, e, t` as arguments:

```
args[] sym   description
  0    id  : button id ("x")
  1    v   : value (object) - type dependent (for now just string)
  2    ui  : ui (THE ui object)
  3    e   : uiInp element (inp 'object' (runtime data structure))
  4    t   : touch info x, y,...  (where last touched)
        { x : x coordinate
        , y : y coordinate
        , t : touched (truey) / untouched (falsey)
        , f : flags
        }
```

For detailed ui setup, including color depth and custom colors, connecting
to display and touch screen, soft key board or buttons, see ui module and
example material (in the ui.zip file and sources with comments). Take a
look at the example that shows all ui elements on one single display -
`uiExampleAll.js` - project file in the `_sbx` Espruino sandbox projects
folder. Make it the Espruino Web IDE sandbox folder and run the ready-made
examples on your Espruino board. Espruino forum has several entries about
the modules and hardware. Search in (google) for:
`Espruino Forum allObjects touch screen display modular ui framework`

No board or display with touch screen yet? No Problem: Open `uiExample.html`
in uidev folder in Web browser to run the same example in the Cross
Development / Emulation environment (where modules are developed and
maintained).

For helpful details to use the ui base and ui element APIs, take a look
at documentation in ui base and uiBtn modules.


### inp ui element constructor arguments (a[]) and runtime data structure (e[]) are:

```
arg runtime 'object' instance of 'clazz' inp - input field
a[]  e[]
 0   [0] f  - flags focus(4), active(2), visible(1)
 .    .         0bxx1 visible &1 visible
 .    .         0bx1x active  &2 active / senses touches vs read/display-only
 .    .         0b1xx focus   &4 focus by touch down, drag w/in bounding box
 1   [1] c  - clazz "inp"
 2   [2] i  - id eg "i01", short, at least 2..3 chars,  ui globally unique.
              Single letter ui element ids are 'reserved' (for keyboard(s)).
 3   [3] x  - x ((left ) of focus / touch bounding box)
 4   [4] y  - y ((top  ) of focus / touch bounding box)
 5       w  - width (of focus / touch box,...
     [5] x2 - x ((right) of focus / touch bounding box: x - w + 1)
 6       h  - height (of focus / touch box,...
     [6] y2 - y ((bot  ) of focus / touch bounding box: y - h + 1)
 7   [7] bc - border color
 8   [8] fc - fill color
 9   [9] v  - value - (string) value to start with
10  [10] cb - simple, preferred callback on untouch after touchdown
11  [11] ls - labels - array of labels of which 1st is also value related   
      ls[0] label (info) for value related info, array with:
         l[0]  fs    - font spec:s>0: fontVector (size); s<0: .fnts[-s] of loaded font
         l[1]  tc    - (label) text color (index)
         l[2]  x     - x offset from focus box x ( bounding box left )
         l[3]  y     - y offset from focus box y ( bounding box top  )
         l[4]  mxLen - maximum length
         l[5]  type  - opt type (absent & 0:plain string, only type for now)
         l[6]  frmt  - opt format function to use to format value for label
      ls[1,2,3,...] any number of additional labels, mostly just 2 (min, max)
         l[0]  fs - font spec:s>0: fontVector (size); s<0: .fnts[-s] of loaded font                     ...for min and max
         l[1]  tc - (label) text color (index)
         l[2]  x  - x offset from focus box x ( bounding box left )
         l[3]  y  - y offset from focus box y ( bounding box top  )
         l[4]  tx - label text to display (using .drawString())
```

### inp (input field) ui element properties - variables and methods - mixed into ui base:

```
exports = // "inp" (input field) ui element ('clazz' name).
{
// ...
// ... private variables and methods
// ...
};
```

Using
-----

* APPEND_USES: uiExt
