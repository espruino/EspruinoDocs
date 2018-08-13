<!--- Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Graphical Menu
==============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/graphical_menu. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Modules,Menu,Menus,Selection,Graphics
* USES: Graphics

This is a very simple, lightweight menu library ([[graphical_menu.js]]) for displays that use
Espruino's [[Graphics]] library.

Simply use it as follows:

```
var g = /* my graphics object */;

var menu = require("graphical_menu");
var m;

// First menu
var mainmenu = {
  "" : {
    "title" : "-- Menu --"
  },
  "Light On" : function() { LED1.set(); },
  "Light Off" : function() { LED1.reset(); },
  "Submenu" : function() { m=menu.list(g, submenu); },
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
}, BTNU, {repeat:true,debounce:50,edge:"rising"});

setWatch(function() {
  m.move(1); // down
}, BTND, {repeat:true,debounce:50,edge:"rising"});

setWatch(function() {
  m.select(); // select
}, BTNA, {repeat:true,debounce:50,edge:"rising"});
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
  "menu text" : function() { called when menu item selected };
};
```

And `menu.list` returns an object containing the following functions:

* `draw()` - draw the menu to the screen (usually happens automatically)
* `select()` - 'select' the current menu item - call this when the 'action' button is pressed
* `move(n)` - if `n=-1`, select the menu item above the current one, if it's `1` select the item below the current one
