/* Copyright (c) 2018 Andreas Dröscher. See the file LICENSE for copying permission. */
/*
Module for emulating a NFC Forum Type 2 Tag.

```
var tag = require("NFCTag").create(data);
```
*/
function NFCTag(data) {
  this.setData(data);
  var self = this;
  NRF.on('NFCrx', function(rx) {
    if(rx) self._rxCallBack(rx);
  });
}

/** 
 * For internal use - Receive Callback
 */
NFCTag.prototype._rxCallBack = function(rx) {
  switch(rx[0]) {
  case 0x30: //command: READ
    this._read(rx);
    break;
  case 0xa2: //command: WRITE
    this._write(rx);
    break;
  default:   //just, re-enable rx
    NRF.nfcSend();
    break;
  }
};

/** 
 * For internal use - Handle READ
 */
NFCTag.prototype._read = function(rx) {
  //calculate block index
  var idx = rx[1]*4;

  //prepare data (pad to 16 bytes)
  var view = new Uint8Array(this._data.buffer, idx, 16);
  var tx = Uint8Array(16);
  tx.set(view, 0);

  //send response
  NRF.nfcSend(tx);
};

/**
 * For internal use - Handle WRITE
 */
NFCTag.prototype._write = function(rx) {
  //calculate block index
  var idx = rx[1]*4;

  //store data if it fits into memory
  if(idx > this._data.length) {
    NRF.nfcSend(0x0);
  } else {
    var view = new Uint8Array(rx, 2, 4);
    this._data.set(view, idx);
    NRF.nfcSend(0xA);
  }
};

/**
 * Set Tag contents
 */
NFCTag.prototype.setData = function(data) {
  //shutdown
  NRF.nfcStop();

  //store data
  this._data = data || new Uint8Array(540);
  
  //re-start
  var header = NRF.nfcStart();
  
  //store UID/BCC
  this._data.set(header, 0);
};

/**
 * Retrieve tag contents as Uint8Array
 */
NFCTag.prototype.getData = function() {
  return this._data;
};

/** 
 * Creates an NFCTag instance.
 *
 * At most one NFCTag instance may
 * exist at any given time.
 */
exports.create = function(data) {
  return new NFCTag(data);
};