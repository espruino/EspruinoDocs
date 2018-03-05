<!--- Copyright (c) 2014 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Espruino Performance Notes
===========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Performance. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Espruino,Performance,Speed,Memory Usage

Please see [[Internals]] for a more technical description of the interpreter's implementation.

Espruino is designed to run on devices with very small amounts of RAM available (under 8kB) *while still keeping a copy of the source code so you can debug and edit on the device*. As such, it makes some compromises that affect the performance in ways you may not expect.

**Is it too slow for you?**

JavaScript on Embedded devices will never be as efficient as compiled code, so we've made it easy for you to add extremely fast code *where it is needed*:

* Use the Web IDE to [compile JavaScript into optimised Thumb Code](/Compilation)
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

So by executing from source, we use around the same amount of memory as we would if we compiled or used bytecode, while still having everything we need to edit and debug the code on-chip.

However, if you need to make things smaller, you can minify the JavaScript functions you don't need to edit, which will use less RAM than even size-optimised C code!

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

**Note:** You can turn on 'pretokenisation' with `E.setFlags({pretokenise:1})`.
Any functions defined after pretokenisation is enabled will have all whitespace
removed, and any tokens (such as `this`, `function`, `for`, etc) will be turned
into numeric values. This means that the above (whitespace slowing down
execution) will not apply - however your original code formatting will be lost,
which will make debugging significantly more difficult.



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

To work around this, try and use `Array.map`, `Array.forEach`, and `Array.reduce` wherever possible, as these can iterate over the linked list very efficiently.

For example to AND together all values in an array:

```
var anded = myArray.reduce(function(last, value) { return last & value; }, 0xFFFFFFFF /*initial value*/);
```

Or to send the contents of an array to digital outputs:

```
myArray.forEach(function(value) {
  digitalWrite([A0,A1,A2,A3], value);
});
```

or even (see below):

```
myArray.forEach(digitalWrite.bind(null,[A0,A1,A2,A3]));
```



EVERY DATATYPE IN ESPRUINO IS BASED ON A SINGLE 16 BYTE STORAGE UNIT
------------------------------------------------------------

This makes allocation and deallocation very fast for Espruino and avoids memory fragmentation. However, if you allocate a single boolean it will still take up 16 bytes of memory.

This may seem inefficient, but if you compare this with a naive malloc/free implementation you'll realise that it saves a significant amount of RAM.

**Note:** on smaller devices (with less than 1024 variables) Espruino uses 12 bytes per storage unit (not 16).



ARRAYS AND OBJECTS USE TWO STORAGE UNITS PER ELEMENT (ONE FOR THE KEY, AND ONE FOR THE VALUE)
---------------------------------------------------------------------------------

This means that Sparse Arrays are relatively efficient, but Dense Arrays are not. For dense arrays you should use [Typed Arrays](Reference#l_Uint8Array_Uint8Array) (see the next heading).

If the name (index) of an element is a string that is greater than 10 characters (7 on 12 byte systems) then another variable will have to be allocated to store the remaining characters. The number of variables needed for the index is: `Math.ceil((characters-10)/12)`

**There are a few cases when both key and value can be packed into an array.** These are:

* An integer index with a boolean value
* An integer index with an integer value between -32768 and 32767 (on parts with 12 byte storage units, the range of allowable values may be less)
* A short (4 chars or less) string index with an integer value between -32768 and 32767, eg `{ boom : 123 }`

You can check how many storage units a data structure is using up with [`E.getSizeOf(...)`](http://www.espruino.com/Reference#l_E_getSizeOf)



TYPED ARRAYS ARE THE MOST EFFICIENT WAY TO STORE DATA
-----------------------------------------------------

Whenever possible, Typed Arrays use one JsVar as a header, and then a contiguous set of JsVars for data. This means that for large arrays you have just 16 bytes of overhead.

Because the data is in one flat block, it is also very fast to do random accesses on.

However Espruino needs to search for a continuous block of memory, allocating Typed Arrays is slow. You should try to allocate them once and leave them allocated. In some cases there won't be a flat block of memory available, and then Espruino will fall back to Strings.

You create a Typed Array with a simple command:

```
a = new Uint8Array(50); //  50 elements
a = new Uint8Array([1,2,3,4,5,6,7,8,9,10]); // 10 elements, pre-set
a = new Int8Array(50);
a = new Int32Array(50);
a = new Float32Array(50);
```

And then you can access it like a normal Array. The only thing you can't do is change the length dynamically (See below). There are other formats of typed array too - see the [[Reference]].

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


STRINGS ARE THE SECOND MOST EFFICIENT WAY TO STORE DATA
-------------------------------------------------------

Strings use on average 12 bytes of data per 16 byte Storage unit. So for an array of bytes, it's 24 times more efficient to use a String or Typed Array than a normal (sparse) Array. It's also faster too!


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
