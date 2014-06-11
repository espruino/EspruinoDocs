/* Copyright (c) 2014 Tom Gidden. See the file LICENSE for copying permission. */
/*
 * Espruino HTU21D humidity and temperature sensor
 *
 * Derived largely from C++ Arduino HTU21D code, from:
 *   https://github.com/sparkfun/HTU21D_Breakout
 *   by: Nathan Seidle, SparkFun Electronics
 *
 *   Currently unimplemented:
 *   -  HOLD mode
 *   -  User register
 *   -  CRC check
 *
 *   Not currently working right:
 *   -  Reading humidity and temperature at the same time causes I2C timing issues.
 *
 */

function HTU21D(_i2c, _address) {
    this.i2c = _i2c;

    if (address)
        this.address = _address;
    else
        this.address = 0x40;
}

HTU21D.prototype.getTemperature = function(cb) {
    var self = this;

    if(self._tto) {
        console.log("HTU21D COLLISION");
        setTimeout(function () { cb(null); }, 0);
        self._tto = false;
        return self;
    }

    self._tto = true;

    self.i2c.writeTo(self.address, [0xf3]);

    self._tto = setTimeout(function () {
        self._tto = false;
        var d = self.i2c.readFrom(self.address, 3);
        var raw = ((d[0]<<8) | d[1]) & 0xfffc;
        cb(-46.85 + (175.72 * raw / 65536));
    }, 100);

    return self;
};

HTU21D.prototype.getHumidity = function(cb) {
    var self = this;

    if(self._hto) {
        console.log("HTU21D COLLISION");
        setTimeout(function () { cb(null); }, 0);
        self._hto = false;
        return self;
    }

    self._hto = true;

    self.i2c.writeTo(self.address, [0xf5]);

    self._hto = setTimeout(function () {
        self._hto = false;
        var d = self.i2c.readFrom(self.address, 3);
        var raw = ((d[0]<<8) | d[1]) & 0xfffc;
        cb(-6 + (125 * raw / 65536));
    }, 100);

    return self;
};

exports.connect = function (_i2c) {
    return new HTU21D(_i2c);
};
