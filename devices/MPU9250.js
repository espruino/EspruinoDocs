/* Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
// Based heavily on https://github.com/sparkfun/SparkFun_MPU-9250_Breakout_Arduino_Library
/*

NOTE: Accelerometer/Gyro readings seem wrong

mpu.r(0x3B,6) => new Uint8Array([128, 0, 128, 0, 254, 86])
X and Y axes both always report 128,0 as if not enabled, but Z seems to work
*/
var C = {
  WHO_AM_I_MPU9250 : 0x75,
  PWR_MGMT_1 : 0x6B,
  PWR_MGMT_2 : 0x6C,
  INT_PIN_CFG : 0x37,
  INT_ENABLE : 0x38,
  FIFO_EN : 0x23,
  I2C_MST_CTRL : 0x24,
  USER_CTRL : 0x6A,
  SMPLRT_DIV : 0x19,
  CONFIG : 0x1A,
  GYRO_CONFIG : 0x1B,
  ACCEL_CONFIG : 0x1C,
  ACCEL_CONFIG2 : 0x1D,
  FIFO_COUNTH : 0x72,
  FIFO_R_W : 0x74,
  XG_OFFSET_H : 0x13,
  XG_OFFSET_L : 0x14,
  YG_OFFSET_H : 0x15,
  YG_OFFSET_L : 0x16,
  ZG_OFFSET_H : 0x17,
  ZG_OFFSET_L : 0x18,
  XA_OFFSET_H : 0x77,
  XA_OFFSET_L : 0x78,
  YA_OFFSET_H : 0x7A,
  YA_OFFSET_L : 0x7B,
  ZA_OFFSET_H : 0x7D,
  ZA_OFFSET_L : 0x7E,
  INT_STATUS : 0x3A,
  ACCEL_XOUT_H : 0x3B,
  TEMP_OUT_H : 0x41,
  GYRO_XOUT_H : 0x43,
  // magnetometer registers
  MAG_ST1 : 0x02, // data ready in bit 0
  MAG_XOUT_L : 0x03,
  MAG_CNTL1 : 0x0A
};

function MPU9250(r,w,rmag,wmag,options) {
  this.r = r; // read from a register on main MPU
  this.w = w; // write to a register on main MPU
  this.rmag = rmag; // read from a register on magnetometer
  this.wmag = wmag; // write to a register on magnetometer

  this.Ascale = 0; //AFS_2G
  this.Gscale = 0; //GFS_250DPS
  this.gyrosensitivity  = 131;   // = 131 LSB/degrees/sec
  this.accelsensitivity = 16384; // = 16384 LSB/g
  this.samplerate = 200; // Hz - default
}

