/* Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
var R = {
  MANUFACTURERID     : 0x0F,  // R   : Manufacturer ID
  PARTID             : 0x10,  // R   : PART ID
  RESET              : 0x40,  // R/W : RESET
  MEAS_CTRL1         : 0x41,  // R/W : Measurement Control1
  MEAS_CTRL2         : 0x42,  // R/W : Measurement Control2
  MEAS_CTRL3         : 0x43,  // R/W : Measurement Control3
  MEAS_CTRL4_LSBS    : 0x44,  // R/W : Lower byte of Measurement Control4
  MEAS_CTRL4_MSBS    : 0x45,  // R/W : Upper byte of Measurement Control4
  MEAS_CTRL5         : 0x46,  // R/W : Measurement Control5
  MEAS_START         : 0x47,  // R/W : Measurement Start
  MEAS_SYNC          : 0x48,  // W   : Measurement Synchronization
  FIFO_LEV           : 0x4B,  // R   : FIFO Level
  FIFO_DATA0_LSBS    : 0x4C,  // R   : Lower byte of FIFO Data0
  FIFO_DATA0_MSBS    : 0x4D,  // R   : Upper byte of FIFO Data0
  FIFO_DATA1_LSBS    : 0x4E,  // R   : Lower byte of FIFO Data1
  FIFO_DATA1_MSBS    : 0x4F,  // R   : Upper byte of FIFO Data1
  IRDATA_LEDOFF_LSBS : 0x50,  // R   : Lower byte of IRDATA LEDOFF
  IRDATA_LEDOFF_MSBS : 0x51,  // R   : Upper byte of IRDATA LEDOFF
  IRDATA_LEDON_LSBS  : 0x52,  // R   : Lower byte of IRDATA LEDON
  IRDATA_LEDON_MSBS  : 0x53,  // R   : Upper byte of IRDATA LEDON
  GDATA_LEDOFF_LSBS  : 0x54,  // R   : Lower byte of GDATA LEDOFF
  GDATA_LEDOFF_MSBS  : 0x55,  // R   : Upper byte of GDATA LEDOFF
  GDATA_LEDON_LSBS   : 0x56,  // R   : Lower byte of GDATA LEDON
  GDATA_LEDON_MSBS   : 0x57,  // R   : Upper byte of GDATA LEDON
  INT_CLEAR          : 0x58,  // R   : Interrupt Clear
}

function BH1792(options,r,w) {
  this.r = r;
  this.w = w;
  this.options = options;
  if (r(R.MANUFACTURERID)!=0xE0) throw new Error("Expected Manufacturer ID 0xE0");
  if (r(R.PARTID)!=0x0E) throw new Error("Expected Part ID 0x0E");
  w(R.RESET, 0x80); // force software reset
}

/** Get a default set of options that can be modified */
BH1792.prototype.getDefaultOptions = function() {
  return {
    sel_adc : 0, // 0=green+ir, 1=ir
    msr : 0, // 0=32Hz, 7=single measurement
    led_en : 0, // 3 bits (led1,led1,led2). 0=pulsed
    led_cur1 : 1, // in milliamps
    led_cur2 : 1, // in milliamps
    ir_th : 0xFFFC, // 16 bits
    int_sel : 1  // FIFO watermark interrupt
  };
};

/** Start measurements */
BH1792.prototype.start = function(o) {
  var t=this;
  t.w(R.MEAS_CTRL1, [
    0b10000000 | (o.sel_adc<<4) | o.msr,// CTRL1 - RDY,green+ir,
    ((o.led_en>>1)<<6) | o.led_cur1,
    ((o.led_en&1)<<7) | o.led_cur2,
    o.ir_th,
    o.ir_th>>8,
    o.int_sel,
    1 // MEAS_START
  ]);
  t.w(R.MEAS_SYNC, 1);
  if (t.syncInterval) clearInterval(t.syncInterval);
  if (t.irqWatch) clearWatch(t.irqWatch);
  t.irqWatch = undefined;
  if (t.options.irq) {
    pinMode(t.options.irq, "input_pullup");
    t.irqWatch = setWatch(function() {
      var d = h.getFIFO();
      if (t.options.callback)
        t.options.callback(d);
    }, t.options.irq, {edge:-1, repeat:true});
    t.syncInterval = setInterval(function() {
      t.w(R.MEAS_SYNC, 1);
    },1000);
  } else {
    t.syncInterval = setInterval(function() {
      t.w(R.MEAS_SYNC, 1);
      var d = h.getFIFO();
      if (t.options.callback)
        t.options.callback(d);
    },1000);
  }
};

/** Stop measurements */
BH1792.prototype.stop = function() {
  this.w(R.RESET, 0x80); // force software reset
  if (this.syncInterval) {
    clearInterval(this.syncInterval);
    this.syncInterval = undefined;
  }
  if (this.irqWatch) {
    clearWatch(this.irqWatch);
    this.irqWatch = undefined;
  }
};

/** Reads from the FIFO, return only data for green with light on.
This is used internally */
BH1792.prototype.getFIFO = function() {
  var l = h.r(R.FIFO_LEV);
  if (!l) return;
  var dat = new Uint16Array(l);
  for (var i=0;i<dat.length;i++) {
    var d = new Uint16Array(h.r(R.FIFO_DATA0_LSBS,4).buffer);
    // d=[led_off, led_on]
    dat[i] = d[1];
  }
  return dat;
};

/** Connect to BH1792 and return an instance of BH1792.
  options = {
  addr,      // I2C address (optional)
  irq,       // irq pin (optional)
  callback   // data callback
} */
exports.connect = function(i2c, options) {
  options=options||{};
  var a = options.addr||0x5B;
  return new BH1792(options, function(r,n) {
    i2c.writeTo(a,r);
    return i2c.readFrom(a,n||1);
  }, function(r,d) {
    i2c.writeTo(a,r,d);
  });
};
