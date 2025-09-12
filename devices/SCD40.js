/* Copyright (c) 2025 Hywel Warsop. See the file LICENSE for copying permission. */
/*
Module for Sensiron SCD40, SCD41 and SCD43.

I2C2.setup({scl:B10,sda:B3});
var scd = require("SCD40").connectI2C(I2C2);

//single measurement
scd.measure_single_shot();
scd.get_data_ready_status();
readings = scd.read_measurement();
console.log({readings});

//continous measurement (5 sec interval)
scd.start_periodic_measurement();
readings = scd.read_measurement();
console.log({readings});

scd.stop_periodic_measurement()
*/

var C = {
  I2C_ADDR : 0x62,

  REQUEST_SINGLE_LOOKUP : [0x21,0x9d],
  REQUEST_SINGLE_LOOKUP_RHT : [0x21,0x96],
  START_MEASUREMENTS : [0x21,0xb1],
  START_LOW_POWER_MEASUREMENTS : [0x21,0xac],
  STOP_MEASUREMENTS : [0x3f,0x86],
  IS_DATA_READY : [0xe4,0xb8],
  READ_DATA : [0xec,0x05],

  PERFORM_FORCED_RECALIBARTION : 0x362f,
  GET_AUTOMATIC_SELF_CALIBRATION_ENABLED : [0x23,0x13],
  SET_AUTOMATIC_SELF_CALIBRATION_ENABLED : 0x2416,
  GET_AUTOMATIC_SELF_CALIBRATION_TARGET : [0x23,0x3f],
  SET_AUTOMATIC_SELF_CALIBRATION_TARGET : 0x243a,

  GET_TEMP_OFFSET : [0x23,0x18],
  SET_TEMP_OFFSET : 0x241d,
  GET_SENSOR_ALTITUDE : [0x23,0x22],
  SET_SENSOR_ALTITUDE : 0x2427,
  GET_AMBIENT_PRESSURE : [0xe0,0x00],
  SET_AMBIENT_PRESSURE : 0xe000,

  PERSIST_SETTINGS : [0x36,0x15],
  GET_SERIAL_NUMBER : [0x36,0x82],
  PERfORM_SELF_TEST : [0x36,0x39],
  FACTORY_RESET : [0x36,0x32],
  RE_INIT : [0x36,0x46],

  /** Chip identifier */
  CHIP_GET_VARIANT : [0x20,0x2f],
  CHIP_VARIANT : [0x0441,0x1440,0x5441],//scd40,scd41,scd43

  POWER_DOWN : [0x36,0xe0],
  WAKE_UP : [0x36,0xf6],

  GET_CALIBRATION_INITIAL_PERIOD : [0x23,0x40],
  SET_CALIBRATION_INITIAL_PERIOD : 0x2445,
  GET_CALIBRATION_STANDARD_PERIOD : [0x23,0x4b],
  SET_CALIBRATION_STANDARD_PERIOD : 0x244e
};

function SCD40(options,read,simpleRead,write) {
  this.w = write;
  this.r = read;
  this.sr = simpleRead;
  this.getValue = function(ref) {
    resp = this.r(ref,3);
    v = new DataView(resp.buffer);
    return v.getInt16(0);
  };
  if ( ! C.CHIP_VARIANT.includes(this.getValue(C.CHIP_GET_VARIANT)) ) {
    throw new Error("SCDXX not found");
  }
  this.crc = function(data) {
    "jit";
    bytes=[data>>8,data];
    var crc=0xff;
    for (j=0;j<2;++j){
      crc ^= (bytes[j]);
      for (var i=8;i>0;i--) {
        if (crc & 0x80)  {
          crc=(crc<<1) ^ 0x31;
        } else {
          crc=(crc<<1);
        }
      }
    }
    return crc;
  };
  this.updateValue = function(command,data) {
    arr = Uint8Array(5);
    update = new DataView(arr.buffer);
    update.setInt16(0,command);
    update.setInt16(2,data);
    update.setInt8(4,this.crc(data));
    this.w(arr);
  };
  this.delay_ms = function(d) {
    var t = getTime()+d/1000; while(getTime()<t);
  };
}

SCD40.prototype.start_periodic_measurement = function() {this.w(C.START_MEASUREMENTS);};
SCD40.prototype.start_low_power_periodic_measurement = function() {this.w(C.START_LOW_POWER_MEASUREMENTS);};
SCD40.prototype.get_data_ready_status = function() {return this.getValue(C.IS_DATA_READY) != 0;};
SCD40.prototype.stop_periodic_measurement = function() {this.w(C.STOP_MEASUREMENTS);};
SCD40.prototype.measure_single_shot = function(ref) {resp = this.w(C.REQUEST_SINGLE_LOOKUP);};
SCD40.prototype.measure_single_shot_rht_only = function(ref) {resp = this.w(C.REQUEST_SINGLE_LOOKUP_RHT);};
SCD40.prototype.read_measurement = function() {
  resp = this.r(C.READ_DATA,9);
  a = new DataView(resp.buffer);
  return {
     ppm : a.getUint16(0),
     t : -45+175*(a.getUint16(3))/65535,
     rh : 100*(a.getUint16(6))/65535
  };
};

