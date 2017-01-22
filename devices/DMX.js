/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
require("DMX").connectRX(pin, 6, function(data) {
  console.log(data.join(","));
  analogWrite(LED1, data[1]/256, {soft:true});
  analogWrite(LED2, data[2]/256, {soft:true});
});
*/

// `callback` is called with a UintArray(`size`)
exports.connectRX = function(pin, size, callback) {
  var ser = Serial.find(pin);
  if (!ser) throw "No Serial peripheral found for pin";
  ser.setup(250000,{rx:pin});
  var dmx = new Uint8Array(size);
  var dmxIdx = 0;
  Serial1.on('data',function(d){dmx.set(d, dmxIdx);dmxIdx+=d.length;});
  Serial1.on('framing',function(){
    if (dmxIdx>=dmx.length) callback(new Uint8Array(dmx.buffer,1));
    dmxIdx = 0;
  });
};
