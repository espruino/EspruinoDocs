<!--- Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Graphical Menu
==============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/graphical_menu. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Modules,Menu,Menus,Selection,Graphics
* USES: Graphics

This is a very simple, lightweight menu library for displays that use
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
    "fontHeight": 0, // optional, height of the font being used
    "y": 0, // optional, y offset of menu
  },
  "menu text" : function() { called when menu item selected };
};
```
