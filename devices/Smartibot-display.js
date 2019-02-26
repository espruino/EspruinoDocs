/* Copyright (c) 2019 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Smartibot display board */
exports.connect = function() {
  var smarti = require("Smartibot");
  return require("IS31FL3731").connect(smarti.I2C);
}