MPU9250.prototype.calibrateMPU9250 = function() {
  /*var mpu = this;
  var gyro_bias = [0,0,0];
  var accel_bias = [0,0,0];
  return (new Promise(function(resolve) {
    // Write a one to bit 7 reset bit; toggle reset device
    mpu.w(C.PWR_MGMT_1, 0x80);
    setTimeout(resolve,100);
  })).then(function() {
    // get stable time source; Auto select clock source to be PLL gyroscope
    // reference if ready else use the internal oscillator, bits 2:0 = 001
    mpu.w(C.PWR_MGMT_1, 0x01);
    mpu.w(C.PWR_MGMT_2, 0x00);
    return new Promise(function(resolve) {setTimeout(resolve,200);});
  }).then(function() {
    // Configure device for bias calculation
    // Disable all interrupts
    mpu.w(C.INT_ENABLE, 0x00);
    // Disable FIFO
    mpu.w(C.FIFO_EN, 0x00);
    // Turn on internal clock source
    mpu.w(C.PWR_MGMT_1, 0x00);
    // Disable I2C master
    mpu.w(C.I2C_MST_CTRL, 0x00);
    // Disable FIFO and I2C master modes
    mpu.w(C.USER_CTRL, 0x00);
    // Reset FIFO and DMP
    mpu.w(C.USER_CTRL, 0x0C);
    return new Promise(function(resolve) {setTimeout(resolve,15);});
  }).then(function() {
    // Configure MPU6050 gyro and accelerometer for bias calculation
    // Set low-pass filter to 188 Hz
    mpu.w(C.CONFIG, 0x01);
    // Set sample rate to 1 kHz
    mpu.w(C.SMPLRT_DIV, 0x00);
    // Set gyro full-scale to 250 degrees per second, maximum sensitivity
    mpu.w(C.GYRO_CONFIG, 0x00);
    // Set accelerometer full-scale to 2 g, maximum sensitivity
    mpu.w(C.ACCEL_CONFIG, 0x00);

    mpu.gyrosensitivity  = 131;   // = 131 LSB/degrees/sec
    mpu.accelsensitivity = 16384; // = 16384 LSB/g

    // Configure FIFO to capture accelerometer and gyro data for bias calculation
    mpu.w(C.USER_CTRL, 0x40);  // Enable FIFO
    // Enable gyro and accelerometer sensors for FIFO  (max size 512 bytes in
    // MPU-9150)
    mpu.w(C.FIFO_EN, 0x78);
    // accumulate 40 samples in 40 milliseconds = 480 bytes
    return new Promise(function(resolve) {setTimeout(resolve,40);});
  }).then(function() {
    // At end of sample accumulation, turn off FIFO sensor read
    // Disable gyro and accelerometer sensors for FIFO
    mpu.w(C.FIFO_EN, 0x00);
    // Read FIFO sample count
    var data = mpu.r(C.FIFO_COUNTH, 2);
    var fifo_count = (data[0] << 8) | data[1];
    // How many sets of full gyro and accelerometer data for averaging
    var packet_count = fifo_count/12;

    for (var ii = 0; ii < packet_count; ii++)
    {
      var accel_temp = [0, 0, 0], gyro_temp = [0, 0, 0];
      // Read data for averaging
      data = mpu.r(C.FIFO_R_W, 12);
      // Form signed 16-bit integer for each sample in FIFO
      accel_temp[0] =  ((data[0] << 8) | data[1]  );
      accel_temp[1] =  ((data[2] << 8) | data[3]  );
      accel_temp[2] =  ((data[4] << 8) | data[5]  );
      gyro_temp[0]  =  ((data[6] << 8) | data[7]  );
      gyro_temp[1]  =  ((data[8] << 8) | data[9]  );
      gyro_temp[2]  =  ((data[10] << 8) | data[11]);

      // Sum individual signed 16-bit biases to get accumulated signed 32-bit
      // biases.
      accel_bias[0] +=  accel_temp[0];
      accel_bias[1] +=  accel_temp[1];
      accel_bias[2] +=  accel_temp[2];
      gyro_bias[0]  +=  gyro_temp[0];
      gyro_bias[1]  +=  gyro_temp[1];
      gyro_bias[2]  +=  gyro_temp[2];
    }
    // Sum individual signed 16-bit biases to get accumulated signed 32-bit biases
    accel_bias[0] /=  packet_count;
    accel_bias[1] /=  packet_count;
    accel_bias[2] /=  packet_count;
    gyro_bias[0]  /=  packet_count;
    gyro_bias[1]  /=  packet_count;
    gyro_bias[2]  /=  packet_count;

    // Sum individual signed 16-bit biases to get accumulated signed 32-bit biases
    if (accel_bias[2] > 0){
      accel_bias[2] -= mpu.accelsensitivity;
    } else {
      accel_bias[2] += mpu.accelsensitivity;
    }

    // Construct the gyro biases for push to the hardware gyro bias registers,
    // which are reset to zero upon device startup.
    // Divide by 4 to get 32.9 LSB per deg/s to conform to expected bias input
    // format.
    data[0] = (-gyro_bias[0]/4  >> 8) & 0xFF;
    // Biases are additive, so change sign on calculated average gyro biases
    data[1] = (-gyro_bias[0]/4)       & 0xFF;
    data[2] = (-gyro_bias[1]/4  >> 8) & 0xFF;
    data[3] = (-gyro_bias[1]/4)       & 0xFF;
    data[4] = (-gyro_bias[2]/4  >> 8) & 0xFF;
    data[5] = (-gyro_bias[2]/4)       & 0xFF;

    // Push gyro biases to hardware registers
    mpu.w(C.XG_OFFSET_H, data[0]);
    mpu.w(C.XG_OFFSET_L, data[1]);
    mpu.w(C.YG_OFFSET_H, data[2]);
    mpu.w(C.YG_OFFSET_L, data[3]);
    mpu.w(C.ZG_OFFSET_H, data[4]);
    mpu.w(C.ZG_OFFSET_L, data[5]);

    // Construct the accelerometer biases for push to the hardware accelerometer
    // bias registers. These registers contain factory trim values which must be
    // added to the calculated accelerometer biases; on boot up these registers
    // will hold non-zero values. In addition, bit 0 of the lower byte must be
    // preserved since it is used for temperature compensation calculations.
    // Accelerometer bias registers expect bias input as 2048 LSB per g, so that
    // the accelerometer biases calculated above must be divided by 8.

    // A place to hold the factory accelerometer trim biases
    var accel_bias_reg = [0, 0, 0];
    // Read factory accelerometer trim values
    data = mpu.r(C.XA_OFFSET_H, 2);
    accel_bias_reg[0] =  ((data[0] << 8) | data[1]);
    data = mpu.r(C.YA_OFFSET_H, 2);
    accel_bias_reg[1] =  ((data[0] << 8) | data[1]);
    data = mpu.r(C.ZA_OFFSET_H, 2);
    accel_bias_reg[2] =  ((data[0] << 8) | data[1]);

    // Define mask for temperature compensation bit 0 of lower byte of
    // accelerometer bias registers
    var mask = 1;
    // Define array to hold mask bit for each accelerometer bias axis
    var mask_bit = [0, 0, 0];

    for (var ii = 0; ii < 3; ii++)
    {
      // If temperature compensation bit is set, record that fact in mask_bit
      if ((accel_bias_reg[ii] & mask))
      {
        mask_bit[ii] = 0x01;
      }
    }

    // Construct total accelerometer bias, including calculated average
    // accelerometer bias from above
    // Subtract calculated averaged accelerometer bias scaled to 2048 LSB/g
    // (16 g full scale)
    accel_bias_reg[0] -= (accel_bias[0]/8);
    accel_bias_reg[1] -= (accel_bias[1]/8);
    accel_bias_reg[2] -= (accel_bias[2]/8);

    data = [];
    data[0] = (accel_bias_reg[0] >> 8) & 0xFF;
    data[1] = (accel_bias_reg[0])      & 0xFF;
    // preserve temperature compensation bit when writing back to accelerometer
    // bias registers
    data[1] = data[1] | mask_bit[0];
    data[2] = (accel_bias_reg[1] >> 8) & 0xFF;
    data[3] = (accel_bias_reg[1])      & 0xFF;
    // Preserve temperature compensation bit when writing back to accelerometer
    // bias registers
    data[3] = data[3] | mask_bit[1];
    data[4] = (accel_bias_reg[2] >> 8) & 0xFF;
    data[5] = (accel_bias_reg[2])      & 0xFF;
    // Preserve temperature compensation bit when writing back to accelerometer
    // bias registers
    data[5] = data[5] | mask_bit[2];

    // Apparently this is not working for the acceleration biases in the MPU-9250
    // Are we handling the temperature correction bit properly?
    // Push accelerometer biases to hardware registers
    mpu.w(C.XA_OFFSET_H, data[0]);
    mpu.w(C.XA_OFFSET_L, data[1]);
    mpu.w(C.YA_OFFSET_H, data[2]);
    mpu.w(C.YA_OFFSET_L, data[3]);
    mpu.w(C.ZA_OFFSET_H, data[4]);
    mpu.w(C.ZA_OFFSET_L, data[5]);

    return {
      // Output scaled gyro biases for display in the main program
      gyroBias : [gyro_bias[0]/mpu.gyrosensitivity,
                  gyro_bias[1]/mpu.gyrosensitivity,
                  gyro_bias[2]/mpu.gyrosensitivity],
      // Output scaled accelerometer biases for display in the main program
      accelBias : [ accel_bias[0]/mpu.accelsensitivity,
                    accel_bias[1]/mpu.accelsensitivity,
                    accel_bias[2]/mpu.accelsensitivity ]
    }
  });*/
  return new Promise(function(resolve) {
    resolve("calibrateMPU9250 not working at the moment");
  });
};

