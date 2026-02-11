<!--- Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Saving code on Espruino
========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Saving. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Built-In,Save,saving,write,flash,flashing,save(),load,non-volatile,onInit,upload,uploading,tutorials

Normally when you upload code to Espruino via the IDE (Upload set to `RAM`), it is stored in Espruino's RAM.
If you reset the board or power is lost, all your code will be lost.

However it's easy to save your code to flash memory and make it permanent.

Summary
--------

In Espruino there are two distinct ways of saving code, which you can swap between using the down-arrow
below the Upload icon in the IDE, or under `Communications` in the `Settings` window.

* **Saving source code** (`Flash`/`Storage`) - (best if using an editor) the source code is uploaded to Flash, and then Espruino is restarted and the code executed on one go after.
* **Saving current state** (`RAM` + `save()`) - (best if building iteratively using the REPL) the code is executed as it is sent to the device. You can then
modify the code and variables in the REPL on the left of the IDE and when you type `save()`, the *current state of the interpreter* is saved to flash memory.

There are pros and cons to each - see below:

Saving source code (`Flash`/`Storage`)
-----------------------------------

When saving to `Flash` or `Storage` in the Espruino IDE, the code is sent directly to the device's
flash memory. When Espruino boots up, it then executes the JavaScript code from Flash.

This is similar to the way you'd program a 'normal' microcontroller, and is best for bigger projects
where you expect to keep a copy of your code on your PC and edit code in the editor rather than the REPL.

If you upload the code `var t = E.getTemperature()` with the IDE set to `Flash`, `t` will be set to the
temperature every time the device is powered on - in contrast to what happens when you use `save()` (below).

There are two different options:

