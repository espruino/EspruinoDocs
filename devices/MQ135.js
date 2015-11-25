/*
Copyright (C) 2015, Nic Marcondes <nic@upnic.net>

This module interfaces with a MQ135 Air Quality sensor (CO2 meter);
Usage (any GPIO pin with ADC capability can be used):

var mq = require("MQ135").connect(A7);
console.log(mq.getPPM());

You can also use with ambient temperature/humidity correction factor:
console.log(mq.getCorrectedPPM(25, 80));

TIP: Take usage of DHT11 to get this temperature/humidity data dynamically. http://www.espruino.com/DHT11

NOTE: This class of sensor needs 24h after powered to "warning-up".

Based on: https://github.com/GeorgK/MQ135/blob/master/MQ135.cpp
*/

exports.connect = function(pin) {
  return new MQ135(pin);
}

function MQ135(pin) {
  this.PIN = pin;

  /// The load resistance on the board
  this.RLOAD = 10.0;

  /// Calibration resistance at atmospheric CO2 level
  this.RZERO = 76.63;

  /// Parameters for calculating ppm of CO2 from sensor resistance
  this.PARA = 116.6020682;
  this.PARB = 2.769034857;

  /// Parameters to model temperature and humidity dependence
  this.CORA = 0.00035;
  this.CORB = 0.02718;
  this.CORC = 1.39538;
  this.CORD = 0.0018;

  /// Atmospheric CO2 level for calibration purposes
  this.ATMOCO2 = 397.13;
}

/**
 * Get the resistance of the sensor (in KOhm)
 */
MQ135.prototype.getResistance = function() {
  return ((1023/analogRead(this.PIN)) * 5 - 1)*this.RLOAD;
}

/**
 * Get the ppm concentration
 */
MQ135.prototype.getPPM = function() {
  return Math.round(this.PARA * Math.pow((this.getResistance() / this.RZERO), -this.PARB));
}

/**
 * Get the resistance RZero of the sensor for calibration purposes.
 * Set this value to your "this.RZERO" variable if you need.
 */
MQ135.prototype.getRZero =  function() {
  return this.getResistance() * Math.pow((this.ATMOCO2/this.PARA), (1/this.PARB));
}

/*
 * Get the correction factor to correct for temperature and humidity
 */
MQ135.prototype.getCorrectionFactor = function(temperature, humidity) {
  return this.CORA * temperature * temperature - this.CORB * temperature + this.CORC - (humidity - 33) * this.CORD;
}

/*
 * Get the calibrated ro based upon read resistance
 */
MQ135.prototype.getCorrectedResistance = function(temperature, humidity) {
  return Math.round(this.getResistance() / this.getCorrectionFactor(temperature, humidity));
}

/**
 * Get the ppm concentration corrected
 */
MQ135.prototype.getCorrectedPPM =  function(temperature, humidity) {
  return Math.round(this.PARA * Math.pow((this.getCorrectedResistance(temperature, humidity)/this.RZERO), -this.PARB));
}

/**
 * Get the corrected resistance RZero of the sensor for calibration purposes
 */
MQ135.prototype.getCorrectedRZero = function(temperature, humidity) {
  return this.getCorrectedResistance(temperature, humidity) * Math.pow((this.ATMOCO2/this.PARA), (1/this.PARB));
}
