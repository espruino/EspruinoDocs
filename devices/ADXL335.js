/* Copyright (c) 2014 Lars Toft Jacobsen. See the file LICENSE for copying permission. */
/*
Convenience module for the ADXL335 analog accelerometer 
*/

function ADXL335(_pin_x, _pin_y, _pin_z) {
  this.pin_x = _pin_x;
  this.pin_y = _pin_y;
  this.pin_z = _pin_z;
}

/* Constants used in G calculations.
All set up for default Espruino use */
ADXL335.prototype.C = {
  MVG : 0.33,   // Sensitivity at 3.3V ~ 330 mV/G
  ZEROG : 1.65, // Zero G bias ~ 3.3V/2
  AREF : 3.3    // Ref. voltage
};

/* Read the raw analog values */
ADXL335.prototype.readRaw = function() {
  var x = analogRead(this.pin_x);
  var y = analogRead(this.pin_y);
  var z = analogRead(this.pin_z);
  return [x, y, z];
};

/* Convert raw readings to G's and return a three element array
[xG's, yG's, zG's] */
ADXL335.prototype.readG = function() {
  var raw = this.readRaw();
  var adxl = this;
  return raw.map(function(e) {
    return ((e * adxl.C.AREF) - adxl.C.ZEROG) / adxl.C.MVG;
  });
};

exports.connect = function (_pin_x, _pin_y, _pin_z) {
  return new ADXL335(_pin_x, _pin_y, _pin_z);
};