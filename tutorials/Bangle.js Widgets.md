<!--- Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bangle.js Widgets
==================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bangle.js+Widgets. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Bangle.js,Development,Widget
* USES: Bangle.js

We'll assume you've already been through the [Bangle.js Development page](/Bangle.js+Development)
and have an idea how to get started, and have maybe looked at [making an app](/Bangle.js+First+App)

Widgets are bits of code that run in the background of other applications. For
example the Battery level, Bluetooth Connection status, or other things. There
are 24 px wide areas at the top and bottom of the screen which are usually
reserved for Widgets to draw their information.

Not every application enables widgets (they need to call `Bangle.loadWidgets()` and
`Bangle.drawWidgets()`) but virtually all clock applications will allow them.


How does it work?
-----------------

`Bangle.loadWidgets()` loads any file ending in `.widget.js`, and those
files add widgets to the global `WIDGETS` variable.

`Bangle.drawWidgets()` then goes through everything in `WIDGETS`
laying it out according to its position on the screen (`tl/tr/bl/br`)
and width, and then drawing them.

When the screen is cleared by the host application, it is responsible
for calling `Bangle.drawWidgets()` again.

However if your widget needs to change what it displays, it should
call its `draw` method again. If it needs to change its width (eg.
to add a 'charging' indicator) it should call `Bangle.drawWidgets()`
for force all widgets to lay out and draw again.


How to develop
--------------

Developing a widget is much like developing an app - in a lot of ways it
is simpler.

