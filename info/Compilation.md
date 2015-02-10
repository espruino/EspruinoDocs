<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
JavaScript Compilation
===================

* KEYWORDS: Compile,Compiler,Compilation,JIT,inline

Normally, when you upload code to Espruino it is executed straight from source - which means that your source code is on the device itself so you can edit it easily.

While this is fast enough for most things, occasionally you need your code to run faster. Up until now you've had the option of writing [Inline Assembler](/Assembler), but now you can actually compile JavaScript directly into native code.

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

What Happens?
-----------

Before uploading, the Web IDE scans your code for functions with the `"compiled";` keyword. It then parses those functions and compiles them to ARM Thumb code, which is then uploaded to Espruino as a native function.

When you run this native function, the ARM processor in Espruino executes those opcodes directly (with no interpreter in the way). You should see an increase in execution speed of at least 4x.

For now, Maths is still handled using Espruino's built-in variable type. When the compiler can automatically switch to integers as needed, you should see another order of magnitude increase in execution speed.


Caveats
------

* Only a small subset of JavaScript is supported by the compiler
* `Ctrl+C` and Exception handling won't work. If there's a loop in your compiled function then you'll only be able to break out of it by resetting the board.
* It's still very early days, and as such you should expect bugs. If you find any, [please let us know](https://github.com/espruino/EspruinoTools/issues) with the smallest bit of sample code you can get that reproduces the problem.
* No source code for the function is stored on Espruino, so you won't be able to edit it using the left-hand pane.

Performance Notes
---------------

* If you access global variables, Espruino will still have to search the symbol table to find them each time the function runs, which will be slow. To speed things up, use local variables or function arguments wherever possible.
* There's no type inference right now - which means that every maths operation is performed with a general-purpose JsVar, regardless of whether it's an integer or not

What works and what doesn't?
----------------------------

### Works

* Maths, string operations
* `a++`, `a+=`, etc.
* IF, FOR, WHILE
* Member and array access
* Function/method calls that don't require `this` - eg. `console.log`

### Doesn't Work

* 'Big' functions. If a label is too far away to be referenced/jumped to then assembly will fail
* Function/method calls that need `this` - eg. `SPI1.send`
* Logical operators with control flow, eg: `&&`, `||` and `A ? B : C`
* DO..WHILE
* Exceptions
* Creating new variables
* Preincrement, eg. `++a`
* The result of postincrement may be broken (`b=a;a++ == b+1`)

Can I help?
-----------

Absolutely! We're always after contributions. The actual code you need is here:

* [Compiler](https://github.com/espruino/EspruinoTools/blob/gh-pages/plugins/compiler.js)
* [Assembler](https://github.com/espruino/EspruinoTools/blob/gh-pages/plugins/assembler.js)
