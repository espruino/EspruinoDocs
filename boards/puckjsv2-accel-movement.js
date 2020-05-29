/* Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */

if (process.env.HWVERSION!=2) throw new Error("Puck.js v2 required for this module");

/** Configure acclerometer to listen for movement. When configured,
power usage is around 40uA. Movement events fire the `Puck.accel`
event.

options = {
  duration : int (default 2) how long must the movement go on for before triggering
  threshold : int (default 2) how much movement is required
};
*/
exports.on = function(options) {
  options = options||{};
  // motion
  Puck.accelOn();
  Puck.accelWr(0x15,0x10);  // CTRL6-C - XL_HM_MODE=1, low power
  Puck.accelWr(0x0D,0x00); // INT1_CTRL - disable
  Puck.accelWr(0x11,0); // CTRL2_G power down gyro
  //Puck.accelWr(0x10,0x60);  // CTRL1_XL accelerometer 416hz
  Puck.accelWr(0x10,0x10);  // CTRL1_XL accelerometer 12.5hz
  Puck.accelWr(0x58,0x90); // TAP_CFG - enable irq, add filter
  Puck.accelWr(0x5C,options.duration||0x02); // WAKE_UP_DUR - very low duration
  Puck.accelWr(0x5B,options.threshold||0x02); // WAKE_UP_THS - low threshold
  Puck.accelWr(0x5E,0x20);  // MD1_CFG wakeup on INT1
}

/** Turn accelerometer off */
exports.off = function() {
  Puck.accelOff();
}
