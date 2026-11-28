/* Copyright (c) 2014 Peter Clarke. See the file LICENSE for copying permission. */
/*
Read different common thermistor characteristic temperature sensors.
*/

function thermistor(pin,characteristic,options) {
  this.pin = pin;
  this.characteristic = characteristic;
  this.resistor = (options && options.resistor) || 10000;
}

/** Read the input and return the temperature in degrees C, rounded to two decimal places */
thermistor.prototype.getTemp = function() {
  var pin = this.pin;
  var characteristic = this.characteristic;

  var scale = [];

  if (Array.isArray(characteristic)) scale = characteristic; // custom Steinhart-Hart coefficients [A,B,C]
  else switch (characteristic) { //Types Based on Sontay Datasheet
    case "A": // 10K3A1
      scale = [0.001128524, 0.000234171, 0.000000088];
      break;
    case "B": // 10K4A1
      scale = [0.001028372, 0.000239254, 0.000000156];
      break;
    case "C": // 20K6A1
      scale = [0.001148252, 0.000214709, 0.000000082];
      break;
    case "D": // PT100A
      scale = [0.036868557, -0.009103122, 0.000089247];
      break;
    case "E": // PT1000A
      scale = [0.040451958, -0.010238242, 0.000106096];
      break;
    case "F": // NI1000
      scale = [0.042765188, -0.007279377, 0.000033964];
      break;
    case "G": // LAN1
      scale = [0.071411383, -0.013172791, 0.000070580];
      break;
    case "H": // SAT1
      scale = [0.002708265, -0.000215138, 0.000004842];
      break;
    case "K": // STA1
      scale = [0.077910722, -0.012961587, 0.000056027];
      break;
    case "L": // TAC1
      scale = [0.001179202, 0.000287911, 0.000000040];
      break;
    case "M": // 2.2K3A1
      scale = [0.001472232, 0.000237522, 0.000000105];
      break;
  }
  
  var val = analogRead(pin); // read voltage
  var ohms = this.resistor*val/(1-val); // calculate thermistor resistance
  var W = Math.log(ohms);
  var temp = 1 / (scale[0] + W * (scale[1]+scale[2] * W*W)) - 273.15;  // calc temperature using Steinhert equation
  temp = Math.round(temp * 100) / 100; // round the temperature to two decimal places
  return temp; // and return the temperature
};

/** Create a thermistor connected to `pin`.

`type` is one of the sensor codes listed on this page (eg. `"A"` for a 10K3A1),
or an array of your own Steinhart-Hart coefficients `[A,B,C]`.

`options` is optional and can contain:

* `resistor` - the value in Ohms of the biasing resistor between the
  thermistor and 3.3v (default 10000)
*/
exports.connect = function (pin, type, options) {
  return new thermistor(pin, type, options);
};