SCD40.prototype.perform_forced_recalibration = function(target) {
  this.updateValue(C.PERFORM_FORCED_RECALIBARTION,target);
  this.delay_ms(400);
  return this.sr(3).toString();
};
SCD40.prototype.get_automatic_self_calibration_enabled = function() {
  return this.getValue(C.GET_AUTOMATIC_SELF_CALIBRATION_ENABLED);
};
SCD40.prototype.set_automatic_self_calibration_enabled = function(enabled) {
  this.updateValue(C.SET_AUTOMATIC_SELF_CALIBRATION_ENABLED,enabled);
};
SCD40.prototype.get_automatic_self_calibration_target = function() {
  return this.getValue(C.GET_AUTOMATIC_SELF_CALIBRATION_TARGET);
};
SCD40.prototype.set_automatic_self_calibration_target = function(target) {
  this.updateValue(C.SET_AUTOMATIC_SELF_CALIBRATION_TARGET,target);
};

SCD40.prototype.persist_settings = function() {this.w(C.PERSIST_SETTINGS);};
SCD40.prototype.get_serial_number = function() {return this.getValue(C.GET_SERIAL_NUMBER,9);};

SCD40.prototype.get_sensor_variant = function() {return this.getValue(C.CHIP_GET_VARIANT);};
SCD40.prototype.perform_self_test = function() {this.w(C.PERfORM_SELF_TEST);};
SCD40.prototype.perform_factory_reset = function() {this.w(C.FACTORY_RESET);};
SCD40.prototype.reinit = function() {this.w(C.RE_INIT);};

SCD40.prototype.get_temperature_offset = function() {
  return this.getValue(C.GET_TEMP_OFFSET)*(175/(Math.pow(2,16)-1));
};

SCD40.prototype.set_temperature_offset = function(offset) {
  newOffset = offset * ((Math.pow(2,16)-1)/175);
  this.updateValue(C.SET_TEMP_OFFSET,newOffset);
};

SCD40.prototype.get_sensor_altitude  = function() { return this.getValue(C.GET_SENSOR_ALTITUDE);};
SCD40.prototype.set_sensor_altitude  = function(val) { return this.updateValue(C.SET_SENSOR_ALTITUDE,val);};
SCD40.prototype.get_ambient_pressure = function() { return this.getValue(C.GET_AMBIENT_PRESSURE);};
SCD40.prototype.set_ambient_pressure = function(val) { return this.updateValue(C.SET_AMBIENT_PRESSURE,val);};

SCD40.prototype.power_down = function() {this.w(C.POWER_DOWN);};
SCD40.prototype.wake_up = function() {this.w(C.WAKE_UP);};

SCD40.prototype.get_automatic_self_calibration_initial_period = function() {
  return this.getValue(C.GET_CALIBRATION_INITIAL_PERIOD);
};
SCD40.prototype.set_automatic_self_calibration_initial_period = function(period) {
  this.updateValue(C.SET_CALIBRATION_INITIAL_PERIOD,period);
};
SCD40.prototype.get_automatic_self_calibration_standard_period = function() {
  return this.getValue(C.GET_CALIBRATION_STANDARD_PERIOD);
};
SCD40.prototype.set_automatic_self_calibration_standard_period = function(period) {
  this.updateValue(C.SET_CALIBRATION_STANDARD_PERIOD,period);
};

/* 
The following code will calculate the crc-8 checksum used for the chip using C code. The JavaScript version above runs in around 4.5 seconds, where as the code below takes around 1.2ms. If performance is an issue this can be used instead.

var crc = E.compiledC(`
//int gencrc(int)

int gencrc(int val) {
    unsigned char data[2] = {val>>8,val};
    int i,j;
    unsigned char crc = 0xFF;
    for (i = 0; i < 2; ++i) {
        crc ^= (data[i]);
        for (j = 8; j > 0; --j) {
            if (crc & 0x80)
                crc = (crc << 1) ^ 0x31;
            else
                crc = (crc << 1);
        }
    }
    return crc;
}
`);

*/

exports.connectI2C = function(i2c, options) {
  var a = (options&&options.addr)||C.I2C_ADDR;
  return (new SCD40(options, function(reg, len) { // read
    i2c.writeTo(a, reg);
//    var t = getTime()+1; while(getTime()<t);
    return i2c.readFrom(a, len);
  }, function(len) { // simpleread
    return i2c.readFrom(a, len);
  }, function(data) { // write
    i2c.writeTo(a, data);
  }));
};


