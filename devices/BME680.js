/* Copyright (c) 2017 Gordon Williams, Poul Borg. See the file LICENSE for copying permission. */
var C = {
  /** BME680 General config */
  POLL_PERIOD_MS   : 10,

  /** BME680 I2C addresses */
  I2C_ADDR_PRIMARY   : 0x76,
  // I2C_ADDR_SECONDARY : 0x77,

  /** BME680 unique chip identifier */
  CHIP_ID  : 0x61,

  /** BME680 coefficients related defines */
  COEFF_SIZE   : 41,
  COEFF_ADDR1_LEN    : 25,
  COEFF_ADDR2_LEN    : 16,

  /** BME680 field_x related defines */
  FIELD_LENGTH   : 15,
  // FIELD_ADDR_OFFSET  : 17,

  /** Soft reset command */
  SOFT_RESET_CMD   : 0xb6,

  /* Info's */
  // I_MIN_CORRECTION   : 1,
  // I_MAX_CORRECTION   : 2,

  /** Register map */
  /** Other coefficient's address */
  ADDR_RES_HEAT_VAL_ADDR : 0x00,
  ADDR_RES_HEAT_RANGE_ADDR : 0x02,
  ADDR_RANGE_SW_ERR_ADDR : 0x04,
  // ADDR_SENS_CONF_START : 0x5A,
  // ADDR_GAS_CONF_START  : 0x64,

  /** Field settings */
  FIELD0_ADDR    : 0x1d,

  /** Heater settings */
  RES_HEAT0_ADDR   : 0x5a,
  GAS_WAIT0_ADDR   : 0x64,

  /** Sensor configuration registers */
  CONF_HEAT_CTRL_ADDR    : 0x70,
  CONF_ODR_RUN_GAS_NBC_ADDR  : 0x71,
  CONF_OS_H_ADDR     : 0x72,
  // MEM_PAGE_ADDR      : 0xf3,
  CONF_T_P_MODE_ADDR   : 0x74,
  CONF_ODR_FILT_ADDR   : 0x75,

  /** Coefficient's address */
  COEFF_ADDR1  : 0x89,
  COEFF_ADDR2  : 0xe1,

  /** Chip identifier */
  CHIP_ID_ADDR : 0xd0,

  /** Soft reset register */
  SOFT_RESET_ADDR    : 0xe0,

  /** Heater control settings */
  ENABLE_HEATER    : 0x00,
  //DISABLE_HEATER   : 0x08,
  DISABLE_HEATER   : 0x01,

  /** Gas measurement settings */
  // DISABLE_GAS_MEAS   : 0x00,
  ENABLE_GAS_MEAS    : 0x01,

  /** Over-sampling settings */
  OS_NONE    : 0,
  // OS_1X    : 1,
  OS_2X    : 2,
  OS_4X    : 3,
  OS_8X    : 4,
  OS_16X   : 5,

  /** IIR filter settings */
  FILTER_SIZE_0  : 0,
  // FILTER_SIZE_1  : 1,
  FILTER_SIZE_3  : 2,
  // FILTER_SIZE_7  : 3,
  // FILTER_SIZE_15 : 4,
  // FILTER_SIZE_31 : 5,
  // FILTER_SIZE_63 : 6,
  FILTER_SIZE_127  : 7,

  /** Power mode settings */
  SLEEP_MODE : 0,
  FORCED_MODE  : 1,

  /** Delay related macro declaration */
  RESET_PERIOD : 10,

  /** SPI memory page settings */
  // MEM_PAGE0  : 0x10,
  // MEM_PAGE1  : 0x00,

  /** Ambient humidity shift value for compensation */
  HUM_REG_SHIFT_VAL  : 4,

  /** Run gas enable and disable settings */
  RUN_GAS_DISABLE  : 0,
  RUN_GAS_ENABLE : 1,

  /** Settings selector */
  // OST_SEL      : 1,
  // OSP_SEL      : 2,
  // OSH_SEL      : 4,
  // GAS_MEAS_SEL : 8,
  // FILTER_SEL   : 16,
  // HCNTRL_SEL   : 32,
  // RUN_GAS_SEL  :  64,
  // NBCONV_SEL   : 128,
  //GAS_SENSOR_SEL : (C.GAS_MEAS_SEL | C.RUN_GAS_SEL | C.NBCONV_SEL)

  /** Number of conversion settings*/
  NBCONV_MIN   : 0,
  NBCONV_MAX : 9, // Was 10, but there are only 10 settings: 0 1 2 ... 8 9 

  /** Bit position definitions for sensor settings */
  // GAS_MEAS_POS : 4,
  FILTER_POS : 2,
  OST_POS    : 5,
  OSP_POS    : 2,
  HCTRL_POS  : 3,
  RUN_GAS_POS  : 4,

  /** BME680 register buffer index settings*/
  /*REG_FILTER_INDEX   : 5,
  REG_TEMP_INDEX   : 4,
  REG_PRES_INDEX   : 4,
  REG_HUM_INDEX    : 2,
  REG_NBCONV_INDEX   : 1,
  REG_RUN_GAS_INDEX  : 1,
  REG_HCTRL_INDEX    : 0,*/
};
var MSK = {
  /** Mask definitions */
  GAS_MEAS : 0x30,
  NBCONV : 0X0F,
  FILTER : 0X1C,
  OST    : 0XE0,
  OSP    : 0X1C,
  OSH    : 0X07,
  HCTRL  : 0x08,
  RUN_GAS  : 0x10,
  MODE   : 0x03,
  RHRANGE  : 0x30,
  RSERROR  : 0xf0,
  NEW_DATA : 0x80,
  GAS_INDEX  : 0x0f,
  GAS_RANGE  : 0x0f,
  GASM_VALID : 0x20,
  HEAT_STAB  : 0x10,
  // MEM_PAGE : 0x10,
  // SPI_RD : 0x80,
  // SPI_WR : 0x7f,
  BIT_H1_DATA  : 0x0F,
};
var R = {
  /** Array Index to Field data mapping for Calibration Data*/
  T2_LSB : 1,
  T2_MSB : 2,
  T3   : 3,
  P1_LSB : 5,
  P1_MSB : 6,
  P2_LSB : 7,
  P2_MSB : 8,
  P3   : 9,
  P4_LSB : 11,
  P4_MSB : 12,
  P5_LSB : 13,
  P5_MSB : 14,
  P7   : 15,
  P6   : 16,
  P8_LSB : 19,
  P8_MSB : 20,
  P9_LSB : 21,
  P9_MSB : 22,
  P10    : 23,
  H2_MSB : 25,
  H2_LSB : 26,
  H1_LSB : 26,
  H1_MSB : 27,
  H3   : 28,
  H4   : 29,
  H5   : 30,
  H6   : 31,
  H7   : 32,
  T1_LSB : 33,
  T1_MSB : 34,
  GH2_LSB  : 35,
  GH2_MSB  : 36,
  GH1    : 37,
  GH3    : 38
};

