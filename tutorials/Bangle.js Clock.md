<!--- Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bangle.js Clock Faces
======================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bangle.js+Clock. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Bangle.js,Development,Clock,Watch,Face,App,Apps,Application
* USES: Bangle.js

We'll assume you've already been through the [Bangle.js Development page](/Bangle.js+Development)
and have an idea how to get started.

If so you're now connected and can write some simple code - let's have a go at making a clock!

To do this, it's best to use the right-hand side of the IDE - once uploaded you can tweak values and call functions using the REPL on the left if you want to.

Drawing the time
----------------

Copy the following code to the right of the IDE and click Upload (![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4gULCQYBpjW0xwAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAB9SURBVDjL1ZTBDsAgCEOp4f9/mR1cCFOjneMwe1KCAi9VmJkEARCRGmTWriJJQnPxttI60h4QrziNDsm9owOkjvYddr0hr6Mlo2jCfUZeYEngYcimbH94klAYj8yDd40hiPkgTVrdKpPK+P5EHx371v73Q5aenPuFWed3dAH/IFc2Q6hbuwAAAABJRU5ErkJggg==)):

```JS
function draw() {
  // work out how to display the current time
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes();
  var time = h + ":" + ("0"+m).substr(-2);

  // Reset the state of the graphics library
  g.reset();
  // Clear the area where we want to draw the time
  g.clearRect(50,50,100,120);
  // draw the current time
  g.drawString(time, 50, 50);
}

// Clear the screen once, at startup
g.clear();
// draw immediately at first
draw();
var secondInterval = setInterval(draw, 1000);
```

You'll now have some tiny text in the middle of the screen, which displays the time.

The slightly odd ` ("0"+m).substr(-2)` code zero-pads the minutes for us (so 1 minute past 12 gets written as `"12:01"` rather than `"12:1"`).

**Why is the code formatted like this?** Check out the [Code Style](/Code+Style)
page for some tips and the reasoning behind it.


Changing font
-------------

First, we'll want to make the text bigger, and properly centered. You have
a bunch of options here [which you can see on the Fonts page](/Fonts).

We're going to load a custom font for 7 segments called `Font7x11Numeric7Seg`,
which can then be used with `g.setFont("7x11Numeric7Seg")`.

```JS
// Load fonts
require("Font7x11Numeric7Seg").add(Graphics);
// position on screen
const X = 160, Y = 140;

function draw() {
  // work out how to display the current time
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes();
  var time = (" "+h).substr(-2) + ":" + ("0"+m).substr(-2);
  // Reset the state of the graphics library
  g.reset();
  // draw the current time (4x size 7 segment)
  g.setFont("7x11Numeric7Seg",4);
  g.setFontAlign(1,1); // align right bottom
  g.drawString(time, X, Y, true /*clear background*/);
  // draw the seconds (2x size 7 segment)
  g.setFont("7x11Numeric7Seg",2);
  g.drawString(("0"+d.getSeconds()).substr(-2), X+30, Y, true /*clear background*/);
}

// Clear the screen once, at startup
g.clear();
// draw immediately at first
draw();
var secondInterval = setInterval(draw, 1000);
```

![](data:image/png;base64,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)

**Note:** To avoid flicker here we're using the 4th argument to `drawString`,
which clears the background (by default only the text itself is drawn).

Finally, let's add the date. For this, we can use the `locale` library
which means that the data will be in the correct language for each user.

Just add the following at the bottom of the `draw` function:

```JS
  // draw the date, in a normal font
  g.setFont("6x8");
  g.setFontAlign(0,1); // align center bottom
  // pad the date - this clears the background if the date were to change length
  var dateStr = "    "+require("locale").date(d)+"    ";
  g.drawString(dateStr, g.getWidth()/2, Y+15, true /*clear background*/);
```

Extra Clock Features
---------------------

We now have something that tells the time, but we need to add a few
extra bits before we can make this a clock face:

### Widgets

Most clocks show widgets. To do this you just need to add the following
code to the end of the clock:

```JS
Bangle.loadWidgets();
Bangle.drawWidgets();
```

