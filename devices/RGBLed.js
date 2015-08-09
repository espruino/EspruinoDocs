/* Copyright (c) 2015 Michał Bartkowiak. See the LICENSE file for copying permission. */

//TODO: test initial state and color
//TODO: stop() when on/off?
//TODO: what if #000000
//TODO: setColor() turns on?


function RGBLed(pins, state, color) {
  this.pins = pins;
  this.pins.forEach(function (e) {pinMode(e, "output");});
  this.state = typeof state !== "undefined";
  this.rgbAnalog = [];
  this.setColor(typeof color === "undefined" ? "FFFFFF" : "000000");
  this.intervalId = 0;
}

RGBLed.prototype._write = function () {
  var that = this;
  this.pins.forEach(function (e, i) {
    analogWrite(e, that.state ? that.rgbAnalog[i] : 0);
  });
};

RGBLed.prototype.setColor = function (color) {
  for (var i = 0, s = -6; i < 3; i += 1, s += 2) {
    this.rgbAnalog[i] = E.clip(parseInt(color.substr(s, 2), 16), 0, 255) / 255;
  }
  this._write();
};
RGBLed.prototype.on = function () {
  this.state = true;
  this._write();
};
RGBLed.prototype.off = function () {
  this.state = false;
  this._write();
};
RGBLed.prototype.toggle = function () {
  this.state = !this.state;
  this._write();
};
RGBLed.prototype.strobe = function (ms) {
  this.stop();
  var that = this;
  this.intervalId = setInterval(function () {
    that.toggle();
  }, typeof ms === "undefined" ? 500 : ms);
};
RGBLed.prototype.stop = function () {
  try {clearInterval(this.intervalId);} catch (e) {}
};

//var led = new RGBLed([B13, B14, B15]);