* `Flash` - code is saved to a file [in Storage](https://www.espruino.com/Reference#Storage) called `.bootcde` that is run automatically at boot (don't use this on [Bangle.js](/Bangle.js2)).
* `Storage` - code is saved to a file name that you get to choose. You can then use
`load(filename)` to force Espruino to reboot and load the file you've given. You may also choose
to write to other files like `.bootrst`/`.boot0`/etc which are executed at certain times (see `Boot Process` below)

### Pros

* Runs all code at boot-time, so there's no need for an `onInit()` function
* The code inside each function is kept in Flash memory, so doesn't use up
as much RAM. This is also true for Modules if `Modules uploaded as functions`
is enabled in the IDE (the default).
* With 'pretokenisation' enabled, Strings and base64 text stay stored in flash
and don't take up RAM when referenced.
* An exact copy of the original code is stored on the device and can be loaded using the IDE
* You can write to different files and use `load(filename)` to load different 'applications'

### Cons

* Your JavaScript code is stored in flash as plain text, so can easily be read out (unless minified/pretokenised)
* If you make changes using the REPL on the left-hand side of the IDE, there is no way to save them
* `E.setFlags({pretokenise:1})` will have no effect, since a function's code will be kept in Flash (you can still add `"ram"` as the first item in a function to force it to be loaded into RAM and pretokenised)
* It isn't possible to run code at upload time - code only ever runs when the device powers on.
* needs the IDE or other tools to write the code to the device

### Gotchas

* If you call `save()` after having saved to flash using a method below, you may
get `Got EOF expected ..., [ERASED]` errors. These happen because there were
function definitions in RAM that referenced code in Flash that is no longer
there.


Saving current state (`RAM` + `save()`)
---------------------------------

If you type `save()` on the left-hand side of the IDE after your code is
uploaded (IDE upload set to `RAM`), the contents of Espruino's RAM at that
point will be compressed and written in to flash memory.

This includes:

* All variables and functions
* Any watches created with `setWatch`
* Timeouts and intervals created with `setTimeout` and `setInterval`
* All Pin states

When power is next applied, Espruino will load the information back out of
flash and will resume where it left off. You can think of this a bit like
'hibernate' on a PC.

This means that you can interact with your code on the left-hand side of the IDE,
changing variables and functions, and can then save everything at any point - including your changes.
This is best for smaller projects where you plan to make a bunch of changes with the REPL while the code is running.

If you upload the code `var t = E.getTemperature()` and type
`save()`, `t` will contain the temperature of the device *at the time that
you uploaded* - **not** at the time the device started, or even the time you
typed `save()`.

However, this means that any code that was executed at upload time will not
be re-executed. For instance you may have some external hardware like an LCD
display connected to Espruino - after applying power, the LCD will need to be
initialised (since it can not remember its state). In this case you can
create a function called `onInit` (or add a `E.on('init', function() { ... })`
listener) that is automatically called by the interpreter when it
initialises.

**Note:** `save()` is not available for [Bangle.js](/Bangle.js2) as the Bangle
needs to be able to run multiple different apps (so all code is saved to Storage)

### Pros

* Once you have your software working, you can just `save()` and it will keep working
* You can make changes to `save()`d code and can then type `save()` again to save your changes
* `dump()` can output the current state of the interpreter as JavaScript (including any changes you made)
* `E.setFlags({pretokenise:1})` will allow JavaScript code in RAM to be heavily compacted, and to execute more quickly.
* You can use `save()` with a simple serial console (no IDE or tools required)

### Cons

* Not as memory efficient since everything is stored in RAM
* Some formatting of the code inside functions may change, and comments outside functions won't be saved
* Any code that has to be run at startup needs to be placed in a function called `onInit`, or a `E.on('init', function() { ... })` event handler

### Gotchas

* Unless you use  `onInit` or `E.on('init', ...)`, code won't run at boot time.
* Since `setWatch` and `setInterval` are remembered, if you call them in `onInit` and then `save()` multiple times, you can end up with multiple copies. You can use `clearInterval()` and `clearWatch()` in `onInit` to avoid that.
* When uploading code with an `onInit()` or `E.on('init', ...)` function the function won't be called at upload time and to test you'll have to either `save()` or call `onInit()` manually.
* Code is executed at boot time, so code that takes a long time to execute can cause upload problems.


Controlling saved code
-------------------------

* `reset()` will reset Espruino, will remove all code from RAM and will not execute the saved JS code.
* `reset(1)` will reset Espruino and remove any saved code
* `E.setBootCode()` will remove any saved code, but won't reset Espruino
* `load()` will reset Espruino and will load any saved code
* `load(filename)` will reset Espruino and load JS code saved to a named file in Storage
* `dump()` will try and output the current state of the interpreter in human-readable JS, as well as the contents of `.bootcde` if it exists



Boot Process
------------

To understand how best to save data, it's best to know how Espruino loads saved code.

When Espruino starts up, it does a few things:

* If `BTN1` is pressed or if it reset because of a call to `reset()`, it sets `hasBeenReset` to `true`.
* If `hasBeenReset` wasn't set, it looks for a compressed image (`.varimg` [in Storage](https://www.espruino.com/Reference#Storage)) of the interpreter's state that was saved with `save()`. If it exists it unpacks it into RAM.
* (2v19 and later) If this is the first boot right after power on, executes `.bootPowerOn` [from Storage](https://www.espruino.com/Reference#Storage). (On [Bangle.js](/Bangle.js) this is *not* executed if `BTN1` is held down, but all other devices execute them each time)
* (2v00 and later) Looks for files [in Storage](https://www.espruino.com/Reference#Storage) named `.boot0`, `.boot1`, `.boot2` and `.boot3` and executes them in sequence. (On [Bangle.js](/Bangle.js) these are *not* executed if `BTN1` is held down, but all other devices execute them each time)
* Looks [in Storage](https://www.espruino.com/Reference#Storage) for a file named `.bootrst` and executes it if it exists (see [Save on Send](#save-on-send) below)
* If `hasBeenReset` **wasn't** set and `.bootrst` wasn't found in the last step, it looks [in Storage](https://www.espruino.com/Reference#Storage) for a file named `.bootcde` and executes it (see [Save on Send](#save-on-send) below)
* Initialises any previously-initialised peripherals
* Runs any handlers registered with `E.on('init', function() { ... });`
* Runs a function called `onInit()` if it exists.

If Espruino is reset with `load()` it follows the same steps as above, with `hasBeenReset` to `false`.
However in Espruino 2v05 and later, `load(filename)` will follow the same steps but will load the
specified file instead of `.bootcde`/`.bootrst`.


Combining options
-----------------

It is possible to combine saving code to flash and `save()` - see [Boot Process](#boot-process)
above for more information.

This allows you to write separate code that can ensure certain things are always done, regardless of the code saved with `save()`.

You can even add files called `.boot0`, `.boot1`, `.boot2` and `.boot3` to
add extra code that doesn't interfere with code saved in other ways. You
could for instance add the following code:

```
require("Storage").write(".boot0", `
WIFI_NAME = "MyWiFi";
WIFI_PASS = "HelloWorld123";
`);
```

To ensure that you always had the variables `WIFI_NAME` and `WIFI_PASS`
defined regardless of what other code you uploaded.

For instance if you're making a device like [the Espruino Home Computer](/Espruino+Home+Computer)
then you might want to use `Save on send` or `.boot0` to save all the code that initialises
the display and keyboard. The computer can then be programmed and its state
saved with `save()`, but regardless of what is saved to the device you will
always be able to rely on the display and keyboard being set up correctly.


Notes
------

You may be able to save code to Espruino that puts it into a state that
stops you from reprogramming it. On most boards, holding down a button while
applying power can be used to force the device to boot *without loading any
of the saved code*. Take a look at the information page on your specific
board for more information.
