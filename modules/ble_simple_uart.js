/* Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
NRF.requestDevice({ filters: [{ namePrefix: 'Puck.js' }] }).then(function(device) {
  exports.write(device, "digitalPulse(LED3,1,1000)\n", function() { print('Done!'); });
});
*/
exports.write = function(device, text, callback) {
  var device;
  return device.gatt.connect().then(function(d) {
    device = d;
    return d.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
  }).then(function(s) {
    return s.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
  }).then(function(c) {
    function sender(resolve, reject) {
      if (text.length) {
        c.writeValue(text.substr(0,20)).then(function() {
          sender(resolve, reject);
        }).catch(reject);
        text = text.substr(20);
      } else  {
        resolve();
      }
    }
    return new Promise(sender);
  }).then(function() {
    device.disconnect();
    if (callback) callback();
  });
}
