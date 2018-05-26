/*<!-- Copyright (c) 2018 Gordon Williams. See the file LICENSE for copying permission. -->
Pixl.js Menus
==============

* KEYWORDS: Menu
* USES: Pixl.js

![Pixl.js Menu](Pixl.js Menu.jpg)

Pixl.js contains a simple menu system based on [the graphical_menu module](graphical_menu).

To use it just call `Pixl.menu(...);` with an object where each field's name
corresponds to a menu item, and the value is a function that is executed
when that item is selected.

To disable the menu, use `Pixl.menu()` - see [the documentation](/Reference#l_Pixl_menu)
*/

// First menu
var mainmenu = {
  "" : {
    "title" : "-- Main Menu --"
  },
  "Backlight On" : function() { LED1.set(); },
  "Backlight Off" : function() { LED1.reset(); },
  "> Second Menu" : function() { Pixl.menu(submenu); },
  "Exit" : function() { Pixl.menu(); },
};

// Submenu
var submenu = {
  "" : {
    "title" : "-- SubMenu --"
  },
  "One" : undefined, // do nothing
  "Two" : undefined, // do nothing
  "< Back" : function() { Pixl.menu(mainmenu); },
};

Pixl.menu(mainmenu);
