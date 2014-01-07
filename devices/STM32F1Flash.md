<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
STM32F1 Flash Memory Module
========================

* KEYWORDS: Module,Flash,Memory,ROM,STM32

This is a module ([[STM32F1Flash.js]]) for reading and writing internal flash memory on the STM32F103RC chip in the Espruino Board.

**BEWARE - THERE BE DRAGONS...**

Flash memory contains Espruino, your saved program, and the bootloader - and it's *almost* all used. Incorrect use of this module could stop your Espruino board from working, so make sure you know what you're doing!

Note
----

* Flash memory starts at 0x08000000
* The Espruino board has 256kB of Flash memory
* Bytes ```0x08000000``` to ```0x08002800``` are the bootloader. Doing ANYTHING with these will almost certainly break your board
* From ```0x08000000``` to ```0x08000000 + sizeof(your_espruino_binary_file.bin)``` is Espruino (usually around 200kB - **but this will increase in the future**). Touching this will require a re-flash of your board via the bootloader
* From ```0x08000000+256kB-40kB``` to ```0x08000000+256kB``` is used for your saved program
* This means that between ```0x08000000 + sizeof(your_espruino_binary_file.bin)``` and ```0x08000000+256kB-40kB``` is free for your use - roughly 16kB.



```
var adr = 0x0803E000;
var f = require("STM32F1Flash");
console.log(f.read(adr).toString(16)); // probably FFFFFFFF
f.unlock(); // unlock flash memory - allows us to do bad things...
f.erase(adr); // erase 2048 bytes from 0x0803E000
console.log(f.read(adr).toString(16)); // now definitely FFFFFFFF
f.write(adr,0xCAFEBABE); // write a 32 bit word
console.log(f.read(adr).toString(16)); // now CAFEBABE
```

