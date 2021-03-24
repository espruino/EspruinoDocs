<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Modules
=======

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Modules. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Modules,Libraries

In Espruino, Modules are pieces of pre-written code that perform common tasks, such as interfacing to different bits of hardware. On this site we generally mean the same thing when referring to "modules" or "libraries".

They can either be JS modules that are loaded from the internet on demand, or they may come compiled in to the Espruino firmware itself.

* APPEND_TOC

Working with Modules
--------------------

**Note:** Module names are case **sensitive**. For example `require("WiFi")` and `require("Wifi")` do not do the same thing.

If you're using the Espruino Web IDE or Espruino command-line tools, simply write `require("modulename")` on the right-hand side. When you click the `Send to Espruino` button, the Web IDE (or command line tools) will automatically look online for minified versions of the modules you need, download them, and load them onto the board. You don't need an SD card or an internet connection to the Espruino board itself.

**Note:** The left-hand side of the IDE is a direct connection to the board itself, which the IDE does not interfere with. As such, if you type `require("modulename")` in the left-hand side then the IDE will not have a chance to dynamically load the module for you, so if it's not in Espruino you won't be able to use it. To fix that, just add `require("modulename")` to the right-hand side of the IDE (nothing else is required) and click `Send to Espruino` - the IDE will then upload that module and you'll be able to use it from the left-hand side.

### Built-in modules

Some modules come built-in to the Espruino firmware on certain boards. If this is the case then the Web IDE won't attempt to load the module and the built-in one will be used.

You can check which modules your board has just connecting to it with the Web IDE, then clicking the `Settings` icon in the Web IDE, going to `Board Information` and looking at `MODULES` (the same info is available by typing `process.env.MODULES` too).