function boundary_check(v,min,max) {
  if (v<min || v>max) throw "Out of range";
}

function BME680(options,read,write) {
  options = options||{};
  options.addr = options.addr||C.I2C_ADDR_PRIMARY;
  this.w = write;
  this.r = read;

  if (this.r(C.CHIP_ID_ADDR,1)!=C.CHIP_ID)
    throw new Error("BME680 not found");  
  var bme = this;
  bme.set_sensor_mode(C.SLEEP_MODE);
  bme.soft_reset(function() {
    bme.get_calib_data();
    var options = {
      /* Set the temperature, pressure and humidity settings */
      os_hum : C.OS_2X,
      os_pres : C.OS_4X,
      os_temp : C.OS_8X,
      filter : C.FILTER_SIZE_3,
      /* Set the remaining gas sensor settings and link the heating profile */
      run_gas : C.ENABLE_GAS_MEAS,
      /* Create a ramp heat waveform in 3 steps */
      heatr_temp : 320, /* degree Celsius 200 .. 400 */
      heatr_dur : 150, /* milliseconds 0 .. 4032 */
      heatr_ctrl : C.ENABLE_HEATER, /* ENABLE_HEATER  DISABLE_HEATER */
      nb_conv : 0, /* profile 0 .. 9 */
    };
    bme.set_sensor_settings(options);
    bme.set_sensor_mode(C.FORCED_MODE);
    //console.log(options);
    //console.log(bme.get_profile_dur(options)+" ms needed");
  });
}

BME680.prototype.soft_reset = function(callback) {
  this.w(C.SOFT_RESET_ADDR, C.SOFT_RESET_CMD);  
  if (callback) setTimeout(callback, C.RESET_PERIOD);
};

