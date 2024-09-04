<!--- Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Debugging Tips
===============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Debugger. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Debug,Debugger,Debugging,Finding Problems

This page describes tips for debugging code written for Espruino - you might also want to check out:

* The [Debugger page](/Debugger) for information on Espruino's built-in code debugger.
* [Advanced Debug (SWD)](/AdvancedDebug) for information on debugging and developing with the Espruino interpreter itself (using a hardware debugger)


Contents
--------

* APPEND_TOC


General
--------

Espruino's IDE has two panes, the right code pane, and the left REPL page which communicates directly with Espruino. When your code is running
you can still interact with the interpreter to query what the value of variables are or even change code:

For example if you have the code:

```
var count = 0;

function test() {
  count++;
}

setInterval(test, 1000);
```

You can upload this, and can:

* type just `i` in the left of the IDE to find out what `i` is set to.
* Set its value with `i=5`.
* Overwrite the `test` function by typing `function test() { count+=2; }` or similar
* For bigger functions, type `edit(test)` to bring up the whole function on the input line and allow you to edit it
* Use the up and down arrow keys to cycle through previously executed commands

**Note:** Bangle.js apps (particularly clocks) have all the code inside `{ ... }` and use `let/const` to define vars, which means none of their code or variables is defined at the global scope and is easy to free (for [fast load](/Bangle.js+Fast+Load)). When debugging you may want to remove those outer brackets so you can actually check the contents of those variables (and run the functions) from the REPL as above.

Espruino has a built-in line-by-line debugger that can be triggered by adding the `debugger` keyword in your code, and is also accessed from the REPL. More info on the [Debugger page](/Debugger)


Debugging when not connected
----------------------------

Often you may encounter an issue where you device stops working after hours or days of use, where it's not practical to keep it connected to a computer.

In these cases you can log any data that gets printed (including exceptions) to a variable:

```
var log="";
LoopbackB.on('data',d=>log+=d);
// On Bluetooth devices, use:
NRF.on('disconnect', function() { LoopbackA.setConsole(); });
```

On Bluetooth devices you can hook onto the 'disconnected' event and can call `LoopbackA.setConsole();` but on other devices you will need to do it manually (for instance in `onInit()`).

You can then connect, and call `print(log)` to see what was output while you were disconnected - which will include any exceptions with stack traces.

**Note:** Since we're just adding to a variable, repeated console output will increase the size of the variable until you run out of memory - so for anything more than simple debugging you may want to modify `LoopbackB.on('data', ...)` to limit the size of `log`.

You can also just log exceptions, for example:

```
var lastError;
process.on('uncaughtException', function(e) {
  lastError=e;
  print(e,e.stack?"\n"+e.stack:"")
});

function checkError() {
  if (!lastError) return print("No Error");
  print(lastError,lastError.stack?"\n"+lastError.stack:"")
}
```

You can now connect and call `checkError()` to see if there was an error, including the stack trace.

**Note:** Adding an `uncaughtException` handler will stop Espruino reporting exceptions to the console, which is why we've added the `print` in the handler.


Where was a function called?
------------------------------

Sometimes you might have some code that calls a function, and you need to find out where/when the function was called.

In that case you can replace the function with one that throws an Error instead:

```JS
foo = function() { throw new Error("Foo was called here"); }
```

When the function is called, a stack trace will then be printed to the console.

**Note:** if you want to override built-in global functions you'll need to use (for example) `global.print = ...;` and not `print = ....;`

You can also just add the `debugger` keyword with `foo = function() { debugger }` and Espruino will jump into debug mode, allowing you to step out/through the code at the point that the function was executed (see the [Debugger page](/Debugger)).


How often or with what arguments is a function called?
----------------------------------------------------------

Sometimes you might want to print something when a function is called, or know what arguments it was called with. In this case you can just replace the function with a new one, which still calls the old one but prints extra information:

```JS
(function(old) {
  functionToCheck = function(arg1,arg2) {
    console.log("Function was called with ",arg1,arg2);
    return old(arg1,arg2);
  };
}(functionToCheck);
```

**Note:** if you want to override built-in global functions you'll need to use (for example) `global.print = ...;` and not `print = ....;`


Where was a variable written?
-------------------------------

