<!--- Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Inline C code
=============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/InlineC. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Compile,Compiler,Compilation,C,C++,inline

Normal code for Espruino is written in JavaScript. However for some tasks this won't
be fast enough, or you may have existing C code that you wish to use.

In this case, you have a few options:

* Insert inline C code into your JS project
* Recompile the Espruino firmware [with your own C code](/Extending+Espruino+1)
* Use the IDE [to compile your JavaScript code](/Compilation)
* Use the [Inline Assembler](/Assembler)

This page covers the first option - follow the links above for other options.

**Note:** This is an online service that is only provided for [official Espruino boards](/Order). It won't work on devices like ESP8266 or ESP32.


How do I use it?
---------------

You create code of the form `var c = E.compiledC` in the root scope of your
code, giving your C code inside a 'template literal' (using the backtick
character at the beginning and end).

```
var c = E.compiledC(`
// int fibo(int)
int fibo(int n){
 if(n <= 1){
  return n;
 }
 int fibo = 1;
 int fiboPrev = 1;
 for(int i = 2; i < n; ++i){
  int temp = fibo;
  fibo += fiboPrev;
  fiboPrev = temp;
 }
 return fibo;
}
`);

print(c.fibo(20));
```

The first lines should contain comments that describe the arguments and return value for
each function that you wish to export to Espruino, [in the same form as used for the Assembler](/Assembler#arguments).
The variable `c` will then contain an object containing a field for each exported function.

Interrupts
----------

One of the main uses for Inline C is doing something when an interrupt occurs.
You can do this by specifying `irq:true` when using `setWatch`:

```

var c = E.compiledC(`
// void press(bool)
// int get()
volatile int data;
void press(bool state){
  data++;
}
int get() {
 int r = data;
 data = 0;
 return r;
}
`);
// Make `c.press` get called on an IRQ
setWatch(c.press, BTN1, {repeat:true, edge:"both", irq:true});
// Every 10 seconds, report back the value
setInterval(function() {
  print(c.get());
}, 10000);
```

Note that you can have multiple functions and variables. While Espruino
can't access the variables directly, you can write 'getter' functions
for them.


Accessing arrays
----------------

You'll probably want to use C code to work through large amounts of data
quickly. To avoid fragmentation problems, it's not guaranteed that Espruino will
always allocate data in one contiguous chunk, so you have two options:

### forEach

Use `Array/TypedArray.forEach` to call your function for each
element of the array:

```
var c = E.compiledC(`
// void hash(int)
// int get()
unsigned int data;
void hash(unsigned int value){
  data = ((data<<1) | (data>>31)) ^ value;
}
int get() {
 int r = data;
 data = 0;
 return r;
}
`);

var arr = new Uint32Array(1000);
// Fill with random data
for (var i in arr) arr[i]=Math.random()*0xFFFFFFFF;
// Feed each data item through in turn
arr.forEach(c.hash);
// Print the result
print(c.get());
```

Note that you can also use `.map`, `.reduce`, `.filter`, etc.

### Direct Access

Large typed arrays (eg. `Uint8Array`) will always be
allocated as Flat Strings if possible, but you can use
`E.toString` to force Espruino to create a Flat String
(a contiguous array of bytes) from whatever data is supplied
as an argument.

Calling `E.getAddressOf(variable, true)` will return the physical
address of the start of that variable's data, or `0` if the memory area
is not flat. All you need to do is pass the address from `E.getAddressOf`
into your C code as an integer and you can access the data as a normal
array.

```
// Sum all items in the given array
var c = E.compiledC(`
// int sum(int, int)
int sum(int len, unsigned char *data){
  int s = 0;
  while (len--)
    s += *(data++);
  return s;
}
`);
// Allocate the data
var data = new Uint8Array(5000);
for (var i in data) data[i]=i;
// Get the address
var addr = E.getAddressOf(data,true);
if (!addr) throw new Error("Not a Flat String");
// Execute the function to sum
print(c.sum(data.length, addr));
```

What Happens?
-----------

Before uploading, the Web IDE scans your code for calls of the form `E.compiledC`. It then sends those functions to our server which compiles that code with GCC and sends a location-independent binary back so that it can be uploaded to Espruino as a native function.

When you run this native function, the ARM processor in Espruino executes the compiled code directly (with no interpreter in the way). You should see an increase in execution speed of at least 100x for most tasks.

Caveats
------

* Arithmetic with floats, doubles and uint64 may not work since it requires functions that won't be compiled in.
* There is no C preprocessor - so `#define`/etc won't work
* `Ctrl+C` and Exception handling won't work. If there's a loop in your compiled function then you'll only be able to break out of it by resetting the board.
* The code that is sent to the Espruino board *is specific to that type of board and version of the Espruino firmware*. To use it on a different board you'll need to send it again using the Web IDE.
