/* Copyright (c) 2015 Dennis Bemmann. See the file LICENSE for copying permission. */
/*
Brain.js
========

This module interfaces the NeuroSky ThinkGear ASIC module (TGAM) for use with Espruino.

The module returns the following information:
- signal quality
- attention value
- meditation value
- EEG power band values for the following brain waves as 24 bit unsigned integers:
  delta, theta, low-alpha, high-alpha, low-beta, high-beta, low-gamma, mid-gamma
  
Currently only "normal output mode" of the TGAM is supported. When interfacing a TGAM
in "raw output mode", Brain.js should still correctly parse all received packets and
return the above values but ignore the raw data.

Usage:

1) Wire TGAM board to Espruino board
  | TGAM pin   | Espruino pin
  | ---------- | ------------
  | -          | GND
  | +          | 3.3
  | T          | Any Serial RX pin, for example A3

2) Write some code
   function processBrainData(data) {console.log(data.field, data.value);}  // event handler that just dumps data
   brain = require('Brain').connect(Serial2, A3, 9600);                    // initialize Brain module
   brain.on('data', processBrainData);                                     // hook up event handler

Disclaimer: use at your own risk.

Useful links:
TGAM Datasheet: http://www.seeedstudio.com/document/pdf/TGAM%20Datasheet.pdf
TGAM Protocol: http://developer.neurosky.com/docs/doku.php?id=thinkgear_communications_protocol
*/

function Brain(serial, rxPin, baud) {
  uartOptions = {bytesize: 8, parity:'none', stopbits:1, rx: rxPin};
  this.buf = '';
  //this.dataHandlers = [];
  this.serial = serial;
  this.serial.setup(baud, uartOptions);
  var serialDataHandler = (function(that){return (function(data){that.tgamReceive(data);});})(this);
  this.serial.on('data', serialDataHandler);
}

Brain.prototype.tgamReceive = function(input) {
  this.buf += input;
  // keep discarding data until sync byte encountered
  while ((this.buf.length > 0) && (this.buf.charCodeAt(0) != 0xAA)) this.buf = this.buf.substr(1);
  // make sure next byte is also a sync byte, otherwise discard
  if (this.buf.length < 2) return;
  if (this.buf.charCodeAt(1) != 0xAA) {
    this.buf = '';
    return;
  }
  // read packet length
  while (this.buf.charCodeAt(2) == 0xAA) this.buf = this.buf.substr(1);
  if (this.buf.length < 4) return;
  var plen = this.buf.charCodeAt(2);
  if (plen > 170) { // plength too large
    this.buf = '';
    return;
  }
  if (this.buf.length < plen+4) return; // packet not fully received yet
  var streamChecksum = this.buf.charCodeAt(plen+3);
  var myChecksum = 0;
  var payload = new ArrayBuffer(plen);
  for (var i=0; i<plen; i++) {
    payload[i] = this.buf.charCodeAt(3+i);
    myChecksum += payload[i];
  }
  myChecksum = (myChecksum & 0xff) ^ 0xff;
  this.buf = '';
  if (myChecksum != streamChecksum) return;
  // handle payload
  var ptr = 0;
  var code, vlen, data=[];
  while (ptr < payload.length) {
    code = 0;
    while (payload[ptr] == 0x55) { code += 256; ptr++; }
    code |= payload[ptr];
    // code is now a two-byte value consisting of MSB = excode, LSB = code byte
    ptr++;
    vlen = 1;
    if ((code&0xff) >= 0x80) { vlen = payload[ptr]; ptr++; }
    if ((code >= 2) && (code <= 7)) data.push({
      field: ['poorSignal', 'heart', 'attention', 'meditation', 'raw', 'marker'][code-2],
      value: payload[ptr]
    });
    else if (code == 0x0083) for (i=0; i<8; i++) data.push({
      field: ['delta','theta','lowAlpha','highAlpha','lowBeta','highBeta','lowGamma','midGamma'][i],
      value: payload[ptr+3*i]*16384 + payload[ptr+3*i+1]*256 + payload[ptr+3*i+2]
    });
    else data.push({field:code.toString(16), ptr:ptr, vlen:vlen});
    ptr += vlen;
  }
  // invoke data event handler for all data fields
  for (i=0; i<data.length; i++)
    this.emit('data', data[i]);
};

exports.connect = function(serial, rxPin, baud) {
  return new Brain(serial, rxPin, baud);
};
