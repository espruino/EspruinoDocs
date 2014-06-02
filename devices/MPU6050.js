/* Copyright (c) 2014 Lars Toft Jacobsen. See the file LICENSE for copying permission. */
/*
Module for the Invensense MPU6050 digital gyro + accelerometer sensor fusion IC.
Only I2C is supported.

Parts of the module is based on the driver written by Jeff Rowberg:
I2Cdev device library code is placed under the MIT license
Copyright (c) 2012 Jeff Rowberg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
*/

/* Module constants*/
var C = {
  ADDRESS_AD0_LOW     : 0x68, // address pin low (GND)
  ADDRESS_AD0_HIGH    : 0x69, // address pin high (VCC)

  CLOCK_INTERNAL      : 0x00,
  CLOCK_PLL_XGYRO     : 0x01,
  CLOCK_PLL_YGYRO     : 0x02,
  CLOCK_PLL_ZGYRO     : 0x03,
  CLOCK_PLL_EXT32K    : 0x04,
  CLOCK_PLL_EXT19M    : 0x05,
  CLOCK_KEEP_RESET    : 0x07,
  
  GYRO_FS_250         : 0x00,
  GYRO_FS_500         : 0x01,
  GYRO_FS_1000        : 0x02,
  GYRO_FS_2000        : 0x03,

  ACCEL_FS_2          : 0x00,
  ACCEL_FS_4          : 0x01,
  ACCEL_FS_8          : 0x02,
  ACCEL_FS_16         : 0x03
};

/* Register addresses*/
var R = {
  SELF_TEST_X         : 0x0D,
  SELF_TEST_Y         : 0x0E,
  SELF_TEST_Z         : 0x0F,
  SELF_TEST_A         : 0x10,
  SMPLRT_DIV          : 0x19,
  CONFIG              : 0x1A,
  GYRO_CONFIG         : 0x1B,
  ACCEL_CONFIG        : 0x1C,
  FIFO_EN             : 0x23,
  I2C_MST_CTRL        : 0x24,
  I2C_SLV0_ADDR       : 0x25,
  I2C_SLV0_REG        : 0x26,
  I2C_SLV0_CTRL       : 0x27,
  I2C_SLV1_ADDR       : 0x28,
  I2C_SLV1_REG        : 0x29,
  I2C_SLV1_CTRL       : 0x2A,
  I2C_SLV2_ADDR       : 0x2B,
  I2C_SLV2_REG        : 0x2C,
  I2C_SLV2_CTRL       : 0x2D,
  I2C_SLV3_ADDR       : 0x2E,
  I2C_SLV3_REG        : 0x2F,
  I2C_SLV3_CTRL       : 0x30,
  I2C_SLV4_ADDR       : 0x31,
  I2C_SLV4_REG        : 0x32,
  I2C_SLV4_DO         : 0x33,
  I2C_SLV4_CTRL       : 0x34,
  I2C_SLV4_DI         : 0x35,
  I2C_MST_STATUS      : 0x36,
  INT_PIN_CFG         : 0x37,
  INT_ENABLE          : 0x38,
  INT_STATUS          : 0x3A,
  ACCEL_XOUT_H        : 0x3B,
  ACCEL_XOUT_L        : 0x3C,
  ACCEL_YOUT_H        : 0x3D,
  ACCEL_YOUT_L        : 0x3E,
  ACCEL_ZOUT_H        : 0x3F,
  ACCEL_ZOUT_L        : 0x40,
  TEMP_OUT_H          : 0x41,
  TEMP_OUT_L          : 0x42,
  GYRO_XOUT_H         : 0x43,
  GYRO_XOUT_L         : 0x44,
  GYRO_YOUT_H         : 0x45,
  GYRO_YOUT_L         : 0x46,
  GYRO_ZOUT_H         : 0x47,
  GYRO_ZOUT_L         : 0x48,
  EXT_SENS_DATA00     : 0x49,
  EXT_SENS_DATA01     : 0x4A,
  EXT_SENS_DATA02     : 0x4B,
  EXT_SENS_DATA03     : 0x4C,
  EXT_SENS_DATA04     : 0x4D,
  EXT_SENS_DATA05     : 0x4E,
  EXT_SENS_DATA06     : 0x4F,
  EXT_SENS_DATA07     : 0x50,
  EXT_SENS_DATA08     : 0x51,
  EXT_SENS_DATA09     : 0x52,
  EXT_SENS_DATA10     : 0x53,
  EXT_SENS_DATA11     : 0x54,
  EXT_SENS_DATA12     : 0x55,
  EXT_SENS_DATA13     : 0x56,
  EXT_SENS_DATA14     : 0x57,
  EXT_SENS_DATA15     : 0x58,
  EXT_SENS_DATA16     : 0x59,
  EXT_SENS_DATA17     : 0x5A,
  EXT_SENS_DATA18     : 0x5B,
  EXT_SENS_DATA19     : 0x5C,
  EXT_SENS_DATA20     : 0x5D,
  EXT_SENS_DATA21     : 0x5E,
  EXT_SENS_DATA22     : 0x5F,
  EXT_SENS_DATA23     : 0x60,
  I2C_SLV0_DO         : 0x63,
  I2C_SLV1_DO         : 0x64,
  I2C_SLV2_DO         : 0x65,
  I2C_SLV3_DO         : 0x66,
  I2C_MST_DELAY_CTRL  : 0x67,
  SIGNAL_PATH_RESET   : 0x68,
  USER_CTRL           : 0x6A,
  PWR_MGMT_1          : 0x6B,
  PWR_MGMT_2          : 0x6C,
  FIFO_COUNT_H        : 0x72,
  FIFO_COUNT_L        : 0x73,
  FIFO_R_W            : 0x74,
  WHO_AM_I            : 0x75
};

