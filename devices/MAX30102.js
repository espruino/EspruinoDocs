/* Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Module for the MAX30102 heart rate monitor

*/
var R = {
  INTR_STATUS_1 : 0x00,
  INTR_STATUS_2 : 0x01,
  INTR_ENABLE_1 : 0x02,
  INTR_ENABLE_2 : 0x03,
  FIFO_WR_PTR : 0x04,
  OVF_COUNTER : 0x05,
  FIFO_RD_PTR : 0x06,
  FIFO_DATA : 0x07,
  FIFO_CONFIG : 0x08,
  MODE_CONFIG : 0x09,
  SPO2_CONFIG : 0x0A,
  LED1_PA : 0x0C,
  LED2_PA : 0x0D,
  PILOT_PA : 0x10,
  MULTI_LED_CTRL1 : 0x11,
  MULTI_LED_CTRL2 : 0x12,
  TEMP_INTR : 0x1F,
  TEMP_FRAC : 0x20,
  TEMP_CONFIG : 0x21,
  PROX_INT_THRESH : 0x30,
  REV_ID : 0xFE,
  PART_ID : 0xFF
};

function MAX30102(options,r,w) {
  this.r = r;
  this.w = w;

  if (r(R.PART_ID,1)!=0x15) throw new Error("WHO_AM_I failed");
}

/// Start the heart rate monitor
MAX30102.prototype.init = function() {
  var w=this.w;
  w(R.MODE_CONFIG,0x40); // reset all
  w(R.INTR_ENABLE_1,0xc0); // INTR setting
  w(R.INTR_ENABLE_2,0x00);
  w(R.FIFO_WR_PTR,0x00);  //FIFO_WR_PTR[4:0]
  w(R.OVF_COUNTER,0x00);  //OVF_COUNTER[4:0]
  w(R.FIFO_RD_PTR,0x00);  //FIFO_RD_PTR[4:0]
  w(R.FIFO_CONFIG,0b10001111);  //sample avg = 4, fifo rollover=false, fifo almost full = 17
  w(R.MODE_CONFIG,0x03);   //0x02 for Red only, 0x03 for SpO2 mode 0x07 multimode LED
  w(R.SPO2_CONFIG,0b00101111);  // SPO2_ADC range = 4096nA, SPO2 sample rate (400 Hz), LED pulseWidth (411uS)
  w(R.LED1_PA,0x3f);   //Choose power for for LED1
  w(R.LED2_PA,0x3f);   // Choose power for for LED2
  w(R.PILOT_PA,0x3f);   // Choose power for for Pilot LED (?)
}

/// Stop the heart rate monitor
MAX30102.prototype.kill = function() {
  this.w = this.w(R.MODE_CONFIG,0x40);
}

/// read one set of FIFO data, return {red,ir}
MAX30102.prototype.readFIFO = function() {
  var d = this.r(R.FIFO_DATA,6);
  return {
    red : (d[0]<<16)|(d[1]<<8)|d[2],
    ir : (d[3]<<16)|(d[4]<<8)|d[5]
  };
}

/// Read all the currently available FIFO data and return it raw
MAX30102.prototype.readFIFORaw = function() {
  var fifo = this.r(R.FIFO_WR_PTR,3); // wr,overflow,rd
  var s = fifo[0]-fifo[2];
  if (s<=0) s+=32;
  if (fifo[1]) s=32; //overflowed
  var result = [];
  return this.r(R.FIFO_DATA,6*s);
}

/// Decode an array of raw FIFO data into red&ir arrays (Uint32Array is preferable)
MAX30102.prototype.decodeRawData = function(d, red, ir) {
  var l = d.length;
  for (var i=0,n=0;i<l;i+=6,n++) {
    red[n] = (d[i+0]<<16)|(d[i+1]<<8)|d[i+2];
    ir[n] = (d[i+3]<<16)|(d[i+4]<<8)|d[i+5];
  }
}

exports.connect = function(i2c, options) {
  options = options||{};
  var addr = options.addr || 87;
  return new MAX30102(options, function(a,n) { // read
    i2c.writeTo(87,a);
    return i2c.readFrom(87,n);
  }, function (a,d) { // write
    i2c.writeTo(87,[a,d]);
  });
};
