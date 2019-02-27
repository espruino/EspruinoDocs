/* Copyright (c) 2019 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Smartibot distance sensor board */

/** Returns {getLeft,getRight,getGesture,gesture,left,right}
* gesture is an instance of APDS9960
* left/right are instances of VL53L0X
*/
exports.connect = function(port) {
  if (!port) throw "No port supplied - use smarti.E1";
  var gesture = require("APDS9960").connect(port.i2c);

  // Do a shuffle with enable pins to reassign addresses of laser 1
  port.int.write(0);
  port.ad.write(1);
  var l1 = require("VL53L0X").connect(port.i2c,{address:42});
  port.int.write(1);
  var l2 = require("VL53L0X").connect(port.i2c,{});

  return {
    getLeft : _ => l1.performSingleMeasurement().distance,
    getRight : _ => l2.performSingleMeasurement().distance,
    getGesture : _ => ({left:"up",right:"down",down:"left",up:"right"}[gesture.getGesture()]),
    gesture : gesture,
    left : l1,
    right : l2
  };
}
