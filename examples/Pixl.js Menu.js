/*<!-- Copyright (c) 2018 Gordon Williams. See the file LICENSE for copying permission. -->
Pixl.js and Bangle.js Menus
==============

* KEYWORDS: Menu
* USES: Pixl.js,Bangle.js

![Pixl.js Menu](Pixl.js Menu.jpg)

Pixl.js and Bangle.js contain a simple menu system based on [the graphical_menu module](graphical_menu).

To use it just call `E.showMenu(...);` with an object where each field's name
corresponds to a menu item, and the value is a function that is executed
when that item is selected.

To disable the menu, use `E.showMenu()` - see [the documentation](/Reference#l_E_showMenu)

[E.showPrompt](/Reference#l_E_showPrompt), [E.showMessage](/Reference#l_E_showMessage)
and [E.showAlert](/Reference#l_E_showAlert) are also available for displaying other types of information.

**Note:** Earlier firmwares used `Pixl.menu(...);` (now deprecated) instead of
`E.showMenu`. `E.showMenu` is more portable between Bangle.js and Pixl.js.

*/

// First menu
var mainmenu = {
  "" : {
    "title" : "-- Main Menu --"
  },
  "Backlight On" : function() { LED1.set(); },
  "Backlight Off" : function() { LED1.reset(); },
  "Submenu" : function() { E.showMenu(submenu); },
  "Exit" : function() { E.showMenu(); },
};

// Submenu
var submenu = {
  "" : {
    "title" : "-- SubMenu --"
  },
  "One" : undefined, // do nothing
  "Two" : undefined, // do nothing
  "< Back" : function() { E.showMenu(mainmenu); },
};

E.showMenu(mainmenu);
