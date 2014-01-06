/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 
Module to communicate with the Wii Nunchuck

```
I2C1.setup({scl:B6,sda:B7});
var wii = require("wii_nunchuck").connect(I2C1);
console.log(JSON.stringify(wii.read()));
```

This will output something like:

```
{"joy":{"x":0,"y":0},"acc":{"x":0,"y":0,"z":1},"btn":{"z":false,"c":false}}
```

Where the values for joy are between -1 and 1, and values for 'acc' are in G (that is, 1 for normal gravity)

*/
exports.connect = function(/*=I2C*/_i2c) {
  var i2c = _i2c;
  // initialise
  i2c.writeTo(0x52, [0xF0,0x55]);
  i2c.writeTo(0x52, [0xFB,0x00]);
  // actual object
  return { read : function () {
    var d = i2c.readFrom(0x52, 6);
    i2c.writeTo(0x52, 0);
    // TODO: we could get another 2 bits of accelerometer data from d[5]
    return { joy : {x:(d[0]-127)/128,y:(d[1]-127)/128},
            acc : {x:(d[2]-127)/54,y:(d[3]-127)/54,z:(d[4]-127)/54},
            btn : {z:!(d[5]&1),c:!(d[5]&2) }
           };
  } };
};
