/* Copyright (c) 2022 Kasper Müller. See the file LICENSE for copying permission. */
/*
Bluetooth Low Energy Human Interface Defice Combo.
With this defice definition and API you have access to mouse and keyboard at the same time.
Tested on windows 10, android and linux. 
Usage:
  var int = require("ble_hid_combo");
  NRF.setServices(undefined, { hid : int.report });
  int.tap(kb.KEY.A, 0);
  int.tap(kb.KEY.A, kb.MODIFY.SHIFT);

*/

/** The BLE HID Report specifying the keyboard mouse combo. */
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
    0x05, 0x01,                    // USAGE_PAGE (Generic Desktop)
    0x09, 0x06,                    // USAGE (Keyboard)
    0xa1, 0x01,                    // COLLECTION (Application)
    0x85, 0x02,                    //   REPORT_ID (2)
    0x05, 0x07,                    //   USAGE_PAGE (Keyboard)
    0x19, 0xe0,                    //   USAGE_MINIMUM (Keyboard LeftControl)
    0x29, 0xe7,                    //   USAGE_MAXIMUM (Keyboard Right GUI)
    0x15, 0x00,                    //   LOGICAL_MINIMUM (0)
    0x25, 0x01,                    //   LOGICAL_MAXIMUM (1)
    0x75, 0x01,                    //   REPORT_SIZE (1)
    0x95, 0x08,                    //   REPORT_COUNT (8)
    0x81, 0x02,                    //   INPUT (Data,Var,Abs)
    0x75, 0x08,                    //   REPORT_SIZE (8)
    0x95, 0x01,                    //   REPORT_COUNT (1)
    0x81, 0x01,                    //   INPUT (Cnst,Ary,Abs)
    0x19, 0x00,                    //   USAGE_MINIMUM (Reserved (no event indicated))
    0x29, 0x73,                    //   USAGE_MAXIMUM (Keyboard F24)
    0x15, 0x00,                    //   LOGICAL_MINIMUM (0)
    0x25, 0x73,                    //   LOGICAL_MAXIMUM (115)
    0x95, 0x05,                    //   REPORT_COUNT (5)
    0x75, 0x08,                    //   REPORT_SIZE (8)
    0x81, 0x00,                    //   INPUT (Data,Ary,Abs)
    0xc0                           // END_COLLECTION
  ]);
  
// Keys taken from ble_hid_kyboard.js

/** Keyboard modifiers */
exports.MODIFY = {
  CTRL        : 0x01,
  SHIFT       : 0x02,
  ALT         : 0x04,
  GUI         : 0x08,
  LEFT_CTRL   : 0x01,
  LEFT_SHIFT  : 0x02,
  LEFT_ALT    : 0x04,
  LEFT_GUI    : 0x08,
  RIGHT_CTRL  : 0x10,
  RIGHT_SHIFT : 0x20,
  RIGHT_ALT   : 0x40,
  RIGHT_GUI   : 0x80
};

