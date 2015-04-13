/* Copyright (c) 2014 Lucie Tozer. See the file LICENSE for copying permission. */
/*
Module to communicate with the Sensirion SHT11(inc. SHT10 & SHT15) temperature and relative humidity sensor
including a function to calculate dew point
*/

/** Conversion constants */
var C = {
	d1 : -39.65,  // for 14 Bit @ 3V
	d2 :  0.01, // for 14 Bit DEGC
	c1 : -2.0468,       // for 12 Bit
	c2 :  0.0367,       // for 12 Bit
	c3 : -0.0000015955, // for 12 Bit
	t1 :  0.01,      // for 12 Bit
	t2 :  0.00008   // for 12 Bit
};

function SHT11(scl,sda) {
  this.datapin = sda;
  this.clockpin = scl;
  this.ack = 0;
  this.timeout = 0;
  this.lastTemperature;
  this.lastHumidity;
  this.lastDewPoint;
}



/** Contraband code for creating Javascript delays */
SHT11.prototype.Delay = function(ms) {
	var timenow = Date().getTime();
	while(1){
		if ((Date().getTime() - timenow) > ms){  
			break; 
		}  
	} 
};

/** Set the scl clock with the required value and leave time for the device to register the change*/
SHT11.prototype.clockTick = function(pinstate){
	digitalWrite(this.clockpin,pinstate);
	this.Delay(1);
}

/** Function for sending a command using the proprietry 2 wire protocol*/
SHT11.prototype.sendCommand = function(command){
 digitalWrite(this.clockpin,0);
 digitalWrite(this.datapin,1);
 this.clockTick(1);
 digitalWrite(this.datapin,0);
 this.clockTick(0);
 this.clockTick(1);
 digitalWrite(this.datapin,1);
 this.clockTick(0);
 for (var i = 0; i < 8; i++){
  digitalWrite(this.datapin, command & (1 << 7 - i))
  this.clockTick(1);
  this.clockTick(0);
 }
 this.clockTick(1);
 this.ack = digitalRead(this.datapin);
 if (this.ack != 0){
  //print("nack1 error")
 }
 this.clockTick(0);
 this.ack = digitalRead(this.datapin);
 if (this.ack != 1){
  //print("nack2 error")
 }
}

SHT11.prototype.shiftIn = function(bitnum){
	var value=0;
	for (var i = 0; i < bitnum; i++){
		this.clockTick(1);
		value = value * 2 + digitalRead(this.datapin);
		this.clockTick(0);
	}
	return value;
}

SHT11.prototype.getData = function(){
 var value = this.shiftIn(8);
 value *= 256;
 digitalWrite(this.datapin,1);
 this.Delay(1);
 digitalWrite(this.datapin,0);
 this.clockTick(1);
 this.clockTick(0);
 value |= this.shiftIn(8);
 return value;
}

SHT11.prototype.skipCrc = function(){
 digitalWrite(this.datapin,1);
 this.clockTick(1);
 this.clockTick(0);
}

SHT11.prototype.resetConnection = function(){
 digitalWrite(this.datapin,1);
 for (var i = 0; i < 10; i++){
  this.clockTick(1);
  this.clockTick(0);
 }
}

SHT11.prototype.readTemperature = function(){
 this.sendCommand(0x03);
 this.timeout = 0;
 while(this.ack == 1){
  this.ack = digitalRead(this.datapin);
  this.timeout++;
  if(this.timeout >= 100){
   break;
  }
  this.Delay(10);
 }
 rawtemp = this.getData();
 this.skipCrc();
 this.lastTemperature = rawtemp * C.d2 + C.d1;
 return this.lastTemperature;
}

SHT11.prototype.readCompensatedHumidity = function(){
 this.lastTemperature = this.readTemperature();
 this.sendCommand(0x05);
 this.timeout = 0;
 while(this.ack == 1){
  this.ack = digitalRead(this.datapin);
  this.timeout++;
  if(this.timeout >= 100){
   break;
  }
  this.Delay(10);
 }
 var rawhumidity = this.getData();
 this.skipCrc();
 this.lastHumidity = C.c1 + C.c2 * rawhumidity + C.c3 * rawhumidity * rawhumidity
 this.lastHumidity = (this.lastTemperature - 25.0 ) * (C.t1 + C.t2 * rawhumidity) + this.lastHumidity
 return this.lastHumidity;
}

SHT11.prototype.readHumidity = function(){
 this.sendCommand(0x05);
 this.timeout = 0;
 while(this.ack == 1){
  this.ack = digitalRead(this.datapin);
  this.timeout++;
  if(this.timeout >= 100){
   break;
  }
  this.Delay(10);
 }
 var rawhumidity = this.getData();
 this.skipCrc();
 this.lastHumidity = C.c1 + C.c2 * rawhumidity + C.c3 * rawhumidity * rawhumidity
 return this.lastHumidity;
}

SHT11.prototype.calculateDewPoint = function(temperature,humidity){
 if (temperature > 0){
  tn = 243.12
  m = 17.62
 }else{
  tn = 272.62
  m = 22.46
 }
 this.lastDewPoint = tn * (Math.log(humidity / 100.0) + (m * temperature) / (tn + temperature)) / (m - Math.log(humidity / 100.0) - m * temperature / (tn + temperature));
 return this.lastDewPoint;
}

/** This is 'exported' so it can be used with `require('SHT11.js').connect(scl,sda)` */
exports.connect = function (scl, sda) {
  return new SHT11(scl, sda);
};
