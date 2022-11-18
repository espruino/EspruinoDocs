<!--- Copyright (c) 2014 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Espruino Performance Notes
===========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Performance. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Built-In,Espruino,Performance,Speed,Memory Usage,Native Strings,Flat Strings,Typed Array,ArrayBuffer,Efficient Code

Please see [[Internals]] for a more technical description of the interpreter's implementation.

Espruino is designed to run on devices with very small amounts of RAM available (under 8kB) *while still keeping a copy of the source code so you can debug and edit on the device*. As such, it makes some compromises that affect the performance in ways you may not expect.

**Is it too slow for you?**

Check out [some easy Code Style changes](/Code+Style) to make your code run better.

JavaScript on Embedded devices will never be as efficient as compiled code, so we've made it easy for you to add extremely fast code *where it is needed*:

* Add `"ram"` to the top of your function to tell Espruino to keep it in RAM and pretokenise it.
* Add `"jit"` to the top of your function to [tell Espruino to JIT compile it](/JIT) on the device (2v16 firmware and later)
* Use the Web IDE to [compile JavaScript into optimised Thumb Code](/Compilation) using an Online service
* Create functions with [Inline C](/InlineC) or [Inline Assembler](/Assembler)
* Recompile the Espruino firmware [with your own C code](/Extending+Espruino+1)


ESPRUINO EXECUTES CODE DIRECTLY FROM SOURCE
--------------------------------------------

### Why not compile to native/bytecode?

Memory is scarce on microcontrollers, and we want the source code on the device itself so we can edit and debug it without external tools.

There isn't enough room on the microcontroller for source code *and* compiled code, but luckily source code is surprisingly memory-efficient.

For instance take this code that draws a Mandelbrot fractal:

```
var x,y,line;
for (y=0;y<32;y++) {
 line="";
 for (x=0;x<32;x++) {
  var Xr = 0;
  var Xi = 0;
  var i = 0;
  var Cr=(4*x/32)-2;
  var Ci=(4*y/32)-2;
  while ((i<8) & ((Xr*Xr+Xi*Xi)<4)) {
    var t=Xr*Xr - Xi*Xi + Cr;
    Xi=2*Xr*Xi+Ci;
    Xr=t;
    i=i+1;
  }
  line += " *"[i&1];
 }
 print(line);
}
```

It's 301 bytes long.