You can find more information on most of them via [Espruino's Software Reference](/Reference)

If the Web IDE says `Module not found` when trying to upload a module that you know exists on your board, try reconnecting the IDE. If the IDE fails to communicate with the board when it first connects, it will be unable to get a list of the preinstalled modules and so will assume the module has to be downloaded (many pre-installed modules do not have downloadable equivalents).

### Espruino Modules

If you are using the Web IDE or command-line tools as is, the modules will be loaded from [http://www.espruino.com/modules/](http://www.espruino.com/modules/) (which is a curated set of modules in https://github.com/espruino/EspruinoDocs). This URL can be changed in Web IDE settings.

To save space, most modules are provided as a minified version and the Web IDE tries to load minified versions first with default configuration (this can be changed in `Settings -> Communications -> Module Extensions`).

For example, using ```require("ADNS5050");``` will make the Web IDE load the minified module from [http://www.espruino.com/modules/ADNS5050.min.js](http://www.espruino.com/modules/ADNS5050.min.js).

If you need to use modules while not connected to the internet, `Settings -> Offline Mode` allows you to download all available modules for offline use.

### from Github (or anywhere on the internet)

You can type a URL into require, so you can actually just pull a module right off GitHub:

```
require("https://github.com/espruino/EspruinoDocs/blob/master/devices/PCD8544.js");
```

You can even look at the history of something on GitHub, and can then require a specific version of that file with:

```
require("https://github.com/espruino/EspruinoDocs/blob/d4996cb3179abe260c030ed02bcb0d2384db6bbd/devices/PCD8544.js");
```

The URL comes from clicking ```<>``` by the commit you were interested in in GitHub.

**Note:** You can use any URL, however because the Web IDE runs in a browser, the server that you access files from must have [Cross Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) headers enabled.

### from Storage

On Espruino `2v00` and above on devices with enough memory you can write a
module to Espruino's flash memory using the built-in [`Storage`](http://www.espruino.com/Reference#Storage) module. It'll then be loaded automatically by Espruino:

```
require("Storage").write("answer",`
exports.get = function() {
  return 42;
};`)
print(require("answer").get());
// prints 42
```

**Note:**

* Modules written to Espruino's flash memory can only have names that are a maximum of 8 characters long.
* If you are adding a module using a Templated String (as in the example above) be aware that **escape characters inside strings need double-escaping** - eg. `"\n"` must become `"\\n"`. To avoid doing this manually you can use the [Espruino File Converter](https://www.espruino.com/File+Converter) page.
* The Espruino Web IDE and Command-line tools will be unaware of extra modules in Storage. When uploading code they may attempt to find the module online and re-upload it, or complain that the module is not found. Make sure there isn't a module of the same name in http://www.espruino.com/modules/


### from NPM

There was a beta option in Web IDE to load modules from the NPM repository. After some testing it was removed (The vast majority of NPM modules are just too large to fit in a microcontroller with their dependencies).

If you require NPM modules we'd recommend that you use a tree-shaking/bundling
system like [`rollup`](https://rollupjs.org) to bundle your NPM modules into one
file, and then use the [Espruino command-line tools](https://www.npmjs.com/package/espruino)
to upload it.

### from a local folder

If you set a project folder with `Web IDE -> Settings -> Project`, the Web IDE will automatically create an empty `modules` folder inside it. Put a module there and you can load it with ```require("myCustomModule");```.

**Note:** This feature is not currently implemented in the 'Web App' IDE available at https://www.espruino.com/ide/. You'll need to use the [Chrome Web Store / Native versions](http://www.espruino.com/Web+IDE)

With default Web IDE configuration, it will look for modules following this order:

1. local minified
2. online minified
3. local normal
4. online normal

If your own module has the same name as one of the existing ones, the Web IDE will use the minified version from online first.

If you need it anyway, you can provide a local minified version or you can change the Web IDE configuration from ```.min.js|.js``` to ```.js|.min.js``` or even ```myCustomModule.js|.min.js|.js``` to get it working.

**Note:** When the Web IDE is running in the browser it cannot access any
folders on your local computer, so the `Projects` functionality is disabled.

### from SD card

If you have an Espruino with an SD card (but you're not using the Web IDE), you can copy the modules you need into a directory called 'node_modules' on the SD card. Now, whenever you write ``` require("modulename") ``` the module will be used.

If you don't have an SD card, see `Modules from Storage` above.

### from the Internet

The Web IDE or command-line tools will load modules from the internet automatically when you upload - see `Espruino modules` above.

However an Internet-connected Espruino device can't automatically load a modules from the internet by itself because `require` is synchronous while network connections are asynchronous.

However you can use the following asyncronous code to load a module from the internet on demand.

```
function loadModule(moduleName, callback) {
  require("http").get("http://www.espruino.com/modules/"+moduleName+".min.js", function(res) {
    var contents = "";
    res.on('data', function(data) { contents += data; });
    res.on('close', function() {
      Modules.addCached(moduleName, contents);
      if (callback) callback();
    });
  }).on('error', function(e) {
    console.log("ERROR", e);
  });
}

// for example:
loadModule("PCD8544", function() { // loads PCD8544.min.js
  SPI1.setup({ sck:B3, mosi:B5 });
  var g = require("PCD8544").connect(SPI1, B6 /*DC*/, B7 /*CE*/, B8 /*RST*/, function() {
    ...
  });
});
```


Existing Modules
----------------

These are the existing modules that are available for download to Espruino:

* APPEND_KEYWORD: Module,-Built-In

### Built-in Functionality

Espruino also contains many built-in modules and classes that provide a lot of functionality - these are some of them:

* APPEND_KEYWORD: Built-In

You don't need a module to be able to interface to hardware - sometimes it just makes it easier. If you want to interface to a device that isn't listed here, please check out the [[Tutorials]] page, or [[Search]] for it.


Frequently Asked Questions
--------------------------

### <a name="repl"></a>Why don't modules work when typing `require` on the left-hand side of the Web IDE (or from a terminal window)?

When you type ```require("modulename")``` on the right-hand side and click *Send to Espruino*, the Espruino Web IDE scans your code for `require` statements and loads the relevant modules off the internet. Because the left-hand side of the Web IDE (or a terminal window) sends each character direct to Espruino, by the time you have pressed enter to execute your command, it's then too late to load the module.

Instead, Espruino defaults to what is mentioned under the **Stand-alone Espruino** heading above - it looks on an SD card (if inserted) for the module. This is why you might get a `ERROR: Unable to read file : NOT_READY` error written to the console.

### If I load modules from an SD card, will the SD card always need to be inserted?

No. As long as you have used `require('module')` at least once for each module before you type `save()`, all the information that is needed will be cached inside Espruino.

### Can I dynamically load (and unload) modules?

Yes. By default each module that is loaded will be cached (to avoid loading modules twice). However you can call [`Modules.removeCached('modulename')`](/Reference#l_Modules_removeCached) which will remove the module from the cache and free the memory that it uses.

### How do I make my own modules?

It's easy! See the [[Writing Modules]] page...
