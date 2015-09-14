/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 
Module for the NRF24L01+ wireless transceiver

Just do the following for a Slave:

```
SPI1.setup({sck:A5, miso:A6, mosi:A7});
var nrf = require("NRF24L01P").connect( SPI1, C4, C5, 4 );
nrf.init([0,0,0,0,1], [0,0,0,0,2]);
setInterval("nrf.slaveHandler()",50);
```  

And the following for a Master:

```
SPI1.setup({sck:A5, miso:A6, mosi:A7});
var nrf = require("NRF24L01P").connect( SPI1, C4, C5, 4 );
nrf.init([0,0,0,0,2], [0,0,0,0,1]);
setInterval("nrf.masterHandler()",50);
```  

Note the two addresses that are given to init - one is the transmit address, one is a receive address. On a Master all you have to do is use nrf.sendCommand to send a command to the Slave Espruino, and in a few milliseconds the result will appear:

```JavaScript
nrf.sendCommand("1+2", function(r) { print("=="+r); });
==3

nrf.sendCommand("analogRead(A0)", function(r) { print("=="+r); });
==0.356694

nrf.sendCommand("LED2.set()", function(r) { print("=="+r); });
==undefined
```

 */
var C = {
  // Registers
  CONFIG      : 0x00,
  EN_AA       : 0x01,
  EN_RXADDR   : 0x02,
  SETUP_AW    : 0x03,
  SETUP_RETR  : 0x04,
  RF_CH       : 0x05,
  RF_SETUP    : 0x06,
  STATUS      : 0x07,
  OBSERVE_TX  : 0x08,
  CD          : 0x09,
  RX_ADDR_P0  : 0x0A,
  RX_ADDR_P1  : 0x0B,
  RX_ADDR_P2  : 0x0C,
  RX_ADDR_P3  : 0x0D,
  RX_ADDR_P4  : 0x0E,
  RX_ADDR_P5  : 0x0F,
  TX_ADDR     : 0x10,
  RX_PW_P0    : 0x11,
  RX_PW_P1    : 0x12,
  RX_PW_P2    : 0x13,
  RX_PW_P3    : 0x14,
  RX_PW_P4    : 0x15,
  RX_PW_P5    : 0x16,
  FIFO_STATUS : 0x17,

  // Bits
  MASK_RX_DR  : 1<<6, // CONFIG
  MASK_TX_DS  : 1<<5,
  MASK_MAX_RT : 1<<4,
  EN_CRC      : 1<<3,
  CRCO        : 1<<2,
  PWR_UP      : 1<<1,
  PRIM_RX     : 1<<0,
  ENAA_P5     : 1<<5, // EN_AA
  ENAA_P4     : 1<<4,
  ENAA_P3     : 1<<3,
  ENAA_P2     : 1<<2,
  ENAA_P1     : 1<<1,
  ENAA_P0     : 1<<0,
  ERX_P5      : 1<<5, // EN_RXADDR
  ERX_P4      : 1<<4,
  ERX_P3      : 1<<3,
  ERX_P2      : 1<<2,
  ERX_P1      : 1<<1,
  ERX_P0      : 1<<0,
  AW          : 1<<0, // SETUP_AW
  ARD         : 1<<4, // SETUP_RETR
  ARC         : 1<<0,
  PLL_LOCK    : 1<<4, // RF_SETUP
  RF_DR_HIGH  : 1<<3,
  RF_DR_LOW   : 1<<5,
  RF_PWR      : 1<<1,
  RX_DR       : 1<<6, // STATUS
  TX_DS       : 1<<5,
  MAX_RT      : 1<<4,
  RX_P_NO     : 1<<1,
  RX_P_NO_FIFO_EMPTY : 7<<1,
  TX_FULL     : 1<<0,
  PLOS_CNT    : 1<<4, // OBSERVE_TX
  ARC_CNT     : 1<<0,
  TX_REUSE    : 1<<6, // FIFO_STATUS
  FIFO_FULL   : 1<<5,
  TX_EMPTY    : 1<<4,
  RX_FULL     : 1<<1,
  RX_EMPTY    : 1<<0,

  // Instructions
  R_REGISTER    : 0x00,
  W_REGISTER    : 0x20,
  REGISTER_MASK : 0x1F,
  R_RX_PAYLOAD  : 0x61,
  W_TX_PAYLOAD  : 0xA0,
  FLUSH_TX      : 0xE1,
  FLUSH_RX      : 0xE2,
  REUSE_TX_PL   : 0xE3,
  NOP           : 0xFF
};

