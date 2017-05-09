/* Copyright (c) 2017 Standa Opichal, Gordon Williams. See the file LICENSE for copying permission. */
/*
  Module for the MPR121 12-Channel Capacitive Sensor (I2C)

  Based on the http://sonnycruz.blogspot.cz/2014/07/espruino.html code snippet
  and other available libraries https://github.com/adafruit?q=MPR121 libraries
```
I2C1.setup({scl:B6,sda:B7});

function ready() {
    setTimeout(function() {
        var keys = mpr.touched();
        console.log("Touched: " + keys);
    }, 200);
}

var mpr = require("MPR121").connect(I2C1, ready);
// or
var mpr = require("MPR121").connect(I2C1, ready, { address: 0x5B });

```

Default address is 0x5A, if tied to 3.3V its 0x5B
If tied to SDA its 0x5C and if SCL then 0x5D
*/
exports.connect = function(i2c, callback, options) {
  options = options || {};

  let addr = options.address || 0x5A; // default address

  let MPR = {
    read: (count) => i2c.readFrom(addr, count),
    write: (data) => i2c.writeTo(addr, data),

    touched: function() {
      i2c.writeTo(addr, 0x00);
      var data = i2c.readFrom(addr, 2);
      return (data[1] << 8) || data[0];
    },

    setThresholds: function(touch, release) {
      for (i=0; i<24; i+=2) {
        i2c.writeTo(addr, 0x41+i, touch);
        i2c.writeTo(addr, 0x42+i, release);
      }
    }
  };

  // disable electrodes
  i2c.writeTo(addr, [0x5E,0x00]);

  i2c.writeTo(addr, [0x2B,0x01]);
  i2c.writeTo(addr, [0x2C,0x01]);
  i2c.writeTo(addr, [0x2D,0x00]);
  i2c.writeTo(addr, [0x2E,0x00]);

  i2c.writeTo(addr, [0x2F,0x01]);
  i2c.writeTo(addr, [0x30,0x01]);
  i2c.writeTo(addr, [0x31,0xFF]);
  i2c.writeTo(addr, [0x32,0x02]);

  // touch, release thresholds
  MPR.setThresholds(15, 8);

  // 0x10: 16uA charge current
  // 0x20: 32uA charge current (default)
  i2c.writeTo(addr, [0x5C, options.config1 || 0x20]);
  // 0x20: 0.5us encoding, 1ms period
  // 0x3A: 0.5us encoding, 18 samples, 4ms period (default)
  i2c.writeTo(addr, [0x5D, options.config2 || 0x20]);

  // enable all electrodes
  i2c.writeTo(addr, [0x5E,0x8F]);

  if (callback) callback(MPR);
  return MPR;
};

