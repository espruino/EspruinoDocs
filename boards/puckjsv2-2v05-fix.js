/* Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Collection of tweaks to accelerometer/magnetometer power consumption */

if (process.env.HWVERSION!=2) throw new Error("Puck.js v2 required for this module");

/** On puck.js v2 with original 2v05 firmware, drops accelerometer power
consumption from 800uA to:

* `accelOn(1.6)` uses 1.6Hz data rate and turns Gyro off - uses just 40uA
* `accelOn(12.5)` uses 350uA at the standard 12.5Hz data rate (with gyro).
* `accelOn(26/52/erc)` uses the sample rates allowed for `Puck.accelOn(..)`
  but with added power saving.

2v06 and later firmwares have this functionality built in. */
Puck._accelOn = Puck.accelOn;
Puck.accelOn = function(samplerate) {
  Puck._accelOn((samplerate===undefined || samplerate<12.5) ? 12.5 : samplerate);
  Puck.accelWr(0x15,0x10);  // CTRL6-C - XL_HM_MODE=1, low power accelerometer
  if (samplerate<12.5) {
    Puck.accelWr(0x10,0xB0);  // CTRL1_XL accelerometer 1.6hz
    Puck.accelWr(0x11,0); // CTRL2_G power down gyro
  } else {
    Puck.accelWr(0x16,0x80);  // CTRL6-C - G_HM_MODE=1, low power gyro
  }
};

// Magnetometer
var watch;

/** This uses the DRDY line rather than polling, and sets up for a
0.625Hz data rate. Drops power consumption to ~40uA  */
Puck.magOn = function() {
  if (watch) magOff();
  var i = new I2C();
  i.setup({scl:D19,sda:D20});
  pinMode(D21,"input");//DRDY
  pinMode(D18,"output");//PWR
  D18.set(); // enable magnetometer power
  i.writeTo(30,0x0F);if(i.readFrom(30,1)[0]!=61)throw new Error("LIS3MDL not found");
  i.writeTo(30,[0x21,0]); // CTRL_REG2 - full scale +-4 gauss
  i.writeTo(30,[0x20,0]); // CTRL_REG1 low power
  i.writeTo(30,[0x23,0x02]); // CTRL_REG4 - low power, LSb at higher address (to match MAG3110)
  i.writeTo(30,[0x22,0x20]); // CTRL_REG3 - normal or low power, continuous measurement
  i.writeTo(30,[0x24,0x40]);
  // IRQ handler
  watch = setWatch(function() {
    i.writeTo(30,0x28);
    var d = new DataView(i.readFrom(30,6).buffer);
    var o = {x:d.getInt16(0),y:d.getInt16(2),z:d.getInt16(4)};
    Puck.emit("mag",o);
  },D21,{repeat:true,edge:1});
  i.writeTo(30,[0x22,0x20]); // poke REG3 again - seems to be required
};

/** replacement for magOff */
Puck.magOff = function(){
  if (!watch) return;
  clearWatch(watch);
  watch = undefined;
  pinMode(D19,"analog");//SCL
  pinMode(D20,"analog");//SDA
  pinMode(D21,"analog");//DRDY
  pinMode(D17,"analog");//INT
  D18.reset(); // disable magnetometer power
};