var BASE_CONFIG = C.EN_CRC;

function NRF(_spi, _csn, _ce, _payload) {
  this.CSN = _csn;
  this.CE = _ce;
  this.PAYLOAD = _payload ? _payload : 16;
  this.cmd = ""; // for receiving commands
  this.spi = _spi;
  this.callbacks = []; // array of callbacks
}

/** Public constants */
NRF.C = {
  RX_ADDR_P0  : 0x0A,
  RX_ADDR_P1  : 0x0B,
  RX_ADDR_P2  : 0x0C,
  RX_ADDR_P3  : 0x0D,
  RX_ADDR_P4  : 0x0E,
  RX_ADDR_P5  : 0x0F,
  TX_ADDR     : 0x10
};

/** Initialise the NRF module. Takes a 5 byte array for both RX and TX addresses */
NRF.prototype.init = function(rxAddr, txAddr) {
  digitalWrite(this.CE,0);
  digitalWrite(this.CSN,1);
  this.setRXAddr(rxAddr);
  this.setTXAddr(txAddr);
  for (var i=C.RX_PW_P0;i<=C.RX_PW_P5;i++) this.setReg(i, this.PAYLOAD);
  this.setReg(C.CONFIG, BASE_CONFIG | C.PWR_UP | C.PRIM_RX); // RX mode
  this.setReg(C.SETUP_RETR, 0b01011111); // setup ARD 0101 (6*250uS retransmit delay) and ARC 1111 (15 retransmit count)
  digitalWrite(this.CE,1); // set active
};
/** Set whether the NRF module is enabled */
NRF.prototype.setEnabled = function(isEnabled) {
  digitalWrite(this.CE, isEnabled);
};
/** Set an register (for internal use only) */
NRF.prototype.setReg = function(reg, value) {
  this.spi.send([C.W_REGISTER | reg, value], this.CSN);
};
/** Set an address (for internal use only) */
NRF.prototype.setAddr = function(reg, value /* 5 byte array*/) {
  value = value.clone();
  value.splice(0,0,C.W_REGISTER | reg);
  this.spi.send(value, this.CSN);
};
/** Set receive address (a 5 byte array). Optional pipe argument. Note that pipes>1 share pipe 1's last 4 address digits */
NRF.prototype.setRXAddr = function(adr, pipe) {
  if (pipe===undefined) pipe=1;
  else this.setReg(C.EN_RXADDR, this.getReg(C.EN_RXADDR) | 1<<pipe); // enable RX addr
  // addresses > 1 use the last 4 bytes from ADDR_P1
  this.setAddr(C.RX_ADDR_P0+pipe,(pipe<2) ? adr : [adr[0]]);
};
/** Set the transmit address (a 5 byte array) */
NRF.prototype.setTXAddr = function(adr /* 5 byte array*/) {
  this.setAddr(C.RX_ADDR_P0,adr);
  this.setAddr(C.TX_ADDR,adr);
};
/** Get the value of the given register (for internal use only) */
NRF.prototype.getReg = function(reg) {
  return this.spi.send([C.R_REGISTER | reg, 0], this.CSN)[1];
};
/** Get the configured address. reg should be NRF.C.TX_ADDR,C.RX_ADDR_P0..4 */
NRF.prototype.getAddr = function(reg) {
  var data = this.spi.send([C.R_REGISTER | reg, 0,0,0,0,0], this.CSN);
  data = data.slice(1); // remove first
  if (reg>C.RX_ADDR_P1) {
    // addresses > 1 use the last 4 bytes from ADDR_P1
    var fullAddr = this.getAddr(C.RX_ADDR_P1);
    fullAddr.splice(0,1,data[0]);
    return fullAddr;
  }
  return data;
};
/** Get the contents of the status register */
NRF.prototype.getStatus = function(reg) {
  return this.getReg(C.STATUS);
};
/** Set the data rate, Either 250000, 1000000 or 2000000 */
NRF.prototype.setDataRate = function(rate) {
  var rates = { 250000:C.RF_DR_LOW, 1000000:0,2000000:C.RF_DR_HIGH };
  if (!rate in rates) console.log("Unknown rate");
  this.setReg(C.RF_SETUP, (this.getReg(C.RF_SETUP)&~(C.RF_DR_LOW|C.RF_DR_HIGH))|rates[rate]);
};
/** Set the transmit power - takes a value from 0 (lowest) to 3 (highest) */
NRF.prototype.setTXPower = function(pwr) {
  this.setReg(C.RF_SETUP, (this.getReg(C.RF_SETUP)&~(3*C.RF_PWR))|((pwr&3)*C.RF_PWR));
};
/** return undefined (if no data) or the pipe number of the data we're expecting */
NRF.prototype.getDataPipe = function() {
  var r = this.getReg(C.STATUS)&C.RX_P_NO_FIFO_EMPTY;
  return (r==C.RX_P_NO_FIFO_EMPTY) ? undefined : (r>>1); 
};

