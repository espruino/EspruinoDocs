/* Copyright (c) 2019 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Smartibot distance sensor board */
exports.connect = function() {
  var smarti = require("Smartibot");
  var gesture = require("APDS9960").connect(i2c);

  // Do a shuffle with enable pins to reassign addresses of laser 1
  I2C_INT1.write(0);
  I2C_AD1.write(1);
  l1 = require("VL53L0X").connect(i2c,{address:42});
  I2C_INT1.write(1);
  l2 = require("VL53L0X").connect(i2c,{});

  return {
    gesture : gesture,
    left : l1,
    right : l2
  };
}
