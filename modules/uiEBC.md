<!--- Copyright (c) 2019 allObjects, Pur3 Ltd. See the file LICENSE for copying permission. -->
UI extension for button control vs touch screen control
==================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/uiEBC. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,UI,Graphics,User Interface

ui EBC extension requires uiExt module.

The uiEBC extension works already well with plain buttons, check boxes and
radio buttons with just watched buttons. Even though it works also with
the uiKbd3x10B soft keyboard and uiInp input field module when choosing
and passing the proper un-touch delay(s). Better support is under
construction.

The uiExampleAll shows in emulation how to use 1 to three buttons to
navigate and 'tap' / 'touch' a ui with buttons, check boxes, and radio
buttons.

The extension supports select next ui element, select previous ui element
and 'tap' selected ui element. By default, select next and previous cycle
thru all active and visible buttons (flags: 0b0011 = 3) with wrap around.
Optional first and last index values can be supplied to stay within a
a range of ui elements, such as a keyboard or keypad when in an input
field. Wrap around can be controlled was well.

The uiEBC extension is added to the base ui the same way as the uiExt
extension  module. uiEBC extension requires iuExt extension to be loaded
in order to work.

```
var ui = require("ui")
    .adx(require("uiBtn"))
    .adx(require("uiExt"))
    .adx(require("uiEBC"))
    ;
```


There can be only one ui element selected at one time. The visual cue is
left and top borders of a rectangle in touch color.


--- Brief documentation of the methods / functions available:

- .sd - delay for re-drawing the selection cue after ui element has been
      tapped / (un)touched - which concludes with a blur. Application
      can control / overwrite select redraw delay as well as the (un)touch
      delay by passing values to tap/touch selected ui element mimicking
      tap / touch duration : `.st(sd,ud)`. Passing a value for `du`
      will  override the default value specified in `ui` base module.
- .sx - property holds index of selected element in ui element array `.es.`
      Value `-1` indicates that no ui element is selected.
- .sn(w,f,l) - method selects the next qualifying ui element. If there is
      none (anymore, if not wrapped), undefined is returned. If there is
      only exactly one, then that one is returned every time. If none is
      currently selected, the first one is returned.
- .st(sd,ud) - method taps / touches the selected ui element and delays the
      untouch by specified time overriding the `.ud` default as defined
      in the `uiExt` module, where the tap / touch function `.t(iie,ud)`
      is defined.

Select next and previous will be constrained in the future by a bit map
in addition to the range to proved more flexibility over non-contiguous
ranges of qualifying and application desired ui elements.


--- EBC (ui extension for push button controlled ui) properties - variables
    and methods - mixed into ui base:

```
exports = // ui ctrl w/ btns vs touch ext, used by ui3|4|5|6BC modules
{ mn: "uiEBC" // module 'clazz' name - globally unique (used to rem frm cache)
, sd: 100 // ms default select delay
, sx: -1 // idx elt selected w/ ui ctrl w/ phys push btns, no touch
// ...
// ... public variables and methods (described above)
// ... private variables and methods
// ...
};
```

Using
-----

* APPEND_USES: uiEBC
