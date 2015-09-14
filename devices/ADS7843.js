/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Module for connecting to the ADS7843 touchscreen controller.

The callback function has two arguments (X and Y). When you move your finger on the touchscreen the X and Y coordinates are reported back, and when you lift your finger, the callback function is called once with X and Y set to undefined.

```
SPI1.setup({sck:A5,miso:A6,mosi:A7});
require("ADS7843").connect(SPI1, A4, B6, 0, 0, 320, 240, function(x,y) {
  if (x!==undefined)
    LCD.fillRect(x-1,y-1,x+1,y+1);
});
```

*/

exports.connect = function(spi, cs, irq, offsetx, offsety, width, height, callback) {
  // wake the controller up
  spi.send([0x90,0],cs);
  // look for a press
  var watchFunction = function() {
    var interval = setInterval(function () {
      if (!digitalRead(irq)) { // touch down
        var d = spi.send([0x90,0,0xD0,0,0],cs);
        callback(
          offsetx + (d[1]*256+d[2])*width/0x8000,
          offsety + (d[3]*256+d[4])*height/0x8000);
      } else {
        callback();
        clearInterval(interval);
        interval = undefined;
        setWatch(watchFunction, irq, { repeat : false, edge: "falling" });
      }
    }, 50);
  };
  setWatch(watchFunction, irq, { repeat : false, edge: "falling" });
};
