/* Jean-Philippe Rey 
 * https://github.com/yerpj
 * 29.01.2016
 * NRF905 driver.
 * It was tested with this hardware : http://www.dx.com/fr/p/diy-nrf905-wireless-module-for-arduino-green-2-pcs-149247#.Vqu3oearXhV
 * This module has been written based on the existing module NRF24L01P.js (http://www.espruino.com/modules/NRF24L01P.js)
 * 
 * TODO: Verify the global code structure, verify the memory usage over time (some setWatch are duplicated?!?), handle the LBT (listen before talk)
 * 
 */
 
/* 
Module for the NRF905 wireless transceiver

Example:

```
//see doc here: https://www.sparkfun.com/datasheets/IC/nRF905_rev1_1.pdf
var NRFDR=B11;
var NRFCS=B12;
var NRFTXE=D8;
var NRFTRXEN=D11;

function RX_callback(data){
	console.log(data);
}

SPI2.setup({sck:B13, miso:B14, mosi:B15 });
var NRF=require("NRF905").connect(SPI2,NRFCS,NRFDR,NRFTXE,NRFTRXEN);

//Init both the module RX address and the RX callback
NRF.init(0x17,RX_callback);

//Send a packet: requires the TX address and a byte array, up to 32 bytes
NRF.send(0x17,['H','e','l','l','o']);
```  


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
	this.setReg(REG.W_CONFIG+2,0x11);	//both TX and RX addresses are 1 byte long
	this.spi.send([(REG.W_CONFIG+5),addr,0,0,0], this.CSN);//RX_ADDRESS 
};

NRF.prototype.setReg= function(reg,value)
{
	this.spi.send([reg,value], this.CSN);
}

NRF.prototype.getReg= function(reg)
{
	var data;
	data= this.spi.send([reg,0x00], this.CSN);
	return data[1];
}

/** Get the contents of the status register */
NRF.prototype.getStatus = function() {
	return this.spi.send(0x00, this.CSN);
};

NRF.prototype.getData = function() {
	var dummy=[];
    dummy.fill(0,0,32);//prepare the 32 dummy bytes
	digitalWrite(this.TRXEN,0);//enable standby+SPI programming
	var data=[];
	data=this.spi.send([REG.R_RX_PAYLOAD,dummy], this.CSN);
	data=data.slice(1); //remove the status byte
	return data;
};

NRF.prototype.TXEnd=function()
{
	//go back to RX
	digitalWrite(this.TXE,0);//enable RX
	digitalWrite(this.TRXEN,1);//enable radio
	this.busy=false;
	var a=this;
	this.RXCallback=setWatch(function(){a.NRF905RX();},this.DR,{repeat:true,edge:'rising'});
}

/** Send a single packet */
NRF.prototype.send = function(txAddr,data) {
	if(!this.busy)
	{
		digitalWrite(this.TRXEN,0);//enable standby+SPI programming
		clearWatch(this.RXCallback);
		this.busy=true;
		while(data.length>32)data.pop();//remove bytes in excess.
		while(data.length<32)data.push(0);//32-byte zero padding
		this.spi.send([REG.W_TX_PAYLOAD,data], this.CSN);//write payload
		if( (typeof(txAddr)=="number") && (txAddr>-1) && (txAddr<256) )
			this.spi.send([REG.W_TX_ADDRESS,txAddr], this.CSN);//write TX address
		
		digitalWrite(this.TXE,1);//enable TX	
		digitalPulse(this.TRXEN, 1, 10);//pulse high for 10ms
		var a=this;
		setWatch(function(){a.TXEnd();},this.DR,{edge:'rising'});
	}
};

NRF.prototype.NRF905RX= function(){
	digitalWrite(this.TRXEN,0);
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
	this.setReg(REG.W_CONFIG,0x60);	//CH_NO=0x60
	this.setReg(REG.W_CONFIG+1,0x0C);	//no retransmission, normal operation, TX:10dBm, band:433MHz
	this.setReg(REG.W_CONFIG+2,0x11);	//both TX and RX addresses are 1 byte long
	this.setReg(REG.W_CONFIG+3,0x20);	//RX payload is 32 byte long
	this.setReg(REG.W_CONFIG+4,0x20);	//TX payload is 32 byte long
	this.setReg(REG.W_CONFIG+9,0x58);	//8-bit CRC enabled, Fosc=16MHz, disable external clock
	digitalWrite(this.TRXEN,1);//enable radio
	digitalWrite(this.TXE,0);//enable RX
	var a=this;
	this.RXCallback=setWatch(function(){digitalWrite(LED3,!digitalRead(LED3));a.NRF905RX();},this.DR,{repeat:true,edge:'rising'});
	this.busy=false;
};

/** Create a new NRF905 class */
exports.connect = function(_spi, _csn, _dr, _txe, _trxen) {
  return new NRF(_spi, _csn, _dr, _txe, _trxen);
};
