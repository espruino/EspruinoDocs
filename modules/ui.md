<!--- Copyright (c) 2019 allObjects, Pur3 Ltd. See the file LICENSE for copying permission. -->
UI Framework for microcontrollers
==================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/ui. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,UI,Graphics,User Interface

The framework consists of a bases module which provides the infrastructure
for individual out of box and custom ui elements and utility extensions.
Out of box ui elements include (for now):

 - [plain button](/uiBtn)
 - [check box](/uiChk)
 - [radio button](/uiRad)
 - [slider](/uiSli)
 - [input field](/uiInp)
 - keyboard (soft keyboard / touch keyboard)

Out of box extensions provide utility and convenience functions and
is required for more complex ui elements - for now - for - out of box -
radio button, input element and keyboard component. The extensions are
also useful for the application to easy access and 'safely' handle ui
elements.

Creating and integrating custom ui elements and extensions is easy
based on the chosen architecture, available documentation and ready
to run examples. Examples can be run on actual Espruino and display
with and without touch screen.
Most of the examples run also emulated in cross development environment
in any browser as html / JavaScript - that's how and where the ui
framework and ui elements are developed and maintained for most of their
parts. The examples share / reuse the Espruino JavaScript project and
module files from the Espruino IDE sandbox folder as they are: unchanged.

All ui elements handled by ui framework have roughly 12 (13) common
properties in same and similar structure(s):

 - flags - hidden/displayed, touch active, read/display-only, in focus,...
 - clazz - btn-Button, chk-Checkbox, rad-Radiobutton, sli-Slider, inp-Inputfield,...
 - id of ui element - enabling sharing callbacks and other nifty things,
   such as keeping additional, application specific state and behavior
   the ui framework does not cater for (yet) or will never do or can...
 - x and y position - left-top of ui elements bounding box
 - width and height
 - border and fill colors
 - a value (object) enabling sharing callbacks and other nifty things
 - a preferred callback - fired on untouch after touch down on same ui element
 - some label object(s) - plain, static text but also as renders (functions)
 - (optional, NON-preferred, experimental callback called on all touch events)

Only the 1st 9 of the 12 (13) properties are really mandatory. Same
values in same structures have lead to an implementation of the ui
elements as light weight, lean 'array objects' in order to save memory
/ variables.

Details about the ui element specific properties for construction and
runtime are documented for each ui element separately.

The ui communicates input (and other) events through callbacks. The
callback arguments include all pertinent information to allow a straight
forward, from simple to sophisticated use in the application and keep the
application code terse in order to save memory / variables:

 - id of ui element
 - value (object) of ui element
 - ui singleton (module) for accessing all statuses / ui elements / ui aspects
 - ui element subject to touch event (for optional query/change by application)
 - touch event object (touch/untouch and position on display / ui element, flags)


### ui framework - base module.


The `ui` base module takes care of most of the plumbing, logic and data
flow between touch screen (or physical buttons) and display as input and
output components and controling application.


### Implementation approach

`ui` is currently implemented as singleton, literally constructed when
loaded (required). At runtime it does not only hold on to its own code and
data but also the mixed in code for the various ui element 'types' as
needed (as loaded on demand by `require()` ) and the data of the
created ui elements. The ui elements are implemented  a light weight array
objects: just data and - where needed - some format function(s).


### Memory / Variable usage

Below some (ballpark) figures on various usage, categorized as U
for unminified vs. M for minified and I for individual vs C for cumulated.

```
// vars (Idividual|Cumulated)  IU /  IM -   CU -   CM  B (Un|Minified)
var ui = require("ui")     // 392 / 314 -  412 -  334 20       (-Base)
    .adx(require("uiExt")) // 237 / 214 -  670 -  547
    .adx(require("uiRad")) // 190 / 168 -  860 -  725
    .adx(require("uiSli")) // 188 / 166 - 1048 -  891
    ;
var ui = require("ui")     // 392 / 314 -  412 -  334 20
    .adx(require("uiBtn"))
    .adx(require("uiChk"))
    .adx(require("uiExt")) // 237 / 214 -  649 -  548
    .adx(require("uiRad")) // 190 / 168 -  839 -  813
    ;
var ui = require("ui")     // 392 / 314 -  412 -  334 20
    .adx(require("uiSli")) // 272 / 227 -  600 -  500
    ;
```

