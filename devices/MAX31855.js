/* Copyright (C) 2014 Spence Konde based on code from User7341 on the Espruino forums. See the file LICENSE for copying permission. */

/*
This module interfaces with a MAX31855 high temperature thermocouple controller. 

Usage:

Setup SPI:
SPI1.setup({ miso:B4, sck:B3, baud:1000000 });

Then call:

var thermocouple=require("MAX31855").connect(spi,cs);

spi is the SPI interface

cs is the chip select pin

Get the temperature with:

thermocouple.getTemp();

This returns an object with properties temp (the temperature, in C), fault (fault code; 0 indicates no error), and faultstring (a string describing the fault);

*/

exports.connect = function(spi,cs) {
  return new MAX31855(spi,cs);
};

function MAX31855(spi,cs) {
  this.spi=spi;
  this.cs=cs;
}

MAX31855.prototype.getTemp = function () {
  var d = SPI1.send("\0\0\0\0",C0); 
  var trtn={};
  trtn.temp=(d.charCodeAt(0)<<6 | d.charCodeAt(1)>>2)*0.25;
  trtn.fault=0;
  if (d.charCodeAt(1) & 1)  {
    var fault = (d.charCodeAt(3) & 7);
    trtn.fault=fault;
    switch (fault) {
      case 1:
        trtn.faultstring="No probe detected";
        break;
      case 3:
        trtn.faultstring="Probe shorted to Ground";
        break;
      case 4:
        trtn.faultstring="Probe shorted to VCC";
        break;
    }
  } 
  return trtn;
};
