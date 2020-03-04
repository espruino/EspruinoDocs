/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 

```
var mouse = require("USBMouse");

setWatch(function() {
  mouse.send(20,20,mouse.BUTTONS.NONE); // X movement, Y movement, buttons pressed
}, BTN, {debounce:100,repeat:true, edge:"rising"});
```

*/

E.setUSBHID({
  reportDescriptor : [
  0x05,   0x01,  // USAGE_PAGE (Generic Desktop)
  0x09,   0x02,  // USAGE (Mouse)
  0xA1,   0x01,  // COLLECTION (Application)
  0x09,   0x01,  //   USAGE (Pointer)

  0xA1,   0x00,  //   COLLECTION (Physical)
  0x05,   0x09,  //     USAGE_PAGE (Button)
  0x19,   0x01,  //     USAGE_MINIMUM (Button 1)
  0x29,   0x03,  //     USAGE_MAXIMUM (Button 3)
  0x15,   0x00,  //     LOGICAL_MINIMUM (0)
  0x25,   0x01,  //     LOGICAL_MAXIMUM (1)
  0x95,   0x03,  //     REPORT_COUNT (3)
  0x75,   0x01,  //     REPORT_SIZE (1)

  0x81,   0x02,  //     INPUT (Data,Var,Abs)
  0x95,   0x01,  //     REPORT_COUNT (1)
  0x75,   0x05,  //     REPORT_SIZE (5)

  0x81,   0x01,  //     INPUT (Constant) for padding
  0x05,   0x01,  //     USAGE_PAGE (Generic Desktop)
  0x09,   0x30,  //     USAGE (X)
  0x09,   0x31,  //     USAGE (Y)
  0x09,   0x38,  //     USAGE (Wheel)

  0x15,   0x81,  //     LOGICAL_MINIMUM (-127)
  0x25,   0x7F,  //     LOGICAL_MAXIMUM (127)
  0x75,   0x08,  //     REPORT_SIZE (8)
  0x95,   0x03,  //     REPORT_COUNT (3)

  0x81,   0x06,  //     INPUT (Data,Var,Rel)
  0xC0,          //   END_COLLECTION
  0x09,   0x3c,  //   USAGE (?) 
  0x05,   0xff,  //   USAGE_PAGE (?) 

  0x09,   0x01,  //   USAGE (Pointer?) 
  0x15,   0x00,  //   LOGICAL_MINIMUM (0) 
  0x25,   0x01,  //   LOGICAL_MAXIMUM (1) 
  0x75,   0x01,  //   REPORT_SIZE (1)  
  0x95,   0x02,  //   REPORT_COUNT (2)
  0xb1,   0x22,  //   FEATURE (?) 
  0x75,   0x06,  //   REPORT_SIZE (6)   
  0x95,   0x01,  //   REPORT_COUNT (1) 
  0xb1,   0x01,  //   FEATURE (?)
  0xc0 ]         // END_COLLECTION
});

exports.BUTTONS = {
  NONE : 0,
  LEFT : 1,
  RIGHT : 2,
  MIDDLE : 4
};

exports.send = function(x,y,b) {
  E.sendUSBHID([b&7,x,y,0]);
};
