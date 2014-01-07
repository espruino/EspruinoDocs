/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Module for handling flash memory on the STM32F103RC in the Espruino Board

**BEWARE - THERE BE DRAGONS...**

Flash memory contains Espruino, and the bootloader. Incorrect use of this module could stop your Espruino board from working.

```
var adr = 0x0803E000;
var f = require("STM32F1Flash");
console.log(f.read(adr).toString(16)); // probably FFFFFFFF
f.unlock();
f.erase(adr);
console.log(f.read(adr).toString(16)); // definitely FFFFFFFF
f.write(adr,0xCAFEBABE);
console.log(f.read(adr).toString(16)); // now CAFEBABE
```
*/

var KEYR = 0x40022004;
var SR = 0x4002200C;
var CR = 0x40022010;
var AR = 0x40022014;
function wait() {
  while (peek32(SR)&1); // busy
  if (peek32(SR)&4) console.log("PGERR");
  if (peek32(SR)&16) console.log("WRPRTERR");
}

exports.unlock = function() { // unlock memory
  poke32(KEYR, 0x45670123);
  poke32(KEYR, 0xCDEF89AB);
};

exports.read = function(addr) { // read a 32 bit word
  if (addr&3) return false; // wrong offset
  return peek32(addr);
};

exports.write = function(addr, val) { // write a 32 bit word
  if (addr&3) return false; // wrong offset
  wait();
  poke32(CR, peek32(CR)|1); // PG_Set
  poke16(addr, val&0xFFFF);
  wait();
  poke16(addr+2, (val>>16)&0xFFFF);
  wait();
  poke32(CR, peek32(CR)&~1); // ~PG_Set
};

exports.erase = function(addr) { // erase a page
  if (addr&2047) return false; // wrong offset
  wait();
  poke32(CR, peek32(CR)|2); // PER_Set
  poke32(AR, addr);
  poke32(CR, peek32(CR)|64); // STRT_Set
  wait();
  poke32(CR, peek32(CR)&~2); // ~PER_Set
  return true;
};

