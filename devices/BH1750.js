/* Copyright (C) 2014 Spence Konde. See the file LICENSE for copying permission. */
/*
This module interfaces with the Rohm's BH1750 I2C Light Sensor. 

Usage is very simple. Setup I2C, and call

bh = require("BH1750").connect(i2c,addr);

The BH1750 can use one of two addresses. If the Addr pin is held low, omit the addr argument, or give it 0, to use the default address of 0x23. If the address pin is held high, pass it 1 to use the alternate address of 0x5C.

Then, you can start measuring:

bh.start(resolution,onetime);


resolution is 1, 2 or 3:
1 - High Resolution mode, accurate to 1 lx. Recommended by manufacturer. 
2 - Low Resolution mode, accurate to 4 lx.
3 - High Resolution mode 2, accurate to 0.5 lx. 

If onetime is true, only a single measurement will be taken, and returned with the next bh.read(); Otherwise, it will be read continually, so there will always be data to read. Unless power is a concern, continuous measurement mode is recommended.

To get the data, use bh.read():

console.log(bh.read());

Note that it takes up to 120ms to complete a measurement at high resolution, so if doing one-time measurements, use setTimeout() to call bh.read() after waiting.

*/


exports.connect = function(i2c, addr) {
  if (addr) {
    return new BH1750(i2c, 0x5C);
  } else {
    return new BH1750(i2c, 0x23);
  }
};

function BH1750(i2c, addr) {
  this.i2c = i2c;
  this.i2ca=addr;
  this.i2c.writeTo(addr,0x01); //power on
  this.i2c.writeTo(addr,0x03); //reset
  this.active=0;
  this.factor=1.2;
  this.onetime=0;
}

BH1750.prototype.reset= function() {
  this.i2c.writeTo(this.i2ca,0x03);
  this.active=0;
};

BH1750.prototype.power= function(onoff) {
  this.i2c.writeTo(this.i2ca,(onoff?1:0)); //if argument true, power on, otherwise, power off. 
  this.active=0;
};

BH1750.prototype.read= function() {
  if (this.active) {
    var data=this.i2c.readFrom(this.i2ca,2);
    data=(data[0]<<8)+data[1];
    if (this.onetime) {
      this.active=0;
    }
    if (this.active==3) {
      return (data*0.5)/this.factor;
    } else {
      return data/this.factor;
    }
  } else {
    throw "Device not active"
  }
};

BH1750.prototype.start= function(resolution,onetime) { //resolution: 1 = 1 lx (recomended by mfg), 2 = 4 lx, 3 = 0.5 lx
  this.i2c.writeTo(this.i2ca,(onetime?32:16)+(resolution==1?0:(resolution==2?3:1)));
  this.active=resolution;
  this.onetime=onetime;
};

BH1750.prototype.setMT=function(mt) {
  this.factor=1.2/(69/X);
  mt=E.clip(mt,31,254);
  this.i2c.writeTo(this.i2ca,0x80+((mt&0xE0)>>3));
  this.i2c.writeTo(this.i2ca,0xB0+(mt&0x1F));
}
