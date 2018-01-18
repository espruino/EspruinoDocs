/* Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */

var C = {
  WHO_AM_I : 0x20,
  WHO_AM_I_VALUE : 0x81,
  
  STATUS : 0x00,
  STATUS_ERROR : 0x01,
  STATUS_DATA_READY : 0x08,
  STATUS_APP_VALID : 0x10,
  STATUS_FW_MODE : 0x80,
  
  MEAS_MODE : 0x01,
  MEAS_MODE_INT_THRESH : 0x04,
  MEAS_MODE_INT_DATARDY : 0x08,
  MEAS_MODE_DRIVE_MODE_IDLE : 0x00,
	MEAS_MODE_DRIVE_MODE_1SEC : 0x10,
	MEAS_MODE_DRIVE_MODE_10SEC : 0x20,
	MEAS_MODE_DRIVE_MODE_60SEC : 0x30,
	MEAS_MODE_DRIVE_MODE_250MS : 0x40,
  
  ALG_RESULT_DATA : 0x02,
  
  SW_RESET : 0xFF,
  BOOTLOADER_APP_START : 0xF4,   
};

/* Set up the CCS811.

options = {
  int : pin, // optional - DRDY interrupt pin. If specified, 'data' event with data from 'get' will be emitted when data is ready
}
*/
function CCS811(r,w,options) {
  this.r = r; // read from a register
  this.w = w; // write to a register
  this.options = options || {};
  
  this.w(C.SW_RESET, [0x11, 0xE5, 0x72, 0x8A]); // software reset
  var ccs = this;
  setTimeout(function() {
    if (ccs.r(C.WHO_AM_I, 1)[0] != C.WHO_AM_I_VALUE)
      throw "CCS811 WHO_AM_I check failed";  
    // start bootloader
    ccs.w(C.BOOTLOADER_APP_START,[]);
    setTimeout(function() {
      if (!ccs.r(C.STATUS_FW_MODE,1)[0]&C.STATUS_FW_MODE)
        throw "CCS811 not in FW mode";
      if (ccs.options.int) {
        ccs.watch = setWatch(function() {
          ccs.emit('data', ccs.get());
        }, ccs.options.int, {edge:"falling",repeat:true});
        // DRDY IRQ, 1 sec drive
        ccs.w(C.MEAS_MODE, C.MEAS_MODE_DRIVE_MODE_1SEC | C.MEAS_MODE_INT_DATARDY);
      } else {
        // 1 sec drive
        ccs.w(C.MEAS_MODE, C.MEAS_MODE_DRIVE_MODE_1SEC);
      }
    },100);
  },100);
  
}
// Shut down the CCS811
CCS811.prototype.stop = function() {
  if (this.watch) clearWatch(this.watch);
  this.watch = undefined;
  this.w(C.MEAS_MODE, C.MEAS_MODE_DRIVE_MODE_IDLE);
};
// Returns true if data is available
CCS811.prototype.available = function() {
  return (this.r(C.STATUS, 1)[0] & C.STATUS_DATA_READY)!=0;
};

/* read the current environment settings, assuming available()==true.
   {
     eCO2 : int, // equivalent CO2, in ppm (400..8192)
     TVOC : int, // Total Volatile Organic Compounds, in ppb (0..1187)
     new : bool  // true if this is a new reading
   }
   ec02 and TVOC values are clipped to the given ranges - so for instance you'll never see a CO2 value below 400. 
*/
CCS811.prototype.get = function() {
  var isNew = (this.r(C.STATUS, 1)[0] & C.STATUS_DATA_READY)!=0;
  var d = this.r(C.ALG_RESULT_DATA,  4); // could read 8, but don't need last 4
  /* NOTE: STATUS is 5th data element, but because we've just read
  ALG_RESULT_DATA, STATUS_DATA_READY is always 0! */
	return { 
    eCO2 : (d[0]<<8)|d[1],
    TVOC : (d[2]<<8)|d[3],
    new : isNew 
  };
};

// Initialise the CCS811 module with the given I2C interface
exports.connectI2C = function(i2c,options) {  
  var addr = 0x5A;
  return new CCS811(function(reg,len) { // read
    i2c.writeTo(addr,reg);
    return i2c.readFrom(addr,len);
  }, function(reg,data) { // write
    i2c.writeTo(addr,reg,data);
  },options);
};
