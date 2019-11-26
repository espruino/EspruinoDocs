<!--- Copyright (c) 2019 allObjects, Pur3 Ltd. See the file LICENSE for copying permission. -->
UI slider module
==================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/uiSli. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,UI,Graphics,User Interface


ui slider module extends ui base with slider ui element.


### Enable ui base with uiSli and create a slider with callback on untouch:

```
var ui = require("ui")       // load ui base module
      .adx(require("uiSli")) // add uiSli module into base and remove from cache
      ;
```


### Create - specify - a slider

```
var s2 = // hold on to "s2" slider ui element for direct access app later on.
//    0   1    2       3   4   5   6   7   8  9      10  11
// flgs  clazz id      x   y   w   h  bc fcs  valObj cb,  ls (arr of labels ([[...],..]))
//       sli                ->x2->y2                    [0] fs tc    x  y  txt fmt
ui.c( 3,"sli","s2"  , 30,175,180, 29, -4,[-4,0],33  ,cb,  [[12, 6,  70, 6,   u,
                                                           ,function(v,_,l){ // (val,ui,lab)
        var s="", f=_.te.f; return (!(f==0 || f&184)) ? s : ((v<1)?"0":"") // 128+32+16+8
                       +(s=_.mr(v*10)+"%").substr(0,s.length-2)+"."+s.substr(-2); }// val
//                         _.mr()=Math.round()               min max si  o a flgs
                                                             -10, 10,[3] 0 1  168
//                                                           left top right bot margins
                                                            ,   6,  3,    5,  0
//                                                      [>0] fs tc   x  y  label text
                                                           ,[12, 7,-25, 6, "%:0"] // frnt
                                                           ,[12, 7,182, 6, "100"] // back
                                                           ]);
```

