/* Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
if (process.env.HWVERSION!=2) throw new Error("Puck.js v2 required for this module");
function clearIRQ() {
  Puck.accelRd(0x53);
}


/** Configure acclerometer to listen for steps. When configured,
power usage is around 50uA. Step events fire the `Puck.accel`
event.

options = { unused };
*/
exports.on = function(options) {
  options = options||{};
  Puck.accelOn(26);
  Puck.accelWr(0x11,0); // CTRL2_G power down gyro
  Puck.accelWr(0x10,0x20);  // CTRL1_XL 26hz, 2g
  Puck.accelWr(0x19,0x14); // CTRL10_C - enable pedometer
  Puck.accelWr(0x0D,0x80); // INT1_CTRL - step detect
  Puck.accelWr(0x15,0x10);  // CTRL6-C - XL_HM_MODE=1, low power accelerometer
  Puck.accelWr(0x58,0x81); // latched IRQ - clear with Puck.accelRd(0x53);
  Puck.on('accel',clearIRQ);
}

/** Turn accelerometer off */
exports.off = function() {
  Puck.removeListener('accel',clearIRQ);
  Puck.accelOff();
}
