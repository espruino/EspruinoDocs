<!--- Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Espruino Debugger
===============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Debugger. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Debug,Debugger,Debugging,Finding Problems

This page describes the built-in debugger. You might also want to check out:

* [Debugging Tips](/Debugging) for more general information on debugging code in Espruino.
* [Advanced Debug (SWD)](/AdvancedDebug) for information on debugging and developing with the Espruino interpreter itself (using a hardware debugger)

[[http://youtu.be/2ODoIpnTDA4]]

As of Espruino 1v81, there is now a built-in text mode debugger, which allows you to step through your code line by line. The commands used are almost identical to those in GDB.

**Note:** If you have a board with very little flash memory (128kB or less) the debugger may not be included in your build. However it *is* available for all official Espruino boards.


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

You can then connect, and call `print(log)` to see what was output while you were disconnected - will will include any exceptions with stack traces.

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


Entering the debugger
-------------------

If your program has actually hung (isn't returning to the prompt) then you can press `Ctrl-C` in order to enter debug mode. Otherwise, to force a breakpoint you need to add the text `debugger` where you want a breakpoint to occur:

```
function bar(one) {
  return one+" ";
}

function foo(one, two) {
  return one+two;
}

function hello() {
  var a = "Hello";
  var b = "World";
  console.log(1);
  debugger;
  console.log(2);
  foo(bar(a),b);
  console.log(3);
}
```

When you then run `hello()`, you'll enter debug mode at the `debugger` keyword. The terminal will now show `debug>` and you're ready to enter debugging commands.

When in debug mode type `help` for a list of what's available.

**Note:** if you want to debug a single function without modifying it, you can simply type `debugger;myfunction()` in Espruino's console.

Exiting the debugger
------------------

To exit back to the normal prompt, press `Ctrl-C` again, or type `q` or `quit`.

If you want to let your program continue running, type `c` or `continue`.


Using the debugger
----------------

When in debug mode, you'll see the current statement pointed to with an arrow. For instance use the code snippet above, and you'll see:

```
>hello()
1
  debugger;
  ^
debug>
```

You'll notice that `console.log(1);` was already executed, because that's above the `debugger` keyword.

Now, you can do some debugging. Type `info locals` (or `i l` for short) - this will show you the values of any local variables:

```
debug>info locals
Locals:
--------------------------------
 a                    : "Hello"
 b                    : "World"
```

But perhaps you want to find the value of just one variable? No problem - you can type `print a` (or `p a`) to print the value of a:

```
debug>print a
="Hello"
```

What you type on the end of `print` can actually be an expression, so you can change the value of a variable:

```
debug>print a="Goodbye"
="Goodbye"
debug>info locals
Locals:
--------------------------------
 a                    : "Goodbye"
 b                    : "World"
```

And now, you can step through the code. Type `next` (or `n`) to go to the next statement, or `step` (or `s`) to step into a function call.

Using `next`:

```
debug>n
  console.log(2);
  ^
debug>n
2
  foo(bar(a),b);
  ^
debug>n
  console.log(3);
  ^
debug>n
3
Value returned is =undefined
=undefined
>
```

Or using `step`, you step inside the functions `bar` and `foo`:

```
debug>s
  console.log(2);
  ^
debug>s
2
  foo(bar(a),b);
  ^
debug>s
Stepping into bar
  return one+" ";
  ^
debug>s
Value returned is ="Goodbye "
Stepping into foo
  return one+two;
  ^
debug>
```

You can also type `finish` (or `f`) to run to the end of the function `foo`, and the return value will be displayed.

```
debug>finish
Value returned is ="GoodbyeWorld"
}
^
```

Finally, if you type `continue` or `c` then the debugger will exit and the program will resume as normal:

```
debug>c
3
=undefined
>
```

Conditional Breakpoints
---------------------

If you want to break into the debugger only when something happens, you can call `debugger` from inside an `if` statement:

```
for (var i=0;i<10;i++) {
  console.log(i);
  if (i==5) debugger;
}
```

This will enter the debugger only when `i` is 5.