BME680.prototype.get_calib_data = function() {
  var coefs = new Uint8Array(C.COEFF_ADDR1_LEN+C.COEFF_ADDR2_LEN);
  coefs.set(this.r(C.COEFF_ADDR1,C.COEFF_ADDR1_LEN));
  coefs.set(this.r(C.COEFF_ADDR2,C.COEFF_ADDR2_LEN),C.COEFF_ADDR1_LEN);
  var vc = new DataView(coefs.buffer);
  // everything is little endian
  this.cal={};
  /* Temperature related coefficients */
  this.cal.par_t = [vc.getUint16(R.T1_LSB, true)
                    ,vc.getInt16(R.T2_LSB, true)
                    ,vc.getInt8(R.T3)];
  
  /* Pressure related coefficients */
  this.cal.par_p = [vc.getUint16(R.P1_LSB, true)
                    ,vc.getInt16(R.P2_LSB, true)
                    ,vc.getInt8(R.P3)
                    ,vc.getInt16(R.P4_LSB, true)
                    ,vc.getInt16(R.P5_LSB, true)
                    ,vc.getInt8(R.P6)
                    ,vc.getInt8(R.P7)
                    ,vc.getInt16(R.P8_LSB, true)
                    ,vc.getInt16(R.P9_LSB, true)
                    ,vc.getUint8(R.P10)];

  /* Humidity related coefficients */
  this.cal.par_h = [(vc.getUint8(R.H1_MSB) << C.HUM_REG_SHIFT_VAL) |
                    (vc.getUint8(R.H1_LSB) & MSK.BIT_H1_DATA)
                    ,(vc.getUint8(R.H2_MSB) << C.HUM_REG_SHIFT_VAL) |
                    (vc.getUint8(R.H2_LSB) >> C.HUM_REG_SHIFT_VAL)
                    ,vc.getInt8(R.H3)
                    ,vc.getInt8(R.H4)
                    ,vc.getInt8(R.H5)
                    ,vc.getUint8(R.H6)
                    ,vc.getInt8(R.H7)];

  /* Gas heater related coefficients */
  this.cal.par_gh = [vc.getInt8(R.GH1)
                     ,vc.getInt16(R.GH2_LSB, true)
                     ,vc.getInt8(R.GH3)];
  /* Other coefficients */  
  this.cal.res_heat_range = (this.r(C.ADDR_RES_HEAT_RANGE_ADDR,1)[0]&MSK.RHRANGE)/16;
  this.cal.res_heat_val = this.r(C.ADDR_RES_HEAT_VAL_ADDR,1)[0];
  this.cal.range_sw_err = (this.r(C.ADDR_RANGE_SW_ERR_ADDR,1)[0]&MSK.RSERROR)/16;
  };

BME680.prototype.set_sensor_mode = function(mode) {
  this.power_mode = mode;
  var tmp_pow_mode;
  var pow_mode = 0;

  /* Call recursively until in sleep */
  do {
    tmp_pow_mode = this.r(C.CONF_T_P_MODE_ADDR, 1);
    /* Put to sleep before changing mode */
    pow_mode = (tmp_pow_mode & MSK.MODE);

    if (pow_mode != C.SLEEP_MODE) {
      tmp_pow_mode = tmp_pow_mode & (~MSK.MODE); /* Set to sleep */
      this.w(C.CONF_T_P_MODE_ADDR, tmp_pow_mode);
      // delay POLL_PERIOD_MS
    }
  } while (pow_mode != C.SLEEP_MODE);

  /* Already in sleep */
  if (mode != C.SLEEP_MODE) {
    tmp_pow_mode = (tmp_pow_mode & ~MSK.MODE) | (mode & MSK.MODE);
    this.w(C.CONF_T_P_MODE_ADDR, tmp_pow_mode); // 0x74 
  }
};