MPU9250.prototype.initMPU9250 = function() {
  if (this.r(C.WHO_AM_I_MPU9250, 1)[0] != 0x71)
    throw "MPU9250 WHO_AM_I check failed";
  var mpu = this;
  return (new Promise(function(resolve) {
      // wake up device
    // Clear sleep mode bit (6), enable all sensors
    mpu.w(C.PWR_MGMT_1, 0x00);
    setTimeout(resolve,100); // Wait for all registers to reset
  })).then(function() {
    // Get stable time source
    // Auto select clock source to be PLL gyroscope reference if ready else
    mpu.w(C.PWR_MGMT_1, 0x01);
    return new Promise(function(resolve) {setTimeout(resolve,200)});
  }).then(function() {
    // Configure Gyro and Thermometer
    // Disable FSYNC and set thermometer and gyro bandwidth to 41 and 42 Hz,
    // respectively;
    // minimum delay time for this setting is 5.9 ms, which means sensor fusion
    // update rates cannot be higher than 1 / 0.0059 = 170 Hz
    // DLPF_CFG = bits 2:0 = 011; this limits the sample rate to 1000 Hz for both
    // With the MPU9250, it is possible to get gyro sample rates of 32 kHz (!),
    // 8 kHz, or 1 kHz
    mpu.w(C.CONFIG, 0x03);

    // Set sample rate = gyroscope output rate/(1 + SMPLRT_DIV)
    mpu.w(C.SMPLRT_DIV, Math.clip(Math.round(1000/mpu.samplerate)-1,0,255));

    // Set gyroscope full scale range
    // Range selects FS_SEL and AFS_SEL are 0 - 3, so 2-bit values are
    // left-shifted into positions 4:3

    // get current GYRO_CONFIG register value
    var c = mpu.r(C.GYRO_CONFIG,1)[0];
    // c = c & ~0xE0; // Clear self-test bits [7:5]
    c = c & ~0x02; // Clear Fchoice bits [1:0]
    c = c & ~0x18; // Clear AFS bits [4:3]
    c = c | mpu.Gscale << 3; // Set full scale range for the gyro
    // Set Fchoice for the gyro to 11 by writing its inverse to bits 1:0 of
    // GYRO_CONFIG
    // c =| 0x00;
    // Write new GYRO_CONFIG value to register
    mpu.w(C.GYRO_CONFIG, c );

    // Set accelerometer full-scale range configuration
    // Get current ACCEL_CONFIG register value
    c = mpu.r(C.ACCEL_CONFIG,1)[0];
    // c = c & ~0xE0; // Clear self-test bits [7:5]
    c = c & ~0x18;  // Clear AFS bits [4:3]
    c = c | mpu.Ascale << 3; // Set full scale range for the accelerometer
    // Write new ACCEL_CONFIG register value
    mpu.w(C.ACCEL_CONFIG, c);

    // Set accelerometer sample rate configuration
    // It is possible to get a 4 kHz sample rate from the accelerometer by
    // choosing 1 for accel_fchoice_b bit [3]; in this case the bandwidth is
    // 1.13 kHz
    // Get current ACCEL_CONFIG2 register value
    c = mpu.r(C.ACCEL_CONFIG2,1)[0];
    c = c & ~0x0F; // Clear accel_fchoice_b (bit 3) and A_DLPFG (bits [2:0])
    c = c | 0x03;  // Set accelerometer rate to 1 kHz and bandwidth to 41 Hz
    // Write new ACCEL_CONFIG2 register value
    mpu.w(C.ACCEL_CONFIG2, c);
    // The accelerometer, gyro, and thermometer are set to 1 kHz sample rates,
    // but all these rates are further reduced by a factor of 5 to 200 Hz because
    // of the SMPLRT_DIV setting

    // Configure Interrupts and Bypass Enable
    // Set interrupt pin active high, push-pull, hold interrupt pin level HIGH
    // until interrupt cleared, clear on read of INT_STATUS, and enable
    // I2C_BYPASS_EN so additional chips can join the I2C bus and all can be
    // controlled by the Arduino as master.
    mpu.w(C.INT_PIN_CFG, 0x22);
    // Enable data ready (bit 0) interrupt
    mpu.w(C.INT_ENABLE, 0x01);

    // Enable Magnetometer

    mpu.wmag(C.MAG_CNTL1, 0b10010); // 16 bit, 8 Hz


    return new Promise(function(resolve) {setTimeout(resolve,100)});
  });
};

