/* Copyright (C) 2016 ST Microelectronics. See the file LICENSE for copying permission. */
/*
 * Espruino module for HTS221 temperature sensor (present on ST X-NUCLEO-IKS01A1 expansion board)
 *
 * HTS221 datasheet is available on ST web site : 
 *     http://www.st.com/content/st_com/en/products/mems-and-sensors/humidity-sensors/hts221.html
 *
 *
 * HW connection : 
 * ---------------
 *   - you can use ArduinoPico adaptor
 *   - else, you can use some wires :
 *        Sensor Shield  <==>  Espruino Pico
 *          D15 (SCL)             B6
 *          D14 (SDA)             B7
 *          GND                   GND
 *          +5V                   VBAT
 *          +3V3                  3.3
 *
 * Example to use this module :
 * ----------------------------
 *   I2C1.setup({scl:B6,sda:B7}); // on EspruinoPico board
 *   I2C1.setup({scl:B8,sda:B9}); // on Nucleo boards
 *   var temp = require("HTS221").connect(I2C1, 0);
 *   temp.ObtainCalibratedTemperatureCoefficient();
 *   temp.getTemperature(print);
 *
 */

var C = {
  // default slave address, see datasheet
  HTS221_I2C_SLAVE_ADDRESS : 95,          

  // control register addresses
  CTRL_WHO_AM_I_ADDRESS : 0xF,
  CTRL_AV_CONF : 0x10,
  CTRL_REG1_ADDRESS : 0x20,

  // bits for Control register, register 1
  // Power down control
  PD_ACTIVE_MODE : 0x80,
  PD_POWER_DOWN_MODE : 0x0,

  // Block data update
  BDU_CONTINUOUS_UPDATE : 0x0,
  BDU_NOT_CONTINUOUS_UPDATE : 0x4,

  // Output data rate
  ODR_ONE_SHOT : 0x0,
  ODR_ONE_HZ : 0x1,
  ODR_SEVEN_HZ : 0x2,
  ODR_TWELVE_DOT_FIVE_HZ : 0x3,

  // bits for Control register, average conf
  AVGT_DEFAULT : 0x1B,

  // data register
  DATA_TEMP_OUT_L : 0x2A,
  DATA_TEMP_OUT_H : 0x2B

};

var T0_degC, T1_degC, T0_OUT, T1_OUT, T_OUT;

exports.connect = function (_i2c, debugMode) {
  return new HTS221(_i2c, debugMode);
};

/**
 * Create a new HTS221 sensor instance
 * 
 *   Set the driver mode, block data rate, output data rate
 *   Set the average configuration (default)
 */
function HTS221(_i2c, debugMode) {
  this.i2c = _i2c;
  this.debugMode = debugMode; // 0 or 1
  
  this.w(C.CTRL_REG1_ADDRESS, (C.PD_ACTIVE_MODE | C.BDU_NOT_CONTINUOUS_UPDATE | C.ODR_ONE_HZ));
  this.w(C.CTRL_AV_CONF, C.AVGT_DEFAULT);

}


