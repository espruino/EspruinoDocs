<!--- Copyright (c) 2019 allObjects, Pur3 Ltd. See the file LICENSE for copying permission. -->
UI Button module
==================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/uiBtn. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,UI,Graphics,User Interface

The ui button module extends ui base with button ui element.

Implementation note: vs3 overlaps/is duplicates of uiExt module and
uwill overwrite each other. Therefore - on changes - changes have to
be applied to both of them to maintain consistent outcome. It is
duplicated in the ui checkbox so that ui extensions does not need to
be loaded when not used. It saves memory / vars with simple UIs.


### Enable ui base with uiBtn and create a button with callback on untouch:

```
var ui = require("ui")       // load ui base module
      .adx(require("uiBtn")) // add module into base and remove from cache
      ;
```

### Create - specify - plain buttons

```
// flgs  clazz id   x  y  w  h b f  value object /. callback on 'untouch'
ui.c( 3,"btn","b1",10,20,50,30,4,7,"B_1"
                  ,function() { (LED1.read()) ? LED1.reset() : LED1.set() }
                  ,[20,0,5,15,"RED"]);
//                  fs t x y   label text
```

Creates, adds to ui, conditionally displays and returns an active(2),
visible(1) =(3) button ("btn") with id "b01". Button is positioned at
10 @ 20 (left @ top,  x @ y) and is sized 50 x 30 (width x height), has
4(red) / 7(white) border / fill colors, has value object string "B_1",
has (arguments ignoring) callback that toggles red LED1, and is labeled
"RED" on top of it in fontVector (size) 20, text (font) color 0 (black
on white button fill color) and x / y-offset of 5 / 15 from left top
corner of button's bounding box.

Colors are bit-coded with 3-bit color-depth according ui.clrs=[...] setup.

Callback cb is called on untouch with `id, v, ui, e, t` as arguments:

```
args[] sym   description
  0    id  : button id ("b1")
  1    v   : value object ("B_1" - can be any object)
  2    ui  : ui (THE ui object)
  3    e   : uiBtn element (btn 'object' (runtime data structure))
  4    t   : touch info x, y,...  (where last touched)
        { x : x coordinate
        , y : y coordinate
        , t : touched (truey) / untouched (falsey)
        , f : flags
        }
```

For ui base, color, label, and callback details see (also) ui base module.

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


### Some more details

A button with border and fill colors equal to display background
color (ui.bc) creates a tap-able area that is useful to make anything,
such as a displayed image, to act like a button...

uiBtn can be changed within callback: for example in example above, the
label can be changed to indicate whether tapping will turn the LED on or
off. In order to make the ui framework redraw the button and make the
label change visible, the callback has to return truey ('JS true'). The
button / callback definition for label changing button looks like this:

```
// flgs clazz id   x  y  w  h  b f  value object /. callback on 'untouch'
ui.c(3,"btn","b01",10,20,50,30,4,7,"B_1"
                  ,function(id, v, ui, e, t) { // on untouch event
                     if (LED1.read()) {
                       LED1.reset();
                       e[11][4] = "RED on"; // label text
                     } else {
                       LED1.set();
                       e[11][4] = "RED off"; // label text
                     }
                     return true; // truey forces button to be re-drawn
                   }
                  ,[20,0,5,15,"RED on"]);
//                  fs t x y   label text
```