/* MPU6050 Object */
function MPU6050(_i2c, _addr) {
  this.i2c = _i2c;
  this.addr =
    (undefined===_addr || false===_addr) ? C.ADDRESS_AD0_LOW :
    (true===_addr) ? C.ADDRESS_AD0_HIGH :
    _addr;
  this.initialize();
}

MPU6050.prototype.C = {
};

/* Initialize the chip */
MPU6050.prototype.initialize = function() {
  this.setClockSource(C.CLOCK_PLL_XGYRO);
  this.setFullScaleAccelRange(C.ACCEL_FS_2);
  this.setFullScaleGyroRange(C.GYRO_FS_250);
  this.setSleepEnabled(false);
};

/* Set a single bit in a register */
MPU6050.prototype.writeBit = function(reg, bit, val) {
  this.i2c.writeTo(this.addr, reg);
  var b = this.i2c.readFrom(this.addr, 1)[0];
  b = (val !== 0) ? (b | (1 << bit)) : (b & ~(1 << bit));
  this.i2c.writeTo(this.addr, [reg, b]);
};

/* Set more bits in a register */
MPU6050.prototype.writeBits = function(reg, shift, val) {
  this.i2c.writeTo(this.addr, reg);
  var b = this.i2c.readFrom(this.addr, 1)[0];
  b = b | (val << shift);
  this.i2c.writeTo(this.addr, [reg, b]);
};

/* Read 2 bytes from register reg
and combine to signed integer */
MPU6050.prototype.readS16 = function(reg) {
  this.i2c.writeTo(this.addr, reg);
  var d = this.i2c.readFrom(this.addr, 2);
  var i = (d[0] << 8) | d[1];
  return (i>=32767) ? i - 65536 : i;
};

/* Read 6 bytes and return 3 signed integer values */
MPU6050.prototype.readSXYZ = function(reg) {
  this.i2c.writeTo(this.addr, reg);
  var bytes = this.i2c.readFrom(this.addr, 6);
  var x = (bytes[0] << 8) | bytes[1];
  var y = (bytes[2] << 8) | bytes[3];
  var z = (bytes[4] << 8) | bytes[5];
  x = (x>=32767) ? x - 65536 : x;
  y = (y>=32767) ? y - 65536 : y;
  z = (z>=32767) ? z - 65536 : z;
  return [x, y ,z];
};

/* Set the clock source */
MPU6050.prototype.setClockSource = function(clock) {
  this.writeBits(R.PWR_MGMT_1, 0, clock);
};

/* Set full scale for accelerometer*/
MPU6050.prototype.setFullScaleAccelRange = function(fs) {
  this.writeBits(R.ACCEL_CONFIG, 3, fs);
  this.acc_lsb_sens = Math.pow(2, 14-fs); // Set LSB sensitivity
};

/* Set full scale for gyro */
MPU6050.prototype.setFullScaleGyroRange = function(fs) {
  this.writeBits(R.GYRO_CONFIG, 3, fs);
  this.gyro_lsb_sens = 131 / Math.pow(2, fs); // Set LSB sensitivity
};

MPU6050.prototype.setSleepEnabled = function(enable) {
  if (enable) {
    this.writeBit(R.PWR_MGMT_1, 6, 1);
  }
  else {
    this.writeBit(R.PWR_MGMT_1, 6, 0);
  }
};

/* Get raw rotation */
MPU6050.prototype.getRotation = function() {
  return this.readSXYZ(R.GYRO_XOUT_H);
};

/* Get rotation measuren in degrees/s */
MPU6050.prototype.getDegreesPerSecond = function() {
  var rot = this.getRotation();
  var mpu = this;
  return rot.map(function(e) {
    return e / mpu.gyro_lsb_sens;
  });
};

/* Get raw acceleration */
MPU6050.prototype.getAcceleration = function() {
  return this.readSXYZ(R.ACCEL_XOUT_H);
};

/* Get acceleration in G's */
MPU6050.prototype.getGravity = function() {
  var acc = this.getAcceleration();
  var mpu = this;
  return acc.map(function(e) {
    return e / mpu.acc_lsb_sens;
  });
};

/* Get temperature in degrees C from built-in sensor */
MPU6050.prototype.getTemperature = function() {
  return this.readS16(R.TEMP_OUT_H) / 340 + 36.53;
};

exports.connect = function (_i2c,_addr) {
  return new MPU6050(_i2c,_addr);
};
