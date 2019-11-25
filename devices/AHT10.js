/* Copyright (c) 2014 Gustav Karlström. See the file LICENSE for copying permission. */
/*
Library for the sensor AHT10
https://wiki.liutyi.info/display/ARDUINO/AHT10
*/
const i2c = new I2C();
const C = {
  ahtAddress: 0x38,
  sensorCalibrateCmd: [0xE1, 0x08, 0x00],
  sensorMeasureCmd: [0xAC, 0x33, 0x00],
  bytesInAMebibyte: 1048576,
  getRHCmd: true,
  getTempCmd: false,
  waterVapor: 17.62,//f
  barometricPressure: 243.5 //f
};

function getRawSensorData(getDataCmd) {
  i2c.writeTo(C.ahtAddress, C.sensorMeasureCmd);
  const dataFromSensor = i2c.readFrom(C.ahtAddress, 6);
  if (getDataCmd) {
    return ((dataFromSensor[1] << 16) | (dataFromSensor[2] << 8) | dataFromSensor[3]) >> 4;
  }
  return ((dataFromSensor[3] & 0x0F) << 16) | (dataFromSensor[4] << 8) | dataFromSensor[5];
}

function AHT10(scl, sda, bitrate) {
  this.scl = scl;
  this.sda = sda;
  this.bitrate = bitrate || 300000;
  i2c.setup({ scl: this.scl, sda: this.sda, bitrate: this.bitrate });
  i2c.writeTo(C.ahtAddress, C.sensorCalibrateCmd);
  if ((i2c.readFrom(C.ahtAddress, 1) & 0x68) === 0x08) {
    console.log('Connection successful');
  } else {
    console.log('Connection failed');
  }

}

AHT10.prototype.getTemperature = function () {
  const rawData = getRawSensorData(C.getTempCmd);
  return ((200 * rawData) / C.bytesInAMebibyte) - 50;
};

AHT10.prototype.getHumidity = function () {
  const rawData = getRawSensorData(C.getRHCmd);
  if (rawData === 0) {
    return 0;
  }
  return rawData * 100 / C.bytesInAMebibyte;
};

AHT10.prototype.getDewPoint = function () {
  const humidity = this.getHumidity();
  const temperature = this.getTemperature();
  const gamma = Math.log(humidity / 100) + C.waterVapor * temperature / (C.barometricPressure + temperature);
  const dewPoint = C.barometricPressure * gamma / (C.waterVapor - gamma);
  return dewPoint;
};

exports.connect = function (scl, sda, bitrate) {
  return new AHT10(scl, sda, bitrate);
};