Minification setting in Espruino Web IDE:  Esprima (offline) for both code
in Editor window and from modules.


*** Basic Application of ui base and - as example - use of uiBtn (Button) element


Get ui base and ui elements and build ui - like a DOM - by ui definitions in
level 0. The build is executed on upload to Espruino. `save()` will save
the built ui. The `onInit()` function will start the already built ui
on power up, after save() or - while under development - manually by
invocation in console or automatically in a `setTimeout()` (see below).


### Require ui components

Get ui base and ui elements to the extent as needed into the system,
such as uiBtn, uiSli(der), etc.


```
var ui = require("ui")     // getting ui base code (w/ 8 default colors)
    .adx(require("uiBtn")) // add / mixin btn ui elt support into ui
    ;
```


### Define UI and add elements

Definition of UI(s) - creation of 'DOM'(s) - best happen (with Espruino)
on code upload and is/are as such then saved on save(), but not displayed
(rendered) yet. Creating it dynamically is possible as well. Example UI
below defines ui with two (2) buttons -`b1` and `b2` - which on
release (untouch, tap) will call the example callback `cb`. Button ui
element definition includes just data and requires out of box no format
functions. For more details see uiBtn module (unminified code) and related
documentation.

```
//    0  1     2      3   4   5   6   7   8  9      10  11
// flas  clazz id     x   y   w   h  bc  fc  valObj cb,  l (label array obj)
//       btn               ->x2->y2                       fs tc    x  y  text
ui.c( 3,"btn","b1" ,  5, 40, 65, 35,  4,  4, "B_1", cb,  [15, 7,  13, 9,"RED"   ]);
ui.c( 3,"btn","b2" , 70, 40, 65, 35,  5,  6, {v:1}, cb,  [15, 0,   9, 9,"BonYbg"]);
// bc/fc/tc: border/fill/text colors; cb=callback(id, v, ui, e, t): id: button id,
// such as "b1"; v, ui, e, t provide btn value, ui, elt. touch event runtime data;
// label font(vector) s(ize)>0, 0 built-in bitmapfont, <0 loaded fonts, x,y offset
// colors: 3-bit depth coded: 0b### ###=rgb (0=black, 7=white, 4=red,...)
```


### Application code

The application acts on ui events that are communicated thru callbacks.
This sample callback `cb` - for simplicity reason - just logs the
buttons' id and value (object) in the console.

```
function cb(id,v,_,e,t) { console.log(id+": "+v); } // sample callback
```


### Devices

Device stuff happens on upload - once - and defines the display and the
touch instance and module variables and sets latter accordingly.

The `ILI9341` display controller used in the examples is a 240 x 320
pixel, max 16-bit color, TFT display controller. Other controller can be
used as well with adjusted width and height values and color definitions.

If the touch screen has a controller, use its module - like `XPT2046`
for resistive touch screen (XPT2046 works also for the `ADS7843`
controller); otherwise use the module that can handle a resistive touch
screen directly (TouchRD - from: Touchscreen, Resistive, where membrane
edge traces are Directly connected to Espruino pins and controlled and
sensed by Espruino).

```
// instance and module variables:
//
var dsp,  dspMod = require("ILI9341");   // display

var touch,touchMod = require("XPT2046"); // touch screen controller
  // or:
var touch,touchMod = require("TouchRD"); // touch screen w/o controller
```


### Define the onInit() function

Function `onInit() {...}` gets everything initialized, connected and
started. The code below shows touch screen controller module for touch
screen connection (`XPT2046` can also be used for equally specified
`ADS7843`). Pins used are related to PICO.

