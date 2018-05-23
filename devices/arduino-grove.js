/* Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* SeedStudio Grove pins for an Arduino board.

* Pixl.js: `var grove = require("arduino-grove").connect()`
* ST Nucleo: `var grove = require("arduino-grove").connect(Nucleo)`

 */
exports.connect = function(arduino) {
  if (!arduino) arduino=global;
  return {
    A0  : [arduino.A0,arduino.A1],
    A1  : [arduino.A1,arduino.A2],
    A2  : [arduino.A2,arduino.A3],
    A3  : [arduino.A3,arduino.A4],
    USART  : [arduino.D0,arduino.D1],
    I2C  : [arduino.A4,arduino.A5],
    D2 : [arduino.D2,arduino.D3],
    D3 : [arduino.D3,arduino.D4],
    D4 : [arduino.D4,arduino.D5],
    D5 : [arduino.D5,arduino.D6],
    D6 : [arduino.D6,arduino.D7],
    D7 : [arduino.D7,arduino.D8],
    D8 : [arduino.D8,arduino.D9]
  };
}
