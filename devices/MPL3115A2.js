/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Usage:

```
var i2c = I2C3;
i2c.setup({sda:B4,scl:A8});
var mpl = new MPL3115A2(i2c);
mpl.getPressure(function(x) {
  console.log("Pressure "+x+" pa");
  mpl.getAltitude(function(x) {
    console.log("Altitude "+x+" m");
      mpl.getTemperature(function(x) {
      console.log("Temperature "+x+" C");
    });
  });
});
```
*/
var C = {
  ADDRESS : 0x60
};
var REG = {  
  STATUS        :  0x00,
  PRESSURE_MSB  :  0x01,
  PRESSURE_CSB  :  0x02,
  PRESSURE_LSB  :  0x03,
  TEMP_MSB      :  0x04,
  TEMP_LSB      :  0x05,
  DR_STATUS     :  0x06,
  P_DELTA_MSB   :  0x07,
  P_DELTA_CSB   :  0x08,
  P_DELTA_LSB   :  0x09,
  T_DELTA_MSB   :  0x0A,
  T_DELTA_LSB   :  0x0B,
  WHOAMI        :  0x0C,
  PT_DATA_CFG   :  0x13,
  CTRL_REG1     :  0x26,
  CTRL_REG2     :  0x27,
  CTRL_REG3     :  0x28,
  CTRL_REG4     :  0x29,
  CTRL_REG5     :  0x2A
};

var F = {
  STATUS_TDR        :  0x02,
  STATUS_PDR        :  0x04,
  STATUS_PTDR       :  0x08,  
  PT_DATA_CFG_TDEFE : 0x01,
  PT_DATA_CFG_PDEFE : 0x02,
  PT_DATA_CFG_DREM  : 0x04,
  CTRL_REG1_SBYB    : 0x01,
  CTRL_REG1_OST     : 0x02,
  CTRL_REG1_RST     : 0x04,
  CTRL_REG1_OS1     : 0x00,
  CTRL_REG1_OS2     : 0x08,
  CTRL_REG1_OS4     : 0x10,
  CTRL_REG1_OS8     : 0x18,
  CTRL_REG1_OS16    : 0x20,
  CTRL_REG1_OS32    : 0x28,
  CTRL_REG1_OS64    : 0x30,
  CTRL_REG1_OS128   : 0x38,
  CTRL_REG1_RAW     : 0x40,
  CTRL_REG1_ALT     : 0x80,
  CTRL_REG1_BAR     : 0x00
};

function MPL3115A2(i2c) {
  this.i2c = i2c;
  if (this.r(REG.WHOAMI,1)[0]!=196)
    throw new Error("MPL3115A2 'WHOAMI' request failed");
  this.w(REG.CTRL_REG1,
    F.CTRL_REG1_SBYB |
    F.CTRL_REG1_OS128 |
    F.CTRL_REG1_ALT);
  this.w(REG.PT_DATA_CFG, 
    F.PT_DATA_CFG_TDEFE |
    F.PT_DATA_CFG_PDEFE |
    F.PT_DATA_CFG_DREM);
  this.busy = 0;
}

// Internal function: read register
MPL3115A2.prototype.r = function(addr, cnt) {
  this.i2c.writeTo({address:C.ADDRESS, stop:false}, addr);
  return this.i2c.readFrom(C.ADDRESS, cnt);
};
// Internal function: write register
MPL3115A2.prototype.w = function(addr, data) {
  this.i2c.writeTo(C.ADDRESS, addr, data);
};

// pressure in Pascals (not kPa)
MPL3115A2.prototype.getPressure = function(callback) {
  if (this.busy) throw new "MPL3115A2 is busy";
  this.w(REG.CTRL_REG1, 
    F.CTRL_REG1_SBYB |
    F.CTRL_REG1_OS128 |
    F.CTRL_REG1_BAR);

  this.busy = setInterval(function() {
    if (this.r(REG.STATUS,1)[0] & F.STATUS_PDR) {
      var d = this.r(REG.PRESSURE_MSB, 3);
      var pressure = (d[0]<<12)|(d[1]<<4)|(d[2]>>4);
      clearInterval(this.busy);
      this.busy = 0;
      callback(pressure / 4);
    }
  }.bind(this), 10);
};

// get altitude in m above sea level
MPL3115A2.prototype.getAltitude = function(callback) {
  if (this.busy) throw new "MPL3115A2 is busy";
  this.w(REG.CTRL_REG1,
    F.CTRL_REG1_SBYB |
    F.CTRL_REG1_OS128 |
    F.CTRL_REG1_ALT);

  this.busy = setInterval(function() {
    if (this.r(REG.STATUS,1)[0] & F.STATUS_PDR) {
      var d = this.r(REG.PRESSURE_MSB, 3);
      var alt = (d[0]<<12)|(d[1]<<4)|(d[2]>>4);
      if (alt&0x800000) alt-=0x1000000; // negative?
      clearInterval(this.busy);
      this.busy = 0;
      callback(alt/16);
    }
  }.bind(this), 10);
};


// temperature in centigrade
MPL3115A2.prototype.getTemperature = function(callback) {
  if (this.busy) throw new "MPL3115A2 is busy";
  this.busy = setInterval(function() {
    if (this.r(REG.STATUS,1)[0] & F.STATUS_TDR) {
      var d = this.r(REG.TEMP_MSB, 2);
      var t = (d[0]<<4)|(d[1]>>4);
      clearInterval(this.busy);
      this.busy = 0;
      callback(t/16);
    }
  }.bind(this), 10);
};

exports.connect = function(i2c) { return new MPL3115A2(i2c); }
