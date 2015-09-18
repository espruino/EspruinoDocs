/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 
Module for the ADS1015 4 channel ADC

```
I2C1.setup({ scl : ..., sda: ...} );
var ads = new ADS1X15(I2C1);
ads.setGain(256); // +/- 0.256mV
ads.getADC(0, function(val) {
  console.log("Read ADC value: "+val);
});
```

 */

/* Register values. Most of these aren't used
and this is hidden, so it'll get optimised out
when minified */
var CONFIG = {
OS_MASK      : (0x8000),
OS_SINGLE    : (0x8000),  // Write: Set to start a single-conversion
OS_BUSY      : (0x0000),  // Read: Bit = 0 when conversion is in progress
OS_NOTBUSY   : (0x8000),  // Read: Bit = 1 when device is not performing a conversion
            
MUX_MASK     : (0x7000),
MUX_DIFF_0_1 : (0x0000),  // Differential P = AIN0, N = AIN1 (default)
MUX_DIFF_0_3 : (0x1000),  // Differential P = AIN0, N = AIN3
MUX_DIFF_1_3 : (0x2000),  // Differential P = AIN1, N = AIN3
MUX_DIFF_2_3 : (0x3000),  // Differential P = AIN2, N = AIN3
MUX_SINGLE_0 : (0x4000),  // Single-ended AIN0
MUX_SINGLE_1 : (0x5000),  // Single-ended AIN1
MUX_SINGLE_2 : (0x6000),  // Single-ended AIN2
MUX_SINGLE_3 : (0x7000),  // Single-ended AIN3
            
PGA_MASK     : (0x0E00),
PGA_6_144V   : (0x0000),  // +/-6.144V range = Gain 2/3
PGA_4_096V   : (0x0200),  // +/-4.096V range = Gain 1
PGA_2_048V   : (0x0400),  // +/-2.048V range = Gain 2 (default)
PGA_1_024V   : (0x0600),  // +/-1.024V range = Gain 4
PGA_0_512V   : (0x0800),  // +/-0.512V range = Gain 8
PGA_0_256V   : (0x0A00),  // +/-0.256V range = Gain 16
            
MODE_MASK    : (0x0100),
MODE_CONTIN  : (0x0000),  // Continuous conversion mode
MODE_SINGLE  : (0x0100),  // Power-down single-shot mode (default)
          
DR_MASK      : (0x00E0),  
DR_128SPS    : (0x0000),  // 128 samples per second
DR_250SPS    : (0x0020),  // 250 samples per second
DR_490SPS    : (0x0040),  // 490 samples per second
DR_920SPS    : (0x0060),  // 920 samples per second
DR_1600SPS   : (0x0080),  // 1600 samples per second (default)
DR_2400SPS   : (0x00A0),  // 2400 samples per second
DR_3300SPS   : (0x00C0),  // 3300 samples per second
         
CMODE_MASK   : (0x0010),
CMODE_TRAD   : (0x0000),  // Traditional comparator with hysteresis (default)
CMODE_WINDOW : (0x0010),  // Window comparator
          
CPOL_MASK    : (0x0008),
CPOL_ACTVLOW : (0x0000),  // ALERT/RDY pin is low when active (default)
CPOL_ACTVHI  : (0x0008),  // ALERT/RDY pin is high when active
        
CLAT_MASK    : (0x0004),  // Determines if ALERT/RDY pin latches once asserted
CLAT_NONLAT  : (0x0000),  // Non-latching comparator (default)
CLAT_LATCH   : (0x0004),  // Latching comparator
           
CQUE_MASK    : (0x0003),
CQUE_1CONV   : (0x0000),  // Assert ALERT/RDY after one conversions
CQUE_2CONV   : (0x0001),  // Assert ALERT/RDY after two conversions
CQUE_4CONV   : (0x0002),  // Assert ALERT/RDY after four conversions
CQUE_NONE    : (0x0003)  // Disable the comparator and put ALERT/RDY in high state (default)
};
var GAINS = {
  6144 : CONFIG.PGA_6_144V,  // +/-6.144V range = Gain 2/3
  4096 : CONFIG.PGA_4_096V,  // +/-4.096V range = Gain 1
  2048 : CONFIG.PGA_2_048V,  // +/-2.048V range = Gain 2 (default)
  1024 : CONFIG.PGA_1_024V,  // +/-1.024V range = Gain 4
  512 : CONFIG.PGA_0_512V,  // +/-0.512V range = Gain 8
  256 : CONFIG.PGA_0_256V  // +/-0.256V range = Gain 16;
};
var DIFFS = {
  "0,1" : CONFIG.MUX_DIFF_0_1,   // Differential P = AIN0, N = AIN1 (default)
  "0,3" : CONFIG.MUX_DIFF_0_3, // Differential P = AIN0, N = AIN3
  "1,3" : CONFIG.MUX_DIFF_1_3, // Differential P = AIN1, N = AIN3
  "2,3" : CONFIG.MUX_DIFF_2_3  // Differential P = AIN2, N = AIN3
};
var REG = {
  MASK : 3,
  CONVERT : 0,
  CONFIG : 1,
  LOWTHRESH : 2,
  HITHRESH : 3
};
function ADS1X15(i2c) {
  this.i2c = i2c;
  this.addr = 0x48;
  this.gain = 2048;
}
// used internally for writing to the ADC
ADS1X15.prototype.writeRegister = function(reg, value) {
  this.i2c.writeTo(this.addr, reg, value>>8, value);  
};
// used internally for reading from the ADC
ADS1X15.prototype.readRegister = function(reg) {
  this.i2c.writeTo(this.addr, reg);  
  var d = this.i2c.readFrom(this.addr, 2);
  return (d[0] << 8) | d[1];  
};
/* Set the I2C address. 
By default it's 0x48, but it could also be 0x4B if the ADDR pin is 1  */
ADS1X15.prototype.setAddr = function(addr) { this.addr = addr; };
/* set the gain, with a value in mv (6144, 4096, 2048, 1024, 512 or 256). 
The value is the full swing, so 256 = +/- 0.256v */
ADS1X15.prototype.setGain = function(gain) {
  if (!(gain in GAINS)) throw new Error("Gain "+gain+" not found");
  this.gain = gain;
};
/* Get an ADC reading and call `callback` with the raw data as a 16 bit signed value. 
`channel` is a value between 0 and 3, or an array of inputs. Either `[0,1]`, `[0,3]`, `[1,3]` or `[2,3]`  */
ADS1X15.prototype.getADC = function(channelSpec, callback) {
  var config = CONFIG.CQUE_NONE    | // Disable the comparator (default val)
                    CONFIG.CLAT_NONLAT  | // Non-latching (default val)
                    CONFIG.CPOL_ACTVLOW | // Alert/Rdy active low   (default val)
                    CONFIG.CMODE_TRAD   | // Traditional comparator (default val)
                    CONFIG.DR_1600SPS   | // 1600 samples per second (default)
                    CONFIG.MODE_SINGLE;   // Single-shot mode (default)
  // single ended (channelSpec is a number) or differential (channelSpec is array w/ valid channel duo)
  if ("number" == typeof channelSpec) { // Set single-ended input channel
    config |= [CONFIG.MUX_SINGLE_0,CONFIG.MUX_SINGLE_1,CONFIG.MUX_SINGLE_2,CONFIG.MUX_SINGLE_3][channelSpec];
  } else { // Set differential input channels from channelSpec
    var dif = DIFFS[channelSpec];
    if (typeof dif === "undefined") throw new Error("Invalid differential channelSpec " + channelSpec);
    config |= dif;
  }    
  // Set PGA/voltage range
  config |= GAINS[this.gain];
  // Set 'start single-conversion' bit
  config |= CONFIG.OS_SINGLE;
  // Write config register to the ADC
  this.writeRegister(REG.CONFIG, config);
  // Wait for the conversion to complete
  var ads = this;
  setTimeout(function() {
    // Read the conversion results
    var d = ads.readRegister(REG.CONVERT);
    if (d&0x8000) d-=65536; // sign
    callback(d); 
  }, 8);
};
/* Get an ADC reading and call `callback` with the voltage as a floating point value.
`channel` is a value between 0 and 3, or an array of inputs. Either `[0,1]`, `[0,3]`, `[1,3]` or `[2,3]`  */
ADS1X15.prototype.getADCVoltage = function(channel, callback) {
  var mul = this.gain / 32768000;
  this.getADC(channel, function(v) {
    callback(v*mul);
  });
};

// Create an instance of ADS1X15
exports.connect = function(/*=I2C*/i2c) {
  return new ADS1X15(i2c);
};
