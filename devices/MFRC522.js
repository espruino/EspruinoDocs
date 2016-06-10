/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
var R = {
  COMMAND : 0x01<<1,
  COMIEN : 0x02<<1,
  DIVIEN : 0x03<<1,
  COMIRQ : 0x04<<1,
  DIVIRQ : 0x05<<1,
  ERROR : 0x06<<1,
  FIFODATA : 0x09<<1,
  FIFOLEVEL : 0x0A<<1,
  BITFRAMING : 0x0D<<1,
  COLLISION : 0x0E<<1,
  TXCONTROL : 0x14<<1,
  TXAUTO : 0x15<<1,
  MODE : 0x2A<<1,
  PRESCALER : 0x2B<<1,
  RELOADH : 0x2C<<1,
  RELOADL : 0x2D<<1,
  VERSION : 0x37<<1
};

var PICC = {
  REQA : 0x26,
  SELECT1 : 0x93
};

var PCD = { 
  IDLE : 0x00,
  TRANSCIEVE : 0x0C
};

function MFRC522(spi, cs) {
  this.spi = spi;
  this.cs = cs;
}

MFRC522.prototype.r = function(addr) {
  return this.spi.send([addr|0x80,0], this.cs)[1];
};

MFRC522.prototype.ra = function(addr, c) {
  var a = new Uint8Array(c+1);
  a.fill(addr|0x80);
  a[c]=0;
  return this.spi.send(a, this.cs).slice(1);
};


MFRC522.prototype.w = function(addr,data) {
  this.spi.write(addr, data, this.cs);
};

MFRC522.prototype.antenna = function(on) {
  if (on) this.w(R.TXCONTROL, this.r(R.TXCONTROL) | 0x03);
  else this.w(R.TXCONTROL, this.r(R.TXCONTROL) & ~0x03);
};

MFRC522.prototype.init = function() {
  this.w(R.MODE, 0x8D);
  this.w(R.PRESCALER, 0x3E);
  this.w(R.RELOADL, 30);
  this.w(R.RELOADH, 0);
  this.w(R.TXAUTO, 0x40);
  this.w(R.MODE, 0x3D);
  this.antenna(1);
};

MFRC522.prototype.req = function(data) {  
  this.w(R.COMMAND, PCD.IDLE);
  this.w(R.COMIEN, 0x80 | 0x77);
  this.w(R.COMIRQ, 0x7F); // clear IRQs
  this.w(R.FIFOLEVEL, 0x80); // clear fifo
  this.w(R.FIFODATA, data); // write request
  this.w(R.COMMAND, PCD.TRANSCIEVE);
  this.w(R.BITFRAMING, this.r(R.BITFRAMING)|0x80); // start TX
  //while (!(this.r(R.COMIRQ)&0x31)); // wait doesn't seem to be needed
  this.w(R.BITFRAMING, this.r(R.BITFRAMING)&~0x80); // stop TX
  var err = this.r(R.ERROR);
  if (err) throw new Error("MFRC522 Request Error "+err);
  var fifo = this.r(R.FIFOLEVEL);
  return this.ra(R.FIFODATA,fifo);
};

MFRC522.prototype.isNewCard = function() {
  this.w(R.BITFRAMING, 0x07); // TX only 7 bits in last byte (?)
  return this.req(PICC.REQA).length>0;
};

MFRC522.prototype.getCardSerial = function() {
  // isNewCard must be called first
  this.w(R.BITFRAMING, 0x00); // TX all bits in last byte
  var r = this.req([PICC.SELECT1,0x20]);
  if (r.length==5) return r.slice(0,-1); // cut off CRC
  else return [];
};

MFRC522.prototype.findCards = function(callback) {
  // TODO: We can do this better I think - and can detect multiple cards
  if (this.isNewCard()) {
    callback(this.getCardSerial());
  }
};


exports.connect = function(spi, cs) {
  var m = new MFRC522(spi, cs);
  m.init();
  return m;
};

