<!--- Copyright (c) 2021 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bangle.js Layout library
=========================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bangle.js+Layout. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Bangle.js,Development,App,Layout,Alignment
* USES: Bangle.js,Bangle.js2

You might have tried making an app (eg by following the [Bangle.js First App](/Bangle.js+First+App)
tutorial), but as your app gets more complicated it can be more of a pain laying things out on the screen -
especially if you want to write an app that works on both [Bangle.js 1](/Bangle.js) and [Bangle.js 2](/Bangle.js2)
which both have different screen sizes and numbers of buttons.

Rather than requiring lots of fiddling and separate positions for each device,
you can use the [Layout library](https://github.com/espruino/BangleApps/blob/master/modules/Layout.js)
to automatically place everything on the screen.

Simple Layout
--------------

By default, Layout centers everything on the screen. Try pasting in this code - a basic 'Hello world':

```JS
var Layout = require("Layout");
var layout = new Layout( {
  type:"txt", font:"6x8", label:"Hello World"
});
g.clear();
layout.render();
```

If you upload, you'll see `Hello World` in the middle of the screen:

![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALAAAACwCAYAAACvt+ReAAAAAXNSR0IArs4c6QAABN9JREFUeF7t1u1uIgcYQ+Fy/xdNlZWQKGIYtnVwvXnyMx+2c96TyVyu1+v1Lx8IjBK4EHj0cmb/IkBgIkwTIPD0+YwnMAemCRB4+nzGE5gD0wQIPH0+4wnMgWkCBJ4+n/EE5sA0AQJPn894AnNgmgCBp89nPIE5ME2AwNPnM57AHJgmQODp8xlPYA5MEyDw9PmMJzAHpgkQePp8xhOYA9MECDx9PuMJzIFpAgSePp/xBObANAECT5/PeAJzYJoAgafPZzyBOTBNgMDT5zOewByYJkDg6fMZT2AOTBMg8PT5jCcwB6YJEHj6fMYTmAPTBAg8fT7jCcyBaQIEnj6f8QTmwDQBAk+fz3gCc2CaAIGnz2c8gTkwTYDA0+cznsAcmCZA4OnzGU9gDkwTIPD0+YwnMAemCRB4+nzGE5gD0wQIPH0+4wnMgWkCBJ4+n/EE5sA0AQJPn894AnNgmgCBp89nPIE5ME2AwNPnM57AHJgmQODp8xlPYA5MEyDw9PmMJzAHpgkQePp8xhOYA9MECDx9PuMJzIFpAgSePp/xBObANAECT5/PeAJzYJoAgafPZzyBOTBNgMDT5zOewByYJkDg6fMZT2AOTBMg8PT5jCfwgwOXy+XXZ67X6z++cvT5lkLv7Pn6nsffo7X3u3r/aIEfD/juQY++792fPzrWv93zbt7j9/3Xvd8lXTL3xwp8e4IdPW2fPbmeCfEq50yo+7xnObevv/qvcPSf4tbtCZz8c/lw1r0U9wc9exK++wQ+yzkS+F7ML8GOch7FPes7+/qH8X+k7kc+gY/EvhH/Pwn86gl6JqxXiI/8DX1fyasn2++IcST2mUDPfrNXrwqPPWcCnvWf/fz3kf9c8o98An/hfXwK3wv96p3z8Z35d96Bb71Hrw2P761nAj7b+er3+pxWn2v6owX+HEZNLQIEbpHXGyFA4AhGIS0CBG6R1xshQOAIRiEtAgRukdcbIUDgCEYhLQIEbpHXGyFA4AhGIS0CBG6R1xshQOAIRiEtAgRukdcbIUDgCEYhLQIEbpHXGyFA4AhGIS0CBG6R1xshQOAIRiEtAgRukdcbIUDgCEYhLQIEbpHXGyFA4AhGIS0CBG6R1xshQOAIRiEtAgRukdcbIUDgCEYhLQIEbpHXGyFA4AhGIS0CBG6R1xshQOAIRiEtAgRukdcbIUDgCEYhLQIEbpHXGyFA4AhGIS0CBG6R1xshQOAIRiEtAgRukdcbIUDgCEYhLQIEbpHXGyFA4AhGIS0CBG6R1xshQOAIRiEtAgRukdcbIUDgCEYhLQIEbpHXGyFA4AhGIS0CBG6R1xshQOAIRiEtAgRukdcbIUDgCEYhLQIEbpHXGyFA4AhGIS0CBG6R1xshQOAIRiEtAgRukdcbIUDgCEYhLQIEbpHXGyFA4AhGIS0CBG6R1xshQOAIRiEtAgRukdcbIUDgCEYhLQIEbpHXGyFA4AhGIS0CBG6R1xshQOAIRiEtAgRukdcbIUDgCEYhLQIEbpHXGyFA4AhGIS0CBG6R1xshQOAIRiEtAgRukdcbIUDgCEYhLQIEbpHXGyFA4AhGIS0CBG6R1xshQOAIRiEtAgRukdcbIUDgCEYhLQIEbpHXGyFA4AhGIS0CBG6R1xshQOAIRiEtAgRukdcbIUDgCEYhLQJ/A3Ycuh4sbXEcAAAAAElFTkSuQmCC)

Let's say we want to make a simple clock - so the time, followed by a line for the date. We need vertical alignment, so we'll start with a block of type `v`, containing an array of children in `c`:

```JS
var Layout = require("Layout");
var layout = new Layout( {
  type:"v", c: [
    {type:"txt", font:"20%", label:"12:00", id:"time" },
    {type:"txt", font:"6x8", label:"The Date", id:"date" }
  ]
});
g.clear();
layout.render();
```

![](data:image/png;base64,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)

The font can be specified with a percentage, in which case it's made into a Vector font with that percentage of screen height.

We also specified an `id`, which makes the item available directly from `layout`, eg `layout.time`. To update the time, we can then change `layout.time.label` and redraw.


Debugging
----------

Sometimes it is useful to be able to check how big an area `Layout` has allocated for certain elements, as this will determine the size of the area that gets cleared if you choose to render just a single element.

For this you can use `layout.debug()` which will draw different color boxes around each element:

```JS
var Layout = require("Layout");
var layout = new Layout( {
  type:"v", c: [
    {type:"h", c: [
      {type:"txt", font:"12x20:2", label:"One", pad:4 },
      {type:"txt", font:"12x20:2", label:"Two", pad:4 }
    ]},
    {type:"txt", font:"12x20:2", label:"Three", fillx:1 },
    {type:"h", c: [
      {type:"txt", font:"12x20:2", label:"4", fillx:1 },
      {type:"txt", font:"12x20:2", label:"5", fillx:2 }
    ]},
  ]
});
g.clear();
layout.render();
layout.debug();
```

![](data:image/png;base64,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)



Updating the screen
--------------------

To redraw we have two main options. The first recommended option is just to use 'lazy' redraw.
Just specify `{lazy:true}` in the second argument of the `Layout` constructor, and
you can then call `layout.render()` when you want to redraw.

`Layout` will then be smart enough to redraw *only* the parts of the clock that have changed.

**Note:** `Layout` positions everything based on the contents that are in the text areas
when `.update()` **or** the first `.render()` is called (see **Debugging** above). As such you should pre-populate
`label` with the maximum size string you expect to be in it (or use `fillx:1` - see **Layout / Positioning** below) before you call `.render()`
the first time - or to avoid flicker you can just call `.update()` which will work out the positions
of everything without drawing anything to the screen.

```JS
var Layout = require("Layout");
var layout = new Layout( {
  type:"v", c: [
    {type:"txt", font:"20%", label:"12:00", id:"time" }, // initial (maximum size) values
    {type:"txt", font:"6x8", label:"The Date", id:"date" }
  ]
}, {lazy:true});
layout.update(); // work out positions

// timeout used to update every minute
var drawTimeout;

// update the screen
function draw() {
  var d = new Date();
  // update time and date
  layout.time.label = require("locale").time(d,1);
  layout.date.label = require("locale").date(d);
  layout.render();
  // schedule a draw for the next minute
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

// update time and draw
g.clear();
draw();
```

Your second option is to manually clear and update just the areas
you're interested in. For example here we use `layout.clear(layout.time)`,
update the text, and then call `layout.render(layout.time)` to draw again.

This can be faster, but is also more fiddly and error-prone.

```JS
var Layout = require("Layout");
var layout = new Layout( {
  type:"v", c: [
    {type:"txt", font:"20%", label:"12:00", id:"time" }, // initial (maximum size) values
    {type:"txt", font:"6x8", label:"The Date", id:"date" }
  ]
});
g.clear();
layout.render(); // first call to layout.render() works out positions and draws

function draw() {
  var d = new Date();
  // update time
  var timeStr = require("locale").time(d,1);
  layout.clear(layout.time); // remove old time
  layout.time.label = timeStr;
  layout.render(layout.time); // redraw
  // check date and update if needed
  var dateStr = require("locale").date(d);
  if (layout.date.label != dateStr) {
    layout.clear(layout.date); // remove old date
    layout.date.label = dateStr;
    layout.render(layout.date); // redraw
  }

  queueDraw();
}

// timeout used to update every minute
var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

draw();
```

Buttons / User Input
---------------------

On Bangle.js you have one or more physical button depending on the version.
`Layout` provides smart handling of this for you, and will either use the physical
button *or* onscreen buttons depending on how many buttons have been requested.

For example this code will display 3 buttons:

```JS
var Layout = require("Layout");
var layout = new Layout( {
  type:"v", c: [
    {type:"txt", font:"6x8:2", label:"A Test", id:"label" }
  ]
}, {btns:[
  {label:"One", cb: l=>print("One"),  cbl: l=>print("One long press")},
  {label:"Two", cb: l=>print("Two")},
  {label:"Three", cb: l=>print("Three")}
], lazy:true});

function setLabel(x) {
  layout.label.label = x;
  layout.render();
}
g.clear();
layout.render(); // first call to layout.render() works out positions and draws
```

On Bangle.js 1 this'll just put 3 labels by the side of the physical buttons and will make them call the callback functions when they are pressed:

![Bangle.js 1](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALAAAACwCAYAAACvt+ReAAAAAXNSR0IArs4c6QAABZNJREFUeF7t3eFO40oQROHN+z+0r7xao2wgcntluF3TH39WS4akq87JMJigPLZt23750EBoAw8Ch5Iz9u8GCEyE6AYIHI3P8ATmQHQDBI7GZ3gCcyC6AQJH4zM8gTkQ3QCBo/EZnsAciG6AwNH4DE9gDkQ3QOBofIYnMAeiGyBwND7DE5gD0Q0QOBqf4QnMgegGCByNz/AE5kB0AwSOxjdr+Mfj8Vfg/e+RCTzLgdi0u7yvf0C/f47AsUhnDU7gWbyXS0vg5ZDOC+QMPI/58omdgZdHvEbA1913T+UqxBpsR6Y4zsR24JH480MTOJ/h6AQEHo0/L/xXVyD2FI4QeSxN/NQAgekQ08DzLnz8WpnAMfhmD/px5v3zmghn4Nk+xKUncBwyAz83QGA+RDfwLPDxWzhXIaKRGp7AHIhvwFWIeISzAxB4Nv/49ASORzg7AIFn849PT+B4hLMDEHg2//j0BI5HODsAgWfzj09P4HiEswMQeDb/+PQEjkc4OwCBZ/OPT0/geISzAxB4Nv/49ASORzg7AIFn849PT+B4hLMDEHg2//j0BI5HODsAgWfzj09P4HiEswMQeDb/+PQEjkc4OwCBZ/OPT0/geISzAxB4Nv/49ASORzg7AIFn849PT+B4hLMDEHg2//j0BI5HODsAgWfzj09P4HiEswMQeDb/+PQEjkc4OwCBZ/OPT0/geISzAxB4Nv/49ASORzg7AIFn849Ov797J4EDEe7g9o9t2wKnv29kAt/X5Y/e00SBj8yvRS+1A98N9l1pryX+9E54d84fffbd+GDL7cB3gyXwjbZ9w10R+GKp1SfIO/Hf7dTV9WdPqJ/+TnCxvm9Z7ghxoVYCXyjrG5a+PoH3J+wSAr+KVRXtasdn93v19rP17+b716+7mrfT+j3zV99hCHyB0pk4V28/W0/gvxv4qq+lBP7uqwNnwp2dUY/5XneS6hn4+PqzOS48J2OWjtiBCRzj4z8NutwZ+GwnOrv9aotn93d2+12Pd/fjXJ2r0/roI8QZyLPbr4I4u7+z2+96vLsf5+pc/9f65x34OIYR+AKNqjhnZ+GP8v+8puHdCGfXda+enS9Ebbf09Qx8/J/AF1AR+EJZNy9dUuCbO3J3jRsgcGM4Rqs1sNwZuBbbqpUbiD4DrwxGtloDBK71ZFXTBgjcFIyxag0QuNaTVU0bIHBTMMaqNUDgWk9WNW2AwE3BGKvWAIFrPVnVtAECNwVjrFoDBK71ZFXTBgjcFIyxag0QuNaTVU0bIHBTMMaqNUDgWk9WNW2AwE3BGKvWAIFrPVnVtAECNwVjrFoDBK71ZFXTBgjcFIyxag0QuNaTVU0bIHBTMMaqNUDgWk9WNW2AwE3BGKvWAIFrPVnVtAECNwVjrFoDBK71ZFXTBgjcFIyxag0QuNaTVU0bIHBTMMaqNUDgWk9WNW2AwE3BGKvWAIFrPVnVtAECNwVjrFoDBK71ZFXTBgjcFIyxzhvY3zODwOc9WdG0AQI3BWOszw28e1NHOzBbYhuwA8eiM/jeAIF5EN+AI0Q8whkBnIFncB6Tcol3qx9DS9BPDRCYFNENEDga37zhX8/A27b9LsEPcfNcWCoxgZfCuW6Yr65C7Lswgddlvmyy4/zrCLEs4vWD+SFufcZLJyTw0njXDucIsTbfUen8EDcKd3bY5ysRrgNnsxw3/ceZ9/H49fvy2fHvdqg8rhKBkxogcBIts75/8Y4dmB2JDTzvwPv8zsCJFM38eWd2BmZFSgOuQqSQMqczMAfWasBViLV4jktD4HHI1wrsKsRaPKX504DXQlAhugECR+MzPIE5EN0AgaPxGZ7AHIhugMDR+AxPYA5EN0DgaHyGJzAHohsgcDQ+wxOYA9ENEDgan+EJzIHoBggcjc/wBOZAdAP/AdGjUFfDFK2uAAAAAElFTkSuQmCC)

On Bangle.js 2, if there's one button it'll use the 'hard' button with a label (like above), or if there's more than one button it'll put buttons on the touchscreen down the side of the screen.

![Bangle.js 2](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALAAAACwCAYAAACvt+ReAAAAAXNSR0IArs4c6QAABy5JREFUeF7tnduW4jgMAM3/f3Tm0Et6M+nOSLLlm1S8zCWJLZUKHWMCvI7jOAoPCDgReL2cBnoY5m7rC4H7As80+pe8vdvhq5SrxAicybCOuQ6R94z/IjECdyxqlqGHynuTGIGzWNYpzynyXiRG4E6FzTIsAmepdNA8EThoYbOkVSWwtNWm3cl4lcISIotpnfJE4E5gGXYMAZPAZ+eVOqzhPDrwmDqHnQWBw5Y2R2IInKPOYbNE4LClzZEYAueoc9gsEThsaXMkZhL48hbwP+lIuxS8lZxDrhFZIvAIyszRjUCVwF7R8E6cF8m84yBw3tqHyNwksHQPxEmENXAIN7ZIAoG3KBNBPhEwCSxh1N4DwS6ERJLjWgIIrCXFeUsSQOAly0JQWgIIrCXFeUsSQOAly0JQWgIIrCXFeUsSMAks7QNr93/ZhVjShS2DQuAty0bQ301wxPehPW5C86lkTGwkYOrAjXP9uJybebyJ5huvSuCntTBr4HwCzc4YgWdXgPmbCJgEvt/rIP1biowlhESI4xIBBJYIcXxpAgi8dHkITiKAwBIhji9NAIGXLg/BSQQQWCLE8aUJuAh8Zsg+8NK1DhkcAocsa56kTAJ7Y2Ef2JtovvEQOF/NQ2WMwKHKmS8ZBM5X81AZI3CocuZMZorEn99L5kdecjrnnvVQifmxb/f6MWApZYjEF3nf0OnAqOdK4Evijo/j9m4dAneEnXFoBM5Y9SA5s4QIUsiMaQyR9wTLi7iMivXLeai8N4lZA/era4qRp8h7kRiBU2jWL0kE7seWkQcQQOABkJmiH4EuAmt/K4P7gfsVNsvICJyl0kHzROCghc2SFgJnqXTQPE0CW++TkD6lzBo4qFUD00LggbCZyp+ASWDt9OxCaElxXisBBG4lyPVTCSDwVPxM3koAgVsJcv1UAl0E1mbELoSWFOc9EUBg3NiaQJXA0n6wtP97EqMDb+3OEsEj8BJlIIhaAiaBtfu72mDowFpSnOeyBkZgRFqNgKkDX9auf+WhXfPek6cDr6bDfvEg8H41I+ILAZPALCFwZzUCCLxaRYjHRMAk8NMa+D6jdk3MGthUK07+hQACo8XWBKoE9sqYDuxFMu84CJy39iEyrxL46V4I7dr3spYO+9VSL+UX1R73b0wOodW4JBC4E2sE7gT2NqxJYGkfWDqe+Z24U+injlt7/OmJkqWzI/CYRlFqBf1ebn2WJHcxEbiUol27Sh1WOk4HLsWrA7c+IQY9b7tPQwfujvi/CVqFu1/fOt6gtLtPg8DdEdcJLAmLwCdXlhBDFLYKh8C6spg68GX/9tfRtWvpDPvAP9b7Dy/Cnl6kITAC6wgMOosO3Ad0VQf2CiXTvRCSwNpO/NTZ7//PPrCXpf8YB4F/wpGWDgj8NwE68IAnKlP0I4DA/dgy8gACCDwAMlP0I4DA/dgy8iACUyT+/OB32PuBB9WOaT4EhkrMr9XjXQ8CQyS+yPvOgQ7co5KJx1R+EKaa0P0DNAhcjZILfyOAwHixLQGWENuWjsCHyHti5kUcwnkSGCrvTWLWwJ6VTDjWFHkvEiNwQuk8U0ZgT5qMNZwAAg9HzoSeBLoIrP14fab7gT2Lxlj/E0BgbNiaAAJvXT6CR2Ac2JqASWDpJ2bvJKSP2bMG3tqdJYJH4CXKQBC1BEwCaydhF0JLivNaCSBwK0Gun0oAgafiZ/JWAgjcSpDrpxLoIrA2I3YhtKQ474kAAuPG1gRMAlv3gU8yT/vBdOCt3VkieAReogwEUUvAJLA0iXb/9xyHDiwR5bhEAIElQhxfmgACL10egpMIILBEiONLE0DgpctDcBIBBJYIcXxpAiaBpX1g6f7fOwl2IZZ2Y4vgEHiLMhHkEwGTwN4Y6cDeRPONh8D5ah4qY5PA0hr4JKNdC9OBQ7k0JRkEnoKdSb0ImAR+XEh/Dmg77zkOHdirjHnHQeC8tQ+RuYvAl4769VdtJ6YDh3BoahIIPBU/k7cSQOBWglw/lQACT8XP5K0EXAS2fhKDXYjWsnH9t0Nv+bQvuthGQ5zVCLh04Nqk2IWoJcd1rh24FicC15LjuiaBn+6JsC5FEBgRWwlULSEQuBU713sRMAl8322Q/i0FSQeWCHFcIoDAEiGOL00AgZcuD8FJBBBYIsTxpQkg8NLlITiJAAJLhDi+NAEXgc8M2QdeutYhg0PgkGXNk5RJYG8s7AN7E803HgLnq3mojKsE5q3kUA5snQwCb10+gjcJLN37YP1kBmtgBGwlgMCtBLl+KgEEnoqfyVsJIHArQa6fSgCBp+Jn8lYCCNxKkOunEnARmHshptYw9eQInLr8+ydvEtg7XfaBvYnmGw+B89U8VMYIHKqc+ZJB4Hw1D5UxAocqZ75kEDhfzcNlPEXiVynHUcrrON5/8IBAG4GhEn/kfUeMwG114+oLgSESX+RFYPRzJ/AlccfHfb3wB9Yd2V3dReoLAAAAAElFTkSuQmCC)

You can also do touchscreen buttons on Bangle.js 2 as well just by adding a `btn`:

```JS
var Layout = require("Layout");
var layout = new Layout( {
  type:"v", c: [
    {type:"txt", font:"6x8:2", label:"A Test", id:"label"},
    {type:"btn", font:"6x8:2", label:"One", cb: l=>setLabel("One") },
    {type:"btn", font:"6x8:2", label:"Two", cb: l=>setLabel("Two") }
  ]
}, {btns:[
  {label:"Three", cb: l=>setLabel("Three")}
], lazy:true});

function setLabel(x) {
  layout.label.label = x;
  layout.render();
}
g.clear();
layout.render(); // first call to layout.render() works out positions and draws
```

![](data:image/png;base64,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)

Finally, while the `cb` field is called for a normal button press, you can also
specify a `cbl` callback to be called when the button has been pressed for a
long time.


Images
------

Images can be supplied either as a function that returns the image (so the image data can remain in flash memory rather than RAM)
or as the image string itself.

As function:

```JS
var Layout = require("Layout");
var layout = new Layout( {
  type:"h", c: [
    {type:"img", pad:4, src:function() { return require("heatshrink").decompress(atob("ikUwYFCgVJkgMDhMkyVJAwQFCAQNAgESAoQCBwEBBwlIgAFDpNkyAjDkm/5MEBwdf+gUEl/6AoVZkmX/oLClv6pf+DQn1/4+E3//0gFBkACBv/SBYI7D5JiDLJx9CBAR4CAoWQQ4Z9DgAA==")); }
 },
    {type:"txt", font:"6x8:2", label:"All ok"}
  ]
});

g.clear();
layout.render(); // first call to layout.render() works out positions and draws
```

As image string:

```JS
var Layout = require("Layout");
var layout = new Layout( {
  type:"h", c: [
    {type:"img", pad:4, src:require("heatshrink").decompress(atob("ikUwYFCgVJkgMDhMkyVJAwQFCAQNAgESAoQCBwEBBwlIgAFDpNkyAjDkm/5MEBwdf+gUEl/6AoVZkmX/oLClv6pf+DQn1/4+E3//0gFBkACBv/SBYI7D5JiDLJx9CBAR4CAoWQQ4Z9DgAA==")) },
    {type:"txt", font:"6x8:2", label:"All ok"}
  ]
});

g.clear();
layout.render(); // first call to layout.render() works out positions and draws
```

![](data:image/png;base64,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)

Custom elements
----------------

Sometimes something might be too complex or fiddly to lay out with `Layout`,
and in these cases you can use the `custom` type, which will call a function
for rendering of that specific field.

```JS
// Some data to graph
var data = new Array(16);
data.fill(0);

// Our custom renderer that draws a graph inside the layout
function renderGraph(l) {
  require("graph").drawBar(g, data, {
    miny: 0,
    axes : true,
    x:l.x, y:l.y, width:l.w, height:l.h
  });
}

// The layout, referencing the custom renderer
var Layout = require("Layout");
var layout = new Layout( {
  type:"v", c: [
    {type:"custom", render:renderGraph, id:"graph", bgCol:g.theme.bg, fillx:1, filly:1 },
    {type:"h", c: [
      {type:"btn", label:"Clear", cb: l=>{ data.fill(0); layout.render(layout.graph); }},
      {type:"btn", label:"Random", cb: l=>{ data=data.map(x=>Math.random()); layout.render(layout.graph); }},
    ]}
  ]
});

g.clear();
layout.render(); // first call to layout.render() works out positions and draws
```

![](data:image/png;base64,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)

Layout / Positioning
---------------------

By default all items are laid out in the center of the screen (and
automatically stepped down if widgets have been loaded first with `Bangle.loadWidgets()`).

However often you'll want to arrange things differently, and there are
several fields you can supply to help.

* `width`/`height` can be manually specified (in pixels) for a specific field
* `pad:3` will add 3 pixels of padding around the edge of an element
* `fillx:1` will make an element fill all available space in a horizontal layout, or if there are
multiple elements with `fillx:number` then space will be spread accordingly.
* `filly:1` has the same effect but on vertical layouts
* A `halign` field to set horizontal alignment. `-1`=left, `1`=right, `0`=center
* A `valign` field to set vertical alignment. `-1`=top, `1`=bottom, `0`=center
* `col` will specify a color for the text, eg `#f00` for red
* `bgCol` is for background color (and if specified, any call to `render` will automatically clear the background)

More information
----------------

There are other layout options too. Check out the documentation at https://github.com/espruino/BangleApps/blob/master/modules/Layout.md for some examples.