You can call `Bangle.drawWidgets()` every time the screen is cleared
and widgets need to redraw themselves - but it's good practice to
do that as rarely as possible to avoid flicker.

In our example we only clear the screen once (at startup) so that's
the only time we call `Bangle.drawWidgets()`


### BTN2 to start the launcher

Every clock needs to be able to start the launcher, and
the default for this is `BTN2`. All you need to do
is add this code to the end of the clock code (not in a function):

```JS
// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });
```

### Power saving

Right now, we're redrawing the screen every second regardless of whether
it is on or not - that's obviously going to be bad for battery.

To get around this we can listen for when the screen is turned off
and cancel our `secondInterval` interval, then restart it when the
screen is turned on (and immediately redraw):

```JS
// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (on) {
    setInterval(draw, 1000);
    draw(); // draw immediately
  }
});
```

### Finally

Your code should now look like this:

```JS
// Load fonts
require("Font7x11Numeric7Seg").add(Graphics);
// position on screen
const X = 160, Y = 140;

function draw() {
  // work out how to display the current time
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes();
  var time = (" "+h).substr(-2) + ":" + ("0"+m).substr(-2);
  // Reset the state of the graphics library
  g.reset();
  // draw the current time (4x size 7 segment)
  g.setFont("7x11Numeric7Seg",4);
  g.setFontAlign(1,1); // align right bottom
  g.drawString(time, X, Y, true /*clear background*/);
  // draw the seconds (2x size 7 segment)
  g.setFont("7x11Numeric7Seg",2);
  g.drawString(("0"+d.getSeconds()).substr(-2), X+30, Y, true /*clear background*/);
  // draw the date, in a normal font
  g.setFont("6x8");
  g.setFontAlign(0,1); // align center bottom
  // pad the date - this clears the background if the date were to change length
  var dateStr = "    "+require("locale").date(d)+"    ";
  g.drawString(dateStr, g.getWidth()/2, Y+15, true /*clear background*/);
}

// Clear the screen once, at startup
g.clear();
// draw immediately at first
draw();
var secondInterval = setInterval(draw, 1000);
// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (on) {
    setInterval(draw, 1000);
    draw(); // draw immediately
  }
});
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });
```


Making an App
-------------

Now we have this, we need to turn it into an app for the watch. To do that
we need two basic files on the watch:

* The app's code in a JS file
* A JSON `info` file describing the app (name/etc) for the launcher.

First, come up with a unique ID for your app. Don't use spaces, use
lowercase letters, and try and make it reasonably short (under 10 characters is a good idea).

It shouldn't already be listed in https://github.com/espruino/BangleApps/tree/master/apps
so that it doesn't interfere with other apps you might install.

### App Code: myclock.app.js

We'll use `myclock`. Now, click the down-arrow below the Upload button,
then choose `Storage`, then `New File`, and then type `myclock.app.js`
and click `Ok`.

Now, click the `Upload` button. The app will be uploaded to the watch
and then executed from the file. With this set, you can easily
continue to develop your app as it is on the watch.

### App Info: myclock.app.info

Now we have the app, but it won't appear in the launcher because
there is no app info file. To fix this, just copy and paste the
following into the **left-hand side** of the IDE.

It'll write the relevant info to the file `myclock.info`

```JS
require("Storage").write("myclock.info",{
  "name":"My Clock",
  "type":"clock",
  "src":"myclock.app.js"
});
```

If you now long-press **BTN3** to get to the clock, the press
**BTN2** to get to the menu, you can scroll down and see `My Clock`.
If you select it, it'll execute your app!

You can also go into Settings, and choose it as the default clock
under `Select Clock`.

**Note:** The [Bangle App Loader](https://banglejs.com/apps/)
automatically generated this file - we're just doing it here
so you can create an app without requiring the loader.


Next Steps
-----------

Ok, so now we've got a clock!

How about adding it to the [Bangle.js App Loader](http://banglejs.com/apps)?
Check out [Adding an app to the Bangle.js App Loader](/Bangle.js+App+Loader)
