<!--- Copyright (c) 2024 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
LED BLE Library
===============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/ble_led. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Modules,BTHome,Bluetooth,BLE,Home Assistant,HomeAssistant
* USES: BLE,Only BLE,BTHome


The [[ble_led.js]] library turns your Espruino device into a Bluetooth LED device compatible with the [Python led-ble library](https://github.com/Bluetooth-Devices/led-ble/blob/main/src/led_ble/led_ble.py)
which means your device can appear in Home Assistant with the [LED BLE integration](https://www.home-assistant.io/integrations/led_ble/).

Once configured, a device running this library will appear in `http://homeassistant/config/integrations/dashboard` where it can be used alongside all your other devices.


Usage
-----

Simply instantiate as follows:

```JS
require("ble_led").setup(function(state) {
  if (state.on) {
    // state.r/g/b arr in the range 0..255
    LED1.pwm(state.r/256);
    LED2.pwm(state.g/256);
    LED3.pwm(state.b/256);
  } else {
    digitalWrite([LED1,LED2,LED3],0);
  }
});
```

Every time the light state changes, the callback will be called with an updated `state` variable, which is of the form:

```JS
{
  on:false,
  r:255,
  g:255,
  b:255,
  w:255,
  version:0
}
```

In the example above, we assume your device has red, green and blue LEDs as `LED1/2/3`, but you could wire up external LEDs, or use the `state.on` value to trigger something other than a light.