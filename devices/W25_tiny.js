/* Copyright (c) 2024 Gordon Williams. See the file LICENSE for copying permission. */
exports = function(spi, CS) {
  return {
    waitReady : function() {
      while (spi.send([0x05,0],CS)[1]&1){}
    }, erase16Pages : function(page){
      spi.write([0x06],CS);
      spi.write([0x20,page>>8,page&0xFF,0],CS);
      this.waitReady();
    }, writePage : function(page,d){
      spi.write([0x06],CS);
      spi.write([0x02,page>>8,page&0xFF,0],d,CS);
      this.waitReady();
    }, readPage : function(page) {
      CS.reset();
      spi.write([0x03,page>>8,page&0xFF,0]);
      return spi.send({ data: 0, count: 256 },CS);
    }
  }
};
