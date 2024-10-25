<!--- Copyright (c) 2024 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bangle.js Performance Optimisation
==================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bangle.js+Performance. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Bangle.js,Development,Performance,Speed,Slow,Optimise,Optimize
* USES: Bangle.js

As you install more apps, enable new features or develop more software for your Bangle, you may find it getting slower.

It can be hard to see why, but we've added a few debugging tools to help you find out.

## Low hanging fruit

* Make sure your firmware is up to date
* Make sure all your apps are up to date
* Make sure `Pretokenise apps before upload` is checked in [the App Loader](https://banglejs.com/apps/). If it's not you'll have to click `Reinstall apps` to reload all their code in a pretokenised form.
* Compact your flash storage with the option in `Settings -> Utils`, or `require("Storage").compact()` in the IDE

## Measuring performance

To use these, you'll have to be connected with the [Web IDE](https://www.espruino.com/ide/#)

### Measuring app load time

Paste the following into the IDE's left-hand side:

```JS
require("Storage").write(".boot3",`
var __start=Date.now();
setTimeout(function() {
  print("APP",0|(Date.now()-__start),"ms");
  delete __start;
},0);
`);
```

Now change app, either with `load()`, by choosing it from the Launcher, or by uploading your app to Flash using the IDE.

This will now print something like `APP 250 ms` which is the time taken for your app to load, *excluding* the time taken to load 'boot code'

When you're done, paste this in the left-hand side to turn off reporting:

```JS
require("Storage").erase(".boot3");
```

to turn off reporting.


### Measuring widget/clockinfo/boot code load time

Some apps may want to run something in the background, in which case they can impact the load time of other apps. To check this out, run this on the left-hand side.

```JS
require("Storage").writeJSON("setting.json", Object.assign(require("Storage").readJSON("setting.json",1),{bootDebug:1}));
load();
```

Now the next time you load an app you'll see something like:

```
.boot0 122 ms
android.boot.js 14 ms
bthome.boot.js 27 ms
health.boot.js 10 ms
messagegui.boot.js 1 ms
sched.boot.js 12 ms
welcome.boot.js 4 ms
widlock.wid.js 2 ms
widbat.wid.js 5 ms
widbt.wid.js 4 ms
widid.wid.js 3 ms
widalarm.wid.js 6 ms
recorder.wid.js 32 ms
widmessages.wid.js 24 ms
recorder.clkinfo.js 10 ms
clkinfogpsspeed.clkinfo.js 6 ms
clkinfocal.clkinfo.js 15 ms
bthome.clkinfo.js 11 ms
clkinfosec.clkinfo.js 7 ms
stopw.clkinfo.js 12 ms
smpltmr.clkinfo.js 38 ms
sched.clkinfo.js 36 ms
```

There are a few parts to this:

* `.boot0` is the initial code that runs to set up the Bangle, much of the time taken by this will be checking to see whether any of the Bangle's `.js` files have changed using `require("Storage").hash`
* `*.boot.js` are each of the boot files provided by each app that wants to run something at startup
* `*.wid.js` are each of the [Widgets](/Bangle.js+Widgets), these are printed when/if your app calls `Bangle.loadWidgets`
* `*.clkinfo.js` are each of the [ClockInfos](/Bangle.js+Clock+Info), these are printed when/if your app loads clockinfos with `require("clock_info").load`

When you're done, paste this in the left-hand side to turn off reporting:

```JS
require("Storage").writeJSON("setting.json", Object.assign(require("Storage").readJSON("setting.json",1),{bootDebug:0}));
load();
```

### Measuring widget draw speed

You can also run:

```JS
require("Storage").write("perfcheck.boot.js",`
Bangle._loadWidgets = Bangle.loadWidgets;
Bangle.loadWidgets = function() {
  Bangle._loadWidgets();
  Object.keys(WIDGETS).forEach(n=>{
    var w = WIDGETS[n];
    w._draw = w.draw;
    w.draw = function() {
      var t = Date.now();
      w._draw(w);
      print("Bangle.drawWidget",n,0|(Date.now()-t),"ms");
    };
  });
};
Bangle._drawWidgets = Bangle.drawWidgets;
Bangle.drawWidgets = function() {
  var t = Date.now();
  print("----");
  Bangle._drawWidgets();
  print("Bangle.drawWidget TOTAL",0|(Date.now()-t),"ms");
};
`);
load();
```

And now whenever widgets are drawn you'll see something like:

```
----
Bangle.drawWidget lock 1 ms
Bangle.drawWidget bluetooth 7 ms
Bangle.drawWidget widid 8 ms
Bangle.drawWidget alarm 1 ms
Bangle.drawWidget recorder 1 ms
Bangle.drawWidget messages 4 ms
Bangle.drawWidget bat 10 ms
Bangle.drawWidget TOTAL 61 ms
```

Which you can use to see whether there are any particularly slow widgets to draw.

When you're done, paste this in the left-hand side to turn off reporting:

```JS
require("Storage").erase("perfcheck.boot.js");
load();
```


## Improving performance

If you see some entry that takes abnormally long, for instance `slow.boot.js` then we'd recommend uninstalling that app if you don't need it, and potentially contacting the app's author.

To fix the issue yourself, look at the app in the App Loader and click the GitHub icon to get to the app's code, then load the relevant file in the IDE. Click the drop-down below the `Upload` icon
and choose `Storage` then choose the matching file on your Bangle. You can now experiment uploading changes and see if you can find out which part of the app is slow and improve it.

We'd suggest adding `var _t = Date.now()` followed by  `print("A name",Date.now()-_t);_t = Date.now()` at various points through the code to measure the time taken to get to each point of it.

**Note:** if you're working on a widget or ClockInfo, they are not designed to be run on their own so just clicking `Upload` is not enough. See the tutorials on [ClockInfos](/Bangle.js+Clock+Info) and [Widgets](/Bangle.js+Widgets) for hints on developing them.



