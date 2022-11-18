<!--- Copyright (c) 2022 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
JIT Compiler
=============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/JIT. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Built-In,Compile,Compiler,Compilation,JIT,inline

Normally, when you upload code to Espruino it is executed straight from source - which means that your source code is on the device itself so you can edit it easily.

In Espruino 2v16 we included a simple JIT compiler that will compile a subset of JS to native ARM code. Unlike the previous options of the [Inline Assembler](/Assembler) or [Online Compiler](/Compilation), the JIT
compiler actually creates code inside the microcontroller.

While final code is not as optimised as the [Online Compiler](/Compilation), JIT has a few big benefits:

* JIT code can integrate more deeply and efficiently with the interpreter
* No firmware version incompatibilities
* No need for an internet connection
* Code can be generated dynamically and then JIT compiled dynamically too

**The JIT compiler is BETA and under heavy development.** It only intended for small sections of code, and JITed code may cause crashes and instability. See [here for information on the current state of development](https://github.com/espruino/Espruino/blob/master/README_JIT.md)

**Note:** The JIT compiler is only enabled for bluetooth-capable [official Espruino boards](/Order), although it may be rolled out to STM32-based boards like the [[Pico]] at a later date. It won't work on devices like ESP8266 or ESP32.

How do I use it?
---------------

Simply get your function working as you want it to, and then add the string `"jit";` to the very front of it:

```
function foo(a,b) {
  "jit";
  return a*53 + b*2;
}

foo(2,3);
```

You can also include loops - for instance here we're rendering the Mandelbrot fractal:

```
function f() {
  "jit";
  var Xr = 0;
  var Xi = 0;
  var Cr=(4*x/64)-2;
  var Ci=(4*y/64)-2;
  for (var i=0;(i<32) & ((Xr*Xr+Xi*Xi)<4);i++) {
    var t=Xr*Xr - Xi*Xi + Cr;
    Xi=2*Xr*Xi+Ci;
    Xr=t;
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

or you can use JIT code to speed up your IO:

```
function f(pin, val) {
  "jit";
  digitalWrite(pin, (val>>7)&1);
  digitalWrite(pin, (val>>6)&1);
  digitalWrite(pin, (val>>5)&1);
  digitalWrite(pin, (val>>4)&1);
  digitalWrite(pin, (val>>3)&1);
  digitalWrite(pin, (val>>2)&1);
  digitalWrite(pin, (val>>1)&1);
  digitalWrite(pin, val&1);
}
```

Performance Notes
---------------

See [here for information on the current state of development](https://github.com/espruino/Espruino/blob/master/README_JIT.md)

* All variables that are accessed are searched for at the start of the JITed function
  * So if you use `digitalWrite` multiple times, you're only actually searching for it once
  * As a result using `pin.write(X)` may be slower than `digitalWrite(pin, X)` because for each call `write` is searched for on `pin`


Can I help?
-----------

Absolutely! We're always after contributions. The actual code you need is here:

* [Current JIT status](https://github.com/espruino/Espruino/blob/master/README_JIT.md)
* [JIT compiler](https://github.com/espruino/Espruino/blob/master/src/jsjit.c)
* [JIT compiler code emitter](https://github.com/espruino/Espruino/blob/master/src/jsjitc.c)
