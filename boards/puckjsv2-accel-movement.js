/* Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
if (process.env.HWVERSION!=2 && process.env.HWVERSION!=2.1) throw new Error("Puck.js v2 required for this module");

/// Called on the movement event, and swaps the IRQ source
function accelHandler(a) {
  a.motion = !!(Puck.accelRd(0x1B)&8);
  Puck.accelWr(0x0D,a.motion ? 0x01 : 0x00);  // INT1_CTRL enable accel  
  Puck.accelWr(0x5E,a.motion ? 0x00 : 0x20);  // No MD1_CFG wakeup on INT1
}

/** Configure acclerometer to listen for movement. When configured,
power usage is around 40uA. Movement events fire the `Puck.accel`
event.

options = {
  duration : int (0..15, default 2) how long must the movement go on for before triggering
  threshold : int (0..63, default 2) how much movement is required
  lowPower : bool - if true, use 0.6Hz vs 12.5Hz sample rate
               Threshold will need to be higher (10+) to work reliably 
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
  Puck.accelWr(0x10,options.lowPower ? 0xB0 : 0x10);  // CTRL1_XL accelerometer 12.5hz
  Puck.accelWr(0x58,0x90); // TAP_CFG - enable irq, add filter
  Puck.accelWr(0x5C,E.clip(options.duration,0,15)||0x02); // WAKE_UP_DUR - very low duration
  Puck.accelWr(0x5B,E.clip(options.threshold,0,63)||0x02); // WAKE_UP_THS - low threshold
  Puck.accelWr(0x5E,0x20);  // MD1_CFG wakeup on INT1
  Puck.on('accel', accelHandler, {first:true}/* only works on 2v19+ */);
};

/** Turn accelerometer off */
exports.off = function() {
  Puck.removeListener('accel', accelHandler); 
  Puck.accelOff();
};
