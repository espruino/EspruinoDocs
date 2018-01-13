<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
STM32F1 Flash Memory Module
========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/STM32F1Flash. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Flash,Memory,ROM,STM32

This is a module ([[STM32F1Flash.js]]) for reading and writing internal flash memory on the STM32F103RC chip in the Espruino Board.

**THIS IS DEPRECATED** - There is now built-in support for writing flash memory of all STM32 boards, available via the [Flash module](/Reference#Flash)

**BEWARE - THIS IS POTENTIALLY DANGEROUS**

Flash memory contains Espruino, your saved program, and the bootloader - and it's *almost* all used. Incorrect use of this module could stop your Espruino board from working, so make sure you know what you're doing!

Note
----

* Flash memory must be erased (so it is all ```0xFF```) before it is written to. If you don't do this you could damage it.
* While you can write individual 32 bit words to flash, it must be erased in blocks of 2048 bytes.
* Flash memory starts at 0x08000000
* The Espruino board has 256kB of Flash memory (or you can check with ```process.memory().flash_length```)
* Bytes ```0x08000000``` to ```0x08002800``` are the bootloader. Doing ANYTHING with these will almost certainly break your board permanently (requiring a re-flash using a USB-TTL convertor).
* From ```0x08002800``` to ```process.memory().flash_binary_end``` is Espruino (usually around 200kB - **but this will increase in the future**). Overwriting this will require a re-flash of your board via the bootloader
* From ```process.memory().flash_code_start``` to ```0x08000000+256kB``` is used for your saved program
* This means that between ```0x08000000 + sizeof(your_espruino_binary_file.bin)``` and ```0x08000000+256kB-40kB``` is free for your use - roughly 16kB.

Figuring out what memory is free
----------------------------

```process.memory()``` returns information on the addresses of various things on the device. For instance you can see how much spare memory there is by calling ```process.memory().flash_code_start - process.memory().flash_binary_end```. To find the first page that you can safely erase, you can type:

```
(process.memory().flash_binary_end+2047)&~2047
```

It's also good practice to check if there's anything in the page of flash. If it's all ```0xFF``` (4 bytes of `0xFF` is `0xFFFFFFFF`, which is bitwise equivalent to `-1`) then you're safe to overwrite it:

```
function isPageSafe(addr) {
  for (var i=addr;i<addr+2048;i+=4)
    if (peek32(i)^-1) return false;
  return true;
}

isPageSafe((process.memory().flash_binary_end+2047)&~2047)
// returns true - it's all fine

isPageSafe(((process.memory().flash_binary_end+2047)&~2047) - 2048)
// returns false - don't use this address!
```


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