/* filter, heatr_ctrl, os_temp, os_pres, os_hum, run_gas, nb_conv */
BME680.prototype.set_sensor_settings = function(options) {
  var intended_power_mode = this.power_mode;
  var data;

  //if (desired_settings & C.GAS_MEAS_SEL)
  // set_gas_config(dev);

  this.set_sensor_mode(C.SLEEP_MODE);

  /* Selecting the filter */
  if (options.filter!==undefined) {
    boundary_check(options.filter, C.FILTER_SIZE_0, C.FILTER_SIZE_127);
    data = this.r(C.CONF_ODR_FILT_ADDR,1)[0]; 
    data = (data&~MSK.FILTER) | (options.filter<<C.FILTER_POS);
    this.w(C.CONF_ODR_FILT_ADDR, data);
  }

  /* Selecting heater control for the sensor */
  if (options.heatr_ctrl!==undefined) {
    boundary_check(options.heatr_ctrl, C.ENABLE_HEATER, C.DISABLE_HEATER);
    data = this.r(C.CONF_HEAT_CTRL_ADDR,1)[0];
    //    data = (data&~MSK.HCTRL) | (options.heatr_ctrl|MSK.HCTRL);
    data = (data&~MSK.HCTRL) | (options.heatr_ctrl<<C.HCTRL_POS);
    this.w(C.CONF_HEAT_CTRL_ADDR, data);
  }

  /* Selecting heater T,P oversampling for the sensor */
  if (options.os_temp!==undefined || options.os_pres!==undefined) {    
    data = this.r(C.CONF_T_P_MODE_ADDR,1)[0];
    if (options.os_temp!==undefined) {
      boundary_check(options.os_temp, C.OS_NONE, C.OS_16X);
      data = (data&~MSK.OST) | (options.os_temp << C.OST_POS);
    }
    if (options.os_pres!==undefined)
      data = (data&~MSK.OSP) | (options.os_pres << C.OSP_POS);
    this.w(C.CONF_T_P_MODE_ADDR, data); // 0x74 
  }

  /* Selecting humidity oversampling for the sensor */
  if (options.os_hum!==undefined) {
    boundary_check(options.os_hum, C.OS_NONE, C.OS_16X);
    data = this.r(C.CONF_OS_H_ADDR,1)[0];
    data = (data&~MSK.OSH) | (options.os_hum&MSK.OSH);
    this.w(C.CONF_OS_H_ADDR, data);
  }

  /* Selecting the runGas and NB conversion settings for the sensor */
  if (options.run_gas!==undefined || options.nb_conv!==undefined) {
    data = this.r(C.CONF_ODR_RUN_GAS_NBC_ADDR,1)[0];
    if (options.run_gas!==undefined) {
      boundary_check(options.run_gas, C.RUN_GAS_DISABLE, C.RUN_GAS_ENABLE);
      data = (data&~MSK.RUN_GAS) | (options.run_gas<<C.RUN_GAS_POS);
    }
    if (options.nb_conv!==undefined) {
      boundary_check(options.nb_conv, C.NBCONV_MIN, C.NBCONV_MAX);
      data = (data&~MSK.NBCONV) | (options.nb_conv&MSK.NBCONV);
    }
    this.w(C.CONF_ODR_RUN_GAS_NBC_ADDR, data);
  }

  this.set_heating_settings(options.heatr_temp, options.heatr_dur, options.nb_conv);

  /* Restore previous intended power mode */
  this.set_sensor_mode(intended_power_mode);
};

BME680.prototype.set_heating_settings = function(tmp, dur, cnv) {
  tmp = (typeof tmp==='undefined')?320:tmp;
  dur = (typeof dur==='undefined')?150:dur;
  cnv = (typeof cnv==='undefined')?0:cnv;
  var data;

  //console.log(tmp,dur,cnv);

  if (cnv!==undefined) {
    boundary_check(cnv, C.NBCONV_MIN, C.NBCONV_MAX);
    data = this.r(C.CONF_ODR_RUN_GAS_NBC_ADDR,1)[0];
    data = (data&~MSK.NBCONV) | (cnv&MSK.NBCONV);
    this.w(C.CONF_ODR_RUN_GAS_NBC_ADDR, data);
  }

  if (tmp!==undefined) {
    boundary_check(tmp, 200, 400);
    data = this.calc_heater_resistance(tmp);
    this.w(C.RES_HEAT0_ADDR + cnv, data); // 0x5a .. 0x63 
  }

  if (dur!==undefined) {
    boundary_check(dur, 0, 4032);
    data = this.calc_heater_duration(dur);
    this.w(C.GAS_WAIT0_ADDR + cnv, data); // 0x64 ..0x6d 
  }
};

// get duration in milliseconds needed before a reading
BME680.prototype.get_profile_dur = function(options) {
  var tph_dur; /* Calculate in us */
  var meas_cycles;
  var os_to_meas_cycles = [0, 1, 2, 4, 8, 16];

  meas_cycles = os_to_meas_cycles[options.os_temp];
  meas_cycles += os_to_meas_cycles[options.os_pres];
  meas_cycles += os_to_meas_cycles[options.os_hum];

  /* TPH measurement duration */
  tph_dur = meas_cycles * 1963;
  tph_dur += 477 * 4; /* TPH switching duration */
  tph_dur += 477 * 5; /* Gas measurement duration */
  tph_dur += 500; /* Get it to the closest whole number.*/
  tph_dur /= 1000; /* Convert to ms */

  tph_dur += 1; /* Wake up duration of 1ms */

  /* Get the gas duration only when the run gas is enabled */
  if (options.run_gas)
    /* The remaining time should be used for heating */
    tph_dur += options.heatr_dur;
  return tph_dur;
};

