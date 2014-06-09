/* Copyright (c) 2014 Tom Gidden. See the file LICENSE for copying permission. */
/*
 * Espruino TSL2561 luminosity sensor
 *
 * Derived largely from C++ Arduino TSL2561 code, from:
 *   https://github.com/adafruit/TSL2561-Arduino-Library
 *   by K. Townsend (microBuilder.eu)
 *
 *   Currently unimplemented:
 *   -  calculateLux function
 *   -  automatic gain / integration
 *
 *   Not currently working right:
 *   -  interrupt-based operation.
 *   -  INFRARED
 *   -  402ms integration is suspect.
 *
 *   It's possibly the features listed above _do_ work, but my particular
 *   TSL2561 breakout sensor _doesn't_ work for some reason.  Or there are
 *   bugs in the original C++ code.
 */

function TSL2561(_i2c) {
    this.i2c = _i2c;
}

// All the configuration constants we should need to drive this thing
TSL2561.prototype.C = {
    FULLSPECTRUM: 0, // Infrared + Visible spectra
    INFRARED: 1,     // Infrared spectrum only
    VISIBLE: 2,      // Visible spectrum only

    LOW: 0x29,       // Address wired to GND
    FLOAT: 0x39,     // Address unwired
    HIGH: 0x49,      // Address wired to Vcc

    _13MS: 0x00,     // Integration time: 13.7ms
    _101MS: 0x01,    // Integration time: 101ms
    _402MS: 0x02,    // Integration time: 402ms

    _1X: 0x00,       // No gain
    _16X: 0x10       // 16x gain
};

/*
  // The full set of control constants.  For minification's sake, these
  // are patched in manually in the functions themselves.

  var READBIT = (0x01);
  var COMMAND_BIT = (0x80); // Must be 1
  var CLEAR_BIT = (0x40); // Clears any pending interrupt (write 1 to clear)
  var WORD_BIT = (0x20); // 1 = read/write word (rather than byte)
  var BLOCK_BIT = (0x10); // 1 = using block read/write

  var CONTROL_POWERON = (0x03);
  var CONTROL_POWEROFF = (0x00);

  var REG_CONTROL = 0x00;
  var REG_TIMING = 0x01;
  var REG_THRESHHOLDL_LOW = 0x02;
  var REG_THRESHHOLDL_HIGH = 0x03;
  var REG_THRESHHOLDH_LOW = 0x04;
  var REG_THRESHHOLDH_HIGH = 0x05;
  var REG_INTERRUPT = 0x06;
  var REG_CRC = 0x08;
  var REG_ID = 0x0A;
  var REG_CHAN0_LOW = 0x0C;
  var REG_CHAN0_HIGH = 0x0D;
  var REG_CHAN1_LOW = 0x0E;
  var REG_CHAN1_HIGH = 0x0F;
*/

// Power up and enable the sensor's data gathering process.
TSL2561.prototype.enable = function () {
    this.i2c.writeTo(this.address, [0x80, 0x03]);
    return this;
};

// Disable the sensor's data gathering process and power down.
TSL2561.prototype.disable = function () {
    this.i2c.writeTo(this.address, [0x80, 0]);
    return this;
};

// Set the integration timing for the sensor, using values from
// TSL2561.C.  Setting this to TSL2561.C._402MS
// will gather the most data (using the automatic integration, that is)
TSL2561.prototype.setTiming = function (_timing) {
    this.timing = _timing;
    this.i2c.writeTo(this.address, [0x81, this.timing | this.gain ]);
    return this;
};

// Set the gain of the sensor, to either TSL2561.C._1X (no gain)
// or TSL2561.C._16X (16x gain)
TSL2561.prototype.setGain = function (gain) {
    this.gain = gain;
    this.i2c.writeTo(this.address, [0x81, this.timing | this.gain ]);
    return this;
};

// Initialise the TSL object and send the passed initial configuration to
// the sensor.  The address should be taken from TSL2561.C.LOW, .FLOAT, or
// .HIGH.  If the ADDR pin on the sensor is left unconnected, address
// should be TSL2561.C.FLOAT. Alternatively it can be pulled high or low
// to use an alternative address.
// An Interrupt (IRQ) pin can also be specified to signal that a value is
// ready to be read.
TSL2561.prototype.init = function (address, timing, gain, irq_pin) {
    this.address = address;
    this.timing = timing;
    this.gain = gain;
    this.irq_pin = irq_pin;

    this.i2c.writeTo(this.address, [0x80, 0x3]);
    this.i2c.writeTo(this.address, [0x81, this.timing | this.gain]);

    if(irq_pin)
        this.i2c.writeTo(this.address, [0x86, 0x1]);

    this.i2c.writeTo(this.address, [0x80, 0]);

    return this;
};