/** Keyboard keys */
exports.KEY = {
  A           : 4 ,
  B           : 5 ,
  C           : 6 ,
  D           : 7 ,
  E           : 8 ,
  F           : 9 ,
  G           : 10,
  H           : 11,
  I           : 12,
  J           : 13,
  K           : 14,
  L           : 15,
  M           : 16,
  N           : 17,
  O           : 18,
  P           : 19,
  Q           : 20,
  R           : 21,
  S           : 22,
  T           : 23,
  U           : 24,
  V           : 25,
  W           : 26,
  X           : 27,
  Y           : 28,
  Z           : 29,
  1           : 30,
  2           : 31,
  3           : 32,
  4           : 33,
  5           : 34,
  6           : 35,
  7           : 36,
  8           : 37,
  9           : 38,
  0           : 39,
  ENTER       : 40,
  "\n"        : 40,
  ESC         : 41,
  BACKSPACE   : 42,
  "\t"        : 43,
  " "         : 44,
  "-"         : 45,
  "="         : 46,
  "["         : 47,
  "]"         : 48,
  "\\"        : 49,
  NUMBER      : 50,
  ";"         : 51,
  "'"         : 52,
  "~"         : 53,
  ","         : 54,
  "."         : 55,
  "/"         : 56,
  CAPS_LOCK   : 57,
  F1          : 58,
  F2          : 59,
  F3          : 60,
  F4          : 61,
  F5          : 62,
  F6          : 63,
  F7          : 64,
  F8          : 65,
  F9          : 66,
  F10         : 67,
  F11         : 68,
  F12         : 69,
  PRINTSCREEN : 70,
  SCROLL_LOCK : 71,
  PAUSE       : 72,
  INSERT      : 73,
  HOME        : 74,
  PAGE_UP     : 75,
  DELETE      : 76,
  END         : 77,
  PAGE_DOWN   : 78,
  RIGHT       : 79,
  LEFT        : 80,
  DOWN        : 81,
  UP          : 82,
  NUM_LOCK    : 83,
  PAD_SLASH   : 84,
  PAD_ASTERIX : 85,
  PAD_MINUS   : 86,
  PAD_PLUS    : 87,
  PAD_ENTER   : 88,
  PAD_1       : 89,
  PAD_2       : 90,
  PAD_3       : 91,
  PAD_4       : 92,
  PAD_5       : 93,
  PAD_6       : 94,
  PAD_7       : 95,
  PAD_8       : 96,
  PAD_9       : 97,
  PAD_0       : 98,
  PAD_PERIOD  : 99,
  ALL         : -1
};
var BUTTON = {
  NONE : 0,
  LEFT : 1,
  RIGHT : 2,
  MIDDLE : 4,
  BACK : 8,
  FORWARD: 16
};
BUTTON.ALL = BUTTON.LEFT | BUTTON.RIGHT | BUTTON.MIDDLE | BUTTON.BACK | BUTTON.FORWARD;

/** Mouse buttons */
exports.BUTTON = BUTTON;

/** Mouse buttons currently holding. */
var holdingButtons = 0;
/** Keys currently being pressed. */
var holdingKeys = new Uint8Array(5);

/**
 * @returns The mouse buttons we are holding (/dragging)
 */
exports.getHoldingButtons = function() {
  return holdingButtons;
};

/**
 * Moves the mouse. If no button is specified the internal holding buttons are used, 
 * set by startHolding() and stopped with stopHolding().
 * @param {number} x - The relative amount to move in x-axis. (-127 to 127) 
 * @param {number} y - The relative amount to move in y-axis. (-127 to 127) 
 * @param {number} [b] - The buttons to hold during this movement.
 * @param {number} [wheel] - The relative amount to scroll vertically. (-127 to 127)
 * @param {number} [hwheel] - The relative amount to scroll horizontally. (-127 to 127)
 * @param {function} [callback] - Function to call when bluetooth message is sent.
 */
exports.moveMouse = function(x, y, b, wheel, hwheel, callback) {
  if (!b) b = holdingButtons;
  if (!wheel) wheel = 0;
  if (!hwheel) hwheel = 0;
  NRF.sendHIDReport([1, b, x, y, wheel, hwheel, 0, 0], function() {
    if (callback) callback();
  });
};

/**
 * Scrolls the mouse.
 * @param {number} wheel - The relative amount to scroll vertically (-127 to 127)
 * @param {number} [hwheel] - The relative amount to scroll horizontally (-127 to 127)
 * @param {function} [callback] - Function to call when bluetooth message is sent.
 */
exports.scroll = function(wheel, hwheel, callback) {
  moveMouse(0, 0, holdingButtons, wheel, hwheel, callback);
};

/**
 * Start holding mouse buttons.
 * Note: you can hold multiple buttons using button = BUTTON.LEFT | BUTTON.RIGHT;
 * @param {number} b - The button or buttons to start holding.
 * @param {function} [callback] - Function to call when bluetooth message is sent.
 */
