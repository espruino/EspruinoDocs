/* Copyright (C) 2019 Gordon Williams. See the file LICENSE for copying permission. */
var C = {
MODE1 : 0x0,
PRESCALE : 0xFE,
LED0_ON_L : 0x6,
};
/**
options = {
  addr : optional I2C address (default is 0x40)
  callback : optional callback when initialised
} */
function PCA9685(i2c,options) {
  options = options||{};
  this.i2c = i2c;
  this.addr = options.addr||0x40;
  if (this.r(5)!=224) throw "ALLCALLADR!=0xE0 - PCA9685 connected?";
  this.reset(() => {
    this.setPWMFreq(60);
    if (options.callback) options.callback();
  });
}
/// Write to I2C
PCA9685.prototype.w = function(r,d) {
  this.i2c.writeTo(this.addr,r,d);
};
/// Read from I2C
PCA9685.prototype.r = function(r) {
  this.i2c.writeTo(this.addr,r);
  return this.i2c.readFrom(this.addr,1)[0];
};
/// Reset the PCA9685
PCA9685.prototype.reset = function(callback) {
  this.w(C.MODE1, 0x80);
  if (callback) setTimeout(callback,5);
};
/// Send raw PWM values to the pin (values 0..4096)
PCA9685.prototype.setRAW = function(num,on,off) {
  this.w(C.LED0_ON_L+4*num, [on, on>>8, off,off>>8]);
};
/// Write a PWM value 0..1 to the pin
PCA9685.prototype.write = function(num,val) {
  val=Math.round(val*4096);
  if (val<0) this.setRAW(num,0,4096);
  else if (val>4095) this.setRAW(num,4096,0);
  else this.setRAW(num,0,val);
};
/// Write to a pin such that PWM is produced with the given pulse length
PCA9685.prototype.writeMs = function(num,len) {
  this.write(num, len*this.freq/1000);
};
/// Set the PWM frequency in Hz
PCA9685.prototype.setPWMFreq = function(freq) {
  this.freq = freq;
  var prescaleval = 25000000.0/(4096*freq); // 25MHz
  this.w(C.MODE1, 0x30); // go to sleep
  this.w(C.PRESCALE, Math.round(prescaleval-1));
  this.w(C.MODE1, 0x20); // wake up
  this.w(C.MODE1, 0x20); // wake up
};
/** Create an instance of PCA9685. Supply an I2C device.
options = {
  addr : optional I2C address (default is 0x40)
  callback : optional callback when initialised
} */
exports.connect = function(i2c,options) {
  return new PCA9685(i2c,options);
};
