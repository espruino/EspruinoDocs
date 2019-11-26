<!--- Copyright (c) 2019 allObjects, Pur3 Ltd. See the file LICENSE for copying permission. -->
UI radio button module
==================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/uiRad. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,UI,Graphics,User Interface

The ui radio button module extends ui base with radio button ui element.

![radio buttons](data:image/bmp;base64,Qk0gBAAAAAAAACAAAAAMAAAAgABAAAEAAQD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAAAAAAAAAAAAAAAH/8AAAAAAAAAAAAAAAAAAB4HgAAAAAAAAAAAAAAAAAAwAYAAAAAD8AAAAAAAAAAAcAHAAAAAD/wAAAD4AAAAAGAA4AAAAB/8AAAAgDO7uADAAGAAGAAf/hzMAQQLuRAAwABh3QTAP/4dFAEEE4kQAMAAYR0NAD/+HdQBBCMxEADAAGEFlcA//hyMAIAYAzAAwABhGUyAP/4UBAD4AAAAAMAAYQAAAD/+AAAAAAAAAADgAGAAAAAf/gAAAAAAAAAAYADgAAAAH/wAAAAAAAAAAHABwAAAAA/8AAAAAAAAAAAwAYAAAAAD8AAAAAAAAAAAHgeAAAAAAAAAAAAAAAAAAB//AAAAAAAAAAAAAAAAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA)

Note: It requires the uiExt - ui extension module - to be loaded.

### Enable ui base with uiRad element functions:

Note: requires uiExt(ension) module (see uiExt.js module)

```
var ui = require("ui")     // load ui base module
    .adx(require("iuExt")) // add uiExt module into base and remove from cache
    .adx(require("uiRad")) // add uiRad module into base and remove from cache
    ;
```  

### Create - specify - radio buttons

```
// flgs clazz  id      x  y  w s b f value callback on 'untouch'
ui.c( 3,"rad","r1.a",  5,80,37,0,6,2,"L",  cb, [12,7,5,10,"Large"]);
ui.c( 3,"rad","r1.b", 95,85,27,1,3,1,"M",  0 , [12,7,5, 7,"Med"  ]);
ui.c( 3,"rad","r1.c",170,90,17,1,5,2,"S",  0 , [12,7,5, 2,"Small"]);
//                                             fs t x  y label text
```

Creates and add to ui three active(2), visible(1) =(3) radio buttons at
x/y (left/top: 5/80, 95/85 and 170/90) of different sizes/widths/diameters
(37, 27 and 17) with size related values ("L", "M" and "S") and labels
("Large", "Medium" and "Small"), with group name "r1." (dot is part of
group name). Medium sized radio button is set/checked (first set/checked
radio button wins... therefore small one is not set/checked even though
specified as such). Border colors (6, 3 and 5) and fill colors (2,1 and 2)
are all different (by choice). Unset/unchecked radiobuttons show ui
display background color (ui.bc). Label array definitions include
fontVector (size), font color, x/y offset from right/top (x2/y) corner of
touch sensitive bounding box, and text.

Colors are bit-coded with 3-bit color-depth according ui.clrs=[...] setup.

Callback cb is called on untouch with `id, v, ui, e, t` as arguments:

```
args[] sym   description
  0    id  : button id ("r1.a")
  1    v   : value object ("L"|"M"|"S" - can be any object)
             NOTE: is undefined when check box is unchecked
  2    ui  : ui (THE ui object)
  3    e   : uiRad element (rad 'object' (runtime data structure) just untouched)
  4    t   : touch info x, y,... (where last touched)
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
`uiExampleAll.js` - project file in the _sbx Espruino sandbox projects
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


### rad ui element constructor arguments (a[]) and runtime data structure (e[]) are:

```
arg runtime 'object' instance of 'clazz' chk (chkbox)
a[]  e[]
 0   [0] f  - flags focus(4), active(2), visible(1)
 .    .         0bxx1 visible &1 visible
 .    .         0bx1x active  &2 active / senses touches vs read/display-only
 .    .         0b1xx focus   &4 focus by touch down, drag w/in bounding box
 1   [1] c  - clazz - "rad"
 2   [2] i  - id - eg "r01.a","r01.b","r01.c",.. short, at least 2 or 3
              chars for radio button group id, and globally unique.
              Single letter ui element ids are 'reserved' (for keyboard(s)).
              Radio button id consist of two elements:
                - Radio button group id - the part *before* the dot.
                - Radio button individual id - the part *after* the dot.
              Radio button group id is used to make the buttons in the
              group behave like radio buttons: any 'pressed' button
              'releases' all others, or in other words, only one radio
              button can be 'pressed' - or on - at one time.
 3   [3] x  - x ((left ) of focus / touch bounding box)
 4   [4] y  - y ((top  ) of focus / touch bounding box)
 5       w  - width and hight (of focus / touch box,...
     [5] x2 - x ((right) of focus / touch bounding box: x - w + 1)
 6       s  - initial checked(truey/1)/unchecked(falsey/0) state
              used w/ [9] value info; note that only one radio
              button can be set / checked / on at one time
     [6] y2 - y ((bot  ) of focus / touch bounding box: y - h + 1)
 7   [7] bc - border color
 8   [8] fc - fill color
 9       v  - value (returned value when checked)
     [9] vi - value info array w/ state and value object
         [0] - truey / falsey indicating state checked/unchecked
         [1] - value object (returned when radio button is checked)
10       cb - simple, preferred callback on untouch after touchdown;
    [10] g  - radio button group management array object
         [0] - radio button group id, eg. "r1." (incl. dot)
         [1] - preferred callback (1st encountered truey cb)
         [2] - alternate callback (1st encountered truey ca)
         [3] - checked radio button ui element (or null / falsey)
         [4...] - group's radio button ui elements
              Note that first encountered truey callback - cb or ca -
              wins and cb wins over ca. Therefore only for one radio
              button cb or ca needs to be specified. For all other
              radion buttons They can be left undefined; they are
              ignored anyway.
11  [11] l  - label (info), array with:
      l[0]  fs  - font spec:s>0: fontVector (size); s<0: .fnts[-s] of loaded font
      l[1]  tc  - (label) text color (index)
      l[2]  x   - x offset from focus box x ( bounding box left )
      l[3]  y   - y offset from focus box y ( bounding box top  )
      l[4]  tx  - label text to display (using .drawString())
      l[5]  fmt - opt. Formatter function(l[4],ui,l)
12  [12] ca - NON-preferred, experimental callback on any touch event
```

### rad (radio button) ui element properties - variables and methods - mixed into ui base:

```
exports = // "rad" (radio button) ui element ('clazz' name).
{
// ...
// ... public variables and methods (described above)
// ... private variables and methods
// ...
};
```

Using
-----

* APPEND_USES: uiRad
