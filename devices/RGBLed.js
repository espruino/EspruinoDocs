/* Copyright (c) 2015 bartmichu. See the file LICENSE for copying permission. */
function RGBLed(pins, state, color) {
  this.pins = pins;
  this.inverted=false;
  this.pins.forEach(function (e) {pinMode(e, "output");});
  this.state = typeof state === "undefined" ? true : !!state;
  this.rgbAnalog = [];
  this.setColor(typeof color === "undefined" ? "FFFFFF" : color);
  this.intervalId = 0;
  this._write(true);
}
RGBLed.prototype._write = function (stop) {
  if (stop) {this._stop();}
  var that = this;
  this.pins.forEach(function (e, i) {
    analogWrite(e, that.state ? that.rgbAnalog[i] : 0);
  });
};
RGBLed.prototype._stop = function () {
  try {clearInterval(this.intervalId);} catch (e) {}
};
RGBLed.prototype.setColor = function (color) {
  for (var i = 0, s = -6; i < 3; i += 1, s += 2) {
    if(!this.inverted){  
      this.rgbAnalog[i] = E.clip(parseInt(color.substr(s, 2), 16), 0, 255) / 255;
    }
    else {
      this.rgbAnalog[i] = 1-(E.clip(parseInt(color.substr(s, 2), 16), 0, 255) / 255);
    }
  }
  this._write();
};
RGBLed.prototype.on = function () {
  this.state = true;
  this._write(true);
};
RGBLed.prototype.off = function () {
  this.state = false;
  this._write(true);
};
RGBLed.prototype.toggle = function () {
  this.state = !this.state;
  this._write();
};
RGBLed.prototype.invert = function (x) {
  this.inverted=x;
};
RGBLed.prototype.getState = function () {
  return this.state;
};
RGBLed.prototype.strobe = function (ms) {
  this._stop();
  var that = this;
  this.intervalId = setInterval(function () {
    that.toggle();
  }, typeof ms === "undefined" ? 100 : ms);
};

exports.connect = function (pins, state, color) {return new RGBLed(pins, state, color);};
