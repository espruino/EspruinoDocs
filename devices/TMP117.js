/* Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
function TMP117(options,r,w) {
  this.r = r;
  this.w = w;
  this.busy = false;
  // this.r(0x0f).toString(16)// WHOAMI - 0x1116? should be 0x0117
  // set to one-shot mode
  this.w(1, 0x0e20);
}

/** starts a one-shot mode and calls callback with the result, usually ~0.2 sec later */
TMP117.prototype.getTemp = function(callback) {
  var t = this;
  if (t.busy) throw new Error("Conversion in progress");
  t.w(1, 0x0e20);
  t.busy = true;
  var i = setInterval(function() {
    if (!(t.r(1)&0x2000)) return;
    clearInterval(i);
    t.busy = false;
    callback(t.r(0)*0.0078125);
  }, 200);
};

/** Connect to TMP117 and return an instance of TMP117.
  options = { addr } */
exports.connect = function(i2c, options) {
  options=options||{};
  var a = options.addr||0x48;
  return new TMP117(options, function(r) {
    i2c.writeTo(a,r);
    return (new DataView(i2c.readFrom(a,2).buffer)).getUint16(0,0);
  }, function(r,d) {
    i2c.writeTo(a,r,d>>8,d);
  });
}

