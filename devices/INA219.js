/* Copyright (c) 2020 parasquid. See the file LICENSE for copying permission. */

/*
Code was adapted from https://github.com/SV-Zanshin/INA
and https://github.com/adafruit/Adafruit_INA219
and https://github.com/espruino/EspruinoDocs/blob/master/devices/INA226.js

See also https://www.ti.com/lit/gpn/ina219 page 12

Example usage:

```
  I2C1.setup({ sda: A4, scl: A5 });

  const ina219 = require("INA219").connect(I2C1);

  console.log(ina219.initDevice());
  setInterval(function() {
    console.log(ina219.getBusMilliVolts() / 1000 + 'V');
    console.log(ina219.getBusMicroAmps() * 1000 + 'mA');
    console.log(ina219.getBusMicroWatts() * 1000 + 'mW');
    console.log('-----');
  }, 1000);
```

connect() also accepts an options object for its second positional parameter.
This allows you to customize the accuracy of the sensor depending on the shunt
and the maximum current you will be using.

```
  const defaultOptions = {
    maximumExpectedCurrent: 3.2768, // in amps
    rShunt: 0.1, // in ohms
  };
```
*/

function INA219(i2c, options, deviceAddress) {
  this.i2c = i2c;
  this.options = options;
  this.deviceAddress = deviceAddress;
  this.currentLsb = options.maximumExpectedCurrent / 32768;
}

/** see INA219 datasheet https://www.ti.com/lit/gpn/ina219 */
var C = {
  I2C_ADDRESS : 0x40,

  CONFIGURATION_REGISTER : 0x00,
  SHUNT_VOLTAGE_REGISTER : 0x01,
  BUS_VOLTAGE_REGISTER : 0x02,
  POWER_REGISTER : 0x03,
  CURRENT_REGISTER : 0x04,
  CALIBRATION_REGISTER : 0x05,

  RESET_DEVICE : 0x8000,

  BUS_VOLTAGE_LSB : 4,
  SHUNT_VOLTAGE_LSB : 10,
  POWER_LSB : 20,
};

INA219.prototype.readWord = function(address) {
  this.i2c.writeTo(this.deviceAddress, address);

  const returnData = this.i2c.readFrom(this.deviceAddress, 2);
  return returnData[1] | returnData[0] << 8;
};

INA219.prototype.readSigned = function(address) {
  const data = this.readWord(address);
  return (data & 32768) ? data - 65536 : data;
};

INA219.prototype.writeWord = function(address, data) {
  this.i2c.writeTo(this.deviceAddress, [address, data >> 8, data]);
};

/** initializes the device
 *
 *  initDevice() performs a quick check to see if the device at the I2C address
 *  is actually an INA219.
 *
 *  It will then calculate a calibration factor based on the resistor shunt and
 *  the maximum expected current (passed in as options in the constructor).
 *
 *  returns an object with the calibration factor
 */
INA219.prototype.initDevice = function() {
  const originalRegister = this.readWord(C.CONFIGURATION_REGISTER);
  this.writeWord(C.CONFIGURATION_REGISTER, C.RESET_DEVICE);
  const tempRegister = this.readWord(C.CONFIGURATION_REGISTER);
  if (tempRegister !== 0x399F) throw new Error("Probably not an INA219");

  const calibration = Math.round(0.04096 / (this.currentLsb * this.options.rShunt));
  this.writeWord(C.CALIBRATION_REGISTER, calibration);
  return({ calibrationFactor: calibration });
};

INA219.prototype.getBusRaw = function() {
  const raw = this.readWord(C.BUS_VOLTAGE_REGISTER);
  return raw >> 3;
};

/** returns the voltage measurement in millivolts */
INA219.prototype.getBusMilliVolts = function() {
  const busVoltage = this.getBusRaw();
  return busVoltage * C.BUS_VOLTAGE_LSB;
};

INA219.prototype.getShuntRaw = function() {
  const raw = this.readWord(C.SHUNT_VOLTAGE_REGISTER);
  return raw >> 3;
};

/** returns the voltage drop across the shunt in micro volts */
INA219.prototype.getShuntMicroVolts = function() {
  const shuntVoltage = this.getShuntRaw();
  return shuntVoltage * C.SHUNT_VOLTAGE_LSB;
};

/** returns the current measurement in microamps */
INA219.prototype.getBusMicroAmps = function() {
  const microAmps = this.readSigned(C.CURRENT_REGISTER);
  return microAmps * this.currentLsb;
};

/** returns the power measurement in microwatts */
INA219.prototype.getBusMicroWatts = function() {
  const microWatts = this.readSigned(C.POWER_REGISTER);
  return microWatts * this.currentLsb * C.POWER_LSB;
};

/** returns a new INA219 object with default values (if positional parameters
 *  were not provided)
 *
 *  the defaults are:
 *
 *  const defaultOptions = {
 *    maximumExpectedCurrent: 3.2768, // in amps
 *    rShunt: 0.1, // in ohms
 *  };
 */
exports.connect = function (i2c, options, deviceAddress) {
  const defaultOptions = {
    maximumExpectedCurrent: 3.2768, // in amps
    rShunt: 0.1, // in ohms
  };
  return new INA219(i2c, options || defaultOptions, deviceAddress || 0x40);
};
