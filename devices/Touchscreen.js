/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Utility module for connecting to touchscreens on boards that have them built in.

The callback function has two arguments (X and Y). When you move your finger on the touchscreen the X and Y coordinates are reported back, and when you lift your finger, the callback function is called once with X and Y set to undefined.

```
require("Touchscreen").connect(function(x,y) {
  if (x!==undefined)
    LCD.fillRect(x-1,y-1,x+1,y+1);
});
```

*/

exports.connect = function(callback) {
  var b = process.env.BOARD;
  if (b=="HYSTM32_24") {
    SPI1.setup({sck:A5,miso:A6,mosi:A7});
    require("ADS7843").connect(SPI1, B7, B6, -16, 256, 352, -272, callback);
  } else if (b=="HYSTM32_28") {
    SPI1.setup({sck:A5,miso:A6,mosi:A7});
    require("ADS7843").connect(SPI1, A4, C13, 336, -16, -352, 272, callback);
  } else if (b=="HYSTM32_32") {
    SPI1.setup({sck:A5,miso:A6,mosi:A7});
    require("ADS7843").connect(SPI1, A4, B6, -16, -16, 352, 272, callback);
  } else
    console.log("Unknown board "+b);
};
