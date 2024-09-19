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

Copy the following code to the right of the IDE and click Upload ![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4gULCQYBpjW0xwAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAB9SURBVDjL1ZTBDsAgCEOp4f9/mR1cCFOjneMwe1KCAi9VmJkEARCRGmTWriJJQnPxttI60h4QrziNDsm9owOkjvYddr0hr6Mlo2jCfUZeYEngYcimbH94klAYj8yDd40hiPkgTVrdKpPK+P5EHx371v73Q5aenPuFWed3dAH/IFc2Q6hbuwAAAABJRU5ErkJggg==) (first ensure the text under it says `RAM` - if not you can change it by clicking the down arrow next to it):

```JS
function draw() {
  // work out how to display the current time
  var d = new Date();
  var clock = require("locale").time(d);
  var meridian = require("locale").meridian(d);
  var time = clock + " " + meridian;

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
// now draw every second
var secondInterval = setInterval(draw, 1000);
```

You'll now have some tiny text in the middle of the screen which displays the time.

The `locale` module will print the clock in different formats depending on each user's language and area.

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
// X/Y are the position of the bottom right of the HH:MM text - make it central!
const X = g.getWidth()/2 + 45,
      Y = g.getHeight()/2 + 20;

function draw() {
  // work out how to display the current time
  var d = new Date();
  var clock = require("locale").time(d, 1 /*omit seconds*/);
  var seconds = d.getSeconds().toString().padStart(2,0);
  var meridian = require("locale").meridian(d);
  // Reset the state of the graphics library
  g.reset();
  // draw the current time (4x size 7 segment)
  g.setFontAlign(1,1); // align bottom right
  g.setFont("7x11Numeric7Seg:4");
  g.drawString(clock, X, Y, true /*clear background*/);
  // draw the meridian(am/pm) and seconds (2x size 7 segment)
  g.setFontAlign(-1,1); // align bottom left
  g.setFont("6x8:2");
  g.drawString(meridian, X+4, Y-26, true /*clear background*/);
  g.setFont("7x11Numeric7Seg:2");
  g.drawString(seconds, X+2, Y, true /*clear background*/);
}

// Clear the screen once, at startup
g.clear();
// draw immediately at first
draw();
// now draw every second
var secondInterval = setInterval(draw, 1000);
```

![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALAAAACwAQAAAACHzNnzAAAAfklEQVR42u3UsQqAIBDG8WvpXtOpZ3C7WuoVelSnTJSbDOUgg+D7Dwq/QRFRQggh9N8kroOYk/k8eZ9GG8txdpmDsluWYSy7hd3c5zQpExmYGqzXUEaOgWws29ViPso2urGb1neZwxcsGRtsXTs1gKsnZWM9TsX47RBCCD10A8Mgq4tOgt5iAAAAAElFTkSuQmCC)

The `.toString().padStart(2,0)` code zero-pads the seconds for us (so 1 second gets written as `"01"` rather than `"1"`).

**Note:** To avoid clearing the whole area here we're using the 4th argument to `drawString`,
which clears the background (by default only the text itself is drawn). This only works because we know
our text will always be the same length!

Finally, let's add the date. Just add the following at the bottom of the `draw` function:

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

### Ensure the button starts the launcher

Every clock needs to be able to start the launcher, and
the default for this is by a press of the middle button. All you need to do
is add this to the end of the clock code (not in a function):

```JS
// Show launcher when middle button pressed
Bangle.setUI("clock");
```

### Widgets

Most clocks show widgets. To do this you just need to add the following
code to the end of the clock:

```JS
// Load and display widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
```

You can call `Bangle.drawWidgets()` every time the screen is cleared
and widgets need to redraw themselves - but it's good practice to
do that as rarely as possible to avoid flicker on Bangle.js 1.

In our example we only clear the screen once (at startup) so that's
the only time we call `Bangle.drawWidgets()`


### Power saving 1

Right now, we're redrawing the whole screen every second, and this
can eat up a reasonable amount of battery (it'll reduce Bangle.js 2
battery life by a factor of 2 or more) compared to updates once a minute.

* If your clock face doesn't show seconds, consider only updating once
a minute - [here is an example](/Bangle.js+Clock+Font)
* If possible, you could update the clock face once a minute using the
code above and then update **just** the area of the clock face responsible
for seconds once a second.

### Power saving 2

On Bangle.js 1, the screen isn't on all the time, so we can stop updates
when it is off. To do this we listen for the `lcdPower` event
and cancel our `secondInterval` interval, then restart it when the
screen is turned on (and immediately redraw):

**Note:** On Bangle.js 2 the screen is on all the time, so this code
isn't required. However you can still use `Bangle.on('lock'` to allow
you to display a clock face with seconds *only* when the Bangle is unlocked.

```JS
// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (on) {
    secondInterval = setInterval(draw, 1000);
    draw(); // draw immediately
  }
});
```

### Finally

Your code should now look like this:

```JS
// Load fonts
require("Font7x11Numeric7Seg").add(Graphics);
// X/Y are the position of the bottom right of the HH:MM text - make it central!
const X = g.getWidth()/2 + 45,
      Y = g.getHeight()/2 + 20;

function draw() {
  // work out how to display the current time
  var d = new Date();
  var clock = require("locale").time(d, 1 /*omit seconds*/);
  var seconds = d.getSeconds().toString().padStart(2,0);
  var meridian = require("locale").meridian(d);
  // Reset the state of the graphics library
  g.reset();
  // draw the current time (4x size 7 segment)
  g.setFontAlign(1,1); // align bottom right
  g.setFont("7x11Numeric7Seg:4");
  g.drawString(clock, X, Y, true /*clear background*/);
  // draw the meridian(am/pm) and seconds (2x size 7 segment)
  g.setFontAlign(-1,1); // align bottom left
  g.setFont("6x8:2");
  g.drawString(meridian, X+4, Y-26, true /*clear background*/);
  g.setFont("7x11Numeric7Seg:2");
  g.drawString(seconds, X+2, Y, true /*clear background*/);
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
// now draw every second
var secondInterval = setInterval(draw, 1000);
// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (on) {
    secondInterval = setInterval(draw, 1000);
    draw(); // draw immediately
  }
});
/* Show launcher when middle button pressed
This should be done *before* Bangle.loadWidgets so that
widgets know if they're being loaded into a clock app or not */
Bangle.setUI("clock");
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
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
  "id":"myclock",
  "name":"My Clock",
  "type":"clock",
  "src":"myclock.app.js"
});
```

If you now long-press the button on Bangle.js to get to the clock,
then press to get to the Launcher, you can scroll down and see `My Clock`.
If you select it, it'll execute your app!

You can also go into Settings, and choose it as the default clock
under `Select Clock`.

**Note:** The [Bangle App Loader](https://banglejs.com/apps/)
automatically generates the `myclock.info` file for apps loaded
from it - we're just doing it here so you can create an app
without requiring the loader.


Next Steps
-----------

Ok, so now we've got a clock!

* How about adding it to the [Bangle.js App Loader](http://banglejs.com/apps)? Check out [Adding an app to the Bangle.js App Loader](/Bangle.js+App+Loader)
* You can [add useful information to the clock face with Clock Info](/Bangle.js+Clock+Info)
* You can make the clock [Fast Load](/Bangle.js+Fast+Load) into the Launcher
* What about [auto-hiding the widgets](/Bangle.js+Hideable+Widgets)
