/* Copyright (c) 2018 Uri Shaked. See the file LICENSE for copying permission. */
/* 
Module for the MS5803 Pressure Sensor

Usage example:

```JavaScript
var sensor = require("MS5803").connectI2C( I2C1 );
sensor.reset().then(() => {
  sensor.begin();
  sensor.read(sensor.PRECISION.ADC_512).then((result) => {
    console.log("Temperature: " + result.temperature + " °C");
    console.log("Pressure: " + result.pressure.toFixed(2) + " mBar");
  });
});
```

Available precision values: ADC_256, ADC_512, ADC_1024, ADC_2048, ADC_4096
*/

// Based on https://github.com/sparkfun/SparkFun_MS5803-14BA_Breakout_Arduino_Library

var C = {
  PRESSURE: 0x00,
  TEMPERATURE: 0x10,

  ADDRESS_HIGH: 0x76,
  ADDRESS_LOW: 0x77,

  CMD_RESET: 0x1e, // reset command
  CMD_ADC_READ: 0x00, // ADC read command
  CMD_ADC_CONV: 0x40, // ADC conversion command
  CMD_PROM: 0xa0 // Coefficient location
};

function MS5803(i2c, address) {
  this._i2c = i2c;
  this._address = address || C.ADDRESS_HIGH;
}

function waitMs(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

MS5803.prototype.PRECISION = {
  ADC_256: 0x00,
  ADC_512: 0x02,
  ADC_1024: 0x04,
  ADC_2048: 0x06,
  ADC_4096: 0x08
};

MS5803.prototype.reset = function() {
  this._i2c.writeTo(this._address, C.CMD_RESET);
  return waitMs(3);
};

MS5803.prototype.begin = function() {
  this.coefficients = [];
  for (let i = 1; i <= 6; i++) {
    this._i2c.writeTo(this._address, C.CMD_PROM + i * 2);
    const bytes = this._i2c.readFrom(this._address, 2);
    this.coefficients[i] = (bytes[0] << 8) | bytes[1];
  }
};

MS5803.prototype.getADCconversion = function(measurement, precision) {
  this._i2c.writeTo(this._address, C.CMD_ADC_CONV + measurement + precision);
  let delay = 11;
  switch (precision) {
    case C.ADC_256:
      delay = 2;
      break;
    case C.ADC_512:
      delay = 4;
      break;
    case C.ADC_1024:
      delay = 5;
      break;
    case C.ADC_2048:
      delay = 7;
      break;
    case C.ADC_4096:
      delay = 11;
      break;
  }
  return waitMs(delay).then(() => {
    this._i2c.writeTo(this._address, C.CMD_ADC_READ);
    const bytes = this._i2c.readFrom(this._address, 3);
    return (bytes[0] << 16) | (bytes[1] << 8) | bytes[2];
  });
};

MS5803.prototype.read = function(precision, farenheit) {
  precision = precision || this.PRECISION.ADC_256;
  return this.getADCconversion(C.TEMPERATURE, precision).then(
    temperatureRaw => {
      return this.getADCconversion(C.PRESSURE, precision).then(pressureRaw => {
        const dT = temperatureRaw - (this.coefficients[5] << 8);
        let temperature = ((dT * this.coefficients[6]) / 8388608) + 2000;
      
        let OFF = (this.coefficients[2] * 65536) + ((this.coefficients[4] * dT) / 128);
        let SENS = (this.coefficients[1] * 32768) + ((this.coefficients[3] * dT) / 256);
      
        let T2, OFF2, SENS2;
        if (temperature < 2000) {
          // below 20C
          T2 = 3 * ((dT * dT) / 8589934592);
          OFF2 = (3 * ((temperature - 2000) * (temperature - 2000))) / 2;
          SENS2 = (5 * ((temperature - 2000) * (temperature - 2000))) / 8;
      
          if (temperature < -1500) {
            // Below -15.0C
            OFF2 = OFF2 + 7 * ((temperature + 1500) * (temperature + 1500));
            SENS2 = SENS2 + 4 * ((temperature + 1500) * (temperature + 1500));
          }
        } else {
          // >= 20C
          T2 = (7 * (dT * dT)) / 137438953472;
          OFF2 = ((temperature - 2000) * (temperature - 2000)) / 16;
          SENS2 = 0;
        }
      
        temperature -= T2;
        OFF -= OFF2;
        SENS -= SENS2;
      
        temperature /= 100; // Convert to Celcius
      
        return {
          temperature: farenheit ? (temperature * 9) / 5 + 32 : temperature,
          pressure: ((SENS * pressureRaw) / 2097152 - OFF) / 32768 / 10,
        };
      });
    }
  );
};

// Initialise the MS5803 module with the given I2C interface
exports.connectI2C = function(i2c, addr) {
  return new MS5803(i2c, addr);
};
