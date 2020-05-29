/* Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
if (process.env.HWVERSION!=2) throw new Error("Puck.js v2 required for this module");
function clearIRQ() {
  Puck.accelRd(0x53);
}

/** Configure acclerometer to listen for when the device is
tilted by more than 35 degrees. When configured,
power usage is around 50uA. Tilt events fire the `Puck.accel`
event.

options = { unused };
*/
exports.on = function(options) {
  options = options||{};
  NRF.setConnectionInterval(50);
  Puck.accelOn(26);
  Puck.accelWr(0x11,0); // CTRL2_G power down gyro
  Puck.accelWr(0x15,0x10);  // CTRL6-C - XL_HM_MODE=1, low power accelerometer
  Puck.accelWr(0x10,0x20);  // CTRL1_XL accelerometer 26hz
  Puck.accelWr(0x19,0x0C); // CTRL10_C - enable tilt detection
  Puck.accelWr(0x0D,0x00); // INT1_CTRL - disable
  Puck.accelWr(0x5E,0x02);  // MD1_CFG tilt on INT1
  Puck.accelWr(0x58,0x81); // latched IRQ - clear with Puck.accelRd(0x53);
  Puck.on('accel',clearIRQ);
}

/** Turn accelerometer off */
exports.off = function() {
  Puck.removeListener('accel',clearIRQ);
  Puck.accelOff();
}
