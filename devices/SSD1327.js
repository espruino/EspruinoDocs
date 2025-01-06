/* Copyright (c) 2023 Stefan Bauwens. Inspired by modules SSD1306 and SH1107.
See the file LICENSE for copying permission. */
/*
Module for the grayscale SSD1327 OLED controller using I2C.
Tested only with 128x128 screen on a flashed ESP8266.

Example usage:

```
function start(){
  // set contrast
  g.setContrast(128);
  // set gray tint (0 is black, 15 is white)
  g.setColor(15);
  // write some text
  g.drawString("Hello World!",2,2);
  // write to the screen
  g.flip();
}

// I2C
I2C1.setup({scl:D5,sda:D4,bitrate:400000});
var g = require("SSD1327").connect(I2C1, start, { address: 0x3C, height: 128 });
```
*/

var C = {
 OLED_WIDTH                 : 128,
 OLED_CHAR                  : 0x40,
 OLED_CHUNK                 : 128,
 M_RATIO_INDEX              : 9
};

// commands sent when initialising the display
var initCmds = new Uint8Array([
  0xAE,       // 0 Display off (all pixels off)
  0xA0, 0x53, // 1 Segment remap (com split, com remap, nibble remap, column remap)
  0xA1, 0x00, // 3 Display start line
  0xA2, 0x00, // 5 Display offset
  0xA4,       // 7 Regular display
  0xA8, 0x7F, // 8 Set multiplex ratio: 127
  0xB3, 0x00, // 10 Front clock divider: 0, Fosc: 0
  0xAB, 0x01, // 12 Enable internal Vdd
  0xB1, 0xF1, // 14 Set phase periods - 1: 1 clk, 2: 15 clks
  0xBC, 0x08, // 16 Pre-charge voltage: Vcomh
  0xBE, 0x07, // 18 COM deselect voltage level: 0.86 x Vcc
  0xD5, 0x62, // 20 Enable 2nd pre-charge
  0xB6, 0x0F, // 22 2nd Pre-charge period: 15 clks
  0xAF,       // 24 Display on
  0x81, 0x7F  // 26 Set Contrast to 128
  ]);

// commands sent when sending data to the display
var flipCmds = [
  0x15,                        // set columns command
  0, C.OLED_WIDTH - 1,         // start collumn, end collumn
  0x75,                        // set rows command
  0, initCmds[C.M_RATIO_INDEX] // start row, end row
];

function update(options) {
  if (options && options.height) {
    initCmds[C.M_RATIO_INDEX] = options.height - 1;
	}
}

exports.connect = function(i2c, callback, options) {
  update(options);
  var oled = Graphics.createArrayBuffer(C.OLED_WIDTH, initCmds[C.M_RATIO_INDEX] + 1, 4, {msb:false});

  var addr = 0x3C;
  if (options && options.address) addr = options.address;

  // initialize the OLED
  i2c.writeTo(addr, [0].concat(initCmds));

  // write to the screen
  oled.flip = function() {
    // set how the data is to be sent (whole screen)
    i2c.writeTo(addr, [0].concat(flipCmds));

    //write buffer
    var chunk = new Uint8Array(C.OLED_CHUNK + 1);
    chunk[0] = C.OLED_CHAR;

    for (var p = 0; p < this.buffer.length; p += C.OLED_CHUNK) {
      chunk.set(new Uint8Array(this.buffer, p, C.OLED_WIDTH), 1);
      i2c.writeTo(addr, chunk);
    }
  };

  // set contrast, 0..255
  oled.setContrast = function(c) { i2c.writeTo(addr, 0, 0x81, c); };

  // set off
  oled.off = function() { i2c.writeTo(addr, 0, 0xAE); };

  // set on
  oled.on = function() { i2c.writeTo(addr, 0, 0xAF); };

  // if there is a callback, call it now(ish)
  if (callback !== undefined) setTimeout(callback, 100);

  // return graphics
  return oled;
};
