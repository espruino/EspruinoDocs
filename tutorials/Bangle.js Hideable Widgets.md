<!--- Copyright (c) 2022 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bangle.js Hideable Widgets
==========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bangle.js+Hideable+Widgets. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Bangle.js,Development,Clock,Watch,hide widgets,hideable widgets
* USES: Bangle.js

Normally, we'd recommend that your app or clock chooses to load and display
[widgets](/Bangle.js+Widgets) with `Bangle.loadWidgets()` and `Bangle.drawWidgets()`.

However there are cases when you might decide you need the 24px at the top of
the screen for your app - either for data or just for the look of it.

In this case you have a few options:

## Don't load widgets

Not calling `Bangle.loadWidgets()` is faster and saves memory, however:

* You might want widgets loaded - sometimes a widget may provide functionality
that doesn't work if widgets aren't loaded.
* You might want to implement [Fast Loading](/Bangle.js+Fast+Load) - in this
case widgets **must** be loaded.

## Load Widgets and hide them

You can use:

```JS
Bangle.loadWidgets();
require("widget_utils").hide();
```

**Note:** To develop with the Web IDE and Bangle.js modules, you need to do a bit of setup first
to set the include path - check out https://github.com/espruino/BangleApps/blob/master/modules/README.md

To load and then hide all widgets. At a later date your app can
use `require("widget_utils").show()` to show the widgets again if needed.

**Using [Fast Loading](/Bangle.js+Fast+Load)?** You'll have to re-display widgets with
`require("widget_utils").show()` when your app unloads.

## Make widgets swipeable (Recommended)

**This only works on Bangle.js 2 at the moment**

You can use:

```JS
Bangle.loadWidgets();
require("widget_utils").swipeOn();
```

**Note:** To develop with the Web IDE and Bangle.js modules, you need to do a bit of setup first
to set the include path - check out https://github.com/espruino/BangleApps/blob/master/modules/README.md

This will load all widgets and put them offscreen. The user can then swipe
down from the top of the display to show them - and a few seconds later (or
after a swipe up) the widgets will slide up again to hide themselves.

This code uses overlays, so even when the widgets are down, the part of the
screen under the widgets is left untouched.

**Using [Fast Loading](/Bangle.js+Fast+Load)?** You'll have to re-display widgets with
`require("widget_utils").show()` when your app unloads.
