/** Create a new Flash EEPROM.

 `addr` - addr to start at (if left off, this will be the address 
   after the last page of Flash. In the Original Espruino and 
   Espruino Pico, this is an flash page that isn't supposed to
   be in the chip - but which is on every one we have tested.
   
 `flash` - the flash object to use (it will use the internal 
   flash if this undefined). If an object implements read, write,
   erasePage and getPage then it can be used 
*/ 
function FlashEEPROM(addr, flash) {
  if (addr) {
    this.addr = addr;
  } else {
    var mem = process.memory();
    if (!mem.flash_start || !mem.flash_length)
      throw "process.memory() didn't contain information about flash memory";  
    this.addr = mem.flash_start + mem.flash_length;
  }
  this.flash = flash ? flash : require("Flash");
  var page = this.flash.getPage(this.addr);
  if (!page) throw "Couldn't find flash page";
  this.addr = page.addr;
  this.endAddr = page.addr+page.length;
}

/** Read the current value of a key (key must be between 0 and 255).
 This will return a Uint8Array */
FlashEEPROM.prototype.read = function(addr) { 
  // search for the last occurrence of the address in flash
  var n = this.addr;
  var key = this.flash.read(4, n);
  var lastAddr = -1;
  while (key[3]!=255 && n<this.endAddr) {
    if (key[0] == addr) lastAddr = n;
    n += (key[1]+7) & ~3;
    key = this.flash.read(4, n);
  }
  // if not found, return undefined
  if (lastAddr<0) return undefined;
  // else get the key again, and return that many characters
  key = this.flash.read(4, lastAddr);
  return this.flash.read(key[1], lastAddr+4);
};

/// return the current values of all keys in an array
FlashEEPROM.prototype.readAll = function(addr) { 
  var data = [];
  var n = this.addr;
  var key = this.flash.read(4, n);
  var lastAddr = -1;
  while (key[3]!=255 && n<this.endAddr) {
    if (key[1])
      data[key[0]] = this.flash.read(key[1], n+4);
    n += (key[1]+7) & ~3;
    key = this.flash.read(4, n);
  }
  return data;
};

/// Internal function to write a data block
FlashEEPROM.prototype._write = function(n, addr, data) {
  // now write header
  this.flash.write(new Uint8Array([addr, data.length, 0, 0]), n);
  // write data
  n+=4;
  if (data.length!=4) {
    var d = new Uint8Array((data.length+3)&~3);
    d.set(data);
    data = d;
  }
  if (data.length) this.flash.write(data, n);
  return n+data.length;
};

/** Write a new value.  Addr must be between 0 and 255, data 
 can be a string or uint8array but cannot be longer than 255 bytes */
FlashEEPROM.prototype.write = function(addr, data) { 
  data = E.toUint8Array(data);
  // search for the last used address in flash
  var n = this.addr;
  var key = this.flash.read(4, n);
  var lastAddr = -1;
  while (key[3]!=255 && n<this.endAddr) {
    if (key[0] == addr) lastAddr = n;
    n += (key[1]+7) & ~3;
    key = this.flash.read(4, n);
  }
  // If we had the key already, check if it is the same
  if (lastAddr>=0) {
    key = this.flash.read(4, lastAddr);
    var oldData = this.flash.read(key[1], lastAddr+4);
    if (oldData == data) return;
  }
  // test if we have enough memory
  if (n+data.length+4>=this.endAddr) {
    n = this.cleanup();
    if (n+data.length+4>=this.endAddr)
      throw "Not enough memory!";
  }
  //
  this._write(n, addr, data);
};

/// Read all data, erase the page, and write it back (removing duplicates)
FlashEEPROM.prototype.cleanup = function() {
  var data = this.readAll();
  this.flash.erasePage(this.addr);
  var n = this.addr;
  for (var addr in data) {
    if (data[addr]!==undefined)
      n = this._write(n, addr, data[addr]);
  }
  return n;
};

/// Erase everything
FlashEEPROM.prototype.erase = function() {
  this.flash.erasePage(this.addr);
};

exports = FlashEEPROM;