Do you have a variable that's been written, but you don't know where from? You can redefine it as a setter which throws an error, and it will then create a stack trace next time it is set. In this example we're testing `width` on the `global` object.

```JS
Object.defineProperty(global, "width", { set: () => { throw new Error("tried to set width"); } })
```


Crashes
-------------

If some code crashes or misbehaves, make sure you try running it when connected to the Web IDE. Often an error will produce a stack trace on the IDE's console that will point you to the exact error. If the line numbers aren't correct try disabling pretokenisation and minification in the App Loader/Web IDE and re-upload to ensure that the code on the device is exactly the same as your code.

On Bangle.js if the crash is happening when you can't be connected to the IDE you can also set `Settings -> Utils -> Debug` to `Log`, and you can then connect with the IDE at a later time and load the file `log.txt` from the `Storage` menu.

If you're using Espruino (not Bangle.js) there are [some examples of saving errors that occur when you're not connected here](#debugging-when-not-connected)


Memory usage
-------------

Espruino stores normal arrays as 'sparse' arrays - so each entry uses one variable. If you want to store any more than 20 items in an array, consider using types arrays like `Uint8Array` - they use less memory and are faster [more info here](/Performance#espruino-stores-normal-arrays-and-objects-in-linked-lists)


Checking for memory leaks
------------------------------

If you type `process.memory().usage` on the console it'll show you how many JS variables are used. The first time you run it it'll add one variable's worth of memory usage (as `process` gets allocated), but ideally in most code if check memory usage every so often, the value you get shouldn't keep rising.

On Bangle.js, many clocks have a `draw()` function and you can call that function manually and then call `process.memory().usage` and see if memory goes up. You can sometimes narrow it down to some other function that when called increases memory usage.


Tracking down memory usage/leaks
------------------------------------

You can use `E.getSizeOf(global,1)` which will return an array of all the contents of the `global` object and how big they are (however the `size` values can sometimes be confusing as objects often end up interlinked). You can then try and recreate the memory leak and run `E.getSizeOf(global,1)` again, and can compare to see if one of the `size`s has got bigger. You can narrow it down by specifying what you're interested in instead of just `global`, or can specify `E.getSizeOf(global,2)` to provide a multi-level array that digs down further into the structures.

**Advanced:** you can dump all variables, one per line with `E.dumpVariables` (you may have to enable logging in the IDE to capture all the lines). It's then possible to compare the two dumps with a `diff` tool to see if there are any new variables defined. Tracking down what a variable corresponds to get be tricky.

You can also use [EspruinoMemView](https://github.com/espruino/EspruinoMemView) - this is a web app that connects to your device, calls `E.dumpVariables` and shows you the contents of memory in a graphical format. It can help you find areas of your code where a lot of memory is used (they appear as big circles of points).


Memory leaks during 'fast load' (on Bangle.js)
--------------------------------------------------

There are some good examples of testing on [the Bangle.js fast load page](/Bangle.js+Fast+Load#testing-afterwards)

After you've unloaded an app, you can run `dump()` which attempts to dump the contents of RAM in a human readable form - you may be able to see some variables/functions defined there that look like they shouldn't be. It may help to uninstall all widgets first to ensure that they're not making it harder to find the real source of memory usage.


Low Level
----------

Espruino stores a bunch of internal state in a 'hidden' variable in the root scope. You can access it with `global["\xFF"]`

Some useful fields are:

* `global["\xFF"].timers` is a list of all active timers/intervals set with `setInterval/setTimeout`.
  * `callback/cb` is the function that'll be called when the timeout expires
  * `time` is the time until it fires (in system 'ticks' - 1/1024*1024 on nRF52 builds)
  * `interval/int` (if set) means it's an interval, and is the time for each repetition
* `global["\xFF"].watches` is a list of all active watches from `setWatch`
* `global["\xFF"].modules` is an object showing all loaded modules


Debugging JIT Code
--------------------

The [JIT compiler](https://www.espruino.com/JIT) is still quite a recent development, and so may have issues.

For debugging JIT code we'd suggest first removing the `"jit"` keyword and checking if the function works. If it does, then try removing code from the JIT function until you have a very small snippet you can reproduce the problem with. You can then either change that part of your code or ideally submit a bug report with it.


