/* Copyright (c) 2024 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*

Implements a Bluetooth LED device compatible with the python led-ble library
(https://github.com/Bluetooth-Devices/led-ble/blob/main/src/led_ble/led_ble.py)
which means your device will appear in Home Assistant with the `LED BLE` integration.

```
require("ble_led").setup(function(state) {
  if (state.on) {
    LED1.pwm(state.r/256);
    LED2.pwm(state.g/256);
    LED3.pwm(state.b/256);
  } else {
    digitalWrite([LED1,LED2,LED3],0);
  }
});
```

*/

exports.sendResponse = function(value) {
  NRF.updateServices({
    0xFF00 : {
      0xFF02 : {
        value : value,
        notify: true
      }
    }
  });
};
exports.state = {
  on:false,
  r:255,g:255,b:255,w:255,version:0
};
exports.setup = function(updateState) {
  let state = exports.state;
  NRF.setServices({
    0xFF00 : {
      0xFF01 : {
        writable : true,
        maxLen : 20,
        onWrite : function(evt) {
          //print(evt.data);
          if (evt.data == [0xEF,0x01,0x77]) { // WHO_AM_I
            // https://github.com/Bluetooth-Devices/led-ble/blob/main/src/led_ble/led_ble.py#L426
            exports.sendResponse([0,0x04,state.on?0x23:0,0,0,0,state.r,state.g,state.b,state.w,0,0]);
          } else if (evt.data[0]==0xCC) {
            state.on = evt.data[1]==0x23;
            updateState(state);
          } else if (evt.data[0]==0x56) {
            state.r = evt.data[1];
            state.g = evt.data[2];
            state.b = evt.data[3];
            state.w = evt.data[4];
            updateState(state);
          }
        }
      },
      0xFF02 : {
        value : [0,0,0,0,0,0,0,0,0,0,0,0],
        notify : true,
      }
    }
  });
  NRF.setAdvertising({},{name:"LEDBLE"});
  updateState(state);
};