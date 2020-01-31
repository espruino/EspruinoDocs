<!--- Copyright (c) 2019 allObjects, Pur3 Ltd. See the file LICENSE for copying permission. -->
UI Checkbox module
==================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/uiChk. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,UI,Graphics,User Interface

![checkboxes](data:image/bmp;base64,Qk0gBAAAAAAAACAAAAAMAAAAgABAAAEAAQD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHEAAAAAAAAAAAAAAAAAAABHAAAAAAPmIgAAAAAAHcAAJQAAAAAD4SEAAAAAABEAABUAAAAAA+YjAAAAAAAIgABjAA//+APkJQAAAcgABEAAAAAf//wD5yIAAACEABmAAAAAH//8AAAAAAAAjAAAAA//8D///gAAAAOQAZQAAAAP//h///8AAAABKACIAf/4H//4f///AAAAATAAAAH//D///H///wAAdgMgAAAD//w///x///8AACEBGA//h//+P//8f///A7giAAAP/4f//j///H///wEQYQAAH//H//4///x///8BECYH/x//x//+P//8f///AzAAD/8f/8f//j///H///wEQAA//H//H//4///x///8AAH+P/x//x//+P//8f///AAD/j/8f/8f//j///H///wP4/4//H//H//4///x///8D+P+P/x//x//+P//8f///A/j/j/8f/8f//j///H///wP4/4//H//H//4///w///4D+P+P/x//w//8H//4H//8A/j/j/8P/4H//A//+B///AP4f4f/D/+B//gP//AP//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAQB3AHYAByAAHIAHYnIACACAJAAhAAJQABFABBJCAAQBgCIAJgACIAAJQAIiIQAEAoBhAGQABlAABUABEhEAHAEAJgAnAAIgABiABmJnAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/h/h/8P/4H/+A//8A//+AIIgI//D/+B//wP//gf//wCCICOAxwAwwAEH//4H//8AgiAjAMYAMYABjwAPDgADgIIgIwDGADGAAY8ADx4AA8CCICMAxgAxgAGOAAccAAHA/iAjAMYAMYABjgAHHAABwAAgIwDGADGAAY4ABxwAAcAAH+MAxgAxgAGOAAccAAHAAAADgMYAMYABjgAHHAABwAAAA//GADGAAY4ABxwAAcAAAAH/xgAxgAGOAAccAAHAAAAAAAcAMYABjgAHHAABwAAAAAAD/+GAAY4ABxwAAcAAAAAAA//hgAGOAAccAAHAAAAAAAAAAMABDwAPHAABwPmIgAAAAAB//w8ADxwAAcCISEAAAAAAf/4H//4cAAHAiYjAAAAAAAAAA//+HgADwIkJQAAAAAAAAAP//A4AA4D5yIAAAAAAAAAAAAAH//8AAAAAAAAAAAAAAAAAB///AAAAAAAAAAAAAAAAAAP//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA)

The ui checkbox module extends ui base with checkbox ui element.

Implementation note: vs2 overlaps/is duplicates of uiExt module and
uwill overwrite each other. Therefore - on changes - changes have to
be applied to both of them to maintain consistent outcome. It is
duplicated in the ui checkbox so that ui extensions does not need to
be loaded when not used. It saves memory / vars with simple UIs.


### Enable ui base with uiChk and create a checkbox with callback on untouch:

```
var ui = require("ui")       // load ui base module
 　　  .adx(require("uiChk")) // add module into base and remove from cache
      ;
```


### Create - specify - check box

```
// flgs clazz  id    x  y  w s b f  value object /. callback on 'untouch'
ui.c( 3,"chk","c1",140,45,25,0,2,7,"H"
                  ,function(id,v){ (v) ? LED2.set() : LED2.reset() }
                  ,[12,7,3,5,"On"]);
//                  fs t x y  label text
```

Creates, adds to ui, conditionally displays and returns an active(2),
visible(1) =(3) checkbox ("chk") with id "c01". Checkbox is positioned
at 145 @ 40 (left @ top, x @ y) and sized 25 square (both width and
height), has 2(blue) / 7(white) border / fill colors, is initially
unchecked (0, but any falsey works), has value object "H" (when checked
and undefined when unchecked), has callback that sets and resets green
LED2 accordingly, and is labeled "On" right next to it in fontVector
(size) 12, text (font) color 7(white) on black screen background color
and x / y-offset of 3 / 5 from left top corner of checkbox's bounding box.

Colors are bit-coded with 3-bit color-depth according ui.clrs=[...] setup.

For ui base, color, label, and callback details see (also) ui base module.

Callback cb is called on untouch with `id, v, ui, e, t` as arguments:

```
args[] sym   description
  0    id  : button id ("c1")
  1    v   : value object ("H" - can be any object);
             NOTE: is undefined when check box is unchecked
  2    ui  : ui (THE ui object)
  3    e   : uiChk element (chk 'object' (runtime data structure))
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


### chk ui element constructor arguments (a[]) and runtime data structure (e[]) are:

```
arg runtime 'object' instance of 'clazz' chk (chkbox)
a[]  e[]
 0   [0] f  - flags focus(4), active(2), visible(1)
 .    .         0bxx1 visible &1 visible
 .    .         0bx1x active  &2 active / senses touches vs read/display-only
 .    .         0b1xx focus   &4 focus by touch down, drag w/in bounding box
 1   [1] c  - clazz "chk"
 2   [2] i  - id eg "c01", short, at least 2..3 chars,  ui globally unique.
              Single letter ui element ids are 'reserved' (for keyboard(s)).
 3   [3] x  - x ((left ) of focus / touch bounding box)
 4   [4] y  - y ((top  ) of focus / touch bounding box)
 5       w  - width and height (of focus / touch bounding box)
     [5] x2 - x ((right) of focus / touch bounding box: x - w + 1)
 6       s  - initial checked(truey/1)/unchecked(falsy/0) state used
              with [9] value info
     [6] y2 - y ((bot  ) of focus / touch bounding box: y - h + 1)
 7   [7] bc - border color
 8   [8] fc - fill color
 9       v  - value (returned value when checked)
     [9] vi - value info array w/ state and value
         [0] - truey/falsey for checked/unchecked state of checkbox
         [1] - value object (returned when checkbox is checked)
10  [10] cb - simple, preferred callback on untouch after touchdown
11  [11] l  - label (info), array with:
      l[0]  fs - font spec: s>0: fontVector (size); s<0: .fnts[-s] of loaded font
      l[1]  tc - (label) text color
      l[2]  x  - x offset from focus box x ( bounding box left )
      l[3]  y  - y offset from focus box y ( bounding box top  )
      l[4]  tx - label text to display (using .drawString())
      l[5]  fmt - opt. Formatter function(l[4],ui,l)
12  [12] ca - NON-preferred, experimental callback on any touch event
```


### chk (check box) ui element class properties - variables and methods - mixed into ui base:

 ```
exports = // "chk" (check box) ui element ('clazz' name).
{ vs2: function(x,y,x2,y2,p) { // vertices for for chk like shapes ('beveled') corners
    // 4 'beveled corners' = 8 corners def'd by 0 and p insetting combinations for x, y
    return [x,y+p, x+p,y, x2-p,y, x2,y+p, x2,y2-p, x2-p,y2, x+p,y2, x,y2-p]; }
// ...
// ... public variables and methods (described above)
// ... private variables and methods
// ...
};
```

Using
-----

* APPEND_USES: uiChk
