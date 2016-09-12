/* Copyright (C) 2016 ST Microelectronics. See the file LICENSE for copying permission. */
/*
 * Espruino module for LPS25HB pressure sensor (present on ST X-NUCLEO-IKS01A1 expansion board)
 *
 * LPS25HB datasheet is available on ST web site : 
 *     http://www.st.com/content/ccc/resource/technical/document/datasheet/9a/4c/aa/72/1f/45/4e/24/DM00141379.pdf/files/DM00141379.pdf/jcr:content/translations/en.DM00141379.pdf
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
 *   I2C1.setup({scl:B6,sda:B7});
 *   var pressure = require("LPS25HB").connect(I2C1, 0);  // 0 or 1 for debug info
 *   pressure.getPressure(print);
 *
 *
 */

var LPS25HB_I2C_SLAVE_ADDRESS = 93; // default value, see datasheet

// =========================
// LPS25HB registers mapping
// =========================

// CONTROL
var LPS25HB_CTRL_REG1_ADDR = 0x20; // Pressure sensor control register 1

// DATA
// The pressure output value is a 24-bit data that contains the measured pressure. It is
// composed of PRESS_OUT_H (2Ah), PRESS_OUT_L (29h) and PRESS_OUT_XL (28h).
// The value is expressed as 2^ complement.
var LPS25HB_PRESS_OUT_XL_ADDR = 0x28; // Pressure Data (LSB)
var LPS25HB_PRESS_OUT_L_ADDR = 0x29;  // Pressure Data (mid part)
var LPS25HB_PRESS_OUT_H_ADDR = 0x2A;  // Pressure Data (MSB)



exports.connect = function (_i2c, debugMode) {
  return new LPS25HB(_i2c, debugMode);
};

/**
 * Create a new LPS25HB sensor instance
 */
function LPS25HB(_i2c, debugMode) {
  this.i2c = _i2c;
  this.debugMode = debugMode; // 0 or 1

  /*
   * Pressure sensor control register 1
   *
   * Read/write
   * Default value: 0x00
   * 7 PD: power down control. 0 - disable; 1 - enable
   * 6:4 ODR2, ODR1, ODR0: output data rate selection.
   *     ODR2  | ODR1  | ODR0  | Pressure output data-rate(Hz)  | Temperature output data-rate(Hz)
   *   ----------------------------------------------------------------------------------
   *      0    |  0    |  0    |         one shot               |         one shot
   *      0    |  0    |  1    |            1                   |            1
   *      0    |  1    |  0    |            7                   |            7
   *      0    |  1    |  1    |            12.5                |            12.5
   *      1    |  0    |  0    |            25                  |            25
   *      1    |  0    |  1    |         Reserved               |         Reserved
   *      1    |  1    |  0    |         Reserved               |         Reserved
   *      1    |  1    |  1    |         Reserved               |         Reserved
   *
   * 3 DIFF_EN: Interrupt circuit. 0 - disable; 1 - enable
   * 2 BDU: block data update. 0 - disable; 1 - enable
   * 1 RESET_AZ: reset AutoZero. 0 - disable; 1 - enable
   * 0 SIM: SPI Serial Interface Mode selection. 0 - SPI 4-wire; 1 - SPI 3-wire
   */
  
  this.w(LPS25HB_CTRL_REG1_ADDR, 0x90);
}

/**
 * Get pressure in hPa
 */
LPS25HB.prototype.getPressure= function(callback) {

  var data = this.r(LPS25HB_PRESS_OUT_XL_ADDR,3);

  /*
   * The most significant bit of the PressOut_H register indicates the polarity. 
   * If the sign bit is zero, then the value is positive and the pressure in mbar is determined by dividing the decimal value by the scaling factor of 4096. 
   * A sign bit of 1 indicates a negative value, so we first take the two^ complement of the complete word and then divide by 4096.
   */              
  if (0x80 == (data[2] & 0x80)) {
    // bit24 is 1 => negative value: this is not handled at the moment 
    console.log("[ERR] LPS25HB returns a negative value: we do not handle this case....");
    return(-1);
  }                                    
                    
  /* Convert into hPa
   * Pressure output data: Pout(mbar)=(PRESS_OUT_H & PRESS_OUT_L & PRESS_OUT_XL)[dec]/4096.
   * WARNING : we consider that the pressure is always positive so we only need to convert a 24-bit positive number.
   * We use the & 0xFF to keep it unsigned.
   */
  var result = ((data[2] & 0xFF)*65536 + (data[1] & 0xFF)*256 + (data[0] & 0xFF))/4096.0;

  if(this.debugMode) {
    console.log(" LPS25HB debug : getPressure return data[2..0]="+data[2]+" "+data[1]+" "+data[0]);
    console.log(" LPS25HB debug : Pressure in hPa is "+result);
  }
  callback(result);
};


/***************
 * Helpers
 ***************/
/* read register */
LPS25HB.prototype.r = function(addr, cnt) {
  if(this.debugMode) console.log(" LPS25HB debug : read "+cnt+" bytes at address "+addr);

  /* 
   * see LPS25HB datasheet, section 6.2.1
   * In order to read multiple bytes incrementing the register address, it is necessary to assert
   * the most significant bit of the sub-address field. In other words, SUB(7) must be equal to 1
   * while SUB(6-0) represents the address of the first register to be read.
   */
  this.i2c.writeTo({address:LPS25HB_I2C_SLAVE_ADDRESS, stop:false}, 0x80 | addr);
  return this.i2c.readFrom(LPS25HB_I2C_SLAVE_ADDRESS, cnt);
};

/* write register */
LPS25HB.prototype.w = function(addr, data) {
  if(this.debugMode) console.log(" LPS25HB debug : write "+data+" at address "+addr);
  this.i2c.writeTo(LPS25HB_I2C_SLAVE_ADDRESS, addr, data);
};
