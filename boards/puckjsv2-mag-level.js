/* Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
if (process.env.HWVERSION!=2) throw new Error("Puck.js v2 required for this module");

var watch;
/** Configure magnetometer in low power mode. When the field
strength is greater than the supplied threshold the Puck.on('mag')
event is fired with:

{
  x,y,z, // int: field strength
  state, // bool: is field strength greater than thresh in any axis?
  xp,yp,zp // bool: is positive field greater than the threshold
  xn,yn,zn // bool: is negative field greater than the threshold
}

Can be called with options, which contains:

options = {
  thresh : int // (default 0x2000) threshold for field strength events
  x : // (default true) trigger on X axis
  y : // (default true) trigger on Y axis
  z : // (default true) trigger on Z axis
}
 */
exports.on = function(options) {
  options = options||{};
  var thresh = options.thresh||0x2000;
  if (watch) exports.off();
  var i = new I2C();
  i.setup({scl:D19,sda:D20});
  pinMode(D17,"input");//INT
  pinMode(D18,"output");//PWR
  D18.set(); // enable magnetometer power
  i.writeTo(30,0x0F);if(i.readFrom(30,1)[0]!=61)throw new Error("LIS3MDL not found");
  i.writeTo(30,[0x21,0]); // CTRL_REG2 - full scale +-4 gauss
  i.writeTo(30,[0x20,0]); // CTRL_REG1 low power
  i.writeTo(30,[0x23,0x02]); // CTRL_REG4 - low power, LSb at higher address (to match MAG3110)
  i.writeTo(30,[0x22,0x20]); // CTRL_REG3 - normal or low power, continuous measurement
  i.writeTo(30,[0x24,0x40]);
  var r = 0x05;
  if (options.x!==undefined && options.x==true) r |= 0x80;
  if (options.y!==undefined && options.y==true) r |= 0x40;
  if (options.z!==undefined && options.z==true) r |= 0x20;
  i.writeTo(30,[0x30,0xD5]); // INT_CFG - IRQ on, XYZ, active high
  i.writeTo(30,[0x32,thresh&0xFF]); // INT_THS_L
  i.writeTo(30,[0x33,thresh>>8]); // INT_THS_H
  // IRQ handler
  watch = setWatch(function(e) {
    i.writeTo(30,0x28);
    var d = new DataView(i.readFrom(30,6).buffer);
    i.writeTo(30,0x31);
    var int = i.readFrom(30,1);
    var o = {
      x:d.getInt16(0),
      y:d.getInt16(2),
      z:d.getInt16(4),
      state : !!(int&0xFC),
      xp : !!(int&0x80),
      yp : !!(int&0x40),
      zp : !!(int&0x20),
      xn : !!(int&0x10),
      yn : !!(int&0x08),
      zn : !!(int&0x04),
    };
    Puck.emit("mag",o);
  },D17,{repeat:true,edge:0});
  i.writeTo(30,[0x22,0x20]); // poke REG3 again - seems to be required
};

/** Turn magnetometer off */
exports.off = function(){
  if (!watch) return;
  clearWatch(watch);
  watch = undefined;
  pinMode(D19,"analog");//SCL
  pinMode(D20,"analog");//SDA
  pinMode(D21,"analog");//DRDY
  pinMode(D17,"analog");//INT
  D18.reset(); // disable magnetometer power
};
