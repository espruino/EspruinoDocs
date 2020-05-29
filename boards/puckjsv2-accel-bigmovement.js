/* Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
if (process.env.HWVERSION!=2) throw new Error("Puck.js v2 required for this module");
function clearIRQ() {
  Puck.accelRd(0x53);
}

/** Configure acclerometer to listen for when the device is
moved significantly for a while. When configured,
power usage is around 50uA, and the `Puck.accel`
event is fired when movement happens.

options = { unused };
*/
exports.on = function(options) {
  options = options||{};
  NRF.setConnectionInterval(50);
  Puck.accelOn(26);
  Puck.accelWr(0x11,0); // CTRL2_G power down gyro
  Puck.accelWr(0x01,0x80);  // FUNC_CFG_ACCESS enabled
  Puck.accelWr(0x13,0x01); // SM_THS - significant motion threshold
  Puck.accelWr(0x01,0x00);  // FUNC_CFG_ACCESS disabled
  Puck.accelWr(0x10,0x20);  // CTRL1_XL accelerometer 26hz
  Puck.accelWr(0x19,0x05); // CTRL10_C - significant motion enable
  Puck.accelWr(0x0D,0x40); // INT1_CTRL - significant motion only
  Puck.accelWr(0x58,0x81); // latched IRQ - clear with Puck.accelRd(0x53);
  Puck.on('accel',clearIRQ);
}

/** Turn accelerometer off */
exports.off = function() {
  Puck.removeListener('accel',clearIRQ);
  Puck.accelOff();
}
