<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Modules
=======

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Modules. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Modules,Libraries

In Espruino, Modules are pieces of pre-written code (libraries) that perform common tasks, such as interfacing to different bits of hardware.

They can currently be used in a few different ways:

Working with Modules
--------------------

### Espruino Web IDE

If you're using the Espruino Web IDE, simply write ```require("modulename")``` on the right-hand side - as you would have seen in the reference pages. When you click the *Send to Espruino* button, the Web IDE will automatically look online for minified versions of the modules you need, download them, and load them onto the board. You don't need an SD card or an internet connection to the Espruino board itself.

#### Load Module - the default mechanism

If you are using the Web IDE as is, the modules will be loaded from [http://www.espruino.com/modules/](http://www.espruino.com/modules/). This URL can be changed in Web IDE settings.

To save space, most modules are provided as a minified version and the Web IDE tries to load minified versions first with default configuration.

For example, using ```require("ADNS5050");``` will make the Web IDE loading the minified module from [http://www.espruino.com/modules/ADNS5050.min.js](http://www.espruino.com/modules/ADNS5050.min.js).

#### Load Module from Github

For now, as you can type a URL into require, you can actually just pull a module right off GitHub:

```
require("https://github.com/espruino/EspruinoDocs/blob/master/devices/PCD8544.js");
```

You can even look at the history of something on GitHub, and can then require a specific version of that file with:

```
require("https://github.com/espruino/EspruinoDocs/blob/d4996cb3179abe260c030ed02bcb0d2384db6bbd/devices/PCD8544.js");
```

The URL comes from clicking ```<>``` by the commit you were interested in.

#### Load Module from NPM

Earlier there was a beta option in Web IDE to load modules from the NPM repository. After some testing it was removed.

#### Load Module from local folder

If you are using a local project folder, the Web IDE will automatically create an empty modules folder inside. Put a module there and you can load it with ```require("myCustomModule");```.

With default Web IDE configuration, it will look for modules following this order:

1. local minified
2. online minified
3. local normal
4. online normal

If your own module has the same name as one of the existing ones, the Web IDE will use the minified version from online first.

If you need it anyway, you can provide a local minified version or you can change the Web IDE configuration from ```.min.js|.js``` to ```.js|.min.js``` or even ```myCustomModule.js|.min.js|.js``` to get it working.

### Stand-alone Espruino

If you have an Espruino with an SD card (but you're not using the Web IDE), you can copy the modules you need into a directory called 'node_modules' on the SD card. Now, whenever you write ``` require("modulename") ``` the module will be used.

### Internet-enabled Espruino

Right now there isn't a way to make Espruino automatically load a module from the internet when required without the Web IDE. This may be added in the future, but the fact that `require` is synchronous while network connections are asynchronous makes this difficult to do reliably until `yield` is added into the interpreter.

Until then, the following asyncronous code will dynamically load a module from the internet on demand.

```
function loadModule(moduleName, callback) {
  require("http").get("http://www.espruino.com/modules/"+moduleName+".js", function(res) {
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
```


Existing Modules
----------------

* APPEND_KEYWORD: Module

### Built-in Functionality

Espruino also contains many built-in modules and classes that provide a lot of functionality:

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
