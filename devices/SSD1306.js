/* Copyright (c) 2014 Sam Sykes, Gordon Williams. See the file LICENSE for copying permission. */
/* 
Module for the SSD1306 OLED controller in the Crius CO-16

```  

 */
// registers
var C = {
 OLED_ADDRESS               : 0x3C,
 OLED_CMD                   : 0x80,
 OLED_CHAR                  : 0x40,
 OLED_WIDTH                 : 128,
 OLED_HEIGHT                : 64,
 OLED_LENGTH                : 1024,
 OLED_CHUNK                 : 128,
 OLED_ROW                   : 8
};

// export
exports.connect = function(i2c, callback) {
 var oled = Graphics.createArrayBuffer(128,64,1,{vertical_byte : true});
 
 // configure the OLED
 i2c.writeTo(C.OLED_ADDRESS, [C.OLED_CMD, 0xAE]);        // display off
 i2c.writeTo(C.OLED_ADDRESS, [C.OLED_CMD, 0x2E]);        // deactivate scrolling
 i2c.writeTo(C.OLED_ADDRESS, [C.OLED_CMD, 0xA4]);        // set all pixels OFF
 // orientation
 i2c.writeTo(C.OLED_ADDRESS, [C.OLED_CMD, 0x20]);        // memory addressing mode
 i2c.writeTo(C.OLED_ADDRESS, [C.OLED_CMD, 0x00]);        // reset paging
 i2c.writeTo(C.OLED_ADDRESS, [C.OLED_CMD, 0xA1]);        // orientation
 i2c.writeTo(C.OLED_ADDRESS, [C.OLED_CMD, 0xC8]);        // left > right
 
 // turn on the display
 i2c.writeTo(C.OLED_ADDRESS, [C.OLED_CMD, 0xAF]);
 
 // if there is a callback, call it now(ish)
 if (callback !== undefined) setTimeout(callback, 10);
  
 // write to the screen
 oled.flip = function() { 
   // set how the data is to be sent (whole screen)
   i2c.writeTo(C.OLED_ADDRESS, [C.OLED_CMD, 0x21]); // columns
   i2c.writeTo(C.OLED_ADDRESS, [C.OLED_CMD, 0]);
   i2c.writeTo(C.OLED_ADDRESS, [C.OLED_CMD, 127]);
   i2c.writeTo(C.OLED_ADDRESS, [C.OLED_CMD, 0x22]); // rows
   i2c.writeTo(C.OLED_ADDRESS, [C.OLED_CMD, 0]);
   i2c.writeTo(C.OLED_ADDRESS, [C.OLED_CMD, 7]);
 
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


