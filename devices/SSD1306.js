/* Copyright (c) 2014 Sam Sykes, Gordon Williams. See the file LICENSE for copying permission. */
/* 
Module for the SSD1306 OLED controller in displays like the Crius CO-16

```
function go(){
 // write some text
 g.drawString("Hello World!",2,2);
 // write to the screen
 g.flip(); 
}

// I2C
I2C1.setup({scl:B6,sda:B7});
var g = exports.connect(I2C1, go);

// SPI
var s = new SPI();
s.setup({mosi: B6, sck:B5});
var g = exports.connectSPI(s, A8, B7, go);
```

*/
var exports = {};

var C = {
 OLED_ADDRESS               : 0x3C,
 OLED_WIDTH                 : 128,
 OLED_HEIGHT                : 64,
 OLED_CHUNK                 : 128
};

// commands sent when initialising the display
var extVcc=false; // if true, don't start charge pump 
var initCmds = new Uint8Array([ 0xAe, // disp off
             0xD5, // clk div
             0x80, // suggested ratio
             0xA8, C.OLED_HEIGHT-1, // set multiplex
             0xD3,0x0, // display offset
             0x40, // start line
             0x8D,extVcc?0x10:0x14, // charge pump
             0x20,0x0, // memory mode
             0xA1, // seg remap 1
             0xC8, // comscandec
             0xDA,0x12, // set compins
             0x81,extVcc?0x9F:0xCF, // set contrast
             0xD9,extVcc?0x22:0xF1, // set precharge
             0xDb,0x40, // set vcom detect
             0xA4, // display all on
             0xA6, // display normal (non-inverted)
             0xAf // disp on
            ]);
// commands sent when sending data to the display
var flipCmds = [0x21, // columns
     0, C.OLED_WIDTH-1,
     0x22, // rows
     0, 7];

// export
exports.connect = function(i2c, callback) {
 var oled = Graphics.createArrayBuffer(C.OLED_WIDTH,C.OLED_HEIGHT,1,{vertical_byte : true});
 var w = function(c) {
   c.forEach(function(d) {i2c.writeTo(C.OLED_ADDRESS, [0,d]);});
 };

 // configure the OLED
 w(initCmds);
 // if there is a callback, call it now(ish)
 if (callback !== undefined) setTimeout(callback, 10);
  
 // write to the screen
 oled.flip = function() { 
   // set how the data is to be sent (whole screen)
   w(flipCmds);
   var chunk = new Uint8Array(C.OLED_CHUNK+1);

   chunk[0] = C.OLED_CHAR;
   for (var p=0; p<C.OLED_LENGTH; p+=C.OLED_CHUNK) {
     chunk.set(new Uint8Array(this.buffer,p,C.OLED_CHUNK), 1);
     i2c.writeTo(C.OLED_ADDRESS, chunk);
   } 
  };
 
 // return graphics
 return oled;
};
exports.connectSPI = function(spi, dc,  rst, callback) {
 var oled = Graphics.createArrayBuffer(C.OLED_WIDTH,C.OLED_HEIGHT,1,{vertical_byte : true});
  
 if (rst) digitalPulse(rst,0,10);
 setTimeout(function() {
   // configure the OLED
   digitalWrite(dc,0); // command
   spi.write(initCmds);
   digitalWrite(dc,1); // data
   // if there is a callback, call it now(ish)
   if (callback !== undefined) setTimeout(callback, 10);
 }, 50);
 
 // write to the screen
 oled.flip = function() { 
   // set how the data is to be sent (whole screen)
   digitalWrite(dc,0);// command
   spi.write(flipCmds);
   digitalWrite(dc,1);// data
   spi.write(this.buffer);
  };
 
 // return graphics
 return oled;
};