/** If there is data available, return an array if PAYLOAD size containing it */
NRF.prototype.getData = function() {
  var data = [C.R_RX_PAYLOAD];
  for (var i=0;i<this.PAYLOAD;i++) data.push(0);
  data = this.spi.send(data, this.CSN); // RX_DR bit
  data = data.slice(1); // remove first
  this.setReg(C.STATUS, C.RX_DR); // clear rx flag
  return data;
};

/** Send a single packet (of length PAYLOAD). Returns true on success */
NRF.prototype.send = function(data/* array of length PAYLOAD */) {
  this.setReg(C.STATUS, C.MAX_RT | C.TX_DS); // clear flags
  digitalWrite(this.CE,0); // disable
  this.setReg(C.CONFIG, BASE_CONFIG | C.PWR_UP ); // Set TX mode
  this.spi.send(C.FLUSH_TX, this.CSN);
  data = data.clone();
  data.splice(0,0,C.W_TX_PAYLOAD);
  this.spi.send(data, this.CSN);
  digitalWrite(this.CE,1); // enable
  var n = 1000;
  while ((n--) && !(this.getReg(C.STATUS)&(C.MAX_RT|C.TX_DS))) {}; // waiting
  if (n<=0) print("TX timeout");
  var success = true;
  if (this.getReg(C.STATUS) & C.MAX_RT) {
    print("TX not received "+this.getReg(C.STATUS));
    success = false;
  }
  digitalWrite(this.CE,0); // disable
  this.setReg(C.CONFIG, BASE_CONFIG | C.PWR_UP | C.PRIM_RX ); // RX mode
  digitalWrite(this.CE,1); // enable
  this.setReg(C.STATUS, C.MAX_RT | C.TX_DS); // clear flags
  return success;
};

/** Slave handler - for slaves this should be called roughly every 50ms */
NRF.prototype.slaveHandler = function() {
  while (this.getDataPipe()!==undefined) {
    var data = this.getData();
    for (var i in data) {
      var ch = data[i];
      if (ch===0 && this.cmd!=="") {
        var c = this.cmd;
        this.cmd = "";
        var nrf = this;
        /** evaluate and return a result in the timeout, 
        so that evaluation errors don't cause the slaveHandler
        interval to get removed */
        setTimeout(function() {
          print("...>"+c);
          var result = ""+eval(c); // evaluate
          print("...="+result);
          // send the result back after a timeout
          setTimeout(function() {
            nrf.sendString(result);
          }, 500);
        }, 1);
      } else if (ch!==0) {
        this.cmd += String.fromCharCode(ch);
      }
    }
  }
};

/** Master handler - for masters this should be called roughly every 50ms */
NRF.prototype.masterHandler = function() {
  while (this.getDataPipe()!==undefined) {
    var data = this.getData();
    for (var i in data) {
      var ch = data[i];
      if (ch===0 && this.cmd!=="") {
        var c = this.cmd;
        this.cmd = "";
        var callback = this.callbacks.splice(0,1)[0]; // pop off the front
        if (callback!==undefined) callback(c);
      } else if (ch!==0) {
        this.cmd += String.fromCharCode(ch);
      }
    }
  }
};

/** Send a string in one or more packets. Returns true on success */
NRF.prototype.sendString = function(cmd) {
  for (var i=0;i<=cmd.length;i+=this.PAYLOAD) {
    var data = [];
    for (var n=0;n<this.PAYLOAD;n++) data[n] = cmd.charCodeAt(i+n);
    if (!this.send(data)) return false; // stop sending string if we had an error
  }
  return true;
};

/** Send a command as a master. The callback is then called when data is received back. Returns true on success */
NRF.prototype.sendCommand = function(cmd, callback) {
  this.callbacks.push(callback);
  return this.sendString(cmd);
};

/** Create a new NRF class */
exports.connect = function(_spi, _csn, _ce, _payload) {
  return new NRF(_spi, _csn, _ce, _payload);
};
