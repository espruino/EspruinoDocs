<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
JavaScript Compilation
===================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Compilation. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Compile,Compiler,Compilation,JIT,inline

Normally, when you upload code to Espruino it is executed straight from source - which means that your source code is on the device itself so you can edit it easily.

While this is fast enough for most things, occasionally you may need your code to run faster. Up until now you've had the option of writing [Inline Assembler](/Assembler), but now you can actually compile JavaScript directly into native code.

**Note:** This is an online service that is only provided for [official Espruino boards](/Order). It won't work on devices like ESP8266 or ESP32.


How do I use it?
---------------

Simply get your function working as you want it to, and then add the string `"compiled";` to the very front of it:

```
function foo(a,b) {
  "compiled";
  return a*53 + b*2;
}

foo(2,3);
```

You can also include loops - for instance here we're rendering the Mandelbrot fractal:

```
function f() {
  "compiled";
  var Xr = 0;
  var Xi = 0;
  var i = 0;
  var Cr=(4*x/64)-2;
  var Ci=(4*y/64)-2;
  while ((i<32) & ((Xr*Xr+Xi*Xi)<4)) {
    var t=Xr*Xr - Xi*Xi + Cr;
    Xi=2*Xr*Xi+Ci;
    Xr=t;
    i=i+1;
  }
  return i;
}

var x,y;
for (y=0;y<64;y++) {
 line="";
 for (x=0;x<64;x++) line += " *"[f()&1];
 print(line);
}
```

or you can use compiled code to speed up your IO:

```
function f(pin, val) {
  "compiled";
  /* we can assign d to a local variable so
  Espruino doesn't have to look it up by name
  each time it's called.*/
  var d = digitalWrite;
  d(pin, (val>>7)&1);
  d(pin, (val>>6)&1);
  d(pin, (val>>5)&1);
  d(pin, (val>>4)&1);
  d(pin, (val>>3)&1);
  d(pin, (val>>2)&1);
  d(pin, (val>>1)&1);
  d(pin, val&1);
}
```
If you want extremely fast IO, you can take advantage of `peek32` and `poke32` to access the registers directly - however which registers you write to depends on the chip you're running Espruino on. As of Espruino 1v81 this is a lot easier, as you can query the bit-banded address of the specific pin that you need:

```
function toggler() {
  "compiled";
  var pB2 = 0|B2.getInfo().out_addr;
  var cnt = 1000000;
  for (var i=0;i<cnt;i++) {
    poke32(pB2, 1); // on
    poke32(pB2, 0); // off
  }
}

function go() {
  pinMode(B2, "output");
  toggler();
}
```

We need to cast `B2.getInfo().out_addr` to an integer by `or`ing it with `0`, as it allows the compiler to optimise the `poke32` call.

**Note:** `in_addr` also works for the input address - see [`Pin.prototype.getInfo`](/Reference#l_Pin_getInfo)

**Note 2:** We're only setting the Output Data register, not the pin state register. This means you'll need a call to `pinMode` (or `digitalWrite`) beforehand in order to set the pin to be an output.

If you did want to access the pins directly, you still can. For example the following code will produce a roughly 8Mhz square wave on an **STM32F4** (Espruino [[Pico]]):

```
function toggler() {
  "compiled";
  // BSRR registers on STM32F4
  var GPIOA = 0x40020018;
  var GPIOB = 0x40020418;

  var PIN2 = 1 << 2;
  // toggle B2 on and off 1 million times
  var cnt = 1000000;
  for (var i=0;i<cnt;i++) {
    poke32(GPIOB, PIN2); // on
    poke32(GPIOB, PIN2 << 16); // off
  }
}
```

For what to do on an **STM32F1**, take a look at the [[Assembler]] page.

Direct access can be done with other peripherals as well - check out the reference manual for the MCU on your board for more information on which addresses to write to. The correct reference manual is linked from the [Pico Board](/Pico) and [Original Espruino Board](/EspruinoBoard) pages under the 'Information' heading.

There's a tutorial [on accessing low-level STM32 peripherals here](/STM32+Peripherals)


What Happens?
-----------

Before uploading, the Web IDE scans your code for functions with the `"compiled";` keyword. It then sends those functions to our server which parses them, converts them to C++ code, compiles that code with GCC, and sends the binary back so that it can be uploaded to Espruino as a native function.

When you run this native function, the ARM processor in Espruino executes the compiled code directly (with no interpreter in the way). You should see an increase in execution speed of at least 4x, and sometimes over 100x if your code can be executed using entirely integers.

For any variable with a type that is not obviously an integer, Maths is handled using Espruino's built-in variable type (which is significantly slower). This means you should try and use integers wherever possible for maximum speed.


Caveats
------

* Only a small subset of JavaScript is supported by the compiler.
* `Ctrl+C` and Exception handling won't work. If there's a loop in your compiled function then you'll only be able to break out of it by resetting the board.
* It's still very early days, and as such you should expect bugs. If you find any, [please let us know](https://github.com/gfwilliams/EspruinoCompiler/issues) with the smallest bit of sample code you can get that reproduces the problem.
* No source code for the function is stored on Espruino, so you won't be able to edit it using the left-hand pane.
* The code that is sent to the Espruino board *is specific to that type of board and version of the Espruino firmware*. To use it on a different board you'll need to send it again using the Web IDE.


Performance Notes
---------------

* If you access global variables, Espruino will still have to search the symbol table to find them each time the function runs, which will be slow. To speed things up, use local variables or function arguments wherever possible.
* When accessing non-local variables, if you expect them to be integers then cast the explicitly with `0|` before using them - this will allow the compiler to do fast integer arithmetic with them, rather than using the interpreter's maths routines (which have to cope with doubles and strings).
* `peek32/peek16/peek8/poke32/poke16/poke8` map down to very fast IO accesses when provided with integer arguments - this is by far the fastest way to access IO.


What works and what doesn't?
----------------------------

### Works

* Maths, string operations
* `++a`, `a++`, `a+=`, etc.
* IF, FOR, WHILE
* Member and array access
* Function/method calls

### Doesn't Work

* Creating objects with `new`
* Creating arrays or structs ( `[1,2,3]` and `{a:5}` )
* DO..WHILE
* Exceptions
* Creating new global variables
* Defining un-named functions or functions not in the root scope ( `function a() { "compiled" }  setInterval(a, 1000);` works, `setInterval(function() { "compiled" }, 1000);` doesn't).
* Functions can not have more than 5 arguments


Can I help?
-----------

Absolutely! We're always after contributions. The actual code you need is here:

* [Compiler client in the Web IDE](https://github.com/espruino/EspruinoTools/blob/gh-pages/plugins/compiler.js)
* [Compiler server](https://github.com/gfwilliams/EspruinoCompiler)