```
function onInit() { // on power on/save() setting up all from scratch
  // setup and connect display, then ui and input (touch | phys btns)
  SPI2.setup({sck:B13, miso:B14, mosi:B15, baud: 1000000}); // display
  dsp = dspMod.connect(SPI2, B10, B1,  A4, function() { // using...
                  // ...spi,  dc, cs, rst, callback
    dsp.clear(); A1.set();  // display clear and turn back light on
    ui.connect(dsp)         // connect ui to dsp and display it
      .w(0,0,dspW-1,dspH-1) // wipe screen (rect) w/ default / bg color
      .d()                  // display all elements (w/ no extras)
      .di = true;           // set display changes to immediate
    SPI1.setup({sck:A5, miso:A6, mosi:A7, baud: 1000000}); // touch inp
    touch = touchMod.connect(SPI1, A3,  A2, function(x,y){ ui.evt(x,y);}
                        // ...spi, cs, irq, callback, /. calibrated...
        , function(yr, xr, d) { // ...function, maps touch to x/y of dsp
            return [ Math.round(xr / -121.44          + 259.70685111989)
                   , Math.round(yr /   88.90357142857 + -19.78130398103)
                   ];
    } ).listen(); // for XPT2046 module (ADS7843: not needed/supported)
  } );
} // /onInit()
```


### Start the code after upload

After uploading the code, enter `onInit()` in the Espruino IDE console
to get the code started. For convenience you can add the following line as
last line in the code, which gets the code automatically going after
upload has successfully completed. Note though to remove or comment this
line on the last upload before saving the code with `save()`:

```
setTimeout(onInit,999); // for dev; remove before upload for save()
```


### Description of (graphical) ui base module and touch controller interface


### Properties - state and behavior / methods - of ui base module

`ui` provides also convenience functions/methods to be used in application
to deal with ui elements as well as plain graphics. Due to ui's
extensibility, you can add easily your own ui element or plain function
extensions as desired (with `.add(module);`).


-- States of ui base module / ui singleton (also referred to as _ for this)

```
exports = // ui base / 'DOM'/ ui e(lement) data & code holder, singleton, for mixins)
{ dsp: null // display (Espruino Graphics object)
, mn: "ui"  // reserved, used temporary
, bc: 0     // dsp background color >=0: r*g*b* bit coded; <0: looked up [...,[R,G,B],...]
, tc: 7     // touch / focus color; >=0: r*g*b* bit coded; <0: looked up [...,[R,G,B],...]
, di: false // display instantly on create/change (not defer until after save())
, es: []    // ui elements
, ef: null  // (primary ui) element (in visual) focus (by touch down / hovering)
, lf: null  // (primary ui element) last (in visual) focus (by touch down / not hovering)
, af: null  // alternate (ui element in non-visual) focus (by drag over / hovering)
, it: false // (display) is touched
, td: false // is touch down (event)
, tt: 0     // touch down time
, lx: 0     // last x (touched)
, ly: 0     // last y (touched)
, dx: -1    // (last) x (touch) down
, dy: -1    // (last) y (touch) down
, te: {f:0} // (last) touch event
, clrs:     // default - bit coded color of 3-bit color-depth - 2^1^3(rgb) = 8 colors
    [function(c,i){ var v=(i)?c^7:c; return [v>>2&1,v>>1&1,v&1]; }.bind(exports)
    ]
, fnts: [0] // setFontMethodNames for font modules added w/ .adx(), accessed w/ fs<0)
// ....
// ... public methods - documented above
// ... private methods
// ...
};
```

### Methods of ui base module / ui singleton (also referred to as _ for this)