HTS221.prototype.ObtainCalibratedTemperatureCoefficient= function(callback) {

  //  this.T0_OUT,  this.T1_OUT, this.T1_degC and  this.T0_degC coefficients are factory calibrated

  // 1. Read the value of coefficients T0_degC_x8 and T1_degC_x8 from registers
  var coefficients = this.r(0x32,2);
        
  var T0_degC_x8_32 = (coefficients[0] & 0xFF);
  var T1_degC_x8_33 = (coefficients[1] & 0xFF);

  // 2. Read the MSB bits of this.T1_degC (T1.9 and T1.8 bit) and  this.T0_degC (T0.9 and T0.8 bit) from register 0x35
  // to compute  this.T0_degC and this.T1_degC
  var T1_T0_msb = this.r(0x35, 1);
  var T1_T0_msb_x8_35 = T1_T0_msb[0] & 0x0F;
  var T0_degC_x8_10bits = (T1_T0_msb_x8_35 & 0x03)*256 + T0_degC_x8_32;
  var T1_degC_x8_10bits = (T1_T0_msb_x8_35 & 0x0C)*64 + T1_degC_x8_33;

  // 3. Divide by 8
  // in order to obtain the value of coefficients  this.T0_degC and  this.T1_degC
  this.T0_degC = T0_degC_x8_10bits/8;
  this.T1_degC = T1_degC_x8_10bits/8;

  // 4. Read the value of  this.T0_OUT from registers 0x3C & 0x3D
  // and
  // 5. Read the value of  this.T1_OUT from registers 0x3E & 0x3F.
  var T0_OUT1 = this.r(0x3C, 1);
  var T0_OUT_3C = T0_OUT1[0] & 0xFF;
        
  var T0_OUT2 = this.r(0x3D, 1);
  var T0_OUT_3D = T0_OUT2[0] & 0xFF;

  var T1_OUT1 = this.r(0x3E, 1);
  var T1_OUT_3E = T1_OUT1[0] & 0xFF;

  var T1_OUT2 = this.r(0x3F, 1);
  var T1_OUT_3F = T1_OUT2[0] & 0xFF;

   this.T0_OUT = (T0_OUT_3D*256) + T0_OUT_3C;

  // manage the negative value (two's complement integers)
  if (this.T0_OUT > 32767) //0x7FFF
  {
      this.T0_OUT -=65536;
      console.log("this.T0_OUT is negative");
  }

   this.T1_OUT = (T1_OUT_3F*256) + T1_OUT_3E;

  // manage the negative value (two's complement integers)
  if (this.T1_OUT > 32767) //0x7FFF
  {
      this.T1_OUT -=65536;
      console.log("this.T1_OUT is negative");
  }

  if(this.debugMode) {
    console.log(" HTS221 debug : T0_degC_x8_32 = "+T0_degC_x8_32);
    console.log(" HTS221 debug : T1_degC_x8_33 = "+T1_degC_x8_33);
    console.log(" HTS221 debug :  this.T0_degC = "+this.T0_degC);
    console.log(" HTS221 debug :  this.T1_degC = "+this.T1_degC);
    console.log(" HTS221 debug :  this.T0_OUT = "+this.T0_OUT);
    console.log(" HTS221 debug :  this.T1_OUT = "+this.T1_OUT);
  }

}


HTS221.prototype.getTemperature= function(callback) {
  // Read Ouput registers (H_OUT) 
  // temp msb, temp lsb  
        
  var outputL = this.r(C.DATA_TEMP_OUT_L, 1);
  var T_OUT_2A = outputL[0] & 0xFF;

  var outputH = this.r(C.DATA_TEMP_OUT_H, 1);
  var T_OUT_2B = outputH[0] & 0xFF;



   this.T_OUT = (T_OUT_2B * 256) + T_OUT_2A;

  if (this.T_OUT > 32767) //0x7FFF
  {
     this.T_OUT -=65536;
  }

  var celsiusTemp = ( (this.T1_degC - this.T0_degC) * (this.T_OUT -  this.T0_OUT) / (this.T1_OUT -  this.T0_OUT) ) + this.T0_degC;

  if(this.debugMode) {
    console.log(" HTS221 debug : DATA_TEMP_OUT_L="+outputL);
    console.log(" HTS221 debug : DATA_TEMP_OUT_H="+outputH);
    console.log(" HTS221 debug : temperature in Celsius is "+celsiusTemp);
  }

  callback(celsiusTemp);
}


/***************
 * Helpers
 ***************/
/* read register */
HTS221.prototype.r = function(addr, cnt) {
  if(this.debugMode) console.log(" HTS221 debug : read "+cnt+" bytes at address "+addr);

  this.i2c.writeTo({address:C.HTS221_I2C_SLAVE_ADDRESS, stop:false}, 0x80 | addr);
  return this.i2c.readFrom(C.HTS221_I2C_SLAVE_ADDRESS, cnt);
};

/* write register */
HTS221.prototype.w = function(addr, data) {
  if(this.debugMode) console.log(" HTS221 debug : write "+data+" at address "+addr);
  this.i2c.writeTo(C.HTS221_I2C_SLAVE_ADDRESS, addr, data);
};
