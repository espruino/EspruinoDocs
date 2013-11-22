<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Modules
=======

* KEYWORDS: Modules,Libraries

In Espruino, Modules are bits of pre-written code (libraries) that perform common tasks, such as interfacing to different bits of hardware.

They can currently be used in a few different ways:

Espruino Web IDE
--------------

If you're using the Espruino Web IDE, simply write ```require("modulename")``` - as you would have seen in the reference pages on espruino.com. When you click the *Send to Espruino* button, the Web IDE will automatically look online for minified versions of the modules you need, download them, and load them onto the board. You don't need an SD card or an internet connection to the Espruino board itself.

Stand-alone Espruino
------------------

If you have an Espruino with an SD card (but you're not using the Web IDE), you can copy the modules you need into a directory called 'node_modules' on the SD card. Now, whenever you write ``` require('modulename') ``` the module will be used.

WiFi-enabled Espruino
------------------

**We're working on this - but soon:** If you have a WiFi-enabled Espruino and it is connected to the internet, ```writing require('mymodule')``` will cause it to look on the internet for the module with the name you have given.

Existing Modules
--------------

* APPEND_KEYWORD: Module