/** Return data:
  new             // is this a new measurement?
  temperature     // degrees C
  pressure        // hPa
  humidity        // % rH
  gas_resistance  // Ohms
*/
BME680.prototype.get_sensor_data = function() {
  var buff = this.r(C.FIELD0_ADDR, C.FIELD_LENGTH);

  this.status = buff[0] & MSK.NEW_DATA;
  this.gas_index = buff[0] & MSK.GAS_INDEX;
  this.meas_index = buff[1];
  //console.log('gas_index ', this.gas_index);

  /* read the raw data from the sensor */
  var adc_pres = ((buff[2] << 12) | (buff[3] << 4) | (buff[4] >> 4));
  var adc_temp = ((buff[5] << 12) | (buff[6] << 4) | (buff[7] >> 4));
  var adc_hum = (buff[8] << 8) | buff[9];
  var adc_gas_res = (buff[13] <<2 ) | (buff[14] >> 6);
  var gas_range = buff[14] & MSK.GAS_RANGE;

  this.status |= buff[14] & MSK.GASM_VALID;
  this.status |= buff[14] & MSK.HEAT_STAB;

  this.ambient_temperature = this.calc_temperature(adc_temp) / 100;
  
  return {
    new : !!(this.status & MSK.NEW_DATA),
    temperature : this.ambient_temperature,
    pressure : this.calc_pressure(adc_pres) / 100,
    humidity : this.calc_humidity(adc_hum) / 1000,
    gas_resistance : this.calc_gas_resistance(adc_gas_res, gas_range)
  };
};

// Request the sensor takes another reading
BME680.prototype.perform_measurement = function() {
  this.set_sensor_mode(C.FORCED_MODE);
};

BME680.prototype.calc_temperature = function(temp_adc) {
  var var1;
  var var2;
  var var3;
  var calc_temp;

  var1 = (temp_adc/8) - (this.cal.par_t[0]*2);
  var2 = (var1 *  this.cal.par_t[1])/2048;
  var3 = (var1 * var1)/16384;
  var3 = ((var3) * ( this.cal.par_t[2]*16))/16384;
  this.cal.t_fine =  (var2 + var3);
  calc_temp = (((this.cal.t_fine * 5) + 128)/256);

  return calc_temp;
};

BME680.prototype.calc_pressure = function(pres_adc) {
  var var1;
  var var2;
  var var3;
  var var4;
  var pressure_comp;

  var1 = ((this.cal.t_fine) >> 1) - 64000;
  var2 = ((((var1 >> 2) * (var1 >> 2)) >> 11) *
          this.cal.par_p[5]) >> 2;
  var2 = var2 + ((var1 * this.cal.par_p[4]) << 1);
  var2 = (var2 >> 2) + (this.cal.par_p[3] << 16);
  var1 = (((((var1 >> 2) * (var1 >> 2)) >> 13) *
           (this.cal.par_p[2] << 5)) >> 3) +
    ((this.cal.par_p[1] * var1) >> 1);
  var1 = var1 >> 18;
  var1 = ((32768 + var1) * this.cal.par_p[0]) >> 15;
  pressure_comp = 1048576 - pres_adc;
  pressure_comp = ((pressure_comp - (var2 >> 12)) * (3125));
  var4 = (1 << 31);
  if (pressure_comp >= var4)
    pressure_comp = ((pressure_comp / var1) << 1);
  else
    pressure_comp = ((pressure_comp << 1) / var1);
  var1 = (this.cal.par_p[8] * (((pressure_comp >> 3) *
                                (pressure_comp >> 3)) >> 13)) >> 12;
  var2 = ((pressure_comp >> 2) *
          this.cal.par_p[7]) >> 13;
  var3 = ((pressure_comp >> 8) * (pressure_comp >> 8) *
          (pressure_comp >> 8) *
          this.cal.par_p[9]) >> 17;

  pressure_comp = (pressure_comp) + ((var1 + var2 + var3 +
                                      (this.cal.par_p[6] << 7)) >> 4);

  return pressure_comp;

};

