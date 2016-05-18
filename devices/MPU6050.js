
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

  PWR1_CLKSEL_BIT     : 2,
  PWR1_CLKSEL_LENGTH  : 3,
  PWR1_SLEEP_BIT      : 6,

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

  GCONFIG_FS_SEL_BIT  : 4,
  GCONFIG_FS_SEL_LENGTH : 2,

  ACONFIG_AFS_SEL_BIT : 4,
  ACONFIG_AFS_SEL_LENGTH  : 2,

  ACCEL_FS_2          : 0x00,
  ACCEL_FS_4          : 0x01,
  ACCEL_FS_8          : 0x02,
  ACCEL_FS_16         : 0x03,

  PWR1_DEVICE_RESET_BIT : 7,
  DMP_MEMORY_CHUNK_SIZE : 16,

  TC_PWR_MODE_BIT   : 7,
  TC_OFFSET_BIT     : 6,
  TC_OFFSET_LENGTH  : 6,
  TC_OTP_BNK_VLD_BIT  : 0,

  USERCTRL_I2C_MST_EN_BIT : 5,
  USERCTRL_I2C_MST_RESET_BIT : 1
};

/* Register addresses*/
var R = {
  XG_OFFS_TC          : 0x00, //[7] PWR_MODE, [6:1] XG_OFFS_TC, [0] OTP_BNK_VLD
  YG_OFFS_TC          : 0x01, //[7] PWR_MODE, [6:1] YG_OFFS_TC, [0] OTP_BNK_VLD
  ZG_OFFS_TC          : 0x02, //[7] PWR_MODE, [6:1] ZG_OFFS_TC, [0] OTP_BNK_VLD
  SMPLRT_DIV          : 0x19,
  CONFIG              : 0x1A,
  GYRO_CONFIG         : 0x1B,
  ACCEL_CONFIG        : 0x1C,
  MOT_THR             : 0x1F,
  MOT_DUR             : 0x20,
  ZRMOT_THR           : 0x21,
  ZRMOT_DUR           : 0x22,
  FIFO_EN             : 0x23,
  I2C_MST_CTRL        : 0x24,
  I2C_SLV0_ADDR       : 0x25,
  I2C_SLV0_REG        : 0x26,
  I2C_SLV0_CTRL       : 0x27,
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
  I2C_SLV0_DO         : 0x63,
  I2C_MST_DELAY_CTRL  : 0x67,
  SIGNAL_PATH_RESET   : 0x68,
  USER_CTRL           : 0x6A,
  PWR_MGMT_1          : 0x6B,
  PWR_MGMT_2          : 0x6C,
  BANK_SEL            : 0x6D,
  MEM_START_ADDR      : 0x6E,
  MEM_R_W             : 0x6F,
  WHO_AM_I            : 0x75
};

