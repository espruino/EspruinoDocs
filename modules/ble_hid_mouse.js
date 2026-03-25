/* Copyright (c) 2018 Derek Arthur, Durnaford Ltd. Derived from the works of Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Usage:
  var mouse = require("ble_hid_mouse");
  NRF.setServices(undefined, { hid : mouse.report });
  NRF.setAdvertising([
    {}, // include original Advertising packet
    [   // second packet containing 'appearance'
      2, 1, 6,  // standard Bluetooth flags
      3,3,0x12,0x18, // HID Service
      3,0x19,0xc2,0x03 // Appearance: 0x03C2 Mouse
    ]
  ]);
  mouse.send(0,0,mouse.BUTTONS.LEFT); // X movement, Y movement, buttons pressed
*/

exports.report = new Uint8Array([
    0x05, 0x01,                    // USAGE_PAGE (Generic Desktop)
    0x09, 0x02,                    // USAGE (Mouse)
    0xa1, 0x01,                    // COLLECTION (Application)
    0x85, 0x01,                    //   REPORT_ID (1)
    0x09, 0x01,                    //   USAGE (Pointer)
    0xa1, 0x00,                    //   COLLECTION (Physical)
    0x05, 0x09,                    //     USAGE_PAGE (Button)
    0x19, 0x01,                    //     USAGE_MINIMUM (Button 1)
    0x29, 0x05,                    //     USAGE_MAXIMUM (Button 5)
    0x15, 0x00,                    //     LOGICAL_MINIMUM (0)
    0x25, 0x01,                    //     LOGICAL_MAXIMUM (1)
    0x95, 0x05,                    //     REPORT_COUNT (5)
    0x75, 0x01,                    //     REPORT_SIZE (1)
    0x81, 0x02,                    //     INPUT (Data,Var,Abs)
    0x95, 0x01,                    //     REPORT_COUNT (1)
    0x75, 0x03,                    //     REPORT_SIZE (3)
    0x81, 0x03,                    //     INPUT (Cnst,Var,Abs)
    0x05, 0x01,                    //     USAGE_PAGE (Generic Desktop)
    0x09, 0x30,                    //     USAGE (X)
    0x09, 0x31,                    //     USAGE (Y)
    0x09, 0x38,                    //     USAGE (Wheel)
    0x15, 0x81,                    //     LOGICAL_MINIMUM (-127)
    0x25, 0x7f,                    //     LOGICAL_MAXIMUM (127)
    0x75, 0x08,                    //     REPORT_SIZE (8)
    0x95, 0x03,                    //     REPORT_COUNT (3)
    0x81, 0x06,                    //     INPUT (Data,Var,Rel)
    0x05, 0x0c,                    //     USAGE_PAGE (Consumer Devices)
    0x0a, 0x38, 0x02,              //     USAGE (AC Pan)
    0x15, 0x81,                    //     LOGICAL_MINIMUM (-127)
    0x25, 0x7f,                    //     LOGICAL_MAXIMUM (127)
    0x75, 0x08,                    //     REPORT_SIZE (8)
    0x95, 0x01,                    //     REPORT_COUNT (1)
    0x81, 0x06,                    //     INPUT (Data,Var,Rel)
    0xc0,                          //     END_COLLECTION
    0xc0,                          // END_COLLECTION
]);

exports.BUTTONS = {
  NONE : 0,
  LEFT : 1,
  RIGHT : 2,
  MIDDLE : 4
};
exports.send = function(x,y,b, callback) {
  NRF.sendHIDReport([1, b, x, y, 0/*wheel*/, 0/*hwheel*/], function() {
    if (callback) callback();
  });
};
