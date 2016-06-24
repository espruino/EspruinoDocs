/* 
Module for the NRF905 wireless transceiver

IC pin cross refernce
CE == TRX_EN
txen == TXE == TX_EN == TxEN

```JavaScript
SPI2.setup({sck:B13, miso:B14, mosi:B15});
var nrf = require("NRF905ck").connect(SPI2,csn,dr,txen,ce);

function rx_callback(data){
  console.log("got "+JSON.stringify(data));
}

nrf.init(0x17, rx_callback);//0x17 hex is 23 decimal
var sendThis = nrf.send(0x17,['H','e','l','l','o']);

Just type sendThis() in the WEB IDE
```
 */

var R = {
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

function NRF(_spi, _csn, _dr, _txen, _ce) {
  this.CSN = _csn;
  this.DR = _dr;
  this.TxEN= _txen;
  this.CE = _ce;
  this.spi = _spi;
  this.busy=false;
  this.userCallback;
  this.rxWatch=false;//watching DR for recieved data
  this.txWatch=false;//watching DR for data was sent
}

NRF.prototype.setReg = function(reg,value) {
  digitalWrite(this.CE,0);
  this.spi.send([reg,value], this.CSN);
  //go back to RX
  digitalWrite(this.TxEN,0);//enable RX
  digitalWrite(this.CE,1);//enable radio
};

NRF.prototype.getReg = function(reg) {
  var data;
  digitalWrite(this.CE,0);
  data = this.spi.send([reg,0x00], this.CSN);
  //go back to RX
  digitalWrite(this.TxEN,0);//enable RX
  digitalWrite(this.CE,1);//enable radio
  return data[1];
};

NRF.prototype.getRxData= function() {
    var dummy=[];
    dummy.fill(0,0,32);//prepare the 32 dummy bytes
    digitalWrite(this.CE,0);//enable standby+SPI programming
    var data=[];
    data=this.spi.send([R.R_RX_PAYLOAD,dummy], this.CSN);
    data=data.slice(1); //remove the status byte
    //go back to RX
    digitalWrite(this.TxEN,0);//enable RX
    digitalWrite(this.CE,1);//enable radio
    if(this.userCallback!==false){
        this.userCallback(data);
    }else{
        console.log('No user callback provided!');
    }
    
};

NRF.prototype.rxMode=function() {
  //go back to RX
  this.txWatch=false;
  digitalWrite(this.TxEN,0);//enable RX
  digitalWrite(this.CE,1);//enable radio
  this.busy=false;
  var a=this;
  if (this.rxWatch===false)
    this.rxWatch=setWatch(function(){a.getRxData();},this.DR,{repeat:true,edge:'rising'});
  else  
    console.log("rxWatch was not cleared properly.");
};

/** Send a single packet */
NRF.prototype.send = function(txAddr,data) {
    if (!this.busy) {
        digitalWrite(this.CE,0);//enable standby+SPI programming
        if (this.txWatch) {
          clearWatch(this.txWatch);
          this.txWatch=false;
        }
        if (this.rxWatch) {
          clearWatch(this.rxWatch);
          this.rxWatch=false;
        } else
          console.log("rxWatch was inexistent");
        this.busy=true;
        while(data.length>32)data.pop();//remove bytes in excess.
        while(data.length<32)data.push(0);//32-byte zero padding
        this.spi.send([R.W_TX_PAYLOAD,data], this.CSN);//write payload
        if ((typeof(txAddr)=="number") && (txAddr>-1) && (txAddr<256)){
            this.spi.send([R.W_TX_ADDRESS,txAddr], this.CSN);//write TX address
        }else{
            console.log("NRF.send: wrong address format");
        }
        digitalWrite(this.TxEN,1);//enable TX  
        digitalPulse(this.CE, 1, 1);//pulse high for 1ms
        var a=this;
        this.txWatch=setWatch(function(){setTimeout(function(){a.rxMode();},1000);},this.DR,{edge:'rising'});
    }
};

/** Initialise the NRF module*/
NRF.prototype.init = function(myAddr,Callback) {
    clearWatch();
    this.userCallback=Callback;
    this.busy=true;
    digitalWrite(this.CE,0);//enable standby+SPI programming
    digitalWrite(this.TxEN,0);
    digitalWrite(this.CSN,1);
    //this.setMyAddr(myAddr);
    this.setReg(R.W_CONFIG,0x01);  //CH_NO
    this.setReg(R.W_CONFIG+1,0x0C);  //no retransmission, normal operation, TX:10dBm, band:433MHz
    this.setReg(R.W_CONFIG+2,0x11);  //both TX and RX addresses are 1 byte long
    this.setReg(R.W_CONFIG+3,0x20);  //RX payload is 32 byte long
    this.setReg(R.W_CONFIG+4,0x20);  //TX payload is 32 byte long
    this.setReg(R.W_CONFIG+5,myAddr);
    this.setReg(R.W_CONFIG+9,0xD8);  //16-bit CRC enabled, Fosc=16MHz, disable external clock
    this.rxMode();
    this.busy=false;
};

/** Create a new NRF905 class */
exports.connect = function(_spi, _csn, _dr, _txen, _ce) {
    return new NRF(_spi, _csn, _dr, _txen, _ce);
};