/*
// Lux conversion is incomplete.  Refer to the Adafruit_TSL2561 Arduino
// module to see how this should work.

var LUX = {

LUXSCALE: (14), // Scale by 2^14
RATIOSCALE: (9), // Scale ratio by 2^9
CHSCALE: (10), // Scale channel values by 2^10
CHSCALE_TINT0: (0x7517), // 322/11 * 2^CHSCALE
CHSCALE_TINT1: (0x0FE7), // 322/81 * 2^CHSCALE

// T, FN and CL Lux conversion table
K1T: (0x0040), // 0.125 * 2^RATIO_SCALE
B1T: (0x01f2), // 0.0304 * 2^LUX_SCALE
M1T: (0x01be), // 0.0272 * 2^LUX_SCALE
K2T: (0x0080), // 0.250 * 2^RATIO_SCALE
B2T: (0x0214), // 0.0325 * 2^LUX_SCALE
M2T: (0x02d1), // 0.0440 * 2^LUX_SCALE
K3T: (0x00c0), // 0.375 * 2^RATIO_SCALE
B3T: (0x023f), // 0.0351 * 2^LUX_SCALE
M3T: (0x037b), // 0.0544 * 2^LUX_SCALE
K4T: (0x0100), // 0.50 * 2^RATIO_SCALE
B4T: (0x0270), // 0.0381 * 2^LUX_SCALE
M4T: (0x03fe), // 0.0624 * 2^LUX_SCALE
K5T: (0x0138), // 0.61 * 2^RATIO_SCALE
B5T: (0x016f), // 0.0224 * 2^LUX_SCALE
M5T: (0x01fc), // 0.0310 * 2^LUX_SCALE
K6T: (0x019a), // 0.80 * 2^RATIO_SCALE
B6T: (0x00d2), // 0.0128 * 2^LUX_SCALE
M6T: (0x00fb), // 0.0153 * 2^LUX_SCALE
K7T: (0x029a), // 1.3 * 2^RATIO_SCALE
B7T: (0x0018), // 0.00146 * 2^LUX_SCALE
M7T: (0x0012), // 0.00112 * 2^LUX_SCALE
K8T: (0x029a), // 1.3 * 2^RATIO_SCALE
B8T: (0x0000), // 0.000 * 2^LUX_SCALE
M8T: (0x0000), // 0.000 * 2^LUX_SCALE

// CS Lux conversion table
K1C: (0x0043), // 0.130 * 2^RATIO_SCALE
B1C: (0x0204), // 0.0315 * 2^LUX_SCALE
M1C: (0x01ad), // 0.0262 * 2^LUX_SCALE
K2C: (0x0085), // 0.260 * 2^RATIO_SCALE
B2C: (0x0228), // 0.0337 * 2^LUX_SCALE
M2C: (0x02c1), // 0.0430 * 2^LUX_SCALE
K3C: (0x00c8), // 0.390 * 2^RATIO_SCALE
B3C: (0x0253), // 0.0363 * 2^LUX_SCALE
M3C: (0x0363), // 0.0529 * 2^LUX_SCALE
K4C: (0x010a), // 0.520 * 2^RATIO_SCALE
B4C: (0x0282), // 0.0392 * 2^LUX_SCALE
M4C: (0x03df), // 0.0605 * 2^LUX_SCALE
K5C: (0x014d), // 0.65 * 2^RATIO_SCALE
B5C: (0x0177), // 0.0229 * 2^LUX_SCALE
M5C: (0x01dd), // 0.0291 * 2^LUX_SCALE
K6C: (0x019a), // 0.80 * 2^RATIO_SCALE
B6C: (0x0101), // 0.0157 * 2^LUX_SCALE
M6C: (0x0127), // 0.0180 * 2^LUX_SCALE
K7C: (0x029a), // 1.3 * 2^RATIO_SCALE
B7C: (0x0037), // 0.00338 * 2^LUX_SCALE
M7C: (0x002b), // 0.00260 * 2^LUX_SCALE
K8C: (0x029a), // 1.3 * 2^RATIO_SCALE
B8C: (0x0000), // 0.000 * 2^LUX_SCALE
M8C: (0x0000) // 0.000 * 2^LUX_SCALE
};


// XXX: Incomplete, untested and almost certainly broken.
//
// This function should use the calibration tables to convert the
// device-specific light-level values into Lux units.  The code is
// available in the Arduino library, but just hasn't been really used yet.
TSL2561.prototype.calculateLux = function (ch0, ch1) {
    var scale;

    switch (this.timing) {
    case self.C._13MS:  scale = LUX.CHSCALE_TINT0; break;
    case self.C._101MS: scale = LUX.CHSCALE_TINT1; break;
    default:            scale = 1 << LUX.CHSCALE; break;
    }

    if(self.gain != self.C._16X)
        scale <<= 4;

    ch0 = (ch0 * scale) >> LUX.CHSCALE;
    ch1 = (ch1 * scale) >> LUX.CHSCALE;

    var ratio1;
    if (ch0 > 0)
        ratio1 = (ch1 << (LUX.RATIOSCALE+1)) / ch0;
    else
        ratio1 = 0;

    var ratio = (ratio1 + 1) >> 1;

    var b, m;

    if(self.cs_package) {
        if ((ratio >= 0) && (ratio <= LUX.K1C))
        {b=LUX.B1C; m=LUX.M1C;}
        else if (ratio <= LUX.K2C)
        {b=LUX.B2C; m=LUX.M2C;}
        else if (ratio <= LUX.K3C)
        {b=LUX.B3C; m=LUX.M3C;}
        else if (ratio <= LUX.K4C)
        {b=LUX.B4C; m=LUX.M4C;}
        else if (ratio <= LUX.K5C)
        {b=LUX.B5C; m=LUX.M5C;}
        else if (ratio <= LUX.K6C)
        {b=LUX.B6C; m=LUX.M6C;}
        else if (ratio <= LUX.K7C)
        {b=LUX.B7C; m=LUX.M7C;}
        else if (ratio > LUX.K8C)
        {b=LUX.B8C; m=LUX.M8C;}
    }
    else {
        if ((ratio >= 0) && (ratio <= LUX.K1T))
        {b=LUX.B1T; m=LUX.M1T;}
        else if (ratio <= LUX.K2T)
        {b=LUX.B2T; m=LUX.M2T;}
        else if (ratio <= LUX.K3T)
        {b=LUX.B3T; m=LUX.M3T;}
        else if (ratio <= LUX.K4T)
        {b=LUX.B4T; m=LUX.M4T;}
        else if (ratio <= LUX.K5T)
        {b=LUX.B5T; m=LUX.M5T;}
        else if (ratio <= LUX.K6T)
        {b=LUX.B6T; m=LUX.M6T;}
        else if (ratio <= LUX.K7T)
        {b=LUX.B7T; m=LUX.M7T;}
        else if (ratio > LUX.K8T)
        {b=LUX.B8T; m=LUX.M8T;}
    }


    var temp = ((channel0 * b) - (channel1 * m));

    if (temp < 0) temp = 0;

    temp += (1 << (LUX.LUXSCALE-1));

    return temp >> LUX.LUXSCALE;
};
*/



