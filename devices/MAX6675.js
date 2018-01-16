/* Copyright (C) 2018  Espruino, based on MAX31855, See the file LICENSE for copying permission. */

/*
This module interfaces with a MAX6675 high temperature thermocouple controller. 

Usage:

Setup SPI:


//MISO = B4; SCK = B3; CS = B5;    // Espruino 
MISO = A6; SCK = A5; CS = A7;    // PICO or Espruino WiFi
//MISO = NodeMCU.D6; SCK = NodeMCU.D5; CS = NodeMCU.D7; // NodeMCU
//MISO = D12 ;SCK = D14; CS = D13; // ESP8266 >= ESP12

SPI1.setup({ miso:MISO, sck:SCK, baud:1000000 });  
var max=require("MAX6675").connect(SPI1,CS);
setInterval(function(){console.log(max.getTemp());},2000);

Then call:

var thermocouple=require("MAX6675").connect(SP1,CS);

spi is the SPI interface

cs is the chip select pin

Get the temperature with:

max.getTemp();

This returns an object with properties temp (the temperature, in C), fault (fault code; 0 indicates no error), and faultstring (a string describing the fault);

*/

exports.connect = function(spi,cs) {
    return new MAX6675(spi,cs);
};

function MAX6675(spi,cs) {
    this.spi=spi;
    this.cs=cs;
}

MAX6675.prototype.getTemp = function () {
    var d = this.spi.send("\0\0",this.cs);
    //console.log( d.charCodeAt(0).toString(2), d.charCodeAt(1).toString(2));
    if (d.charCodeAt(1) & 0x4)
      return {fault:'no probe detected'};
    else 
      return { temp : ((d.charCodeAt(0)<<8 | d.charCodeAt(1)) >> 3) *0.25,fault:0};
};
