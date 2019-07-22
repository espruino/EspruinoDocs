<!--- Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Graphical Menu
==============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/graphical_menu. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Modules,Menu,Menus,Selection,Graphics
* USES: Graphics

This is a very simple, lightweight menu library ([[graphical_menu.js]]) for displays that use
Espruino's [[Graphics]] library.

**NOTE:** This is the menu library used by the [`Pixl.menu()`](/Reference#l_Pixl_menu) command on [Pixl.js](/Pixl.js)

Simply use it as follows:

```
var g = /* my graphics object */;

var menu = require("graphical_menu");
var m;

var boolean = false;
var number = 50;

// First menu
var mainmenu = {
  "" : {
    "title" : "-- Menu --"
  },
  "Light On" : function() { LED1.set(); },
  "Light Off" : function() { LED1.reset(); },
  "Submenu" : function() { m=menu.list(g, submenu); },
  "A Boolean" : {
    value : boolean,
    format : v => v?"On":"Off",
    onchange : v => { boolean=v; }
  },
  "A Number" : {
    value : number,
    min:0,max:100,step:10,
    onchange : v => { number=v; }
  }
};

// Submenu
var submenu = {
  "" : {
    "title" : "-- SubMenu --"
  },
  "One" : undefined,
  "Two" : undefined,
  "< Back" : function() { m=menu.list(g, mainmenu); },
};

function onInit() {
  // Create and display the first menu
  m = menu.list(g, mainmenu);
}

setWatch(function() {
  m.move(-1); // up
}, BTN1, {repeat:true,debounce:50,edge:"rising"});

setWatch(function() {
  m.move(1); // down
}, BTN4, {repeat:true,debounce:50,edge:"rising"});

setWatch(function() {
  m.select(); // select
}, BTN3, {repeat:true,debounce:50,edge:"rising"});
```

Call `menu.list` with the [[Graphics]] object and
an object which defines the main menu.

Each object is as follows:

```
var menuinfo = {
  "" : {
    "title": "...", // optional, the menu's title
    "selected": 0, // optional, first selected menu item's index
    "fontHeight": 0, // optional, height of the font being used (default is 6)
    "y": 0, // optional, y offset of menu
    "x": 0, // optional, x offset of menu
    "x2": g.getWidth()-1, // optional, x coordinate of right of menu
    "y2": g.getHeight()-1, // optional, y coordinate of bottom of menu
    "predraw": function(gfx) {} // optional, function called before menu is drawn
                                // (you could for instance set the font in here)
    "preflip": functiongfx() {} // optional, function called after menu is drawn,
                                // before it's sent to the screen
  },
  "menu text" : function() { called when menu item selected };,
  "another menu" : {
    value : 42,       // A number or boolean to be changed
    step : 1,         // optional (default 1) - the amount to inc/dec the number
    min / max : ...,  // minimum/maximum values to clamp to
    onchange : function(value) // optional - called when the value changes
    format : function(value) // optional - converts the value to a string to be displayed
  }
};
```

And `menu.list` returns an object containing the following functions:

* `draw()` - draw the menu to the screen (usually happens automatically)
* `select()` - 'select' the current menu item - call this when the 'action' button is pressed
* `move(n)` - if `n=-1`, select the menu item above the current one, if it's `1` select the item below the current one
