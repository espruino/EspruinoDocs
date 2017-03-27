<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
EEPROM on Flash
===============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/FlashEEPROM. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Flash,EEPROM,storage,non-volatile,memory,rom,storage

STM32-based chips don't have nonvolatile EEPROM memory (which can be changed one byte at a
time). Instead, they have Flash memory in which 32 bit words can be written one at a time,
*but not overwritten*.

To overwrite some data, you need to erase an entire flash page, which could be as much as 128kB long!

To work around this, We've provided a 'Fake EEPROM' module called [[FlashEEPROM.js]].

This stores a 'journal' of all written data. When you write something new to it, that data
goes on the end of the journal (if it's too long, everything is read into RAM, the page is
erased, and only the latest values are written back).

You use it as follows:

```
/* No arguments mean use the default, which will work on the Original Espruino or Espruino Pico
 You can supply extra arguments to choose which flash page you'll use, and even whether you
 use external flash memory - but be careful when doing this. You can accidentally overwrite
 Espruino itself! */
var f = new (require("FlashEEPROM"))();

f.write(0, "Hello");
f.write(1, "World");
//.. you can write to any address between 0 and 255, with any data up to 65536 chars long

f.read(0)
// returns new Uint8Array([72, 101, 108, 108, 111])

E.toString(f.read(1))
// returns "World"

f.readMem(0)
// returns "Hello" - this is a special string that is accessed directly from ROM
// (and is not loaded into RAM first)

f.readAll();
// returns [
//  new Uint8Array([72, 101, 108, 108, 111]),
//  new Uint8Array([87, 111, 114, 108, 100])
// ]

f.write(1, "Espruino");
// has now overwritten 'World'

E.toString(f.read(1))
// returns "Espruino"

/* You can tidy up the journal if you want, removing any values that were
overwritten by subsequent writes. It can take around a second though */
f.cleanup();

// Or clear absolutely everything out of memory
f.erase();

```

Speed
-----

This module can be quite slow as it will scan all of the flash page for data. The more times
you change the data, the bigger the journal gets, and the slower both reads and writes will get.

You can explicitly call `f.cleanup()` which will re-write the data to just what is needed, but
you should be aware that flash memory has a fixed number of write cycles (see the IC's datasheet)
so you should try and do this as rarely as possible.

Another option is to limit the amount of Flash memory that can be used. This is a good idea if
you're using something like the Espruino Pico that will default to using the full 128kB page!

```
// Use only 1024 bytes
f.endAddr = f.addr+1024;
```


Reference
--------------

* APPEND_JSDOC: FlashEEPROM.js


Using
-----

* APPEND_USES: FlashEEPROM
