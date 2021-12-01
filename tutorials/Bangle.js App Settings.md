<!--- Copyright (c) 2021 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Adding a Bangle.js App Settings Page
=========================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bangle.js+App+Settings. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Bangle.js,Development,Settings,Setting,Config,Options
* USES: Bangle.js

If you've made an app, often you may want to provide some options to allow
it to be customised. While you can use `E.showMenu` to add an options screen
inside your app, Bangle.js provides a way to add extra menus to the
global `Settings` application.

First, check out the tutorial on [adding an app to the Bangle.js App Loader](/Bangle.js+App+Loader)
as it'll help you to understand about `apps.json`.

First off, you need to store your settings in a file. Apps in Bangle.js generally
use either `"myapp.json"` or `"myapp.settings.json"` as the filename, where `myapp`
is your app's ID. We're using `"myapp.json"` here (which what we would suggest).

## Using settings in your app

In the app itself, you can read settings using code like this:

```JS
// read settings file, or if it doesn't exist use {}
var settings = require('Storage').readJSON("myapp.json", true) || {};
// if an item doesn't exist, you can set a default
if (settings.something === undefined)
  settings.something = 123;
```

You can also specify all default values at once:

```JS
var settings = Object.assign({
  something: 123,
  anotherthing: 456,
}, require('Storage').readJSON("myapp.json", true) || {});
```

Or you can use a helper function:

```JS
var settings = require('Storage').readJSON("myapp.json", true) || {};
function getSetting(key, def) {
  return (key in settings) ? settings[key] : def;
}

var value = getSetting('something', 123);
```

Or you could only check values when using them:

```JS
var settings = require('Storage').readJSON("myapp.json", true) || {};

var value = settings.something;
if (typeof(value) !== "number")
  value = 123;
```
It's important to think about both memory usage and speed:

* **Do you only have a few settings, or you use them often?** It's probably easier
just to load the settings right at the time your app loads, and keep them in
memory.
* **Do you have a lot of settings, not use settings often, or you're a Widget
that needs to keep memory usage down?** Maybe you should load the settings
as and when you need them:

```JS
var settings = require('Storage').readJSON("myapp.json", true) || {};
var value = settings.something || 123;
delete settings; // remove unneeded settings from memory
```

**Note:** You should never depend upon a settings file being present,
or even having some field, so defaults are a good idea. Someone may
have deleted it or upgraded from an older version of your app.


## Testing settings in your app

When you're loading settings inside your app, you can manually
write:

```JS
require('Storage').writeJSON("myapp.json", {
  something : 123
});
```

To set up some settings. You can enter this at the console and then
reload your app to check then take effect.

**It's also important to check your app works with no settings file**
using `require('Storage').erase("myapp.json")`. It's very easy to create
an app that works for you, submit it to the app store and find nobody
else can use it because they don't have a settings file.


## The Settings page

Now, develop your setting page. In the Web IDE, upload to RAM and start with the
following:

```JS
(function(back) {
  var FILE = "myapp.json";
  // Load settings
  var settings = Object.assign({
    something: 123,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "App Name" },
    "< Back" : () => back(),
    'On or off?': {
      value: !!settings.onoroff,  // !! converts undefined to false
      format: v => v?"On":"Off",
      onchange: v => {
        settings.onoroff = v;
        writeSettings();
      }
    },
    'How Many?': {
      value: 0|settings.howmany,  // 0| converts undefined to 0
      min: 0, max: 10,
      onchange: v => {
        settings.howmany = v;
        writeSettings();
      }
    },
  });
})(load)
```

It's pretty easy to add different options - check out the [`E.showMenu`](http://www.espruino.com/Reference#l_E_showMenu)
docs for more ideas.

This is great for testing, however to create a settings app, you must remove the
`(load)` from the end of the code, so it should look like this:

```JS
(function(back) {
  var FILE = "myapp.json";
  // Load settings
  var settings = Object.assign({
    something: 123,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "App Name" },
    "< Back" : () => back(),
    'On or off?': {
      value: !!settings.onoroff,  // !! converts undefined to false
      format: v => v?"On":"Off",
      onchange: v => {
        settings.onoroff = v;
        writeSettings();
      }
    },
    'How Many?': {
      value: 0|settings.howmany,  // 0| converts undefined to 0
      min: 0, max: 10,
      onchange: v => {
        settings.howmany = v;
        writeSettings();
      }
    },
  });
})
```

Save the file to `myapp.settings.js` on the Bangle's
storage. If the app JSON is set up, you should now be able to access the
settings by going to `Settings` -> `App/Widget Settings` and your App's Name.

## Adding to the app loader

* Save the settings file above to a file called `settings.js` in your app's
folder in the App Loader.
* Now you need to add both `myapp.settings.js` and `myapp.json` to `apps.json`

Assuming this is your app, add the lines marked:

```JSON
{
  "id": "myapp",
  "name": "My App",
  "version": "0.01",
  "description": "...",
  "icon": "app.png",
  "tags": "...",
  "supports": ["BANGLEJS","BANGLEJS2"],
  "storage": [
    {"name":"myapp.app.js","url":"app.js"},
    {"name":"myapp.settings.js","url":"settings.js"}, // < ------- HERE
    {"name":"myapp.img","url":"app-icon.js","evaluate":true},
  ],
  "data": [{"name":"myapp.json"}]  // < ------- HERE
},
```

And you're finished!

## Extra 1: Applying widget settings immediately

Sometimes you may want settings for a Widget, and that widget may
be running in the background while the settings page is active. In
that case we'd suggest:

* Adding a function called `reload` to your Widget that reloads the settings and redraws
* Adding the line `if (WIDGETS["myapp"]) WIDGETS["myapp"].reload()` at the
  end of your `writeSettings` function.

## Extra 2: Loading Settings from your app

Sometimes you may want to enter the settings menu direct from your app.
If you do, you can use this code:

```JS
eval(require("Storage").read("myapp.settings.js"))(()=>load());
```

You should replace the call to `load()` with a function that displays the
main menu of your app, or going `< Back` from settings will go back
to the clock.
