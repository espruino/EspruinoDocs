/* Copyright (C) 2014 Spence Konde. See the file LICENSE for copying permission. */
/*
This module interfaces with the Smart Nixie Tube module from Switchmode Design. This device consists of an IN-14 Nixie Tube, an RGB led shining up into the tube, a serial interface, and a boost converter to provide the 170v required by the tube. The modules can be chained together to form a multiple digit display.

Connect the TX pin of the Espruino to the RX pin of the left-most Smart Nixie Tube board (this is the fourth pin away from the power-jack) and GND of Espruino to GND of Smart Nixie Tube board (pin closest to power connector). 

Set up the serial for 115200 baud. 

ex:

Serial3.setup(115200,{tx:B10});
var nixie=require("SmartNixie").connect(Serial3,6);

Functions are:

nixie.send() //Send current data to nixies. Nothing will be sent to the nixies until this is called. 
nixie.setTube(digit,number,ldot,rdot,brightness,red,green,blue) //set all options for one digit. ldot and rdot should be 0 or 1, brightness, red, green and blue from 0 to 255. All arguments must be supplied, no error checking is performed. 
nixie.setString(string) //set values from a string. Valid characters are space, 0-9, decimal points, and commas. Decimal points turn on left decimal point, commas turn on right decimal point. Does not change brightness or LEDs
nixie.setLED(digit,red,green,blue) //set LED for the specified digit to this value. 
nixie.setBright(digit,brightness) //set tube brightness for specified digit.
nixie.setAllLED(red,green,blue) //set LEDs for all nixies.
nixie.setAllBright(brightness) //set tube brightness for all nixies.

  */

exports.connect = function(ser,digits) {
    return new NIXIE(ser,digits);
}

function NIXIE(ser,digits) {
  this.ser = ser;
  this.digits=digits;
  this.data=new Uint8Array(5*digits);
  for (j=0;j<digits;j++) {
  	this.data[j*5+1]=127;
  }
}
NIXIE.prototype.setTube = function (digit,number,ldot,rdot,brightness,red,green,blue) {
	this.data[digit*5]=ldot*0x10+rdot*0x20+number;
	this.data[digit*5+1]=brightness;
	this.setLED(digit,red,green,blue)
}
NIXIE.prototype.setAllBright=function(brightness) {
	for (k=0;k<this.digits;k++){
		this.data[k*5+1]=brightness;
	}
}
NIXIE.prototype.setBright=function(digit,brightness) {
	this.data[digit*5+1]=brightness;
}
NIXIE.prototype.setLED=function(digit,red,green,blue) {
	this.data[digit*5+2]=red;
	this.data[digit*5+3]=green;
	this.data[digit*5+4]=blue;
}
NIXIE.prototype.setAllLED=function(red,green,blue) {
	for (k=0;k<this.digits;k++){
		this.data[k*5+2]=red;
		this.data[k*5+3]=green;
		this.data[k*5+4]=blue;
	}
}
NIXIE.prototype.setString = function(data) {
	var y=0;
	var dig=0;
	for (k=0;k<this.digits;k++){
		this.data[k*5]=15;
	}
	while (dig < this.digits && y < data.length) {
		switch (data.charAt(y)) {
			case "." : {this.data[dig*5]=this.data[dig*5]|0x10;break;}
			case "," : {this.data[dig*5]=this.data[dig*5]|0x20;break;}
			case " " : {this.data[dig*5]=this.data[dig*5]|0x0A;dig++;break;}
			default : {

				this.data[dig*5]=(this.data[dig*5]&0xF0)+parseInt(data.charAt(y));
				dig++;
			}
		}
		y++;
	}
}
NIXIE.prototype.send = function() {
	var outstr="";
	for (i=0;i<this.digits;i++) {
		outstr=this.getString(i)+outstr;
	}
	this.ser.write(outstr+"!");
}
NIXIE.prototype.getString = function(digit) {
	var d=this.data;
	var str="$";
	if ((d[digit*5]&0x0F) < 10) {
		str+=(d[digit*5]&0x0F);
	} else {
		str+="-";
	}
	if (d[digit*5]&0x10){
		str+=",Y";
	} else {
		str+=",N"
	}
	if (d[digit*5]&0x20){
		str+=",Y";
	} else {
		str+=",N"
	}
	for (x=1;x<5;x++) {
		var t=d[digit*5+x];
		var t=t.toFixed(0);
		switch (t.length) {
			case 1 : {t="00"+t; break;}
			case 2 : {t="0"+t;break;}
		}
		str+=","+t;
	}
	return str;
}
