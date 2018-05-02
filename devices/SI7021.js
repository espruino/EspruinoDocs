/* Copyright (c) 2018 Simone Di Cicco. See the file LICENSE for copying permission. */
/*
Si7021(-A20) is a I2C Humidity and Temperature sensor by Silicon Labs.
Default temperature unit of measure (by factory) is Celsius.

Breakout Board is purchasable at: https://www.adafruit.com/product/3251.
Datasheet: https://www.silabs.com/documents/public/data-sheets/Si7021-A20.pdf.

This module is interfacing all the possibile commands available on Si7021(-A20) module.
Temperature and Humidity formulas are provided by the Sensor's Datasheet.
*/

var C = {
  ADDRESS: 0x40,
  BITS_TO_READ: 16
};

var COMMANDS = {

  REL_HUMIDITY_HOLD_MASTER: [0xE5],
  REL_HUMIDITY_NO_HOLD_MASTER: [0xF5],
  TEMP_HOLD_MASTER: [0xE3],
  TEMP_NO_HOLD_MASTER: [0xF3],
  TEMP_FROM_PREV_REL_HUMIDITY_MEASURE: [0xE0],
  RESET: [0xFE],
  WRITE_RH_T_USER_REG_1: [0xE6],
  READ_RH_T_USER_REG_1: [0xE7],
  WRITE_HEATER_CONTROL_REG: [0x51],
  READ_HEATER_CONTROL_REG: [0x11],
  READ_ELECTRONIC_ID_1_BYTE: [0xFA, 0x0F],
  READ_ELECTRONIC_ID_2_BYTE: [0xFC, 0xC9],
  READ_FIRMWARE_REV: [0x84, 0xB8]
};

function SI7021(I2C) {
  this.I2C = I2C;
}

/* Eventually, converts result from. I2C */
function elaborateI2CResult(buffer, returnShifted) {
  return returnShifted ? (buffer[0] << 8) | buffer[1] : buffer;
}

/* Temperature value conversion. */
function calculateTemperature(value) {
  return ((175.72 * value) / 65536) - 46.85;
}

/* Relative Humidity value conversion. */
function calculateRelativeHumidity(value) {
  return ((125 * value) / 65536) - 6;
}

/* I2C transmission. */
function transmit(i2c, command, options) {

  if (!options) {
    options = { returnShifted: true }
  } else {

    if (options.value) {
      command.push(options.value);
    }
  }

  i2c.writeTo(C.ADDRESS, command);
  return elaborateI2CResult(i2c.readFrom(C.ADDRESS, C.BITS_TO_READ), options.returnShifted);
}

/* Read Relative Humidity command. */
SI7021.prototype.readRelativeHmidity = function(holdMaster) {

  holdMaster = holdMaster ? holdMaster : true;

  var command = COMMANDS.REL_HUMIDITY_NO_HOLD_MASTER;
  if (holdMaster) {
    command = COMMANDS.REL_HUMIDITY_HOLD_MASTER;
  }

  var result = transmit(this.I2C, command);
  return calculateRelativeHumidity(result);
};

/* Read Temperature command. */
SI7021.prototype.readTemperature = function(holdMaster) {

  holdMaster = holdMaster ? holdMaster : true;

  var command = COMMANDS.TEMP_NO_HOLD_MASTER;
  if (holdMaster) {
    command = COMMANDS.TEMP_HOLD_MASTER;
  }

  var result = transmit(this.I2C, command);
  return calculateTemperature(result);
};

/* Read Temperature from previous Relative Humidity measurement command. */
SI7021.prototype.readTemperatureFromPrevRHMeasure = function() {

  var result = transmit(this.I2C, COMMANDS.TEMP_FROM_PREV_REL_HUMIDITY_MEASURE);
  return calculateTemperature(result);
};

/* Reset command. */
SI7021.prototype.reset = function() {
  return transmit(this.I2C, COMMANDS.RESET);
};

/* Write Relative Humidity User register 1 command. */
SI7021.prototype.writeRelHumidityUserReg1 = function(value) {
  return transmit(this.I2C, COMMANDS.WRITE_RH_T_USER_REG_1, { value: value });
};

/* Read Relative Humidity User register 1 command. */
SI7021.prototype.readRelHumidityUserReg1 = function() {
  return transmit(this.I2C, this.I2C, COMMANDS.READ_RH_T_USER_REG_1);
};

/* Write Heater Control Register command. */
SI7021.prototype.writeHeaterControlReg = function(value) {
  return transmit(this.I2C, COMMANDS.WRITE_HEATER_CONTROL_REG, { value: value });
};

/* Read Heater Control Register command. */
SI7021.prototype.readHeaterControlReg = function() {
  return transmit(this.I2C, COMMANDS.READ_HEATER_CONTROL_REG);
};

/* Read Electronic ID 1 byte command. */
SI7021.prototype.readElectronicId1Byte = function() {
  return transmit(this.I2C, COMMANDS.READ_ELECTRONIC_ID_1_BYTE);
};

/* Read Electronic ID 2 byte command. */
SI7021.prototype.readElectronicId2Byte = function() {
  return transmit(this.I2C, COMMANDS.READ_ELECTRONIC_ID_2_BYTE);
};

/* Read Firmware Revision command. */
SI7021.prototype.readFirmwareRev = function() {
  return transmit(this.I2C, COMMANDS.READ_FIRMWARE_REV);
};

/* Sets the I2C port. */
exports.connect = function(I2C) {
  return new SI7021(I2C);
};