Above example definition creates, adds to ui, and returns (and stores in
global variable `s2` ) a 0..100% horizontal slider of 3 pixel change
value touch / drag s(ensitivity) with left top at x and y (30, 175) and
of h(eight) and w(idth) (180,29), with custom colored border (-4) and
same colored 'left' filling and black colored (0) 'right' filling, with
start value 33 (%) within min (0) and max (100) range and 3 respective
labels with own font specs (fs, all 12), text colors (tc, 6 and 7) and
positions (by fixed x and y offset from left top showing custom formatted
value (in center), "%:0" on the left and "100", on the right, with bit
coded single value callback activation touch event flags filter (flgs:
168), with not value-based adjustment (a: 0) of color and position of
value label, with extra margins - left and right for easy min / max
setting by touch (left:6, right:5) - top (3) for drawing within bounding
box ticks (and values) taller than 1 pixel, and no extra margin at the
bottom (bot: 0).

Two more examples:

```
// Simple horizontal slider "s1":
//
//    0  1     2       3   4   5   6   7   8  9       10  11                         12
// flgs  clazz id      x   y   w   h  bc fcs  value   cb, ls (arr labels [[...],..]) ca
//       sli                ->x2->y2                    [0] fs tc    x  y  txt fmt
ui.c( 3,"sli","s1"  , 10,145,220, 26,  6,[ 4, 1],0,   cb, [[ u, u,   u, u, u,    0
//                                                          min max si
                                                          , -10,100,[0]);

// Fully loaded vertical slider "s5":
//
//....0  1     2       3   4   5   6   7   8  9       10  11                         12
//.flgs  clazz id      x   y   w   h  bc fcs  value   cb, ls (arr of labels [[...],..])
//.......sli                ->x2->y2                    [0] fs tc    x  y  txt fmt
ui.c( 3,"sli","s5"  , 10,150, 55,170,  2,[ 4, 1], 4,  cb, [[14, 6,   6, u, "v" // y val dep
     ,function(v,_,l){ // value,ui,label passed for value dependent modification...
      var s="",y, f=_.te.f; if (f===0 || f&184) { // update label only at 0 and 128+32+16+8
      s=((_.mu(s=_.mr(v))<10)?" ":"")+((s<0)?s:"+"+s)+l[4]; // ./ label y pos val dependent
      l[3]=(((y=_.mr(170/2-v*(170-2-2-5-5)/(10-(-10)))-18)>=2+5+3)?y:y+23); }
      return s; } // value dependent display location of value label (a top of bar level)
// orientation o: 0=horizontal, 1=vertical                 min max si  o a flgs
                                                          ,-10, 10,[3],1,0, 168
// margins for ticks and easy min / max tap area            left top right bot margins
                                                           ,   0,  5,    5,  5]
// minimum, maximum labels relative to left top corner [>0] fs tc   x   y  txt fmt
                                                          ,[10, 4, 80 , 1, "max"]
                                                          ,[10, 1, 83,156, "min"]
                                                          ]);
```


### sli ui element constructor arguments (a[]) and runtime data structure (e[]) are:

```
arg runtime 'object' instance of 'clazz' slider
a[]  e[]
 0   [0] f   - flags focus(4), active(2), visible(1)
 .    .         0bxx1 visible &1 visible
 .    .          0bx1x active  &2 active / senses touches vs read/display-only
 .    .          0b1xx focus   &4 focus by touch down, drag w/in bounding box
 1   [1] c   - clazz - "rad"
 2   [2] id  - eg "s02", short, at least 3 chars, and ui globally unique
               Single letter ui element ids are 'reserved' (for keyboard(s)).
 3   [3] x   - x ((left ) of focus / touch bounding box)
 4   [4] y   - y ((top  ) of focus / touch bounding box)
 5       w   - width (of focus / touch box,...
     [5] x2  - x ((right) of focus / touch bounding box: x - w + 1)
 6       h   - height (of focus / touch box,...
     [6] y2  - y ((bot  ) of focus / touch bounding box: y - h + 1)
 7   [7] bc  - border color
 8   [8] fcs - fill colors array
         [0] fill color for 'left side' of slider
         [1] fill color for 'right side' of slider
 9   [9] v  - value - a number
10  [10] cb - callback on touch, value change, untouch
11  [11] ls - labels - array of labels of which first one is value related
      ls[0] label (info) for value related info, array with:
         l[0]  fs - font spec:s>0: fontVector (size); s<0: .fnts[-s] of loaded font
         l[1]  tc - (label) text color (index)
         l[2]  x  - x offset from focus box x ( bounding box left )
         l[3]  y  - y offset from focus box y ( bounding box top  )
         l[4]  tx - value label text available for formatter function
         l[5]  fm - optional function to format/change value label/parms
         l[6]  mn - minimum value ( at left  border )
         l[7]  mx - maximum value ( at right border )
         l[8]  si - sensitivity information
           si[0] s - sensitivity (in pixels to detect change and redraw)
         l[9]  o  - opt. orientation falsy: horizontal, else vertical slider
         l[10] a  - opt. value adjusted label pos and color (for B&W, 2-clrs)
         l[11] flgs - flags define on what touch events label is rendered
         l[12] ml - opt. margin left for extra min touch area (part of w)
         l[13] mt - opt. margin top for ticks or a-alike (part of h)
         l[14] mr - opt. margin right for extra  min touch area (part of w)
         l[15] mb - opt. margin bottom for ticks or a-alike (part of h)
      ls[1,2,3,...] any number of additional labels, mostly just 2 (min,max)
         l[0]  fs - font spec:s>0: fontVector (size); s<0: .fnts[-s] of loaded font
         l[1]  tc - (label) text color (index)
         l[2]  x  - x offset from focus box x ( bounding box left )
         l[3]  y  - y offset from focus box y ( bounding box top  )
         l[4]  tx - label text to display (using .drawString())
         l[5]  fm - opt. formatter function(l[4],_,l)
```

Above examples custom formatter does one decimal rounding on value and
appends percent sign ( `50.6%` ). Flags define on what touch event(s)
the value label is rendered.

Custom formatter has dual purpose:

 - Render more than just the bare (numeric) value.
 - Simplified custom formatted numeric value (rounded, less digits).
 - Render discrete text values based on numeric value, such as
   "high", "medium" and "low" alone or combined with (formatted)
   numeric value.
 - Placing a visual - value labe or any other thing - alone
   or in combination with (formatted) value anywhere on the
   display with value derivced position and color and form and
   shape and...
 - Avoid slowing down sliding by suppressing rendering on some of
   the touch events. When value label's font spec ( ```fs / l[0] /
   ls[0][0]` ) is *NOT* `undefined```, value label rendering
   gets invoked on virtually all occurring touch events and
   leaves it to the application to skip - by returning empty
   string.
 - Provide a hook for the application to render (and/or do) what
   ever extra ordinary thing the application requires based on
   different values reached when visualizing these values with
   (most likely read-only / display-only, not active bit
   displayed) sliders by updating them with these values using
   one of these avenues (when no other touch is going on,
   otherwise it has to be deferred with a timeout / queued):
   - invoke ui update method with respective arguments:
     - `ui.u(sliderEltIdxOrIdOrInstance, value, 1);`
       (1 for 'propagate' change / update event).
   - invoke ui event method with x and y with the right values
     simulating a touch down and then and then invoke with no
     arguments to simulate an untouch:
     - `ui.evt(x,y);ui.evt();` .

Because rendering - drawing strings on a display - can be slow, rendering
the actual value while sliding has to be kept to a minimum to keep sliding
snappy. Providing the formatter function that returns an non-empty string
only on desired conditions and an empty one else does the trick: rendering
an empty string is not noticeably slowing down sliding; ui element value
(v), ui and touch event states / flags (_, _.te.f) can be used to form
the desired condition to return empty or not empty string.

Note that the custom formatter ([l[13] of first label - ls[0]) is called
*before* value label is drawn. This allows the custom formatter not only
to define what is rendered, but also how and where it is rendered by
just-in-time setting/modifying the passed label's parameters and do other
extraordinary things (like coloring or clearing a alert zone).

Label parameters useful to modify just-in-time for drawing the label are:

  - l[0] fs - font spec: vectorFont size (>0), (loaded) bit map font (<=0)
  - l[1] tc - text color: single coded value (>=0) or from palette (<0)
  - l[2] x -  x relative to bounding box left side (x of ui element def)
  - l[3] y -  y relative to bounding box top side (y of ui element def)
  - l[6] s -  sensitivity - for value / change/time dependent adjustment
  - l[8] a -  adjust (value based <>50%) vs fix label color and position
  - l[13] itself, the custom formatter (for the next label drawing).

No working guarantee is given for changing other label parameters than
the one listed above.

Just-in-time setting parameters for the value label to draw helps when
either fixed specified ( `l[8] = 0 or absent`) or fix combined with
value-based, out-of-box adjusted ( `l[8] = 1`) colors and position
do just not fit the ui's needs or aren't looking right (After all it is
UX and and the ui has to look at be usable at its best). To avoid
value-based adjustment of color and position after setting parameters,
define the slider ui element with `0 for a / l[8] / ls[0][8]` (like
for fixed specified color and postion).

With value-based auto adjustment (a) of value label's color and position
enabled - value of ( `a / l[8] / ls[0][8]` ) is set to  ( `1` ) -
drawing position is adjusted a third of the slider bar width to the left
when slider value is >= 50% (half an upper half), otherwise to the right
(when the slider is <50%, lower half), and the color of the labe takes on
the opposite fill color. Specifying another non-0 value than `1` does
it proportionally less ( `<1` ) or more ( `>1` ). Best results
are easiest achieved when drawn label length is around a third of the
actual slider bar. Longer labels may need label parameters set to custom
calculated placement and color in custom formatter and with value-based
auto adjustment 'turned of' (set to `0` ).

A real estate saving trick on small displays and keeping the actual
slider bar as wide as possible is to use the space of the left and right
labels  - if present - for the extra padding for easy minimum and maximum
touching area. Note that the extra margins are part of the width of the
bounding box, so labels left and right of the actual slider bar lay
inside the bounding box and their x and y are different from what they
are when positioned outside of the bounding box.

Ticks drawing is part of the extra drawings function that can be passed
at initial or re-display of all items or whole display by the ui base
draw  function `ui.d(undefined,extraDrawingsFunction)` or - for
short either `ui.d(0,...)` or `ui.d(u,...)` (with variable `u`
defined for `undefined`, or when custom (re-)drawing individual
slider ui element `e` with `ui.d(e,tickDrawingFunction)`. For
convenience (and more so for performance),  ui ( `_` ) and slider ui
element ( `e` ) are passed to the `extra_or_tick_drawings(_,e)`
function. Note the extra margin for the ticks are part of the height
of the bounding box. You either increase the slider ui elements h(eight)
or you accept a slim slider bar. Slim slider bars may though not anymore
accommodate a label value, which - under some circumstances - may not be
an issue because of not added value or (accurate,) numeric value is not
needed. Btw, custom formatter can return text values, such as "high",
"medium", "low" instead of numeric values... or combined with numeric
values). Last but not least the value label can be drawen anywhere on
the display with the respective 'fix' x and y relative to the left top
of the bounding box ('fix', `0` for the auto value-based adjustment
of position and color value label 111a / l[8] / ls[0][8]``` may be
recommended if not otherwise desired, such as 'moving target'-a-like
and limited control over the color. Both 'moving target' AND full
control over color can be achieved by setting label parameters in
custom formatter function).


Colors are bit-coded with 3-bit color-depth according ui.clrs=[...] setup.

Since slider has two (2) areas to fill - left and right side of slider -
fill colors - fcs - are specified as array:

  - fcs[0] is fill color for the 'left'  / 'filled' side of the slider.
  - fcs[1] is fill color for the 'right' / 'empty'  side of the slider.

Since slider has drag aspects callback and should also be able to deliver
values to the application while sliding, callback conditions can be
specified by flags as defined for the ui event flags. These flags also
control whether the new changed value is set and custom formatter function
is invoked or not. On untouch though, the new value is and formatter is
invoked no matter whether the untouch flag(s) is(are) set or not.


Callback is called with `id, v, ui, e, t` as arguments:

```
args[] sym   description
  0    id  : button id ("c01")
  1    v   : value object (usually a number)
  2    ui  : ui (THE ui object)
  3    e   : uiSli element (sli 'object' (runtime data structure))
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


### sli - slider ui element properties - variables and methods - mixed into ui base:

```
exports = // sli (slider) ui element ('clazz' name).
{
// ...
// ... private variables and methods
// ...
};
```

Using
-----

* APPEND_USES: uiSli