exports.holdButton = function(b, callback) {
  holdingButtons |= b;
  exports.moveMouse(0, 0, holdingButtons, 0, 0, callback);
};

/**
 * Release mouse buttons.
 * Note: you can release all buttons using button = BUTTON.ALL;
 * @param {number} b - The button or buttons to release.
 * @param {function} [callback] - Function to call when bluetooth message is sent.
 */
exports.releaseButton = function(b, callback) {
  holdingButtons &= ~b;
  exports.moveMouse(0, 0, holdingButtons, 0, 0, callback);
};

/**
 * Single click a certain (mouse) button (hold & immidiatly release).
 * @param {number} b - The button or buttons to click.
 * @param {function} callback - Function to call when the bluetooth messages are sent.
 */
exports.clickButton = function(b, callback) {
  exports.holdButton(b, () => exports.releaseButton(b, callback));
};

/**
 * @returns the array of currently holding (pressed) keys.
 */
exports.getHoldingKeys = function() {
  return holdingKeys;
};

/**
 * Update the keyboard modifiers while holding keys.
 * Also updates the currently holding keys.
 * @param {number} modifiers - The keyboard modifier(s) to use.
 * @param {function} [callback] - Function to call when the bluetooth messages are sent.
 */
exports.updateModifiers = function(modifiers, callback) {
  if (!modifiers) modifiers = 0;
  NRF.sendHIDReport([2, modifiers, 0, 
    holdingKeys[0], holdingKeys[1], holdingKeys[2], holdingKeys[3], holdingKeys[4]
  ], function() {
    if (callback) callback();
  });
};

function insertPressedKey(k) {
  // Fill empty spots first.
  for (var j = 0; j < holdingKeys.length; j++) {
    if (holdingKeys[j] == k) return;
    if (holdingKeys[j] == 0) {
      holdingKeys[j] = k;
      return;
    }
  }
  // Otherwise FIFO key replace. (> 5 keys are used!)
  for (j = 0; j < holdingKeys.length - 1; j++) {
    holdingKeys[j] = holdingKeys[j + 1];
  }
  holdingKeys[holdingKeys.length - 1] = k;
  return;
}

function removePressedKey(k) {
  if (k == -1) {
    holdingKeys.fill(0);
    return;
  }
  for (j = 0; j < holdingKeys.length; j++) {
    if (holdingKeys[j] == k) holdingKeys[j] = 0;
  }
}

/**
 * Start holding a key down. 
 * Note: Maximum of 5 concurrent keys are supported! 
 * More keys will result in the previous being dropped.
 * @param {number|number[]} keyCode - The keycode(s) to press in.
 * @param {number} [modifiers] - The keyboard mofifier(s) to use.
 * @param {function} [callback] - Function to call when the bluetooth messages are sent.
 */
exports.keyDown = function(keyCode, modifiers, callback) {
  if (!Array.isArray(keyCode)) keyCode = [keyCode];
  for (var i = 0; i < keyCode.length; i++) {
    insertPressedKey(keyCode[i]);
  }
  exports.updateModifiers(modifiers, callback);
};

/**
 * Stop holding a key down. 
 * @param {number|number[]} keyCode - The keycode(s) to release (use -1 for all keys)
 * @param {function} [callback] - Function to call when the bluetooth messages are sent.
 */
exports.keyUp = function(keyCode, callback) {
  if (!Array.isArray(keyCode)) keyCode = [keyCode];
  for (var i = 0; i < keyCode.length; i++) {
    removePressedKey(keyCode[i]);
  }
  exports.updateModifiers(0, callback);
};

/**
 * Single tap a certain (keyboard) key (hold & immidiatly release).
 * @param {number|number[]} keyCode - The keycode(s) to tap.
 * @param {number} [modifiers] - The keyboard modifier(s) to use.
 * @param {function} [callback] - Function to call when the bluetooth messages are sent.
 */
exports.tapKey = function(keyCode, modifiers, callback) {
  exports.keyDown(keyCode, modifiers, () => exports.keyUp(keyCode, callback));
};