// getLuminosity is asynchronous, as after triggering, the sensor
// needs a short time to integrate the data together before it can be
// read.  As a result, the sensor is initialised and a setTimeout is
// set to the readCallback function.  The readCallback function should
// then collect the data and pass it to 'callback'.
var _get = function (self, ch) {
    self.i2c.writeTo(self.address, 0x80 | 0x20 | (ch === 1 ? 0x0e : 0x0c));
    var buf = self.i2c.readFrom(self.address, 2);
    if (self.debug) print (buf);
    return (buf[1]<<8) | buf[0];
};

var _read = function (self, ch, cb) {
    var x1, x0;

    if(ch != self.C.FULLSPECTRUM) {
        x1 = _get(self, 1);
    }

    if(ch != self.C.INFRARED) {
        x0 = _get(self, 0);
    }

    if(undefined !== self.irq_pin)
        self.i2c.writeTo(self.address, [0xc0, 0x1]);

    self.disable();

    self._rto = false;

    switch (ch) {
    case self.C.INFRARED:
        cb(x1/_read.scale);
        return;

    case self.C.VISIBLE:
        cb((x0 - x1)/_read.scale);
        return;

    default:
        cb(x0/_read.scale);
        return;
    }
};

TSL2561.prototype.getLuminosity = function(ch, cb) {
    var self = this;

    if(this._rto) {
        console.log("TSL2561 COLLISION");
        setTimeout(function () { cb(null); }, 0);
        this._rto = false;
        return this;
    }

    this._rto = true;

    this.enable();

    var t;

    switch (this.timing) {
    case this.C._13MS:
        _read.scale = 0.034;
        t = 14;
        break;

    case this.C._101MS:
        _read.scale = 0.252;
        t = 102;
        break;

    default:
        _read.scale = 1;
        t = 403;
    }

    if(undefined !== this.irq_pin) {
        this._rto = setWatch(function () { _read(self, ch, cb); },
                             this.irq_pin, {repeat:false, edge:'rising'});
    }
    else {
        this._rto = setTimeout(function () { _read(self, ch, cb); }, t);
    }

    return this;
};

exports.connect = function (_i2c) {
    return new TSL2561(_i2c);
};