exports.connect = function (_i2c,_addr) {
  return new MPU6050(_i2c,_addr);
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


/* Initialize the chip */
MPU6050.prototype.initialize = function() {
  this.setClockSource(C.CLOCK_PLL_XGYRO);
  this.setFullScaleAccelRange(C.ACCEL_FS_2);
  this.setFullScaleGyroRange(C.GYRO_FS_250);
  this.setSleepEnabled(false);
};

MPU6050.prototype.reset = function() {
  this.writeBit(R.PWR_MGMT_1, C.PWR1_DEVICE_RESET_BIT, true);
}

MPU6050.prototype.readBytes = function(reg, length) {
  this.i2c.writeTo(this.addr, reg);
  return this.i2c.readFrom(this.addr, length);
}

MPU6050.prototype.writeBytes = function(reg, data) {
  this.i2c.writeTo(this.addr, [reg].concat(data));
}

/** Read a single bit from an 8-bit device register.
 * @param reg Register to read from
 * @param bit Bit position to read (0-7)
 * @return The bit value read.
 */
MPU6050.prototype.readBit = function(reg, bit) {
    var b = this.readBytes(reg, 1)[0];
    b &= (1 << bit);
    return b;
}

/* Set a single bit in a register */
MPU6050.prototype.writeBit = function(reg, bit, val) {
  var b = this.readBytes(reg, 1)[0];
  b = (val != 0) ? (b | (1 << bit)) : (b & ~(1 << bit));
  this.writeBytes(reg, b);
};

/** Read multiple bits from an 8-bit device register.
 * @param reg Register to read from
 * @param bitStart First bit position to read (0-7)
 * @param length Number of bits to read (not more than 8)
 * @return The right-aligned value (i.e. '101' read from any bitStart position will equal 0x05)
 */
MPU6050.prototype.readBits = function(reg, bitStart, length) {
  var b = this.readBytes(reg, 1)[0];
  // 01101001 read byte
  // 76543210 bit numbers
  //    xxx   args: bitStart=4, length=3
  //    010   masked
  //   -> 010 shifted
  var mask = ((1 << length) - 1) << (bitStart - length + 1);
  b &= mask;
  b >>= (bitStart - length + 1);
  return b;
}

/* Set more bits in a register */
MPU6050.prototype.writeBits = function(reg, bitStart, length, val) {
  var b = this.readBytes(reg, 1)[0];

  //      010 value to write
  // 76543210 bit numbers
  //    xxx   args: bitStart=4, length=3
  // 00011100 mask byte
  // 10101111 original value (sample)
  // 10100011 original & ~mask
  // 10101011 masked | value
  var mask = ((1 << length) - 1) << (bitStart - length + 1);
  val <<= (bitStart - length + 1); // shift data into correct position
  val &= mask; // zero all non-important bits in data
  b &= ~(mask); // zero all important bits in existing byte
  b |= val; // combine data with existing byte

  this.writeBytes(reg, b);
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
  this.writeBits(R.PWR_MGMT_1, C.PWR1_CLKSEL_BIT, C.PWR1_CLKSEL_LENGTH, clock);
};

/* Set full scale for accelerometer*/
MPU6050.prototype.setFullScaleAccelRange = function(fs) {
  this.writeBits(R.ACCEL_CONFIG, C.ACONFIG_AFS_SEL_BIT, C.ACONFIG_AFS_SEL_LENGTH, fs);
  this.acc_lsb_sens = Math.pow(2, 14-fs); // Set LSB sensitivity
};

/* Set full scale for gyro */
MPU6050.prototype.setFullScaleGyroRange = function(fs) {
  this.writeBits(R.GYRO_CONFIG, C.GCONFIG_FS_SEL_BIT, C.GCONFIG_FS_SEL_LENGTH, fs);
  this.gyro_lsb_sens = 131 / Math.pow(2, fs); // Set LSB sensitivity
};

MPU6050.prototype.setSleepEnabled = function(enable) {
  this.writeBit(R.PWR_MGMT_1, C.PWR1_SLEEP_BIT, enable);
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


MPU6050.prototype.setMemoryBank = function(bank, prefetchEnabled=false, userBank=false) {
  bank &= 0x1F;
  if(userBank) bank |= 0x20;
  if(prefetchEnabled) bank |= 0x40;
  this.writeBytes(R.BANK_SEL, bank);
}

MPU6050.prototype.setMemoryStartAddress = function(address) {
  this.writeBytes(R.MEM_START_ADDR, address);
}

MPU6050.prototype.writeMemoryBlock = function(data, bank, address) {
  this.setMemoryBank(bank);
  this.setMemoryStartAddress(address);

  var chunkSize = C.DMP_MEMORY_CHUNK_SIZE;
  var dataSize = data.length;

  for(var i = 0; i < dataSize;) {
    // determine correct chunk size according to bank position and data size
    chunkSize = C.DMP_MEMORY_CHUNK_SIZE;
    // make sure we don't go past the data size
    if (i + chunkSize > dataSize) chunkSize = dataSize - i;
    // make sure this chunk doesn't go past the bank boundary (256 bytes)
    if (chunkSize > 256 - address) chunkSize = 256 - address;

    // write the chunk of data as specified
    var dataToBeWritten = data.slice(i, i + chunkSize);
    this.writeBytes(R.MEM_R_W, dataToBeWritten);

    // VERIFY
    this.setMemoryBank(bank);
    this.setMemoryStartAddress(address);
    var dataWritten = this.readBytes(R.MEM_R_W, chunkSize);
    if(dataWritten.toString() != dataToBeWritten.toString()) {
      console.log("WriteMemoryBlock FAILED for bank: " + bank + " / address: " + address + " / chunkSize: " + chunkSize + " / dataSize: " + dataSize + " / i: " + i);
      console.log("Data TO BE written: " + dataToBeWritten);
      console.log("Data READ BACK: " + dataWritten);
      return false;
    }

    i += chunkSize;

    address += chunkSize;
    address = address % 256;

    // if we aren't done, update bank (if necessary) and address
    if (i < dataSize) {
      if (address == 0) bank++; // this means we've done 256 bytes, time to go to next bank

      this.setMemoryBank(bank);
      this.setMemoryStartAddress(address);
    }
  }

  return true;
}

MPU6050.prototype.readMemoryBlock = function(dataSize, bank, address) {
    this.setMemoryBank(bank);
    this.setMemoryStartAddress(address);

    var chunkSize = C.DMP_MEMORY_CHUNK_SIZE;
    var result = new Uint8Array(dataSize);

    for (i = 0; i < dataSize;) {
      // determine correct chunk size according to bank position and data size
      chunkSize = C.DMP_MEMORY_CHUNK_SIZE;
      // make sure we don't go past the data size
      if (i + chunkSize > dataSize) chunkSize = dataSize - i;
      // make sure this chunk doesn't go past the bank boundary (256 bytes)
      if (chunkSize > 256 - address) chunkSize = 256 - address;

      // read the chunk of data as specified
      result.set(this.readBytes(R.MEM_R_W, chunkSize), i);

      // increase byte index by [chunkSize]
      i += chunkSize;

      address += chunkSize;
      address = address % 256;

      // if we aren't done, update bank (if necessary) and address
      if (i < dataSize) {
        if (address == 0) bank++; // this means we've done 256 bytes, time to go to next bank

        this.setMemoryBank(bank);
        this.setMemoryStartAddress(address);
      }
    }
}


//Set the I2C address of the specified slave (0-3).
MPU6050.prototype.setSlaveAddress = function(num, address) {
    if (num > 3) return;
    this.writeBytes(R.I2C_SLV0_ADDR + num * 3, address);
}

MPU6050.prototype.setI2CMasterModeEnabled = function(enabled) {
    this.writeBit(R.USER_CTRL, C.USERCTRL_I2C_MST_EN_BIT, enabled);
}

/**
 * This bit resets the I2C Master when set to 1 while I2C_MST_EN equals 0.
 * This bit automatically clears to 0 after the reset has been triggered.
 */
MPU6050.prototype.resetI2CMaster = function() {
    this.writeBit(R.USER_CTRL, C.USERCTRL_I2C_MST_RESET_BIT, true);
}


// XG_OFFS_TC register

MPU6050.prototype.getOTPBankValid = function() {
  return this.readBit(R.XG_OFFS_TC, C.TC_OTP_BNK_VLD_BIT);
}

MPU6050.prototype.setOTPBankValid = function(enabled) {
  this.writeBit(R.XG_OFFS_TC, C.TC_OTP_BNK_VLD_BIT, enabled);
}

MPU6050.prototype.getXGyroOffsetTC = function() {
    return this.readBits(R.XG_OFFS_TC, C.TC_OFFSET_BIT, C.TC_OFFSET_LENGTH);
}
MPU6050.prototype.setXGyroOffsetTC = function(offset) {
    this.writeBits(R.XG_OFFS_TC, C.TC_OFFSET_BIT, C.TC_OFFSET_LENGTH, offset);
}

// YG_OFFS_TC register

MPU6050.prototype.getYGyroOffsetTC = function() {
    return this.readBits(R.YG_OFFS_TC, C.TC_OFFSET_BIT, C.TC_OFFSET_LENGTH);
}
MPU6050.prototype.setYGyroOffsetTC = function(offset) {
    this.writeBits(R.YG_OFFS_TC, C.TC_OFFSET_BIT, C.TC_OFFSET_LENGTH, offset);
}

// ZG_OFFS_TC register

MPU6050.prototype.getZGyroOffsetTC = function() {
    return this.readBits(R.ZG_OFFS_TC, C.TC_OFFSET_BIT, C.TC_OFFSET_LENGTH);
}
MPU6050.prototype.setZGyroOffsetTC = function(offset) {
    this.writeBits(R.ZG_OFFS_TC, C.TC_OFFSET_BIT, C.TC_OFFSET_LENGTH, offset);
}
