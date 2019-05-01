/* Copyright (c) 2015 Dennis Bemmann. See the file LICENSE for copying permission. */
/*
W25.js
========

https://github.com/pastaclub/espruino-w25q

Driver for Winbond 25Q series SPI Flash RAM
Tested with W2580BV, http://www.adafruit.com/datasheets/W2580BV.pdf
*/

function W25(spi, csPin) {
  this.spi = spi;
  this.csPin = csPin;
}

W25.prototype.seek = function (pageNumber, offset) {
  // seeks to an address for sequential reading
  this.command(0x03);
  this.setAddress(pageNumber, offset);
  // stays selected until client finishes reading
};

W25.prototype.read = function () {
  // reads a byte
  return this.spi.send(0);
};

W25.prototype.waitReady = function () {
  // waits until chip is ready
  this.command(0x05);
  while (this.read() & 1);
  digitalWrite(this.csPin, 1);
};

W25.prototype.eraseChip = function () {
  // overwrite whole chip with 0xFF
  this.command(0x06);
  this.command(0xC7);
  this.waitReady();
};

W25.prototype.erase16Pages = function (pageNumber) {
  // overwrite 16 pages (of 256 bytes each) with 0xFF
  this.command(0x06);
  this.command(0x20);
  this.setAddress(pageNumber, 0);
  this.waitReady();
};

W25.prototype.writePage = function (pageNumber, arrayBuffer) {
  // overwrites a page (256 bytes)
  // that memory MUST be erased first
  this.startWrite(pageNumber, 0);
  this.spi.write(arrayBuffer);
  this.finish();
};

W25.prototype.writePageFillSpace = function (pageNumber, arrayBuffer) {
  // overwrites a page (256 bytes)
  // that memory MUST be erased first
  this.startWrite(pageNumber, 0);
  // for (var i = 0; i < arrayBuffer.length; i++)
  // this.write(arrayBuffer[i]);
  for (var i = 0; i < 256; i++) {
    if (i < arrayBuffer.length)
      this.write(arrayBuffer[i]);
    else
      this.write(' ');
  }
  this.finish();
};

W25.prototype.writeSector = function (pageNumber, arrayBuffer) {
  // overwrites a sector (256*16 bytes)
  // that memory MUST be erased first
  // todo: check if arrayBuffer has 256*16 bytes
  for (p = 0; p < 16; p++) {
    pageToWrite = pageNumber + p;
    pageStart = p * 256;
    pageEnd = pageStart + 256;
    page = arrayBuffer.slice(pageStart, pageEnd);
    this.startWrite(pageToWrite, 0);
    this.spi.write(page);
    this.finish();
  }
};

W25.prototype.startWrite = function (pageNumber, offset) {
  // seeks to address for sequential overwriting of memory
  // that memory MUST be erased first!
  // to end the operation, call finish
  this.command(0x06);
  this.command(0x02);
  this.setAddress(pageNumber, offset);
};

W25.prototype.send = function (data) {
  // sends data and returns result
  return this.spi.send(data);
};

W25.prototype.write = function (data) {
  // writes data without returning result
  this.spi.write(data);
};

W25.prototype.finish = function () {
  // ends current operation, for example a sequential write
  digitalWrite(this.csPin, 1);
  this.waitReady();
};

W25.prototype.getJedec = function () {
  // gets chips's JEDEC information
  this.command([0x90, 0, 0, 0]);
  var res = {};
  res.manufacturerId = this.read();
  res.deviceId = this.read();
  digitalWrite(this.csPin, 1);
  return res;
};

W25.prototype.getCapacity = function () {
  // gets chip's capacity
  this.command(0x9f);
  this.read();
  var cap = this.read() * 16384;
  digitalWrite(this.csPin, 1);
  return cap;
};

W25.prototype.command = function (cmd) {
  // for internal use only
  digitalWrite(this.csPin, 1);
  digitalWrite(this.csPin, 0);
  this.spi.write(cmd);
};

W25.prototype.setAddress = function (pageNumber, offset) {
  // for internal use only
  this.spi.write([
    (pageNumber >> 8) & 0xFF,
    (pageNumber >> 0) & 0xFF,
    (offset >> 0) & 0xFF
  ]);
};

W25.prototype.readPage = function (pageNumber) {
  this.seek(pageNumber, 0);
  return this.spi.send({ data: 0, count: 256 });
}

W25.prototype.readSector = function (sector) {
  var pageNumber = sector * 16;
  this.seek(pageNumber, 0);
  return this.spi.send({ data: 0, count: 256 * 16 });
}

W25.prototype.readPageString = function (page) {
  var x = "";
  this.seek(page, 0);
  for (i = 0; i < 256; i++) {
    x += String.fromCharCode(this.spi.send(0));
  }
  return x;
}

exports.connect = function (spi, csPin) {
  var flash = new W25(spi, csPin);
  jedec = flash.getJedec();
  if ((jedec.manufacturerId != 0xEF) || (jedec.deviceId != 0x13)) flash = null;
  return flash;
};

exports = W25;
