/* Copyright (c) 2018 Standa Opichal. See the file LICENSE for copying permission. */
/*
  Module for the WeMos Matrix LED Shield (based on TM1640)

  Based on the https://github.com/wemos/WEMOS_Matrix_LED_Shield_Arduino_Library
```
var g = require("TM1640").connect({din: NodeMCU.D7, clk: NodeMCU.D5}, function() {
  g.drawLine(0, 0, g.getWidth() - 1, g.getHeight() - 1);
  g.setContrast(2); // a value between `0` lowest and `7` highest intensity.
  g.flip();
});
```
*/

exports.connect = function(pins, callback) {
  pinMode(pins.clk, 'output');
  pinMode(pins.din, 'output');

  var c = digitalWrite.bind(null, [pins.clk]);
  var d = digitalWrite.bind(null, [pins.din]);
  var g = Graphics.createArrayBuffer(8,8,1);
  var intensity = 1;

  function send(data) {
    for (var i = 0; i < 8; i++) {
      c(LOW);
      d(data & 1 ? HIGH : LOW);
      data >>= 1;
      c(HIGH);
    }
  }

  function sendCommand(cmd) {
    d(LOW);
    send(cmd);
    d(HIGH);
  }

  g.flip = function() {
    var b = g.buffer;
    for(var i=0;i<8;i++) {
      // sendData(i,b[i]) - send row byte
      sendCommand(0x44);
      d(LOW);
      send(0xC0 | i);
      send(b[i]);
      d(HIGH);

      // strobe
      d(LOW);
      c(LOW);
      c(HIGH);
      d(HIGH);
    }

    sendCommand(0x88|intensity);
  }

  g.setContrast = function(v) {
    intensity = v>7 ? 7 : v;
  };

  g.setRotation(0, true);
  g.clear();

  // init
  d(HIGH);
  c(HIGH);

  if (callback) callback();
  return g;
};
