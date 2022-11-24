<!--- Copyright (c) 2022 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bangle.js Fast Loading
=======================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bangle.js+Fast+Load. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Bangle.js,Development,Clock,Watch,fast load,quick load
* USES: Bangle.js

Fast Loading is when an app can remove all its code from memory so that a new
app (like the Launcher) can be loaded without having to completely reset Bangle.js's
state.

Normally an app can do whatever it wants because everything gets totally reset
afterwards and reloaded - but this process can take 200ms or more, so if it
can be avoided your Bangle will run faster.

Some clocks (like [Anton](https://banglejs.com/apps/?id=antonclk)) implement this,
and you can implement it in your own apps too, as long as your app uses widgets.

**We're recommending you only use this on Clocks and Launchers right now** - the
potential improvement for apps is small (as it only affects loading the next app
  *after* yours), and the potential for things to break is much higher!

**BE CAREFUL!** - because the environment persists, anything you don't free
or reset to the correct state can cause a memory leak or interfere with the
next app.

There are a few things you need to get right with your app. As an example we'll
use this code ([from here](/Bangle.js+Clock+Font))

```JS
// timeout used to update every minute
var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

function draw() {
  var x = g.getWidth()/2;
  var y = g.getHeight()/2;
  g.reset();
  // work out locale-friendly date/time
  var date = new Date();
  var timeStr = require("locale").time(date,1);
  var dateStr = require("locale").date(date);
  // draw time
  g.setFontAlign(0,0).setFont("Vector",48);
  g.clearRect(0,y-15,g.getWidth(),y+25); // clear the background
  g.drawString(timeStr,x,y);
  // draw date
  y += 35;
  g.setFontAlign(0,0).setFont("6x8");
  g.clearRect(0,y-4,g.getWidth(),y+4); // clear the background
  g.drawString(dateStr,x,y);
  // queue draw in one minute
  queueDraw();
}

// Clear the screen once, at startup
g.clear();
// draw immediately at first, queue update
draw();
// Show launcher when middle button pressed
Bangle.setUI("clock");
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
```

## Testing

The first thing we need to do is to be able to test how much memory our clock uses.

* Copy the above file into the IDE, and set it to save to s Storage File called `myclock.app.js` by clicking the down-arrow below the upload icon in the IDE.
* Now type `reset()` in the left-hand side - this will reset Bangle.js without loading any app
* Now type `Bangle.loadWidgets();Bangle.drawWidgets();` - this will load the widgets (because we want to include these in our 'before' memory measurement)
* Now type `process.memory().usage` - this shows us how much memory is used by *just* the widgets. In my case it's 465 - yours will be different.
* Now, we'll load our app with `eval(require("Storage").read("myclock.app.js"))`
* We can now run `process.memory().usage` again and see how much memory is being used now the app is loaded - it's 609 in my case

When unloading is working, you should be able to type `Bangle.setUI()` in the left-hand side,
and then `process.memory().usage`, and you should see the *same number that you had from just after you called `Bangle.loadWidgets();` (in my case 465)

**Note:** this may not be entirely true (see below)

Ok, so now it's time to get started making sure memory is freed.

## 1. `Bangle.setUI({ ..., remove })`

The first step is to add a `remove` handler to setUI - this shows that your app
supports unloading, and this handler should remove anything that got allocated
or any timers that got started.

First, replace `Bangle.setUI("clock");` with:

```JS
Bangle.setUI({mode:"clock", remove:function() {
  if (drawTimeout) clearTimeout(drawTimeout);
}});
```

This code removes the timeout added by `queueDraw` which makes your
clock redraw. Your clock will have something similar.

## 2. Scoping

Right now, everything that is defined is in the global scope, which is
great for debugging. However, it means that `drawTimeout`, `queueDraw`, etc
will all stay allocated.

We want to define them in their own scope, so that when `drawTimeout` is removed
everything is de-allcoated.

The classic way to do this is to wrap everything in a function `(function() { ... })()`
but this has the downside that when loading your app the function has to be parsed
once to allocate it and again to execute - which will slow down your app's loading.

Instead, we'll put the code in a block (`{...}`) and instead of using `var`
we'll use `let` and `const`, and instead of `function foo() { ... }` we'll
use `let foo = function() { ... };`

So now our code looks like this:

```JS
{
  // timeout used to update every minute
  let drawTimeout;

  // schedule a draw for the next minute
  let queueDraw = function() {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function() {
      drawTimeout = undefined;
      draw();
    }, 60000 - (Date.now() % 60000));
  };

  let draw = function() {
    var x = g.getWidth()/2;
    var y = g.getHeight()/2;
    g.reset();
    // work out locale-friendly date/time
    var date = new Date();
    var timeStr = require("locale").time(date,1);
    var dateStr = require("locale").date(date);
    // draw time
    g.setFontAlign(0,0).setFont("Vector",48);
    g.clearRect(0,y-15,g.getWidth(),y+25); // clear the background
    g.drawString(timeStr,x,y);
    // draw date
    y += 35;
    g.setFontAlign(0,0).setFont("6x8");
    g.clearRect(0,y-4,g.getWidth(),y+4); // clear the background
    g.drawString(dateStr,x,y);
    // queue draw in one minute
    queueDraw();
  };

  // Clear the screen once, at startup
  g.clear();
  // draw immediately at first, queue update
  draw();
  // Show launcher when middle button pressed
  Bangle.setUI({mode:"clock", remove:function() {
    if (drawTimeout) clearTimeout(drawTimeout);
  }});
  // Load widgets
  Bangle.loadWidgets();
  Bangle.drawWidgets();
}
```

## Event Handlers

For some apps/clock faces, you may add event handlers - usually these
will take the form `Bangle.on('event', handler` - for example in the
Clock examples we use `Bangle.on('lcdPower'` to detect if the LCD is
turned on for Bangle.js 1:

```JS
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});
```

We need to remove these handlers. To do this (and not remove other handlers)
you need the function you use to be in a variable. So you'll need to change
your code to:

```JS
let onLCDPower = on => {
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
};
Bangle.on('lcdPower',onLCDPower);

// then in Bangle.setUI({mode:"clock", remove:function() {
Bangle.removeListener('lcdPower',onLCDPower);
```

Your clock may also use `setWatch` on a button - but in this case
we'd recommend you use `Bangle.setUI({mode : "custom", ...}` to handle this -
[see the reference](http://www.espruino.com/Reference#l_Bangle_setUI)


## Other libraries

You might find that other libraries you've used are registering for
Bangle.js input as well. If so, you'll need to call a function provided
by the library that will remove that.

If the library registers for input and can't be unloaded then it may not be suitable for 'fast load'.

As an example, the [`clock_info.js`](/Bangle.js Clock Info) module allows you to
add custom information to your clock face:

```JS
let clockInfoItems = require("clock_info").load();
let clockInfoMenu = require("clock_info").addInteractive(clockInfoItems, { ... });
```

In this case, `clockInfoMenu` contains a function called `remove` which you'll
need to call in your `remove` function:

```JS
// in Bangle.setUI({mode:"clock", remove:function() {
clockInfoMenu.remove();
```

Or if your app used the [`widget_utils.js`](/Bangle.js+Hideable+Widgets) module
to hide widgets (or make them swipeable) it must use `.show()` to show them again.

## Bangle.js state

You may also have configured something in Bangle.js - for example:

* Turning hardware on (like the heart rate monitor)
* Setting the Theme to something other than the system theme

And you'll have to reset these to what they were when your app was loaded.

## Changes to global variables

Your app might also have added to a global variable. For example if your
clock face uses a custom font, it may have code like this:

```JS
Graphics.prototype.setFontAnton = function(scale) {
  ...
};
```

In that case you'll have to add:

```JS
// in Bangle.setUI({mode:"clock", remove:function() {
delete Graphics.prototype.setFontAnton;
```

## Testing Afterwards

Ok, now it's time to test:

Type `reset()` to reset the Bangle's state.

Now paste the following into the IDE's left hand side:

```JS
Bangle.loadWidgets();Bangle.drawWidgets();
process.memory().usage
eval(require("Storage").read("myclock.app.js"))
process.memory().usage
Bangle.setUI()
process.memory().usage
```

You should get something along the lines of:

```
=465
=undefined
=619
=undefined
=565
```

* 465 : before the app was loaded
* 619 : after the app was loaded
* 565 : when the app was unloaded

They're not the same! So what's wrong?

Well, if modules are loaded into memory then they will stay loaded, and
we're using `require("locale")`, which is using memory. We don't actually
care about 'losing' this memory, but we just need to check we're not
leaking memory anywhere else.

We can get an idea of how much memory modules are using with `E.getSizeOf(global["\xff"].modules)`
(although this may not be accurate if the modules reference user code).

But the best way to check is just to re-load and free your app again:

```JS
eval(require("Storage").read("myclock.app.js"))
process.memory().usage
Bangle.setUI()
process.memory().usage
```

And this gives us:

```
=undefined
=619
=undefined
=565
```

The same figures as before - showing that we're not leaking memory!

Now that's done, your clock is good to publish. You'll notice that now,
when you press the button to enter the Launcher, there is no `Loading...`
popup and the Launcher will be loaded much more quickly!


## Taking Advantage of Fast Loading

Now that your clock uses fast loading, anything loaded *from* your app
can be loaded quickly **as long as that app uses widgets too**

Using `Bangle.setUI({mode:"clock",...})` means that he button-press
will load the launcher, as will `Bangle.showLauncher()` - and these
commands are smart enough to do a fast load.

You can also use `Bangle.showClock()` (if your app is not a clock - eg
a launcher). Or, you can use `Bangle.load("load_me.app.js")` - but again, the app
you load *must* use widgets, since your Clock would have loaded with
widgets and they cannot be unloaded.
