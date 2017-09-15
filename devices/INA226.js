/* Copyright (c) 2017 SunElectrum. See the file LICENSE for copying permission. */
/*
addr  = I2C address, default is 0x40 - if A0/A1 are GND
maxCurrent = Largest amount of current expected to be measured (10A default)
shunt = shunt resistance in ohms (default 0.1 Ohms)
average = averaging for a reading (default 256) - 1,4,16,64,128,256,512 or 1024
*/
function INA226(i2c, options) {
  this.i2c = i2c;
  options = options||{};
  this.addr = options.addr||0x40; // default address if A0/A1 are GND
  this.maxCurrent = options.maxCurrent||10;
  this.currentLSB = this.maxCurrent/32768;
  this.shunt = options.shunt||0.1;
  if (this.rd(0xFE)!=0x5449) throw new Error("Invalid manufacturer ID");
  // config reg
  var config = 0x4127; // power on defaults
  options.average = options.average||256;
  if (options.average) {
    var i = [1,4,16,64,128,256,512,1024].indexOf(options.average);
    if (i<0) throw new Error("average must be 1,4,16,64,128,256,512 or 1024");
    config |= i<<9;
  }
  this.wr(0x00, config);
  // calibration reg
  var cal = Math.round(0.00512 / (this.currentLSB * this.shunt));
  if (cal<0 || cal>32767) throw new Error("maxCurrent/shunt mean calibration is out of range");
  this.wr(0x05, cal);
  // alert register - pull down when data is ready
  this.wr(0x06,1<<10);
}

// read reg
INA226.prototype.rd = function(a) {
  this.i2c.writeTo(this.addr,a);
  var d = this.i2c.readFrom(this.addr,2);
  return d[1]|d[0]<<8;
};
// write reg
INA226.prototype.wr = function(a,d) {
  this.i2c.writeTo(this.addr,[a,d>>8,d&0xff]);
};
// read reg signed
INA226.prototype.rds = function(a) {
  var r = this.rd(a);
  return (r&32768)?r-65536:r;
};
/* Returns an object with:

* vshunt - voltgage across shunt - -0.082 to 0.082mV
* vbus - bus voltage - 0 to 41v
* power - calculated power in watts
* current - calculated current in amps
* overflow - was there an arithmetic overflow during the averaging?
*/
INA226.prototype.read = function() {  
  // reading the mask register clears the conversion ready
  var flags = this.rd(0x06); 
  return {
    vshunt : this.rds(0x01)*0.000025, // volts
    vbus : this.rd(0x02)*0.00125, // volts
    power : this.rd(0x03)*25*this.currentLSB, // watts
    current : this.rds(0x04)*this.currentLSB, // amps
    overflow : (flags&4)!=0
  };
};

exports = INA226;