When compiled with [SpiderMonkey](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey), the following bytecode is created (obtained by running a debug build and `dbg(function() { .... })`:

```
loc     op
-----   --
main:
00000:  getlocal 0
00003:  pop
00004:  getlocal 1
00007:  pop
00008:  getlocal 2
00011:  pop
00012:  zero
  ...
00256:  loopentry 1
00258:  getlocal 1
00261:  int8 32
00263:  lt
00264:  ifne 22 (-242)
00269:  stop
```

It's 270 bytes long. So you've saved 31 bytes over the original code, but now your code is totally uneditable and unreadable.

If you compiled this into native code with the Espruino [Compiler](http://www.espruino.com/Compilation), the size of the binary would be 1136 bytes.

But what if you rewrote it in C and compiled it in GCC with size optimisation turned on. That'll be efficient, right?

```
void main() {
 int x,y;
 char line[33];
 line[32] = 0;
 for (y=0;y<32;y++) {
  for (x=0;x<32;x++) {
   double Xr = 0;
   double Xi = 0;
   int i = 0;
   double Cr=(4*x/32.0)-2;
   double Ci=(4*y/32.0)-2;
   while ((i<8) & ((Xr*Xr+Xi*Xi)<4)) {
     double t=Xr*Xr - Xi*Xi + Cr;
     Xi=2*Xr*Xi+Ci;
     Xr=t;
     i=i+1;
   }
   line[x] = (char)((i&1)?'*':' ');
  }
  puts(line);
 }
}
```

```
$arm-none-eabi-gcc mandel.c -mthumb -Os -c -o mandel.o
$arm-none-eabi-objdump -S mandel.o

00000000 <main>:
   0:	b5f0      	push	{r4, r5, r6, r7, lr}
   2:	2400      	movs	r4, #0
   4:	b097      	sub	sp, #92	; 0x5c
   6:	ab0c      	add	r3, sp, #48	; 0x30
   ...
 116:	bc01      	pop	{r0}
 118:	4700      	bx	r0
 11a:	46c0      	nop			; (mov r8, r8)
 11c:	3fa00000 	.word	0x3fa00000
 120:	40100000 	.word	0x40100000
```

Nope. 290 bytes.

However, if you minified your code with the closure compiler you'd get:

```
var a,b,c;for(b=0;32>b;b++){c="";for(a=0;32>a;a++){for(var
d=0,e=0,f=0,g=4*a/32-2,h=4*b/32-2;8>f&4>d*d+e*e;)var k=d*d
-e*e+g,e=2*d*e+h,d=k,f=f+1;c+=" *"[f&1]}print(c)};
```

It's editable, *just about* readable, and it's only 167 bytes - so *it is smaller than bytecode and even highly optimised native code!*

| Type | Size (bytes) |
|------|--------------|
| Original JS Code | 301 |
| Spidermonkey bytecode | 270 |
| Espruino Compiled JS | 1136 |
| GCC Compiled C code (`-Os`) | 290 |
| Minified JS | 167 |
| Minified and pretokenised JS | 149 |

So by executing from source, we use around the same amount of memory as we would if we compiled or used bytecode, while still having everything we need to edit and debug the code on-chip.

However, if you need to make things smaller, you can minify the JavaScript functions you don't need to edit, which will use around half the RAM of even size-optimised C code!

### What does executing from source mean?

The size of your source code will affect the code execution speed.

On the Espruino board a simple loop will create roughly a 4kHz square wave (so 4000 iterations of the loop per second) using code like this:

```
while (1) {A0.set();A0.reset();}
```

While code like this will toggle a pin at around 3.5kHz.

```
while (1) { A0.set();                 A0.reset();               }
```

This applies equally to comments - so it pays to keep comments above or below a function declaration or loop, not inside it.

**Note:** You can turn on 'pretokenisation' globally with `E.setFlags({pretokenise:1})` or
by beginning a function's code with the string `"ram"`. Pretokenised functions have all whitespace
removed, and any tokens (such as `this`, `function`, `for`, etc) will be turned
into numeric values. This means that the above (whitespace slowing down
execution) will not apply - however your original code formatting will be lost,
which will make debugging significantly more difficult.

**Note:** On Bangle.js devices JS code is executed direct from external flash
memory. Using the `"ram"` string as above will also load the function into RAM
which will improve speed further.


EXECUTING CODE HAS A NOTICABLE OVERHEAD - GIVE AS MUCH WORK TO ESPRUINO IN ONE GO AS YOU CAN
---------------------------------------------------------------------------------

Many of the IO routines are designed to allow you to send lots of data at once. For instance, instead of:

```
SPI1.send(1);
SPI1.send(2);
SPI1.send(3);
```

You can just do:

```
SPI1.send([1,2,3]);
```

This will be significantly faster. For maximum speed/efficiency you can put the data in a String or `Uint8Array` that you defined previously (see below).

```
var buf = new Uint8Array([1,2,3]);
....
SPI1.send(buf);
```

Unlike Arduino's `digitalWrite`, Espruino's `digitalWrite` can take an array of pins, in which case it sets them in order, LSB first. For example you could send 8 bits and then pulse a clock line as follows:

```
var pins = [CLK,CLK,A7,A6,A5,A4,A3,A2,A1,A0];

array.forEach(function(data) {
  digitalWrite(pins, data|256);
});
```

This sets `A0`..`A7`, but then sets `CLK` to `1`, and then to `0`.



ESPRUINO STORES NORMAL ARRAYS AND OBJECTS IN LINKED LISTS
--------------------------------------------------

So the number of elements in an array or object will seriously affect the time it takes to access elements in it. For instance, if you're storing two-dimensional data, it is faster to store data in a two-dimensional array than it is to store it in a single-dimensional array!

To work around this, try and use `Array.map`, `Array.forEach`, `Array.reduce`, `for (i of ...)` and `for (i in ...)` wherever possible, as these can iterate over the linked list very efficiently.

For example to AND together all values in an array:

```
var anded = myArray.reduce(function(last, value) {
  return last & value;
}, 0xFFFFFFFF /*initial value*/);
```

Or to send the contents of an array to digital outputs:

```
myArray.forEach(function(value) {
  digitalWrite([A0,A1,A2,A3], value);
});
```

or you can even pre-bind array arguments to speed things up further (see below):

```
myArray.forEach(digitalWrite.bind(null,[A0,A1,A2,A3]));
```

If you need to go really fast you can also tag specific functions as `"ram"` or
even JIT compile them (see the very top of this page) and then use them
with `forEach`/`map`/etc.

**Note:** Espruino contains some extra functions like `E.sum` and `E.variance` to
help with common tasks like summing all values in an array. It's a lot faster
to try and use these if possible.



EVERY DATATYPE IN ESPRUINO IS BASED ON A SINGLE STORAGE UNIT (12-16 BYTES)
--------------------------------------------------------------------------

The actual size of storage unit (referred to as `JsVar` internally) depends on how many vars your device needs to be able to address. You can check `process.memory().blocksize` to find out the actual size.

This makes allocation and deallocation very fast for Espruino and avoids memory fragmentation. However, if you allocate a single boolean it will still take up one storage unit (12-16 bytes) of memory.

This may seem inefficient, but if you compare this with a naive malloc/free implementation you'll realise that it saves a significant amount of RAM.


ARRAYS AND OBJECTS USE TWO STORAGE UNITS PER ELEMENT (ONE FOR THE KEY, AND ONE FOR THE VALUE)
---------------------------------------------------------------------------------

This means that Sparse Arrays are relatively efficient, but Dense Arrays are not. For dense arrays you should use [Typed Arrays](Reference#l_Uint8Array_Uint8Array) (see the next heading).

If the name (index) of an element is a string that is greater than 10 characters (7 on 12 byte systems) then another variable will have to be allocated to store the remaining characters. The number of variables needed for the index is: `Math.ceil((characters-10)/12)`

**There are a few cases when both key and value can be packed into an array.** These are:

* An integer index with a boolean value
* An integer index with an integer value between -32768 and 32767 (on parts with 12 byte storage units, the range of allowable values may be less)
* A short (4 chars or less) string index with an integer value between -32768 and 32767, eg `{ boom : 123 }`

You can check how many storage units a data structure is using up with [`E.getSizeOf(...)`](http://www.espruino.com/Reference#l_E_getSizeOf)


STRINGS VS. FLAT STRINGS
-------------------------

When Espruino allocates a big String that it knows the size of up-front, it
can create a Flat String. This is one JsVar as a header, followed by a
number of other JsVars that are used as one flat memory area.

Allocating a Flat String takes more time than allocating a normal string
as a contiguous area of memory has to be found (and isn't guaranteed to exist
even if you have the available free memory, since memory can get fragmented).

**Note:** You can now call [`E.defrag()`](http://www.espruino.com/Reference#l_E_defrag) to
defragment memory, but this can be slow. It's not recommended you call this unless you
are absolutely sure you have to.

However, once allocated a Flat String is very efficient for large amounts of
data and allows for very fast accesses.

If you want to create a Flat String, use [E.toString](http://www.espruino.com/Reference#l_E_toString),
but be aware that you'll probably need a Typed Array (see below) to write to it.

Once allocated, you can use `E.getAddressOf(v, true)` to get the actual
physical address in memory of the Flat String's data (which can be used for DMA/etc).


Functions and pretokenisation
------------------------------

Normally if you upload code to RAM, function code is uploaded there as-is.

If you use the `E.setFlags({pretokenise:1})` command (for all functions) or add
 `"ram"` at the top of a single function, Espruino will automatically minify your
 function code on upload. For example:

```
function foobar() {
  "ram"
  if (this.x==undefined) throw new Error("Hello");
  return null;
}
```

Turns into something like  `#foobar(){#(#.x==#)##Error("Hello");##;}` where
`#` is a special token representing that reserved word. This saves a lot of
memory and also speeds up execution by 10-20%. However it does remove line
numbers from stack traces and so makes debugging harder.

If you're using a device with external flash (like Bangle.js) then  `"ram"`
(but not `E.setFlags({pretokenise:1})`) will ensure that your function is loaded
into RAM rather than being executed from flash.


Functions in Flash
------------------

If you write your code to flash memory (see [the page on Saving](/Saving))
then any function that is defined will have its function code executed
directly from flash.

If your device (like [Bangle.js](/Bangle.js) uses external flash) then
this will likely make functions execute more slowly than they would
otherwise.

This is great for RAM usage, and can be used to improve usage even further.
For instance if you are trying to store a big blob of data, maybe an image:

```
const mydata = atob("GBgCAAAAAAAAAAQA....AAAAAAAAAAAAA");

function useData() {
  print(mydata);
}
```

The code above will parse `mydata` and store the array in RAM.

However, if you define the array in a function:

```
function useData() {
  const mydata = atob("GBgCAAAAAAAAAAQA....AAAAAAAAAAAAA");
  print(mydata);
}

// or

function getMyData() {
  return atob("GBgCAAAAAAAAAAQA....AAAAAAAAAAAAA");
}

function useData() {
  print(getMyData());
}
```

Then the data won't be in RAM - it'll be in Flash memory until the
function is executed, when it'll be loaded into memory.

**Note:** This only works if you're [uploading to Flash](/Saving). If
you upload to RAM then the function's code will be in RAM, and will
use *more* memory than just having parsed and decoded the base64 data.


ARRAY BUFFERS ARE THE MOST EFFICIENT WAY TO STORE DATA
-----------------------------------------------------

While Flat Strings are really *the* most efficient method of storing data,
if you want to write to one then you'll need a Typed Array and [`ArrayBuffer`](http://www.espruino.com/Reference#ArrayBuffer).

A [`Uint8Array`](http://www.espruino.com/Reference#Uint8Array) will link to an [`ArrayBuffer`](http://www.espruino.com/Reference#ArrayBuffer)
which represents the untyped data, and that [`ArrayBuffer`](http://www.espruino.com/Reference#ArrayBuffer) will then link to a String
(usually a Flat String) which stores your data.

Because the data in the Flat String is in one flat block, it is very fast to do random accesses on.

However Espruino needs to search for a continuous block of memory for the Flat String,
so allocating Typed Arrays is slow. You should try to allocate them once and leave them
allocated. In some cases there won't be a flat block of memory available, and then
Espruino will fall back to normal Strings. Everything will still work, but they
will take up more memory and will be slower to access.

You create a Typed Array with a simple command:

```
a = new Uint8Array(50); //  50 elements
a = new Uint8Array([1,2,3,4,5,6,7,8,9,10]); // 10 elements, pre-set
a = new Int8Array(50);
a = new Int32Array(50);
a = new Float32Array(50);
```

And then you can access it like a normal Array. The only thing you can't do is change the length dynamically (See below). There are other formats of typed array too - see the [Reference](http://www.espruino.com/Reference#t_ArrayBufferView).

While you can't change the length dynamically, you can create 'views' which change how you access the information in the array without actually copying it. For example:

```
a = new Uint8Array([1,2,3,4,5,6,7,8,9,10]);
b = new Uint16Array(a.buffer); // [513,1027,1541,2055,2569]
c = new Uint8Array(a.buffer, 2, 5); // [3,4,5,6,7]
(new Uint8Array(a.buffer, 2, 3)).forEach(function(x) { console.log(x); }); // prints 3,4,5 on different lines
```

You can also use `.set` to quickly set elements. For example...

```
a = new Uint8Array([1,2,3,4,5,6,7,8,9,10]);
b = new Uint8Array(7); // 0,0,0,0,0,0,0
c = new Uint8Array(a.buffer, 2, 5); // [3,4,5,6,7]
b.set(c, 2); // set b with the contents of c starting from index 2
b; // [0,0,3,4,5,6,7]
```

You can also use [DataView](http://www.espruino.com/Reference#DataView) to access
an `ArrayBuffer` using multiple different types at the same time:

```
var b = new ArrayBuffer(8)
var v = new DataView(b)
v.setUint16(0,"0x1234")
v.setUint8(3,"0x56")
console.log("0x"+v.getUint32(0).toString(16))
// prints 0x12340056
```


STRINGS ARE THE SECOND MOST EFFICIENT WAY TO STORE DATA
-------------------------------------------------------

Strings use on average 12 bytes of data per 16 byte Storage unit. So for an array
of bytes, it's 24 times more efficient to use a String or Typed Array than a normal
(sparse) Array. It's also faster too!

Although if they can be allocated Flat Strings are better (see above), normal
Strings *are just as fast to iterate over* - it's just random access that is
slower.


NATIVE STRINGS ARE GREAT, IF YOU JUST NEED TO READ
--------------------------------------------------

A Native String (created with [`E.memoryArea`](http://www.espruino.com/Reference#l_E_memoryArea))
is a String that is just a pointer to an area of memory. On most devices there
isn't enough free RAM for a Native String to point to anything useful, however
if you have data in Flash memory then it can be extremely useful as a way to
access data without taking up any RAM.

While you can use `E.memoryArea` directly, you can also use [the `Storage` library](http://www.espruino.com/Reference#Storage)
to write data to Flash memory using a simple file system. When retrieving data
with [`require('Storage').read(...)`](http://www.espruino.com/Reference#l_Storage_read)
the returned data will be a Native String.

If you [save your code with Save on Send](/Saving) then any functions that are
defined will also have their contents stored in a Native String pointing directly
to flash memory.


SOME VARIABLE LOOKUPS ARE FASTER THAN OTHERS
---------------------------------------

The time taken to find a variable from the name is dependent on how far down the
scope chain Espruino has to search to find it. Global variables take longer to find than
local variables of function parameters.

For instance this code:

```
function go() {
  var counter = 0;
  setWatch(function() {
    counter++;
  }, A0, {repeat:true, edge:"falling"});
}
```

Will execute more quickly than:

```
var counter = 0;
function go() {
  setWatch(function() {
    counter++;
  }, A0, {repeat:true, edge:"falling"});
}
```

Because `counter` is further up the scope chain.

`LED1.write(1)` is also slightly faster (~5%) than `digitalWrite(LED1,1)` because there is only
one global lookup for `LED1`. Once `LED1` is found, Espruino knows that it is a Pin, so only
has to look within the Pin for the `write` method.

Variables also take a little longer to find if their names are longer. You might want to
consider storing a function that you use a lot locally, for instance instead of:

```
for (var i=0;i<1000;i++) {
  digitalWrite(LED1,1);
  digitalWrite(LED1,0);
}
```

you might do:

```
var d = digitalWrite;
for (var i=0;i<1000;i++) {
  d(LED1,1);
  d(LED1,0);
}
```

You can also use `.bind` - see below:


BINDING IS FAST
-------------

Binding variables to functions is pretty fast - for instance, maybe you want to write a value to a pin:

```
digitalWrite(pin, x);
// or
pin.write(x);
```

You can speed things up by 'binding' the `this` variable and the first arguments, eg:

```
var w = pin.write.bind(pin);
// ...
w(x);
```

This has the advantage of reducing variable lookups (mentioned above) as well.