MPU9250.prototype.dataReady = function() {
  return this.r(C.INT_STATUS,1) & 0x01;
};

// return {x,y,z} for the accelerometer - in G
MPU9250.prototype.readAccel = function() {
  var d = new DataView(new Uint8Array(this.r(C.ACCEL_XOUT_H, 6)).buffer);
  return { // big endian
    x: d.getInt16(0,0)/this.accelsensitivity,
    y: d.getInt16(2,0)/this.accelsensitivity,
    z: d.getInt16(4,0)/this.accelsensitivity
  };
};

// return {x,y,z} for the gyro in degrees/second
MPU9250.prototype.readGyro = function() {
  var d = new DataView(new Uint8Array(this.r(C.GYRO_XOUT_H, 6)).buffer);
  return { // big endian
    x: d.getInt16(0,0)/this.gyrosensitivity,
    y: d.getInt16(2,0)/this.gyrosensitivity,
    z: d.getInt16(4,0)/this.gyrosensitivity
  };
};

// return {x,y,z} for the magnetometer in millGaus
MPU9250.prototype.readMag = function() {
  var d = new DataView(new Uint8Array(this.rmag(C.MAG_XOUT_L, 7)).buffer);
  // reading 7th byte lets us get more data next time
  var s = 49120/32760;
  return { // little endian
    x: d.getInt16(0,1)*s,
    y: d.getInt16(2,1)*s,
    z: d.getInt16(4,1)*s
  };
};

// return {x,y,z} for all 3 sensors - { accel, gyro, mag }
MPU9250.prototype.read = function() {
  return {
    accel: this.readAccel(),
    gyro: this.readGyro(),
    mag: this.readMag(),
    new: this.dataReady() // reading INT_STATUS resets the dataready IRQ line
  };
};

// Initialise the MPU9250 module with the given I2C interface
exports.connectI2C = function(i2c,options) {
  var ampu = 0x68;
  var amag = 0x0C;
  return new MPU9250(function(reg,len) { // read mpu
    i2c.writeTo(ampu,reg);
    return i2c.readFrom(ampu,len);
  }, function(reg,data) { // write mpu
    i2c.writeTo(ampu,reg,data);
  },function(reg,len) { // read mag
    i2c.writeTo(amag,reg);
    return i2c.readFrom(amag,len);
  }, function(reg,data) { // write mag
    i2c.writeTo(amag,reg,data);
  },options);
};