BME680.prototype.calc_humidity = function(hum_adc) {
  var var1;
  var var2;
  var var3;
  var var4;
  var var5;
  var var6;
  var temp_scaled;
  var calc_hum;

  temp_scaled = (( this.cal.t_fine * 5) + 128) >> 8;
  var1 =  (hum_adc - ( ( this.cal.par_h[0] * 16)))
    - (((temp_scaled *  this.cal.par_h[2]) / ( 100)) >> 1);
  var2 = ( this.cal.par_h[1]
          * (((temp_scaled *  this.cal.par_h[3]) / ( 100))
             + (((temp_scaled * ((temp_scaled *  this.cal.par_h[4]) / ( 100))) >> 6)
                / ( 100)) +  (1 << 14))) >> 10;
  var3 = var1 * var2;
  var4 =  this.cal.par_h[5] << 7;
  var4 = ((var4) + ((temp_scaled *  this.cal.par_h[6]) / ( 100))) >> 4;
  var5 = ((var3 >> 14) * (var3 >> 14)) >> 10;
  var6 = (var4 * var5) >> 1;
  calc_hum = (((var3 + var6) >> 10) * ( 1000)) >> 12;

  if (calc_hum > 100000) /* Cap at 100%rH */
    calc_hum = 100000;
  else if (calc_hum < 0)
    calc_hum = 0;

  return  calc_hum;
};

BME680.prototype.calc_gas_resistance = function(gas_res_adc, gas_range) {
  var var1;
  var var2;
  var var3;
  var calc_gas_res;

  /**Look up table for the possible gas range values */
  var lookupTable1 = [ 2147483647, 2147483647, 2147483647, 2147483647,
                  2147483647, 2126008810, 2147483647, 2130303777, 2147483647,
                  2147483647, 2143188679, 2136746228, 2147483647, 2126008810,
                  2147483647, 2147483647 ];

  /**Look up table for the possible gas range values */
  var lookupTable2 = [ 4096000000, 2048000000, 1024000000, 512000000,
                  255744255, 127110228, 64000000, 32258064, 16016016, 8000000, 4000000, 2000000, 1000000, 500000, 250000,
                  125000 ];

  var1 = ((1340 + (5 * this.cal.range_sw_err)) * (lookupTable1[gas_range])) / 65536;
  var2 = (((gas_res_adc * 32768) - (16777216)) + var1);
  var3 = ((lookupTable2[gas_range] * var1) / 512);
  calc_gas_res =  ((var3 + (var2/2)) / var2);

  return calc_gas_res;
};

BME680.prototype.calc_heater_resistance = function(temperature) {
  var var1;
  var var2;
  var var3;
  var var4;
  var var5;
  var heatr_res;

  temperature = Math.min(Math.max(temperature,200),400);
  if (this.ambient_temperature===undefined) {this.ambient_temperature = 22;}

  var1 = ((this.ambient_temperature * this.cal.par_gh[2]) / 1000) * 256;
  var2 = (this.cal.par_gh[0] + 784) * (((((this.cal.par_gh[1] + 154009) * temperature * 5) / 100) + 3276800) / 10);
  var3 = var1 + (var2 / 2);
  var4 = (var3 / (this.cal.res_heat_range + 4));
  var5 = (131 * this.cal.res_heat_val) + 65536;
  var heatr_res_x100 = (((var4 / var5) - 250) * 34);
  heatr_res = ((heatr_res_x100 + 50) / 100);

  return heatr_res;
};

BME680.prototype.calc_heater_duration = function(duration) {
  if (duration < 0xfc0) {
    var factor = 0;

    while (duration > 0x3f) {
      duration /= 4;
      factor += 1;
    }

    return Math.floor(duration + (factor * 64)); // INT
  }
  return 0xff;
};

exports.BME680 = BME680;

exports.connectI2C = function(i2c, options) {
  var a = (options&&options.addr)||C.I2C_ADDR_PRIMARY;
  return (new BME680(options, function(reg, len) { // read
    i2c.writeTo(a, reg);
    return i2c.readFrom(a, len);
  }, function(reg, data) { // write
    i2c.writeTo(a, [reg, data]);
  }));
};

exports.connectSPI = function(spi, cs, options) {
  return (new BME680(options, function(reg, len) { // read
    return spi.send([reg|0x80,new Uint8Array(len)], cs).slice(1);
  }, function(reg, data) { // write
    spi.write(reg&0x7f, data, cs);
  }));
};