You can either develop the widget on its own, or inside another app. First,
lets develop on its own since we can do that in [the emulator](https://www.espruino.com/ide/emulator.html) if needed.

First, check out the example widget in [`apps/_example_widget/`](https://github.com/espruino/BangleApps/blob/master/apps/_example_widget)

Add `WIDGETS = {};` to the top of the code, and `Bangle.drawWidgets();` to the bottom,

The Example widget will look like:

```JS
WIDGETS = {};

(() => {
  function draw() {
    g.reset(); // reset the graphics context to defaults (color/font/etc)
  	// add your code
    g.drawString("X", this.x, this.y);
  }

  // add your widget
  WIDGETS["mywidget"]={
    area:"tl", // tl (top left), tr (top right), bl (bottom left), br (bottom right)
    width: 28, // how wide is the widget? You can change this and call Bangle.drawWidgets() to re-layout
    draw:draw // called to draw the widget
  };
})()

Bangle.drawWidgets();
```

**Ensure the IDE is set to upload to RAM** (the default) - use the down-arrow below
the upload button.

If you upload this now, you will see an 'X' in the top left of the screen. Because
Bangle.js's corners are rounded, Widgets do not start at `0,0` but are instead inset
from the side slightly.


Example - displaying the date
------------------------------

As an example, let's display the date...

* Change the widget name from `mywidget` to `dayofweek`
* Place it where we want it - in this case `tl` is top left
* Change the width
* Write our own `draw` function - in this case draw just the month

In this case I've added a `drawRect` so we can see the bounds that
we need to stay within.

```JS
WIDGETS = {}; // for testing only

(() => {
  var width = 24; // width of the widget

  function draw() {
    var date = new Date();
    g.reset(); // reset the graphics context to defaults (color/font/etc)
    g.setFontAlign(0,0); // center fonts    
    g.drawRect(this.x, this.y, this.x+width-1, this.y+23); // check the bounds!
    // Use 'locale' module to get a shortened day of the week
    // in the correct language    
  	var text = require("locale").month(date,1);
    g.setFont("6x8");
    g.drawString(text, this.x+width/2, this.y+12);
  }

  setInterval(function() {
    WIDGETS["date"].draw(WIDGETS["date"]);
  }, 10*60000); // update every 10 minutes

  // add your widget
  WIDGETS["date"]={
    area:"tl", // tl (top left), tr (top right), bl (bottom left), br (bottom right)
    width: width, // how wide is the widget? You can change this and call Bangle.drawWidgets() to re-layout
    draw:draw // called to draw the widget
  };
})()

Bangle.drawWidgets(); // for testing only
```

The widget should now look like: ![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5AQDCiM4PQiwMwAAAHtJREFUSMftVEEKwCAMy0YP/f9rcyhslylFZDpnbw14qJakislB44VACACoaAg5jTgRjBRIgSABGvcabcYwHsWYNEJF63nXsE9U1FVqv//WM+r7/UR+6t4NpCX2Tb72ol+yS1YmXf5FLcmIdEb0jJw+oyIFNobdzvRscQMCqlSnDW+pqQAAAABJRU5ErkJggg==)

Now, we'll need to make sure we update the day when it changes. We could be clever
and figure out exactly when the next day was, but for this example we'll just
update our widget every 10 minutes:

```JS
setInterval(function() {
  WIDGETS["date"].draw(WIDGETS["date"]);
}, 10*60000); // update every 10 minutes
```

Finally, we might want to add an icon above the day to show what the text is
meant to be. So...

* Search for [a calandar icon](https://icons8.com/icons/set/calendar)
* Download the image: ![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAcklEQVRIiWNgGEDwH4opUsdENecQaYEXAwPDYwZUF/0ngJHVPWZgYPDEZyHMcErwI2QDGdEsICbMiQFwc+keB1QHLDjE0YOOWIARxEM/iEYtGLVg1AJMC55AaXKLagYGSJGPE3gyQMpzSuoCDzI8OpIBABfVRCSeUd9lAAAAAElFTkSuQmCC)
* Scale/crop it and convert it to white on black: ![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAANCAIAAAASSxgVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5AQDChYUreEeZgAAAGNJREFUGNPNj8sJxDAMRF8W9yLclFuy3ILr8V3VmMkhgQTyYWEv+26jNzAIAJBkZpwwM0l7aK1JmnPqwnZ09+WoP/PhCxJQSomIW51z7r0nICLGGL/O/WMpbX8+6V25u16pta4QG1hS79KvfwAAAABJRU5ErkJggg==)
* Open the [Image Converter page](http://www.espruino.com/Image+Converter) and upload the image
* Choose No transparency, 2 bit black and white, image string
* And you'll get a line like `var img = E.toArrayBuffer(atob("DA0CDQBwv//+////////1VVX0AAH0AAH0AAH0AAH0AAH0AAH1VVXv//+"))`

You can now draw the image using some code like:

```JS
g.drawImage(atob("DA0CDQBwv//+////////1VVX0AAH0AAH0AAH0AAH0AAH0AAH1VVXv//+"), this.x+6, this.y)
```

One the image is drawn, you could then draw the current day of the month inside it. And finally, the code looks like:

```JS
WIDGETS = {}; // for testing only

(() => {
  var width = 24; // width of the widget

  function draw() {
    var date = new Date();
    g.reset(); // reset the graphics context to defaults (color/font/etc)
    g.setFontAlign(0,0); // center fonts    
    //g.drawRect(this.x, this.y, this.x+width-1, this.y+23); // check the bounds!
    // Draw icon
    g.drawImage(atob("DA0CDQBwv//+////////1VVX0AAH0AAH0AAH0AAH0AAH0AAH1VVXv//+"), this.x+6, this.y)
    // Draw a small day of the month    
    g.drawString(date.getDate(), this.x+width/2, this.y+9);
    // Use 'locale' module to get a shortened day of the week
    // in the correct language    
  	var text = require("locale").month(date,1);
    g.setFont("6x8");
    g.drawString(text, this.x+width/2, this.y+19);
  }

  setInterval(function() {
    WIDGETS["date"].draw(WIDGETS["date"]);
  }, 10*60000); // update every 10 minutes

  // add your widget
  WIDGETS["date"]={
    area:"tl", // tl (top left), tr (top right), bl (bottom left), br (bottom right)
    width: width, // how wide is the widget? You can change this and call Bangle.drawWidgets() to re-layout
    draw:draw // called to draw the widget
  };
})()

Bangle.drawWidgets(); // for testing only
```

And the widget displayed should be: ![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAXCAYAAAARIY8tAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5AQDCiYX6655LwAAAMlJREFUSMfFVTEOxCAM850y8DwGBp7HyHBDn5cBiZuQEC0pAapaQi2E4gCOCwBZapw4W2dP49bZzInz3ffoBUIMmRMPtRBDl+BTWFpwYmhgyFyOf/EwSAp674cWiTHOEQDA8TvEuHVWjA8fESdW34uKwJCBIaMmUV0yJ+6qZQvBzA5Ik72k9x7EQtPIVCJ+xyp24XGreIdgpmKXZNoSFsWUwruT8OkPVj/b93aONA9AXj6iOuurHZDkNXW/JtVUM81kusUqVl204A/oQ/4PSLzwIQAAAABJRU5ErkJggg==)


Trying in an app
-----------------

**Note:** this won't work in the emulator

Trying inside an app requires some changes to the IDE's settings. We want to
write the widget to a file in Storage, but to then run the default app (a clock)
and *not* the widget itself.

* Click the down-arrow below the Upload button
* Click `Storage`
* Click `New File`
* Enter `date.wid.js` as the name
* Open `Settings`, `Communications` and change `Load after saving` to `Load default application`
* Delete the lines `WIDGETS = {};` (top) and `Bangle.drawWidgets();` (bottom) from your code

Now click the upload button and you should see your widget displayed alongside all the other widgets and your clock.

The widget is now installed and usable on your watch, even without the IDE!


Adding to the App Loader
-----------------------

Checking out the page on [adding an app to the Bangle.js App Loader](/Bangle.js+App+Loader)

Adding the widget is very similar...

* Come up with a short name (no spaces) for your widget that isn't listed in https://github.com/espruino/BangleApps/tree/master/apps
* Copy [the example widget](https://github.com/espruino/BangleApps/tree/master/apps/_example_widget) to `apps/yourshortname`
* Save your widget's code to `apps/yourshortname/widget.js`
* Find an icon for the app loader and put it in `apps/yourshortname/widget.png`
* Open `apps/yourshortname/add_to_apps.json`, change `7chname` to `yourshortname`, add your widget's details, then add the contents of the file to `apps.json` in the root of the BangleApps repository and delete `apps/yourshortname/add_to_apps.json`

You can then try it out your own custom App Loader and issue a Pull Request (PR) to add it to the main [Bangle.js App Loader](https://banglejs.com/apps/)
