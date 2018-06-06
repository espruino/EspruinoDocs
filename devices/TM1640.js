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

  var spi = new SPI();
  spi.setup({mosi:pins.din, sck:pins.clk, mode:3, order:'lsb'});
  var s = spi.write.bind(spi);
  var cL = pins.clk.reset.bind(pins.clk);
  var cH = pins.clk.set.bind(pins.clk);
  var dL = pins.din.reset.bind(pins.din);
  var dH = pins.din.set.bind(pins.din);
  var g = Graphics.createArrayBuffer(8,8,1);
  var intensity = 1;

  var sendCommand = function(cmd) {
    dL();
    s(cmd);
    dH();
  }

  g.flip = function() {
    var b = g.buffer;
    for(var i=0;i<8;i++) {
      // sendData(i,b[i]) - send row byte
      sendCommand(0x44);
      dL();
      s(0xC0 | i);
      s(b[i]);
      dH();

      // strobe
      dL();
      cL();
      cH();
      dH();
    }

    sendCommand(0x88|intensity);
  };

  g.setContrast = function(v) {
    intensity = v>7 ? 7 : v;
  };

  g.setRotation(0, true);
  g.clear();

  // init
  dH();
  cH();
  // use setTimeout so the user's 'g=TM1640.connect' command will have had time to execute
  if (callback) setTimeout(callback,10,g);
  return g;
};
