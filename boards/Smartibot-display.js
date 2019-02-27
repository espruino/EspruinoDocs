/* Copyright (c) 2019 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Smartibot display board */
exports.connect = function(port) {
  if (!port) throw "No port supplied - use smarti.E1";
  return require("IS31FL3731").connect(port.i2c);
}