The same callback shared by multiple uiBtns can produce button specific
results when callback takes into account the each buttone's unique id or
value (object) as passed to the callback as 2nd argument. Example code for
label change above shows that callback parameters include the value object
of the button (as well as the button element itself). This allows to use
the same callback with different outcome based on button value object (or
button's fill color). Multiple, different colored buttons can be used to
light up an RGB LED (string) in the button's colors as defined by the
value object (and/or fill a rectangle somewhere on the display with the
same color as the button's color using one and the same callback to keep
the code terse and save space (variables).

Note: The **preferred touch event** to invoke the callback is **on untouch**,
because it has these advantages:

- UI behavior is simple in sequence and behavior.
- Enables cancel of touchdown: releasing / untouch **AFTER** 'moving /
  dragging the touch' out of the bounding box of the initially touched
  button (touched on touch down) will not invoke the untouch callback
  that  otherwise would be the inevitable consequence on touchdown on
  the button.
- Implementation of callback is simpler because it is time-wise less
  critical for delivering a UX behavior with timely, intuitive (visual)
  feedback to user and no delay on execution of the callback.

To use the (experimental) alternative callback called on all touch events,
the 11th ([10]) argument value for the preferred callback 11in the
constructor - `ui.c(...);` - has to be a falsey value best is
*undefined*) and the 13th [12] has to be the callback function. The
alternative callback is called with the same arguments as the preferred
one. The touch event object `t` has 12 bit coded flags - `t.f`,
for example for the untouch event `0b000000011001` or `25` -
which describe the touch event in detail. For details see ui base module.

Using a synchronous implementation for callback on touch down may delay
the visual feedback to the user about the accepted touch down when it
takes noticeable time to complete. Therefore, the callback should invoke
the heavy lifting code in a `setTimeout(function(...){...},10,...);`
function as the last thing in the (otherwise 'empty') callback. The 10
millisecond timeout is a value to start with. If it is not working, find
the best value empirically by working thru the application varying the
value.

If the button has to change to give additional visual feedback to the user
that the callback is in execution, then that change has to be coded
**BEFORE*** the `setTimeout()` and the callback has to return truey in
order to trigger the redrawing of the button in the ui base module.
Changing the button again after completion of the heavy lifting of the
callback, it has to happen as last thing *IN* the
`setTimeout(function(...){...; e[#]=...; ... _.d(e); },10,...);`
(with `_` being the `ui` singleton (ui base module) object, passed
as the 3rd argument to the callback).

To prevent additional touch down events on the button to prevent
triggering the callback again before its completion, disabling of the
button has to happen before `setTimeout()` as well with
`e[1]=e|1]|2-2;`. Re-enabling as absolutely last item **IN** the
`setTimeout(){...; e[1]=|2; }` code, even after the redraw (see
above). A more radical approach is to control the touch listener if it
supports the method `touch.listen(false)` (and the opposite,
touch.listen(), which is the same as touch.listen(true)... or 0 and 1
for false and true argument values, respective). Doing latter though,
you loose the ability to issue a cancel  of a long running callback
(which of course has to yield once in a while to the touch controller
module using chained setTimeout()s until done.

Example of a button with both untouch and touchdown event callback:

```
// flgs clazz id   x  y  w  h  b f  value object
ui.c(3,"btn","b01",10,20,50,30,4,7,"B_1"
                  ,undefined
                  ,[20,0,5,15,"RED"]
//                  fs t x y   label text
                  ,function(id,v,_,e,t){ console.log(id+" "+t.f); } );
```

If you use both callbacks and put 'the (heavy) work' of the touch down
callback into a `setTimeout(function(...){...},10,...);`, you may
consider to put 'the work' of both callbacks into a `setTimeout();`
(with equal timeout value) to ensure proper sequence (to prevent touchdown
callback being triggered first...). Having 'the work' of the untouch in a
`setTimout();`, it is recommended to implement button changes the same
way as it has to be done in the touchdown callback by invoking the redraw
in the callback with `_.d(e);` and let the callback return nothing
(which is the same as falsey).


### btn ui element constructor arguments (a[]) and runtime data structure (e[]) are:

```
arg runtime 'object' instance of 'clazz' button
a[]  e[]
 0   [0] f  - flags focus(4), active(2), visible(1)
 .    .         0bxx1 visible &1 visible
 .    .         0bx1x active  &2 active / senses touches vs read/display-only
 .    .         0b1xx focus   &4 focus by touch down, drag w/in bounding box
 1   [1] c  - clazz "btn"
 2   [2] i  - id eg "b01", short, at least 2..3 chars,  ui globally unique.
              Single letter ui element ids are 'reserved' (for keyboard(s)).
 3   [3] x  - x ((left ) of focus / touch bounding box)
 4   [4] y  - y ((top  ) of focus / touch bounding box)
 5       w  - width (of focus / touch box)
     [5] x2 - x ((right) of focus / touch bounding box: x - w + 1)
 6       h  - height (of focus / touch box,...
     [6] y2 - y ((bot  ) of focus / touch bounding box: y - h + 1)
 7   [7] bc - border color
 8   [8] fc - fill color
 9   [9] v  - value - any object, from simple string to number to
              complex { } object (returned when button pressed)
10  [10] cb - simple, preferred callback on untouch after touchdown
11  [11] l  - label (info), array with:
      l[0]  fs - font spec:s>0: fontVector (size); s<0: .fnts[-s] of loaded font
      l[1]  tc - (label) text color
      l[2]  x  - x offset from focus box x ( bounding box left )
      l[3]  y  - y offset from focus box y ( bounding box top  )
      l[4]  tx - label text to display (using .drawString())
      l[5]  fmt - opt. Formatter function(l[4],ui,l)
12  [12] ca - NON-preferred, experimental callback on any touch event
```


### btn (button) ui element class properties - variables and methods - mixed into ui base:

```
exports = // "btn" (plain button) ui element ('clazz' name).
{ vs3: function(x,y,x2,y2,p,q) { // return vertices for btn like shapes ('round' corners)
    // 12 'round corners' (4x3) defined by 0, p and q insetting combinations for x and y
    return [ x,y+q,   x+p,y+p,   x+q,y, x2-q,y, x2-p,y+p, x2,y+q,
            x2,y2-q, x2-p,y2-p, x2-q,y2, x+q,y2, x+p,y2-p, x,y2-q]; }
// ...
// ... private variables and methods
// ...
}
```

Using
-----

* APPEND_USES: uiBtn
