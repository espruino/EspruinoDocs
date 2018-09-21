/* Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */


exports.connect = function(uart, rxPin) {
  var sbus = {
    channels : new Uint16Array(18),
    frameLoss : false,
    failSafe : false
  };
  uart.setup(100000, {rx:rxPin, parity:"e",stopbits:2});
  uart.removeAllListeners();
  var data = "";
  uart.on('data', function(d) {
    data += d;
    var idx = data.indexOf("\x00\x0f");
    while (idx >= 0) {
      if (idx==23) {
        var l = E.toUint8Array(data.substr(0,23));
        var status = l[22];
        E.mapInPlace(l,sbus.channels,undefined,-11);
        sbus.channels.set([status&128?2047:0,status&64?2047:0],16);
        sbus.frameLoss = !!(status&32);
        sbus.failSafe = !!(status&16);
        sbus.emit('frame', sbus);
      }
      data = data.substr(idx+2);
      idx = data.indexOf("\x00\x0f");
    }
  });
  return sbus;
};
