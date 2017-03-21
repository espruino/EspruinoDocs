<!--- Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Espruino Notes
============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Notes**. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub.</span>

* KEYWORDS: Web IDE,Execution,onInit,init,Modules,Coding Style

What follows is a list of things that you might find useful as you start out with Espruino.


## What are the two panes of the Web IDE for?

The left-hand side is a simple terminal. When Espruino is plugged in, you are communicating directly with it. You can write expressions, create and read variables, and even write and execute code while your program is running. When you type enter after writing an expression, it is executed immediately. If you want to clear what you wrote, or break out of a running function, press `Ctrl+C`.

The right-hand side is a JavaScript editor. It's syntax highlighted and has code completion, but what you write is only uploaded to Espruino when you click the `Send to Espruino` button. See below:


## When is code executed?

When you write code in the right-hand pane of Espruino and click `Send to Espruino`, the code is sent to Espruino almost as if you copied and pasted it into the Left hand side pane.

This means that if you write `var a = analogRead(A0);`, the value of `a` will be set to the voltage on `A0` *at the time you uploaded your code*. It won't be updated again, even after a reboot.

When you type `save()`, a *copy of the current state of the interpreter* is saved into Flash memory, **not** a copy of the code that you originally uploaded. 

If you want to do something when Espruino reboots, add one or more event handlers for the `init` event on `E`:

```
E.on('init', function() {
  // ...
});
```

This will then be loaded every time Espruino starts up. If you create a function called `onInit`, that will be executed too:

```
function onInit() {
 // ...
}
```

But of course there can only be one `onInit` function, so if you copy and paste two bits of code with two `onInit` functions then the second function will overwrite the first.


## How do modules work?

Espruino contains a mix of built-in and dynamically loaded modules of code that can be used with the `require(...)` function. Built-in modules are documented in the [[Reference]], and can be used without any need for the Web IDE and an internet connection. However on some boards you may find that these modules are not included (as there may not be enough space).

Dynamically loaded modules are uploaded to Espruino by the Web IDE *on demand*. They are usually documented on the main Espruino site, under [[Modules]]. When you type something like `require("PCD8544")` and then click `Send to Espruino` in the Web IDE, the Web IDE scans your code for any `require` statements, and if it doesn't think they are built-in, it looks online (usually in http://www.espruino.com/modules/) to find the module (you can configure this from Settings). It then downloads the module and uploads it to Espruino just before your code.

If dynamically loaded modules can't be found by the Web IDE, nothing is uploaded to the Espruino. When Espruino encounters a `require` statement that isn't built in or wasn't pre-loaded by the Web IDE it tries to look on the SD card for the module in the `node_modules` directory. If it can't find anything there (or there's no SD card!) then it will fail.


## Coding Style

When entering code in the left-hand side of the Web IDE (Espruino's terminal), Espruino uses a simple rule to work out whether to execute the line when you press Enter: If you have as many open brackets as close brackets then the line is executed, otherwise a new line is added.

This means that the coding style given in the examples is very intentional. The following code can just be copy+pasted straight into the left-hand side of Espruino:

```
function hello() {
 // ...
}
``` 

Whereas the following cannot, because for the newline after `function` all open braces are still closed:

```
function hello()
{
 // ...
}
```

The Web IDE tries to automatically replace newline characters with Alt-Enter in code when it sends it to Espruino from the editor (so you can write in whatever coding style you want in the right-hand editor window), however we'd still recommend that you use the same coding style as the examples in case you do want to copy+paste a single function into the left-hand side for debugging.
