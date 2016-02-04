/* Jean-Philippe Rey 
 * https://github.com/yerpj
 * 29.01.2016
 * NRF905 driver.
 * It was tested with this hardware : http://www.dx.com/fr/p/diy-nrf905-wireless-module-for-arduino-green-2-pcs-149247#.Vqu3oearXhV
 * This module has been written based on the existing module NRF24L01P.js (http://www.espruino.com/modules/NRF24L01P.js)
 * 
 * TODO: Verify the memory usage over time (some setWatch are duplicated?!?), handle the LBT (listen before talk)
 * 
 */

var REG = {
  // Registers
  W_CONFIG    : 0x00,
  R_CONFIG    : 0x10,
  W_TX_PAYLOAD: 0x20,
  R_TX_PAYLOAD: 0x21,
  W_TX_ADDRESS: 0x22,
  R_TX_ADDRESS: 0x23,
  R_RX_PAYLOAD: 0x24,
  CHANNEL_CONFIG: 0x80
};

function NRF(_spi, _csn, _dr, _txe, _trxen) {
  this.CSN = _csn;
  this.DR = _dr;
  this.TXE= _txe;
  this.TRXEN = _trxen;
  this.spi = _spi;
  this.busy=false;
  this.userCallback=false;
  this.RXCallback=false;
}

/** addressing is limited to [0..255] */
NRF.prototype.setMyAddr = function(addr) {
  digitalWrite(this.TRXEN,0);
  this.setReg(REG.W_CONFIG+2,0x11);  //both TX and RX addresses are 1 byte long
  this.spi.send([(REG.W_CONFIG+5),addr,0,0,0], this.CSN);//RX_ADDRESS 
  //go back to RX
  digitalWrite(this.TXE,0);//enable RX
  digitalWrite(this.TRXEN,1);//enable radio
};

NRF.prototype.setReg = function(reg,value) {
  digitalWrite(this.TRXEN,0);
  this.spi.send([reg,value], this.CSN);
  //go back to RX
  digitalWrite(this.TXE,0);//enable RX
  digitalWrite(this.TRXEN,1);//enable radio
}

NRF.prototype.getReg = function(reg) {
  var data;
  digitalWrite(this.TRXEN,0);
  data = this.spi.send([reg,0x00], this.CSN);
  //go back to RX
  digitalWrite(this.TXE,0);//enable RX
  digitalWrite(this.TRXEN,1);//enable radio
  return data[1];
}

/** Get the contents of the status register */
NRF.prototype.getStatus = function() {
  digitalWrite(this.TRXEN,0);
  var status=this.spi.send(0x00, this.CSN);
  //go back to RX
  digitalWrite(this.TXE,0);//enable RX
  digitalWrite(this.TRXEN,1);//enable radio
  return status;
};

NRF.prototype.getData = function() { 
  var dummy=[];
  dummy.fill(0,0,32);//prepare the 32 dummy bytes
  digitalWrite(this.TRXEN,0);//enable standby+SPI programming
  var data=[];
  data=this.spi.send([REG.R_RX_PAYLOAD,dummy], this.CSN);
  data=data.slice(1); //remove the status byte
  //go back to RX
  digitalWrite(this.TXE,0);//enable RX
  digitalWrite(this.TRXEN,1);//enable radio
  return data;
};

NRF.prototype.TXEnd=function() {
  //go back to RX
  digitalWrite(this.TXE,0);//enable RX
  digitalWrite(this.TRXEN,1);//enable radio
  this.busy=false;
  var a=this;
  if (this.RXCallback==false)
    this.RXCallback=setWatch(function(){a.NRF905RX();},this.DR,{repeat:true,edge:'rising'});
  else  
    console.log("RXCallback was not cleared properly.");
}

/** Send a single packet */
NRF.prototype.send = function(txAddr,data) {
  if (!this.busy) {
    digitalWrite(this.TRXEN,0);//enable standby+SPI programming
    if (this.RXCallback) {
      clearWatch(this.RXCallback);
      this.RXCallback=false;
    } else
      console.log("RXCallback was inexistent");
    this.busy=true;
    while(data.length>32)data.pop();//remove bytes in excess.
    while(data.length<32)data.push(0);//32-byte zero padding
    this.spi.send([REG.W_TX_PAYLOAD,data], this.CSN);//write payload
    if ((typeof(txAddr)=="number") && (txAddr>-1) && (txAddr<256))
      this.spi.send([REG.W_TX_ADDRESS,txAddr], this.CSN);//write TX address
    else
      console.log("NRF.send: wrong address format");
    digitalWrite(this.TXE,1);//enable TX  
    digitalPulse(this.TRXEN, 1, 1);//pulse high for 1ms
    var a=this;
    setWatch(function(){a.TXEnd();},this.DR,{edge:'rising'});
  }
};

NRF.prototype.NRF905RX= function() {
  var data=[];
  data=this.getData();
  if(this.userCallback!=false)
    this.userCallback(data);
  //go back to RX
  digitalWrite(this.TXE,0);//enable RX
  digitalWrite(this.TRXEN,1);//enable radio
}

/** Initialise the NRF module*/
NRF.prototype.init = function(myAddr,Callback) {
  this.userCallback=Callback;
  this.busy=true;
  digitalWrite(this.TRXEN,0);//enable standby+SPI programming
  digitalWrite(this.TXE,0);
  digitalWrite(this.CSN,1);
  this.setMyAddr(myAddr);
  this.setReg(REG.W_CONFIG,0x01);  //CH_NO
  this.setReg(REG.W_CONFIG+1,0x0C);  //no retransmission, normal operation, TX:10dBm, band:433MHz
  this.setReg(REG.W_CONFIG+2,0x11);  //both TX and RX addresses are 1 byte long
  this.setReg(REG.W_CONFIG+3,0x20);  //RX payload is 32 byte long
  this.setReg(REG.W_CONFIG+4,0x20);  //TX payload is 32 byte long
  this.setReg(REG.W_CONFIG+9,0xD8);  //16-bit CRC enabled, Fosc=16MHz, disable external clock
  digitalWrite(this.TRXEN,1);//enable radio
  digitalWrite(this.TXE,0);//enable RX
  var a=this;
  this.RXCallback=setWatch(function(){a.NRF905RX();},this.DR,{repeat:true,edge:'rising'});
  this.busy=false;
};

/** Create a new NRF905 class */
exports.connect = function(_spi, _csn, _dr, _txe, _trxen) {
  return new NRF(_spi, _csn, _dr, _txe, _trxen);
};
