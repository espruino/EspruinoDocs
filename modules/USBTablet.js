/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 

```
var tab = require("USBTablet");

// When the button is pressed, mouse the cursor in a circle around the screen
setWatch(function() {
  var p = 0;
  var intr = setInterval(function() {
    tab.send((Math.sin(p)+1)/2, (Math.cos(p)+1)/2, tab.BUTTONS.NONE);
    p += 0.02;
    if (p>Math.PI*2) clearInterval(intr);
  }, 10);
}, BTN, {debounce:100,repeat:true, edge:"rising"});
```

*/

E.setUSBHID({
  reportDescriptor : [
    0x05, 0x01,                    // USAGE_PAGE (Generic Desktop)
    0x09, 0x02,                    // USAGE (Mouse)
    0xa1, 0x01,                    // COLLECTION (Application)
    0x09, 0x01,                    //   USAGE (Pointer)
    0xa1, 0x00,                    //   COLLECTION (Physical)
    0x05, 0x09,                    //     USAGE_PAGE (Button)
    0x19, 0x01,                    //     USAGE_MINIMUM (Button 1)
    0x29, 0x03,                    //     USAGE_MAXIMUM (Button 3)
    0x15, 0x00,                    //     LOGICAL_MINIMUM (0)
    0x25, 0x01,                    //     LOGICAL_MAXIMUM (1)
    0x95, 0x03,                    //     REPORT_COUNT (3)
    0x75, 0x01,                    //     REPORT_SIZE (1)
    0x81, 0x02,                    //     INPUT (Data,Var,Abs)
    0x95, 0x01,                    //     REPORT_COUNT (1)
    0x75, 0x05,                    //     REPORT_SIZE (5)
    0x81, 0x03,                    //     INPUT (Cnst,Var,Abs)
    0x05, 0x01,                    //     USAGE_PAGE (Generic Desktop)
    0x09, 0x30,                    //     USAGE (X)
    0x09, 0x31,                    //     USAGE (Y)
    0x35, 0x00,                    //     PHYSICAL_MINIMUM (0)
    0x46, 0xFF, 0x7F,              //     PHYSICAL_MAXIMUM (32767)
    0x15, 0x00,                    //     LOGICAL_MINIMUM (0)
    0x26, 0xFF, 0x7F,              //     LOGICAL_MAXIMUM (32767)
    0x65, 0x11,                    //     UNIT (SI Lin:Distance)
    0x55, 0x0e,                    //     UNIT_EXPONENT (-2)
    0x75, 0x10,                    //     REPORT_SIZE (16)
    0x95, 0x02,                    //     REPORT_COUNT (2)
    0x81, 0x02,                    //     INPUT (Data,Var,Abs)
    0xc0,                          //   END_COLLECTION
    0xc0                           // END_COLLECTION
 ]
});

exports.BUTTONS = {
  NONE : 0,
  LEFT : 1,
  RIGHT : 2,
  MIDDLE : 4
};

// Move to absolute location, x and y both between 0 and 1, B for buttons
exports.send = function(x,y,b) {
  var rx = Math.clip(x*32767,0,32767)|0;
  var ry = Math.clip(y*32767,0,32767)|0;
  E.sendUSBHID([b&7,rx,rx>>8,ry,ry>>8]);
};
