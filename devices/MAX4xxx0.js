  /* Copyright (C) 2014 Spence Konde. See the file LICENSE for copying permission. */
  /*
This module interfaces with 256-tap serial digital potentiometers from Microchip, 41xx0 series of single potentiometers, and the 42xx0 series of dual potentiometers. 


Usage:

var digipot=require("MCP4xxx0").connect(SPI,pots)

These pots provide very little functionality. The only operations availabe are:

digipot.setVal(value, pot)

digipot.shutdown(pot)

/*


exports.connect = function(spi,pots,cs) {
	if ( pots < 3 && pots > 0)
	{
	    return new MCP4xxx0(spi, pots,cs);
	} else { throw "Invalid number of pots";}
};

function MCP4xxx0(spi,pots,cs) {
  this.pots = pots;
  this.spi=spi;
  this.cs=cs;
}

MCP4xxx0.prototype.setVal  = function (value,pot) {
  this.spi.send([0x10+pot,value],cs]);
};

MCP4xxx0.prototype.shutdown  = function (pot) {
  this.spi.send([0x20+pot,value],cs]);
};
