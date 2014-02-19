<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Modules
=======

* KEYWORDS: Modules,Libraries

In Espruino, Modules are bits of pre-written code (libraries) that perform common tasks, such as interfacing to different bits of hardware.

They can currently be used in a few different ways:

Espruino Web IDE
--------------

If you're using the Espruino Web IDE, simply write ```require("modulename")``` on the right-hand side - as you would have seen in the reference pages on espruino.com. When you click the *Send to Espruino* button, the Web IDE will automatically look online for minified versions of the modules you need, download them, and load them onto the board. You don't need an SD card or an internet connection to the Espruino board itself.

Stand-alone Espruino
------------------

If you have an Espruino with an SD card (but you're not using the Web IDE), you can copy the modules you need into a directory called 'node_modules' on the SD card. Now, whenever you write ``` require("modulename") ``` the module will be used.

WiFi-enabled Espruino
------------------

**We're working on this - but soon:** If you have a WiFi-enabled Espruino and it is connected to the internet, writing ```require("mymodule")``` will cause it to look on the internet for the module with the name you have given.

Existing Modules
--------------

* APPEND_KEYWORD: Module

Frequently Asked Questions
-----------------------

* <a name="repl"></a>Why don't modules work when typing `require` on the left-hand side of the Web IDE (or from a terminal window)?

When you type ```require("modulename")``` on the right-hand side and click *Send to Espruino*, the Espruino Web IDE scans your code for `require` statements and loads the relevant modules off the internet. Because the left-hand side of the Web IDE (or a terminal window) sends each character direct to Espruino, by the time you have pressed enter to exeture your command, it's then too late to load the module.

Instead, Espruino defaults to what is mentioned under the **Stand-alone Espruino** heading above - it looks on an SD card (if inserted) for the module. This is why you might get a `ERROR: Unable to read file : NOT_READY` error written to the console.
