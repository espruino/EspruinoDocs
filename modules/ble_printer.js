/* Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
exports.print = function(device, text, callback) {
  return device.gatt.connect().then(function(d) {
    device = d;
    return d.getPrimaryService("000018f0-0000-1000-8000-00805f9b34fb");
  }).then(function(s) {
    return s.getCharacteristic("00002af1-0000-1000-8000-00805f9b34fb");
  }).then(function(c) {
    function sender(resolve, reject) {
      if (text.length) {
        c.writeValue(text.substr(0,20)).then(function() {
          sender(resolve, reject);
        }).catch(reject);
        text = text.substr(20);
      } else
        resolve();
    }
    return new Promise(sender);
  }).then(function() {
    device.disconnect();
    if (callback) callback();
  });
};

exports.getGraphics = function(g) {
  var d = new Uint8Array(8+g.buffer.length+1);
  d[0] = 29;  // Print raster bitmap
  d[1] = 118; // Print raster bitmap
  d[2] = 48; // Print raster bitmap
  d[3] = 0;  // Normal 203.2 DPI
  d[4] = g.getWidth()>>3;
  d[5] = 0;
  d[6] = g.getHeight()%255;
  d[7] = g.getHeight()>>8;
  d.set(new Uint8Array(g.buffer),8);
  d[d.length-1] = 10; // newline
  return E.toString(d);
};
