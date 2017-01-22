/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 
Module for the HD44780 controller in text-based LCDs (pretty much all 16x2 and 20x4 LCDs)

If you have one of the LCDs with an I2C backpack, just use:

```
I2C1.setup({scl:B6, sda:B7});
var lcd = require("HD44780").connectI2C(I2C1);
lcd.print("Hello World!");
```

You can specify device address following way:
```
require("HD44780").connectI2C(I2C1, 0x3F);
```

Otherwise try:

```
var lcd = require("HD44780").connect(A4,A5,A0,A1,A2,A3);
lcd.print("Hello World!");
```  
*/

function HD44780(write) {
  // initialise
  write(0x33,1);
  write(0x32,1);
  write(0x28,1);
  write(0x0C,1);
  write(0x06,1);
  write(0x01,1);
  // add functions
  return {
    write : write,
    // clear screen
    clear : function() { write(0x01,1); },
    // print text
    print : function(str) {
      for (var i=0;i<str.length;i++)
        write(str.charCodeAt(i));
    },
    // flashing block for the current cursor, or underline
    cursor : function(block) { write(block?0x0F:0x0E,1); },
    // set cursor pos, top left = 0,0
    setCursor : function(x,y) { var l=[0x00,0x40,0x14,0x54];write(0x80|(l[y]+x),1); },
    // set special character 0..7, data is an array(8) of bytes, and then return to home addr
    createChar : function(ch, data) {
      write(0x40 | ((ch&7) << 3), 1);
      for (var i=0; i<8; i++) write(data[i]);
      write(0x80,1);
    }
  };
}

exports.connectI2C = function(/*=I2C*/i2c, _addr) {
  return new HD44780(function(x, c) {
    var a = (x&0xF0) |8| ((c===undefined)?1:0);
    var b = ((x<<4)&0xF0) |8| ((c===undefined)?1:0);
    i2c.writeTo(_addr || 0x27, [a,a,a|4,a|4,a,a,b,b,b|4,b|4,b,b]);
  });
};

exports.connect = function(/*=PIN*/rs,/*=PIN*/en,/*=PIN*/_d4,/*=PIN*/_d5,/*=PIN*/_d6,/*=PIN*/_d7) {
  var data = [_d7,_d6,_d5,_d4];
  var d = digitalWrite;
  d(rs, 1);
  d([rs,en], 0);
  return new HD44780(function(x, c) {
    d(rs, !c);
    d(data, x>>4);
    d(en, 1);
    d(en, 0);
    d(data, x);
    d(en, 1);
    d(en, 0);
  });
};

exports.HD44780 = HD44780;