- `.evt(x,y)` - main entry point for touch and touch emulating functions (tap
     function in uiExt module). A tap starts with invocation of .evt(x,y)
     with x and y values; subsequent invocations with x and y values
     indicate dragging, and invocation without x and y indicate an un-touch,
     which completes a tap or touch. ui base module keeps track of the
     changes and makes them available to the application thru callbacks
     with the ui singleton - variable `ui` / `_` - and touch event
     object `t` with detailed flags `t.f`. Any other 'entries' can
     be used but keeping the states consistent become the burden of the
     application and is not recommended.
- `.iib(x,y,e)` - returns true when x and y (of touch) lay in bounding box of
     ui element e
- `.foc(e)` - set focus to element e (and takes it away from element that had
     it so far)
- `.blr(e)` - blur/unfocus element e (if `.blr()`, element currently in
     focus is blurred)
- `.w(x,y,w,h,c)` - wipe rectangular area at x/y and w(idth)/h(eight) of
     display w/ optional color c; default color is background color (.bc).
- `.c(arguments)` generic, single point entry for creating ui elements. Uses
     first arguments[1] as class or type name and concatenates it with "C"
     for specific create entry. To create a custom ui element and
     integrate it (with .adx(require("customUiElementModule")) is
     discussed in a separate publication.
- `.d(e,f)` - (re) draw element e, and when just .d(), redraw the whole ui
     (all ui elements), and - if function f is passed, call f with this
     (`ui/_`) for displaying complementary items, such as extra labels /
     titles w/ `_.ld(20,30,[15,7,0,0,"Screen Title"])`, for example),
     ticks on sliders, borders for grouping ui elements, etc. In general,
     a ui is built on upload without displaying it to save variables and
     displayed on demand or in onInit() to re-display on every re-power up
     or reset. Note: ui elements with custom (label) renderer / formatter
     that use ui (`_`) or touch event states / flags `_.te.f`, `t.f`
     in their logic, such as the optional value renderer / formatter of
     sliders, this logic needs adjustment, or, the state(s) / flag(s) need
     to be pre-set accordingly, latter though without interfering with
     their overall life cycle or their dependents (ui components' logic).
- `.clr(c,i)` - set color according this.clrs{0](c,i) (customizable)
     function. Default is set for bit coded value for 3-bit (rgb) color
     depth and provides 8 colors: `b&000=0` = black, `b&111=7`
     = white, `b&100=4` = red, etc. `ui.clrs[0]()` can be
     customized to support any color depth - coded - and any number of
     colors - table looked up - or literal, all according to provided
     color converter. For details see section about *Colors and color
     definitions* below.
- `.fnt(s)` - set font spec:
  -   `s>0`: set fontVector (size)
  -   `s=0`: Espruino Graphics built-in 4x6 bit map font
  -   `s<0`: set to font loaded with .adx() - negative index pointing to
      .fnts[idx>0] array, which holds the setFontMethod names as
      strings.
- `.ld(l[abelInfoArray],x,y)` - label draw function; label info array:
  -  `l[0]: fs`  - font spec (>0: fontVector size; s<0: .fnts[-s] of loaded font
  -  `l[1]: tc`  - text color (see Colors section)
  -  `l[2]: x`   - xOffset to x - left of elt bounding box (.drawString(...))
  -  `l[3]: y`   - yOffset to y - top  of elt bounding box (.drawString(...))
  -  `l[4]: tx`  - label text (used in .drawString(...))
  -  `l[5]: fmt` - optional formatter function(l[4],ui,l) that gets passed
     the label tx value (l[4]), the ui singleton (ui) and the
     labelInfoArray, and gets called before drawing. Formatter
     has to return final value to draw with .drawString even
     modify all the other values within the label array `l`.
  - `x` optional base x value - when label used directly
  - `y` optional base y value - when label used directly
      **Note:** the reason for x and xOffset - and y and yOffset - is because
      .ld() is used in conjunction with a ui element that has a bounding
      box that provides x and y - usually left-top corner and xOffset
      and yOffset are used to place the label relative to the ui
      element's corner coordinates. For plain, direct use with absolute
      coordinates, x and y can be omitted.
- `.adx(mon,t,n)` - add any module type t to ui as (integrated) extension to
     support modularity and flexibility, and - if type is negative (<0) -
     remove module from cache. Arguments are:
     - mon - module or module (file / url) name - latter a string, which
         does a dynamic require(). (Note that dynamic require() are not
         discovered by upload to the board. therefore, at runtime, the
         module has to be found on mounted SD card / file system are
         loaded into Modules cache otherwise).
    - t - type of module and - if t<0 - deletion from cache
          - -1, 1 - -1 is default - for modules specifically written for
              ui framework and who's non overwriting properties are merged
              into ui singleton object. Such are ui elements and plain
              code extensions, for examples, uiBtn and uiExt.
          - -2, 2 - for fonts, which are added to Espruino Graphics 'class'
             and name to ui.fnts array (getFont_methodName, as string).
    - n - module (file / url) name - for modules specifically written for
          io framework but their module (file / url) name differs from
          'internal, built=-in module name .mn, for for any other modules,
          such as font modules, that are somehow integrated into ui
          framwork and later referenced.
          etc.
     'Integrate-able' extensions / modules - modules specifically written
     for ui framework - have an (internal) property called .mn - for
     Module Name - which matches the modules (file) name and is for easy
     (self identification and) deletion / removal from Modules cache. For
     modules who's module (file) name differs from 'internal' module name
     property .mn, name n has to be specified and has to be the same name
     as used in require() in order find module in cache and remove it.
     Example module onOff.js for switching back light on/off on pin B2,
```
exports = { mn:"onOff" // module name
           , on: function(on) { digitalWrite(B2, on || on===undefined); }
```

     defines the module code, `ui.adx(require("onOff"))` adds it to the
     ui.js base code in order to be used as `ui.on();`. Without building
     a file, modules can also be put into cache directly on upload in level
     0 (and served with require() with module name provided as variable to
     escape regular module detection and pre-upload from modules sources):

```
Modules.addCached(mName,'{ mn:"onOff",on: function(on) {'
          + digitalWrite(B2, on || on===undefined); }');
```

and added with `ui.add("onOff");`.


### UI (touch) event object (passed in callbacks)

The touch event object `t` and other objects, such as the `ui` /
`_` and the ui element `e` themselves, are passed around for easy
access in the ui base and ui element implementation as well as in the
application. The touch event object has this structure:

```
t = // (touch) event
   { x: x // current or last touched x coordinate
   , y: y // current or last touched y coordinate
   , t: t // touching: (truey), not touching (anymore): falsey
   , f: f // touch event flags (experimental)
   }
```

Touch event flags `t.f` - experimental - are:

```
0000 0000 0000    0 unexpected (invalid?)
0000 0000 0001    1 untouch
0000 0000 0010    2 touching
0000 0000 0100    4 touch down
0000 0000 1000    8 'untouch' focused element while not in focus - _.lf
0000 0001 0000   16 untouched focused elt while in focus (typical untouch)
0000 0010 0000   32 moved out of focused element (touched down element)
0000 0100 0000   64 touching in focused elt (touched down elt) - _.ef / _.lf
0000 1000 0000  128 touching / focused 1st time or re-focused - _.ef / _.lf
0001 0000 0000  256 untouch on dragged over non-touched-down, alt elt - _.af
0010 0000 0000  512 moved out of non-touched-down, alternate focused elt
0100 0000 0000 1024 touching in non-touched-down, alternate focused element
1000 0000 0000 2048 touching 1st time in non-touched-down, alt. focused elt
```

Re-focusing happens when having touched down, dragged out of the element
and now draging back 'into' the initially focused element (touched down
element (`_.ef` / `_.lf`).

In preferred callback, a typical untouch - touch down on a ui element and
untouch on same ui element - set these flags:
conditions:

```
0000 0001 0001   7 = 16 untouched focused element while in focus (simple,
                    +  1 untouch event
```

Untouching after moving / dragging out of the bounding box of the touched
down ui element sets these flags:

```
0000 0001 1001   25 = 16 untouched focused element while in focus (simple,
                         regular untouch event)
                    +  8 'untouch' focused element while not in focus
                         (_.lf) - last registered focused element, now not
                         in focus anymore (_.fe), but may need cleanup
                         or reset when element has been modified on other
                         events using alternative callback
                    +  1 untouch event
```

In the preferred callback fired on ontouch only - touch started with
touch down and ended with untouch on same ui element - requires usually
no or only rarely interpretation of touch event flags.

The alternative callback fires on every kind of touch event and demands
significant interpretation of the flags from the application and ui
status items - passed as well in the callback - in order to take
appropriate action(s) in the application. The multitude of flags
allows to determine - next to untouch - touch down, dragging within,
leaving and re-entering bounding box of touched down ui element as well
as same events of the alternate - not touched down - element (and can
be used to implement drag and drop).


### Colors and Color Definitions

ui base module includes a default color converter that supports 3-bit
color depth - 1 bit each per red, green and blue base color - coded as
single RGB integer value, yielding 8 colors: 2^1^3 = 8 colors (3 LSB -
Least Significant Bits of an integer). The color converter is a
function and is first element - index [0] - of an array which is set
and stored as `ui.clrs[]` array property:

```
ui.clrs = [ function(c,i){ var v=(i)?c^7:c;
                           return [v>>2&1,v>>1&1,v&1]; }.bind(exports) ]
```

The default color converter accepts for c a value from 0..7 for the basic
8 colors and returns them as triplets of 0s and 1s (array of three (3)
elements of values 0 and 1). It accepts an optional second parameter to
invert the color when truey. The inverted, complementary color contrasts
the non-inverted color and is defined by the color specified by the
1-complement of color c. For example, for a the 3-bit color depth defined
color with value `4`, `[1r,0g,0b]` or `red`, the inverted,
contrasting complementary color value is `3`, `[0r,1g,1b]`
or `aqua`.

The color converter is is invoked by ui's color setting method
`ui.clr(c,i)` with same arguments. Any color converter delivers - has
to deliver - the normalized values 0..1 for each of the RGB colors as
[r, g, b] triplet, because hat values triplet is parameter for setting the
color by invoking the set-color method  `.setColor(r, g, b)` of the
Espruino Graphics object. The display module knows how to pass the color
onto the display's controller to make the display show the proper color.

Using the enhanced color converter as below, colors can be specified in
three ways:

- bit-coded as single positive value
- (negative) index into palette of [r,g,b] triplets
- literal [r,g,b] triplet

The n custom colors of the custom color palette are stored in the same
array as the color converter as 2nd to n-th + 1 element - index 1..n. The
color converter has to be built to accept 'negative' color values -1 .. -n
to pick a color from the custom palette: it takes the negative value as
positive index into the `ui.clrs[]` array property tp pick a color
from the custom color palette and return it as value-normalized
[0..1r,0..1g,0..1b] triplet. The way the custom colors of the custom color
 palette are specified determines the implementation of the converter.

```
ui.clrs = // 'imply' color depth and populate table w/ converter and define
          // user colors / palette (colors accessed w/ negative index)
  [function(c,i) { // converts 'custom color info / spec' to [r,g,b]...
       var v, s=isNaN(c); // ...@ idx 0; internally called: _.clrs[0](...)
       if (s || c<0) { // c<0 (looked up [R,G,B]) or c=[R,G,B]
         return ( ((s) ? c : this.clrs[-c]).map( // convert 0..255->0.0..1.0
                               function(v){ return ((i)?v^255:v)/256; } ) );
       } else {        // c>=0 bit coded rgb color (0b001,010,011,100,...111
         v = (i) ? c^7 : c;  // (default 3-bit color depth w/ 2^1^3=8 colors)
         return [v>>2&1,v>>1&1,v&1]; }
     }.bind(ui)  // custom color palette (converter knows to convert spec)
  ,[216,216,216] // user color -1: light grey // keyboard special keys
  ,[192,192,192] // user color -2: medium light grey
  ,[128,128,128] // user color -3: medium gray
  ,[192,128,192] // user color -4: light purple
  ,[0  ,160, 64] // user color -5: kind of a 'darker' green
  ];
ui.bc = 0; // ui (screen) background color (override default w/ other value)
ui.tc = 7; // ui (screen) touch / focus color (override default w/ oth. val)
```

For [r,g,b] specification, Espruino Graphics modules accepts for each
r,g,b base color the normalized value in the range of 0.0 .. 1.0. Under
the hood and with help of the module for the display, this normalized
color specification is transformed - most of the time - into a bit coded
color again, but in a different, more elaborate / complicated encoding,
especially when different number of bits are used for each of the base r,
g and b colors, for example, (display specific) 5, 6, 5 bits for r, g, b.
The module also handles the conversion the sequence of the r, g and b
colors when needed, for example, [r,g,b] to [r,b,g].

Normalized color specification value is mapped to actual color based on
color depth specified for or implied by the display (module) used in
conjunction with the Espruino's Graphics object. The ui base module
already includes a default color converter from bit coded rgb value to
Espruino's normalized [r,g,b] values triplet. Passing the normalized
values triplets makes bit coded colors in the ui independent from the
display's version of bit coding.

The n custom colors of the custom color palette are stored in the same
array as the color converter as 2nd to n-th + 1 element - index 1..n.
The color converter has to be built to accept 'negative' color values
in range of -1 .. -n to pick a color from the custom palette: it takes
the negative value as positive index into the `ui.clrs[]` array to
properly pick a color from the custom color palette and return it
converted to value-normalized [0.0..1.0r, 0.0..1.0g, 0.0..1.0b] triplet.
The way the custom colors of the custom color palette are specified
determines the implementation of the converter.


### Fonts, font definitions and font extensions

Espruino Graphics class has two built-in fonts: vector font and a 4x6
bit map font. Both are available to ui framework by default. Application
can load any additional font module and access it indexed, similar to
custom colors.

Loading custom font modules (module type: 2, -2 to delete by name (for
more see `ui.adx(mon,t,n)` add any module w/ cache delete function):

```
ui.adx(require("Font6x8"     .-2,"Font6x8"     )) // ...and del from cache
  .adx(require("FontSinclair",-2,"FontSinclair")) // ...and del from cache
  ;
```
Using the fonts:

```
//     fs (also used in label spec array as 1at element = fs: font spec)
ui.fnt(15); // sets display's font to built-in vector font with size 15
ui.fnt( 0); // sets display's font to built-in 4x6 bitmap font
ui.fnt(-1); // sets display's font to custom loaded 6x8 bitmap font
ui.fnt(-2); // sets display's font to custom loaded Sinclair bitmap font
```

When loading fonts, they are added to the Espruino `Graphics` class
(and removed when type is specified as -2 - font module - and name n),
and the corresponding `.dsp.setFontXyz()`  method name as string is
added to the `.fnts[]` array (indices 1,2,3,... specified and accessed
with negative index value for fonts spec (fs | s) in labels and ui.


### Custom ui elements and extensions

In order to not collide with future development of the ui components
out of the box and for easy distinction, choose for custom ui elements
clazz names of 5 characters or more, use for mixed in properties -
variables and methods - names with 6 or more characters. Also, add a
custom parallel array object or real js object rather than adding
elements to the existing array object.  


### More...

The unminified sources and examples have in-line documentation - same
as this - and in-line comments. Latter is useful when reading the code
to grok 'what is going on'. Feedback - in general and in particular -
and (improving) contributions are welcome - [@allObjects](http://forum.espruino.com/profiles/1922/).


Using
-----

* APPEND_USES: ui
