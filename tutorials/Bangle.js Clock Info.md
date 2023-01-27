<!--- Copyright (c) 2022 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bangle.js Clock Info
=====================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bangle.js+Clock+Info. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Bangle.js,Development,Clock,Watch,information,clockinfo,clock_info,clock info
* USES: Bangle.js

If you've been following the [Bangle.js Clock tutorial](/Bangle.js+Clock)
you should have an idea how you can go about making a clock.

One feature you might want in your clock face is to display some other
information - be that step count, altitude, or the time until your
next timer.

[We have Widgets](/Bangle.js+Widgets) that you can use with `Bangle.loadWidgets()`
but these sit in a 24px bar at the top of your screen which may not integrate
well with your clock, and they may not display what you need.

**Note:** If you just want widgets to appear only when needed,
you could check out [Widget Hiding](/Bangle.js+Hideable+Widgets)

While you can write any code you want in your clock face, you may soon
decide that you want to display more than one thing, and to be able to
cycle through what is displayed.

**We've already implemented this for you with the [clock_info.js module](https://github.com/espruino/BangleApps/tree/master/apps/clock_info)**

The [clock_info.js module](https://github.com/espruino/BangleApps/tree/master/apps/clock_info)
provides a series of 'info cards' for things like battery, heart rate and altitude.

Not just that, but you can install other apps (like [Sunrise Clockinfo](http://banglejs.com/apps/?id=clkinfosunrise)
that can add other information cards, so any clock that uses clock_info.js can then display this information. A full list is available at https://banglejs.com/apps/?q=clkinfo

## Setup

Recently the `clock_info` module turned into an app. So all you need to do is to ensure  you install
the [clock_info app](https://banglejs.com/apps/?id=clock_info) on your Bangle.

Before that, `clock_info` was a module in [BangleApps/modules](https://github.com/espruino/BangleApps/tree/master/modules)
and so to develop with the Web IDE you need to do a bit of setup first to set the include path - check out https://github.com/espruino/BangleApps/blob/master/modules/README.md
That isn't needed now.

## How it works

First, in your clock's `metadata.json` you'll want to add `"dependencies" : { "clock_info":"module" },` to tell the app loader that your app needs to have the `clock_info` module pre-installed.

In your clock, calling `require("clock_info").load()` will return an array of the form:

```
[
  {
    name: "Bangle", img: ...,
    items: [
      {
        name: "Battery",
        hasRange: true,
        get: function () { ... },
        show: function () { ... },
        hide: function () { ... }
       },
      {
        name: "Steps",
        hasRange: true,
        get: function () { ... },
        show: function () { ... },
        hide: function () { ... }
       },
      ...
     ]
   }
 ]
```

The object in the list returned by `require("clock_info").load()` contains:

* `name` : text to display and identify menu object (e.g. weather)
* `img` : a 24x24px image
* `items` : menu items such as temperature, humidity, wind etc.

Each item in `items` contains:

* `item.name` : friendly name to identify an item (e.g. temperature)
* `item.hasRange` : if `true`, `.get` returns `v/min/max` values (for progress bar/guage)
* `item.get` : function that returns an object:

```JS
  {
    'text'  // the text to display for this item
    'short' // optional: a shorter text to display for this item (at most 6 characters)
    'img'   // optional: 24x24px image to display for this item (if not supplied, text may be 2 lines separated with \n)
    'color' // optional: a color string (like "#f00") to color the icon in compatible clocks    
    'v'     // (if hasRange==true) a numerical value
    'min','max' // (if hasRange==true) a minimum and maximum numerical value (if this were to be displayed as a guage)
  }
```  

* `item.show` : called when item should be shown. Enables updates. Call BEFORE 'get'
* `item.hide` : called when item should be hidden. Disables updates.
* `.on('redraw', ...)` : event that is called when 'get' should be called again (only after 'item.show')
* `item.run` : (optional) called if the info screen is tapped - can perform some action. Return true if the caller should feedback the user.

## Using clock_info.js

You can call `require("clock_info").load()` and can display the information directly - an
example is at the bottom of the [clock_info.js module](https://github.com/espruino/BangleApps/blob/master/modules/clock_info.js).

However we'd strongly recommend that you use the `addInteractive` function. This
implements all the user-interaction code and leaves you to implement
just the way data is to be displayed on the clock.

After this, you'll end up with an information screen that you can focus by tapping on it.

* By default there is one list of info cards, called `Bangle`. Other clock_info add-ons (for example the scheduler) may add other lists
* Once focused (by tapping):
  * Swipe left/right moves between lists (by default there is one list so this has no effect)
  * Swipe up/down moves between info cards in the current list
  * If the clock_info supports it you can even tap to activate it


```JS
// Load the clock infos
let clockInfoItems = require("clock_info").load();
// Add the
let clockInfoMenu = require("clock_info").addInteractive(clockInfoItems, {
  // Add the dimensions we're rendering to here - these are used to detect taps on the clock info area
  x : 20, y: 20, w: 80, h:80,
  // You can add other information here you want to be passed into 'options' in 'draw'
  // This function draws the info
  draw : (itm, info, options) => {
    // itm: the item containing name/hasRange/etc
    // info: data returned from itm.get() containing text/img/etc
    // options: options passed into addInteractive
    // Clear the background
    g.reset().clearRect(options.x, options.y, options.x+options.w-2, options.y+options.h-1);
    // indicate focus - we're using a border, but you could change color?
    if (options.focus) g.drawRect(options.x, options.y, options.x+options.w-2, options.y+options.h-1); // show if focused
    // we're drawing center-aligned here
    var midx = options.x+options.w/2;
    if (info.img) g.drawImage(info.img, midx-12,options.y+4); // draw the image
    g.setFont("6x8:2").setFontAlign(0,1).drawString(info.text, midx,options.y+44); // draw the text
  }
});
```

After calling `addInteractive` it returns the `options` parameter with the following added:

* `index` : int - which instance number are we? Starts at 0
* `menuA` : int - index in 'menu' of showing clockInfo item
* `menuB` : int - index in 'menu[menuA].items' of showing clockInfo item
* `remove` : function - remove this clockInfo item
* `redraw` : function - force a redraw
* `focus` : function - bool to show if menu is focused or not


If your clock implements [Fast Loading](/Bangle.js+Fast+Load) you'll want to
ensure you call `clockInfoMenu.remove();` when your clock unloads.

## Multiple clock_info

You can easily call `require("clock_info").addInteractive` more than once
with different areas (see `slopeclockpp` for an example). As long as the areas
don't overlap they can be individually focussed and modified.


## clock_info Add-on files

Now we're using `clock_info`, you might want to add your own info cards to it.

You can create a storage file called `example.clkinfo.js` and populate it with the following:

```JS
(function() {
  return {
    name: "Bangle",
    // img: 24x24px image for this list of items. The default "Bangle" list has its own image so this is not needed
    items: [
      { name : "Item1",
        get : function() { return { text : "TextOfItem1",
                       // v : 10, min : 0, max : 100, - optional
                      img : atob("GBiBAAAAAAAAAAAYAAD/AAOBwAYAYAwAMAgAEBgAGBAACBCBCDHDjDCBDBAACBAACBhCGAh+EAwYMAYAYAOBwAD/AAAYAAAAAAAAAA==") }},
        show : function() {},
        hide : function() {},
        // run : function() {} optional (called when tapped)
      }
    ]
  };
}) // must not have a semi-colon!
```

You create the images as 1bpp 24x24px with https://www.espruino.com/Image+Converter
In the preview the image should appear white on transparent.

Next time you load clock_info a card with an icon and `TextOfItem1` will be shown

For example if we want to add a stopwatch that you can start and stop with a press,
you can add the following:

```JS
(function() {
  var startTime;
  var interval;
  var running = false;

  return {
    name: "Bangle",
    items: [
      { name : "Timer",
        get : () => ({ text : startTime ? ((Date.now()-startTime)/1000).toFixed(1) : "--",
                      img : atob("GBiBAAAAAAB+AAB+AAAAAAB+AAH/sAOB8AcA4A4YcAwYMBgYGBgYGBg8GBg8GBgYGBgAGAwAMA4AcAcA4AOBwAH/gAB+AAAAAAAAAA==") }),
        show : function() { // shown - if running, start animation
          if (running)
            interval = setInterval(()=>this.emit('redraw'), 100);
        },
        hide : function() { // hidden - stop animation
          if (interval) clearInterval(interval);
          interval=undefined;
        },
        run : function() { // tapped - cycle between start and stop
          if (interval) { // stop
            clearInterval(interval);
            interval=undefined;
            running = false;
          } else { // start
            interval = setInterval(()=>this.emit('redraw'), 100);
            startTime = Date.now();
            running = true;
          }
        }
      }
    ]
  };
});
```

**Note:** the mix of `function` and arrow functions (`() => {}`) is very
intentional here. `show/hide/run` need to access `this` (which points to
  the object they are a member of), but when using `setInterval` arrow
  functions must be used so `this` is preserved when they are called.

To add this to the app loader, simply create a new app with this as the
only file (ideally with a name starting with `clkinfo`). Then
set `"type": "clkinfo",` in the `metadata.json` file.

See [`clkinfosunrise`](https://github.com/espruino/BangleApps/blob/master/apps/clkinfosunrise) as an example.


## Adding Clock-info just to your clock

If you want to add some custom info card to your clock, you can do that too.

If you don't want to package a file along with your clock, you can add it direct to your app:

```JS
let clockInfoItems = require("clock_info").load();
// add as the first item
clockInfoItems[0].items.unshift({ name : "Item1",
  get : function() { return { text : "TextOfItem1",
                              img : atob("GBiBAAAAAAAAAAAYAAD/AAOBwAYAYAwAMAgAEBgAGBAACBCBCDHDjDCBDBAACBAACBhCGAh+EAwYMAYAYAOBwAD/AAAYAAAAAAAAAA==") }},
  show : function() {},
  hide : function() {},
})
// create the menu
let clockInfoMenu = require("clock_info").addInteractive(clockInfoItems, {
```
