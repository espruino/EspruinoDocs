/* Copyright (C) 2018 ST Microelectronics, Gordon Williams. See the file LICENSE for copying permission. */
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
 *   var temp = require("HTS221").connect(I2C1);
 *   print(temp.getTemperature());
 *   print(temp.getHumidity());
 *
 */

var C = {
  // default slave address, see datasheet
  HTS221_I2C_SLAVE_ADDRESS : 95,          

  // control register addresses
  CTRL_WHO_AM_I_ADDRESS : 0xF,
  CTRL_AV_CONF : 0x10,
  CTRL_REG1_ADDRESS : 0x20,
  CTRL_REG3_ADDRESS : 0x22,
  CTRL_STATUS_ADDRESS : 0x27,

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
  AVGT_DEFAULT : 0b011011, // default 16/32 samples

  // data register
  DATA_HUMIDITY_OUT_L : 0x28,
  DATA_HUMIDITY_OUT_H : 0x29,
  DATA_TEMP_OUT_L : 0x2A,
  DATA_TEMP_OUT_H : 0x2B

};

/* Initialise the module. See HTS221 for more information */
exports.connect = function (i2c, options) {
  return new HTS221(i2c, options);
};

/* Create a new HTS221 sensor instance - set up the device
   and read coefficients.
   
   options = {
     int : pin, // optional - DRDY interrupt pin. If specified, 'data' event will be emitted when data is ready
   }
*/
function HTS221(i2c, options) {
  this.i2c = i2c;
  this.options = options||{};
  // Set the driver mode, block data rate, output data rate
  this.w(C.CTRL_REG1_ADDRESS, (C.PD_ACTIVE_MODE | C.BDU_NOT_CONTINUOUS_UPDATE | C.ODR_ONE_HZ));
  // Set the average configuration (default)
  this.w(C.CTRL_AV_CONF, C.AVGT_DEFAULT);
  // 1. Read the value of coefficients T0_degC_x8 and T1_degC_x8 from registers
  var coefficients = this.r(0x32,2);        
  var T0_degC_x8_32 = coefficients[0];
  var T1_degC_x8_33 = coefficients[1];

  // 2. Read the MSB bits of this.T1_degC (T1.9 and T1.8 bit) and  this.T0_degC (T0.9 and T0.8 bit) from register 0x35
  // to compute  this.T0_degC and this.T1_degC
  var T1_T0_msb = this.r(0x35, 1)[0];
  var T1_T0_msb_x8_35 = T1_T0_msb & 0x0F;
  var T0_degC_x8_10bits = (T1_T0_msb_x8_35 & 0x03)*256 + T0_degC_x8_32;
  var T1_degC_x8_10bits = (T1_T0_msb_x8_35 & 0x0C)*64 + T1_degC_x8_33;

  // 3. Divide by 8
  // in order to obtain the value of coefficients  this.T0_degC and  this.T1_degC
  this.T0_degC = T0_degC_x8_10bits/8;
  this.T1_degC = T1_degC_x8_10bits/8;

  // 4. Read the value of  this.T0_OUT from registers 0x3C & 0x3D
  // and
  // 5. Read the value of  this.T1_OUT from registers 0x3E & 0x3F.
  this.T0_OUT = this.r16(0x3C, true);
  this.T1_OUT = this.r16(0x3E, true);
  // Humidity
  var coefficients = this.r(0x30,2);        
  this.H0_RH = coefficients[0]/2;
  this.H1_RH = coefficients[1]/2;
  this.H0_T0_OUT = this.r16(0x36, true);
  this.H1_T0_OUT = this.r16(0x3A, true);
  
  
  if (this.options.int) {
    // Enable DRDY output on pin, active high
    this.w(C.CTRL_REG3_ADDRESS, 0x04);
    this.watch = setWatch(function() {
      this.emit('data', this.get());
    }.bind(this), this.options.int, {edge:"rising",repeat:true});
    // ensure we clear DRDY
    this.get();
  }
}

// Power down the HTS221
HTS221.prototype.stop = function() {
  if (this.watch) clearWatch(this.watch);
  this.watch = undefined;
  this.w(C.CTRL_REG1_ADDRESS, C.PD_POWER_DOWN_MODE);  
}

// deprecated. It's now done automatically when the HTS221 class is created
HTS221.prototype.ObtainCalibratedTemperatureCoefficient = function() {
  print("ObtainCalibratedTemperatureCoefficient deprecated. It's now done automatically.");
}

// Read the temperature in degrees C
HTS221.prototype.getTemperature = function(callback) {
  // Read Ouput registers (H_OUT) 
  // temp msb, temp lsb  
  var T = this.r16(C.DATA_TEMP_OUT_L, true);
  var celsiusTemp = ( (this.T1_degC - this.T0_degC) * (T -  this.T0_OUT) / (this.T1_OUT -  this.T0_OUT) ) + this.T0_degC;
  if (callback) callback(celsiusTemp); // for backwards compatibility
  return celsiusTemp;
};

// Read the humidity percentage (rh)
HTS221.prototype.getHumidity = function(callback) {
  var H = this.r16(C.DATA_HUMIDITY_OUT_L, true);
  var rh = ( (this.H1_RH - this.H0_RH) * (H - this.H0_T0_OUT) / (this.H1_T0_OUT -  this.H0_T0_OUT) ) + this.H0_RH;
  if (callback) callback(rh); // for backwards compatibility
  return rh;
};

// Get the current temperature in degrees C and humidity percentage (rh)
HTS221.prototype.get = function() {
  return { 
    temperature : this.getTemperature(),
    humidity : this.getHumidity()
  };
}

// Call the callback with a new humidity & temperature value
HTS221.prototype.read = function(callback) {  
  if (this.options.int) {
    callback(this.get());
  } else {    
    var intr = setInterval(function() {
      if (this.r(C.CTRL_STATUS_ADDRESS)&3) {
        clearInterval(intr);
        callback(get());
      }        
    }.bind(this), 100);
    return this.get();
  }
};

// read register 
HTS221.prototype.r = function(addr, cnt) {
  this.i2c.writeTo({address:C.HTS221_I2C_SLAVE_ADDRESS, stop:false}, 0x80 | addr);
  return this.i2c.readFrom(C.HTS221_I2C_SLAVE_ADDRESS, cnt);
};
// read 16 bit regsister
HTS221.prototype.r16 = function(addr,signed) {
  var d = this.r(addr,2);
  var r = (d[1]<<8)|d[0];
  if (signed && (r&0x8000)) r-=0x10000;
  return r;
};
// write register 
HTS221.prototype.w = function(addr, data) {
  this.i2c.writeTo(C.HTS221_I2C_SLAVE_ADDRESS, addr, data);
};
