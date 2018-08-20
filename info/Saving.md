<!--- Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Saving code on Espruino
========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Saving. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Built-In,Save,saving,write,flash,flashing,save(),load,non-volatile,onInit,upload,uploading

When you upload code to Espruino normally, it is stored in Espruino's RAM.
If you reset the board or power is lost, all your code will be lost.

However it's easy to save your code to flash memory and make it permanent.
There are two main ways to do it with Espruino.

`save()`
--------

If you type `save()` on the left-hand side of the IDE after your code is
uploaded, the contents of Espruino's RAM at that point will be compressed
and written in to flash memory.

This includes:

* All variables and functions
* Any watches created with `setWatch`
* Timeouts and intervals created with `setTimeout` and `setInterval`
* All Pin states

When power is next applied, Espruino will load the information back out of
flash and will resume where it left off. You can think of this a bit like
'hibernate' on a PC.

This is the standard way of saving code in Espruino, and it means that
you can interact with your code on the left-hand side of the IDE, changing
variables and functions, and can then save everything - including your changes.

For instance, if you upload the code `var t = E.getTemperature()` and type
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

Once code is saved, you can return the interpreter to a 'clean' state
with `reset()`. This won't clear out any of the saved data in flash, so
if you reboot the device (or call `load()`) it will re-load your previously
saved state. To completely clear out  saved code, run `reset()` and *then*
run `save()` to save the clean state back into flash memory.

### Pros

* Once you have your software working, you can just `save()` and it will keep working
* You can make changes to `save()`d code and can then type `save()` again to save your changes
* JS code isn't stored in flash as plain text, so is harder for a malicious user to extract
* `E.setFlags({pretokenise:1})` will allow JavaScript code in RAM to be heavily compacted, and to execute more quickly.

### Cons

* Not as memory efficient since everything is stored in RAM
* Some formatting of the code inside functions may change, and comments outside functions won't be saved
* Any code that has to be run at startup needs to be placed in a function called `onInit`, or a `E.on('init', function() { ... })` event handler

### Gotchas

* Unless you use  `onInit` or `E.on('init', ...)`, code won't run at boot time.
* Since `setWatch` and `setInterval` are remembered, if you call them in `onInit` and then `save()` multiple times, you can end up with multiple copies. You can use `clearInterval()` and `clearWatch()` to avoid that.
* When uploading code with an `onInit()` or `E.on('init', ...)` function the function won't be called at upload time and to test you'll have to either `save()` or call `onInit()` manually.


Save on Send
------------

`Save on Send` is an option in the Espruino IDE. Behind the scenes it uses
the `E.setBootCode` command to save JS code directly into Espruino's
flash memory. When Espruino boots up, it then executes the JavaScript code.

This is similar to the way you'd program a 'normal' microcontroller.

For instance, if you upload the code `var t = E.getTemperature()` with
`Save on Send` enabled, `t` will be set to the temperature every time
the device is powered on (in contrast to what happens when you use `save()`.

`Save on Send` (in the Communications section of the IDE) has three settings:

* `No` - code is uploaded to RAM, but can be saved with `save()` (as above)
* `Yes` - JavaScript code is saved to flash and loaded even after boot.
If `reset()` is called, Espruino will remove all code from RAM and will
not execute the saved JS code.
* `Yes, execute even after reset()` - JavaScript code is saved to flash and
loaded even after boot. If `reset()` is called, Espruino will remove all
`save()`d code from RAM, but will still execute the JS code that you saved. See
the 'Both Options' section.

To remove any code saved with `Save on Send`, simply call `E.setBootCode()` with
no arguments.

### Pros

* Runs all code at boot-time, so there's no need for an `onInit()` function
* The code inside each function is kept in Flash memory, so doesn't use up
as much RAM. This is also true for Modules if `Modules uploaded as functions`
is enabled in the IDE.

### Cons

* Your JavaScript code is stored in flash as plain text, so can easily be read out
* If you make changes using the left-hand side of the IDE, there is no way to save them
* `E.setFlags({pretokenise:1})` will have no effect, since a function's code will be kept in Flash
* It isn't possible to run code at upload time - code only ever runs when the device powers on.

### Gotchas

* If you turn on `Save on Send`, upload code, and then turn it off, you can be left
with both bits of code in Espruino at the same time (see 'Both Options' below).


Both options
------------

It is possible to combine `Save on Send` and `save()`. In this case, the contents
of RAM will be loaded from Flash, then the code saved with `Save on Send` will
be executed, and finally `onInit()` and `E.on('init', ...)` will be called.

This allows you to write separate code with `Save on Send` that can ensure
certain things are always done, regardless of the code saved with `save()`.

For instance if you're making a device like [the Espruino Home Computer](/Espruino+Home+Computer)
then you might want to use `Save on send` to save all the code that initialises
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
