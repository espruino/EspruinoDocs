<!--- Copyright (c) 2014 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Espruino Performance Notes
===========================

* KEYWORDS: Espruino,Performance,Speed,Memory Usage

Please see [[Internals]] for a more technical description of the interpreter's implementation.

Espruino is designed to run on devices with very small amounts of RAM available (down to 8kB) *while still keeping a copy of the source code it is executing so you can edit it on the device*. As such, it makes some compromises that affect the performance in ways you may not expect.

**Please Note:** It's very easy to use the information below to pick holes in Espruino's implementation - however we have provided it in order to help our users. We suggest that you actually try Espruino before writing it off - you'll find out that in the real world these decisions pay off, and allow us to create a very capable JavaScript implementation that uses around 1000x less RAM than desktop JavaScript implementations.

**Does it seem too slow for you?** Then use the Web IDE to [Compile JavaScript into Thumb Code](/Compilation), or if that isn't fast enough then use [Inline Assembler](/Assembler) instead.



ESPRUINO EXECUTES CODE DIRECTLY FROM SOURCE
--------------------------------------

So source code size affects code execution speed.

On the Espruino board a simple loop will create roughly a 4kHz square wave (so 4000 iterations of the loop per second) using code like this:

```
while (1) {A0.set();A0.reset();}
```

While code like this will toggle a pin at around 3.5kHz.

```
while (1) { A0.set();                 A0.reset();               } 
```

This applies equally to comments - so it pays to keep comments above or below a function declaration, not inside it.

 

WHY DON'T YOU COMPILE TO BYTECODE?
-----------------------------------------

*It uses too much RAM.* To put it in context, look at the square below:
 
<div style="margin-left:64px;border:1px solid black;background-color:#CCC;width:45px;height:45px"></div>
  
That square alone (45x45x32bpp) is using 8kB of RAM. In order to run on a device with that much RAM, Espruino has to fit your program code, data, the execution stack, interpreter state and IO buffers in there. If you want the source code (so you can edit it on the device) then there's not enough room for that and the bytecode too (8kB = roughly 5 pages of text from a normal hardback book).

Luckily the Espruino board has a bit more memory than that ([Original Espruino](/EspruinoBoard) = 64kB, [Espruino Pico](/Pico) = 96kB), however it is still very important to make the most of every byte.

JavaScript minification can also provide a good alternative to bytecode. While not as fast, it is still very compact - and is still valid, human-readable JavaScript.

**If you need higher execution speed, you can now write [inline assembler](/Assembler) or [Compile JavaScript](/Compilation)**



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

This will be significantly faster. For maximum speed/efficiency you can put the data in a String or Uint8Array that you defined previously (see below).

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

As Espruino becomes more mature the Linked Lists may be replaced with a Tree structure, but for now it is very useful to be aware of this limitation.

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
 


EVERY DATATYPE IN ESPRUINO IS BASED ON A SINGLE 16 BYTE STORAGE UNIT
------------------------------------------------------------

This makes allocation and deallocation very fast for Espruino and avoids memory fragmentation. However, if you allocate a single boolean it will still take up 16 bytes of memory. 

This may seem inefficient, but if you compare this with a naive malloc/free implementation you'll realise that it saves a significant amount of RAM.

**Note:** on smaller devices (with less than 256 variables) Espruino uses 12 bytes per storage unit (not 16).

 

ARRAYS AND OBJECTS USE TWO STORAGE UNITS PER ELEMENT (ONE FOR THE KEY, AND ONE FOR THE VALUE)
---------------------------------------------------------------------------------

This means that Sparse Arrays are relatively efficient, but Dense Arrays are not. For dense arrays you should use [Typed Arrays](Reference#l_Uint8Array_Uint8Array) (see the next heading).

If the name (index) of an element is a string that is greater than 4 characters then another variable will have to be allocated to store the remaining characters. The number of variables needed for the index is: `Math.ceil((characters-4)/12)`

**There are a few cases when both key and value can be packed into an array.** These are:

* An integer index with a boolean value
* An integer index with an integer value between -32768 and 32767 (on parts with 12 byte storage units, the range of allowable values may be less)
* A short (4 chars or less) string index with an integer value between -32768 and 32767, eg `{ boom : 123 }`
 
You can check how many storage units a data structure is using up with [`E.getSizeOf(...)`](http://www.espruino.com/Reference#l_E_getSizeOf)



STRINGS OR TYPED ARRAYS ARE THE MOST EFFICIENT WAY TO STORE DATA
--------------------------------------------------------

Strings and Typed Arrays use the same storage format, where you get on average 12 bytes of data per 16 byte Storage unit. So for an array of bytes, it's 24 times more efficient to use a String or Typed Array than a normal (sparse) Array. It's also faster too!

**Note:** On Espruino 1v72 and later, Typed Arrays allocate a continuous block of variables (if possible). This uses one 16 byte storage unit as a header, and then the following storage units are used to hold the data in one continuous block. It's much faster to access and is significantly more efficient for large amounts of data.

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

