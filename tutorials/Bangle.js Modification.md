<!--- Copyright (c) 2021 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bangle.js Software Modification
=========================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bangle.js+Modification. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Bangle.js,Development,App,Modification,Software
* USES: Bangle.js,Bangle.js2

As it comes, Bangle.js provides several utility functions that other apps
use to provide more functionality.

For example:

* `E.showMessage` shows a message
* `E.showAlert` shows a message with an 'ok' button
* `E.showPrompt` shows a message with multiple buttons
* `E.showMenu` shows a menu where items can be selected and tweaked
* `Bangle.setUI` provides easy access to Bangle.js buttons/touchscreen

For usage info on these, see [the reference](http://www.espruino.com/Reference#E)

These functions are built in and work a certain way, **but they can be changed**
if you don't like the look of them, for instance with the [Small Menus App](https://banglejs.com/apps/#menusmall).

You might want to change the positioning, font size, or even the way you
interact with the menus completely!

So how does this work?

* Get the original implementation
* Test it out locally
* Make modifications
* Write them to your Bangle.js
* Turn your modifications into an app

For this example, we'll look at `E.showMessage` as it's nice and simple.


Get the original implementation
--------------------------------

In most cases, the implementation of the function will be in [JavaScript
in the Espruino Repository](https://github.com/espruino/Espruino/tree/master/libs/js), but it's worth checking.

* Go to http://www.espruino.com/Reference
* Find your function, scroll down, and click the `⇒` arrow next to it.

For `E.showMessage` you're taken to the Pixl.js implementation (there can be more than one implementation) which looks
like this:

```JS
/*JSON{
    "type" : "staticmethod",
    "class" : "E",
    "name" : "showMessage",
    "generate_js" : "libs/js/pixljs/E_showMessage.min.js",
    "params" : [
      ["message","JsVar","A message to display. Can include newlines"],
      ["title","JsVar","(optional) a title for the message"]
    ],
    "ifdef" : "PIXLJS"
}
...
*/
```

So here you can see it's loading up `libs/js/pixljs/E_showMessage.min.js`.
We can guess where the Bangle.js one is... [`libs/js/banglejs/E_showMessage.js`](https://github.com/espruino/Espruino/blob/master/libs/js/banglejs/E_showMessage.js)

**Note:** sometimes there will be multiple versions of a file, like `_Q3` (Bangle.js 2)
and `_F18` (Bangle.js 1)

Bear in mind these functions are generally written for execution speed and
not readability!


Test it out locally
--------------------------------

Now you have your file, copy it into the IDE with `E.showMessage =` before
it (or whatever function you're trying to replace) and copy out one of the
usage examples from the documentation to right below it - like this:

```JS
E.showMessage = function(msg,options) {
  if ("string" == typeof options)
    options = { title : options };
  options = options||{};
  g.clear(1); // clear screen
  Bangle.drawWidgets(); // redraw widgets
  g.reset().setFont("6x8",(g.getWidth()>128)?2:1).setFontAlign(0,-1);
  var Y = global.WIDGETS ? 24 : 0;
  var W = g.getWidth(), H = g.getHeight()-Y, FH=g.getFontHeight();
  var titleLines = g.wrapString(options.title, W-2);
  var msgLines = g.wrapString(msg||"", W-2);
  var y = Y + (H + (titleLines.length - msgLines.length)*FH )/2;
  if (options.img) {
    var im = g.imageMetrics(options.img);
    g.drawImage(options.img,(W-im.width)/2,y - im.height/2);
    y += 4+im.height/2;
  }
  g.drawString(msgLines.join("\n"),W/2,y);  
  if (options.title)
    g.setColor(g.theme.fgH).setBgColor(g.theme.bgH).
      clearRect(0,Y,W-1,Y+4+titleLines.length*FH).
      drawString(titleLines.join("\n"),W/2,Y+2);
  Bangle.setLCDPower(1); // ensure screen is on
};

E.showMessage("Lots of text will wrap automatically",{
  title:"Warning",
  img:atob("FBQBAfgAf+Af/4P//D+fx/n+f5/v+f//n//5//+f//n////3//5/n+P//D//wf/4B/4AH4A=")
})
```

You can now run it - make sure you upload to `RAM`:

![](data:image/png;base64,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)

You may also want to test it with widgets, in which case you can add these lines
right before your test call:

```JS
Bangle.loadWidgets();
Bangle.drawWidgets();
```


Make modifications
--------------------

Ok, now you can tweak the function - let's say we want to put a rounded border
around the edge:

```JS
E.showMessage = function(msg,options) {
  if ("string" == typeof options)
    options = { title : options };
  options = options||{};
  g.clear(1); // clear screen
  Bangle.drawWidgets(); // redraw widgets
  g.reset().setFont("6x8",(g.getWidth()>128)?2:1).setFontAlign(0,-1);
  var Y = global.WIDGETS ? 24 : 0;
  var W = g.getWidth(), H = g.getHeight()-Y, FH=g.getFontHeight();
  var titleLines = g.wrapString(options.title, W-2);
  var msgLines = g.wrapString(msg||"", W-2);
  var y = Y + (H + (titleLines.length - msgLines.length)*FH )/2;
  var yt = Y + titleLines.length*FH;
  // colour everything
  g.setColor(g.theme.bgH).fillRect(0,Y,W-1,g.getHeight());
  // add a white inner with rounded borders
  g.setColor(g.theme.bg).
    fillRect(8,yt+16,W-8,g.getHeight()-16).
    fillRect(16,yt+8,W-17,g.getHeight()-8).
    fillCircle(16,yt+16,8).
    fillCircle(W-16,yt+16,8).
    fillCircle(16,g.getHeight()-16,8).
    fillCircle(W-16,g.getHeight()-16,8).
    setColor(g.theme.fg);
  // draw image
  if (options.img) {
    var im = g.imageMetrics(options.img);
    g.drawImage(options.img,(W-im.width)/2,y - im.height/2);
    y += 4+im.height/2;
  }
  // message body
  g.drawString(msgLines.join("\n"),W/2,y);  
  // title
  if (options.title)
    g.setColor(g.theme.fgH).setBgColor(g.theme.bgH).
      drawString(titleLines.join("\n"),W/2,Y+2);
  Bangle.setLCDPower(1); // ensure screen is on
};


E.showMessage("Lots of text will wrap automatically",{
  title:"Warning",
  img:atob("FBQBAfgAf+Af/4P//D+fx/n+f5/v+f//n//5//+f//n////3//5/n+P//D//wf/4B/4AH4A=")
})
```

![](data:image/png;base64,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)

Write them to your Bangle.js
-----------------------------

This is really easy - simply delete all your test code, so you're left with
**just** something like:

```JS
E.showMessage = function(msg,options) {
  // ...
};
```

Now:

* Click the down-arrow next to the Upload icon in the IDE
* Click `Storage`, `New File`
* Enter `mytweaks.boot.js` as the name
* Now click the `Upload` button

Nothing will happen immediately, but now try typing `E.showMessage("Boo!")` in the left
hand side of the IDE - you'll get the new message box.

Your watch will now be usable as it was before, but all apps will have your updated menu.

**Note: The next time you upload, the saved version of your code will
not update** because Bangle.js caches the boot files. You will need to
type `load("bootupdate.js")` into the left-hand side of the IDE.


Turn your modifications into an app
---------------------------------------

Now everything is working, you can turn this into an app.

* Follow the instructions for [making an app](https://www.espruino.com/Bangle.js+App+Loader) if you haven't already
* Think of a unique app ID (ideally all lowercase, no spaces or special characters) - I used `mytweaks`
* Create a new folder like `BangleApps/apps/mytweaks`
* In that folder, save your `E.showMessage` implementation as `boot.js`
* Add a nice 48x48px icon as `app.png`
* Now add the following to the end of `BangleApps/apps.json`, remembering
to change `mytweaks` to whatever app ID you decided to use:

```
},
{
  "id": "mytweaks",
  "name": "Rounded showMessage",
  "version": "0.01",
  "description": "Replace built in E.showMessage",
  "icon": "app.png",
  "type": "boot",
  "tags": "system",
  "supports": ["BANGLEJS2"],
  "storage": [
    {"name":"mytweaks.boot.js","url":"boot.js"}
  ]
}
```

And now you're done! You can either use it on your own personal app loader, or
can [submit it to the main Bangle.js app loader](https://www.espruino.com/Bangle.js+App+Loader#submitting-your-app-to-the-main-app-loader-website)!
