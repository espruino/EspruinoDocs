/* Copyright (c) 2018 Gordon Williams See the file LICENSE for copying permission. */

/**
Options should contain:
{
  sck   : PD_SCK pin
  miso  : DOUT pin
  lsbGrams : 0.00103123388(default) - grams per LSB
  mode  :
    "A128" = Channel A, 128 gain (default)
    "B32" = Channel B, 32 gain
    "A64" = Channel A, 64 gain
*/
function HX711(options) {
  options = options||{};
  this.sck = options.sck;
  if (!this.sck) throw "Expecting sck";
  this.miso = options.miso;
  if (!this.miso) throw "Expecting miso";
  this.mode = options.mode||"A128";
  this.lsbGrams = options.lsbGrams||0.00103123388;
  /* We have to send different numbers of clock edges
    depending on the mode, so we actually use 'mosi'
    as the clock and send the data we want. */
  this.spi = new SPI(); // use software SPI
  this.spi.setup({miso:this.miso, mosi:this.sck, baud: 2000000/*ignored atm*/});
  this.sck.write(0); // idle, but on
  this.zero = 0;
}

HX711.prototype.readRaw = function() {
  var finalClk = {
    A128:0b10000000, // 25
    B32:0b10100000, // 26
    A64:0b10101000, // 27
  }[this.mode];
  if (!finalClk) throw "Invalid mode";
  var c = 0b10101010;
  var d = this.spi.send([c,c,c,c,c,c,finalClk]);
  // mosi left as 0, so power on.
  function ex(x) { return ((x&128)?8:0)|((x&32)?4:0)|((x&8)?2:0)|((x&2)?1:0); }
  var val = (ex(d[0])<<20)|(ex(d[1])<<16)|(ex(d[2])<<12)|(ex(d[3])<<8)|(ex(d[4])<<4)|ex(d[5]);
  if (val&0x800000) val-=0x1000000; // two's complement
  return val;
};
/// Set the current reading to be the zero
HX711.prototype.tare = function() {
  this.zero = this.readRaw();
};
/// Read the ADC and return the result in grams (based on options.lsbGrams)
HX711.prototype.readGrams = function() {
  return (this.readRaw() - this.zero) * this.lsbGrams;
};
/// Is data ready for retrieval?
HX711.prototype.isReady = function() {
  return !this.miso.read();
};
/// Set whether the ADC is in standby mode or not
HX711.prototype.setStandby = function(isStandby) {
  this.sck.write(isStandby);
};

exports.connect = function(options) {
  return new HX711(options);
};
