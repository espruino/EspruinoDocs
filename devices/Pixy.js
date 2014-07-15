/* Copyright (c) 2014 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Module for CMUcam5 'Pixy' camera


```
SPI2.setup({sck : B13, miso : B14, mosi : B15, baud : 1000000});
var pixy = exports.connect(SPI2);
console.log(pixy.getBlocks());
```

*/
var C = {
  PIXY_START_WORD        : 0xaa55,
  PIXY_START_WORDX       : 0x55aa,
  PIXY_MAXIMUM_ARRAYSIZE : 130,
  PIXY_SYNC_BYTE         : 0x5a,
  PIXY_SYNC_BYTE_DATA    : 0x5b,
  PIXY_OUTBUF_SIZE       : 6
};

function Pixy(spi) {
  this.spi = spi;
  this.skipStart = false;
  this.outIndex = 0;
  this.outBuf = undefined;
}
  
/** For internal use - get a work and send out any queued up data */
Pixy.prototype.getWord = function() {
  // ordering is different because Pixy is sending 16 bits through SPI 
  // instead of 2 bytes in a 16-bit word as with I2C
  var w, cout = 0;

  if (outBuf)
  {
    w = this.spi.send(C.PIXY_SYNC_BYTE_DATA);
    cout = outBuf[outIndex++];
    if (outIndex==outLen)
      outBuf = undefined; 
  }
  else
    w = this.spi.send(C.PIXY_SYNC_BYTE);
  return (w<<8) | this.spi.send(cout);
};
  
/** For internal use - get a single byte */
Pixy.prototype.getByte = function() {
  return this.spi.send(0x00);
};

/** For internal use - queue the given data to be sent */
Pixy.prototype.send = function(data) {
  if (outBuf) return -1;
  outBuf = data;
  outIndex = 0;
  return len;
};

/** For internal use - get the start of a frame */
Pixy.prototype.getStart = function() {
  var lastw = 0xffff;
  while(true) {
    var w = this.getWord();

    if (w===0 && lastw===0) {
//    delayMicroseconds(10);
      return false;
    } else if (w==C.PIXY_START_WORD && lastw==C.PIXY_START_WORD)
      return true;
    else if (w==C.PIXY_START_WORDX) {
      console.log("reorder");
      this.getByte(); // resync
    }
    lastw = w;
  }
};

/** Get an array of tracked blocks in the form:

  { id: number, x: number, y: number, width: number, height: number }
*/
Pixy.prototype.getBlocks = function() {
  var blocks = [];
  
  if (!this.skipStart) {
    if (!this.getStart())
      return [];
  } else
    this.skipStart = false;
	
  while (blocks.length < C.PIXY_MAXIMUM_ARRAYSIZE) {
    var checksum = this.getWord();
    if (checksum==C.PIXY_START_WORD) {
      // we've reached the beginning of the next frame
      this.skipStart = true;
      return blocks;
    }
    else if (checksum===0)
      return blocks;

    var block = {
      id : this.getWord(),
      x : this.getWord(),
      y : this.getWord(),
      width : this.getWord(),
      height : this.getWord()
    };

    if (checksum==block.id+block.x+block.y+block.width+block.height)
      blocks.push(block);
    else
      console.log("cs error");

    if (this.getWord()!=C.PIXY_START_WORD)
      return blocks;
  }
  return blocks;
};
  
/** Return a new Pixy object that's connected to the given SPI port */
exports.connect = function(spi) {
  return new Pixy(spi);
};
