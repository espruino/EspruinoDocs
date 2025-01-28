<!--- Copyright (c) 2023 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
BTHome Library
==============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/BTHome. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Modules,BTHome,Bluetooth,BLE,BT Home,Home Assistant,HomeAssistant,esphome
* USES: BLE,Only BLE

[BTHome](https://bthome.io/) is an energy efficient but flexible BLE format for devices to broadcast their sensor data and button presses. It is supported by popular home automation platforms, like [Home Assistant](https://www.home-assistant.io/), out of the box.

BTHome devices advertise data in a specific format, which is then received by either [Home Assistant](https://www.home-assistant.io/) directly,
[ESPHome](https://esphome.io/components/esp32_ble_tracker) or [Shelly](https://www.shelly.com/) devices (which act as bridges).

In Espruino we provide the [BTHome module](/modules/BTHome.js) which allows you to advertise most common BTHome advertising types. Once configured, any new BTHome-advertising device found will magically appear in `http://homeassistant/config/integrations/dashboard` where it can be used alongside all your other devices.


Usage
-----

Call `require("BTHome").getAdvertisement()` with an array of things (`{type: string, v : value}`) to advertise, and it
will return an advertisement that can be fed into `NRF.setAdvertising`:

```JS
function updateAdvertising() {
  NRF.setAdvertising(require("BTHome").getAdvertisement([
    {
      type : "battery",
      v : E.getBattery()
    },
    {
      type : "temperature",
      v : E.getTemperature()
    }
  ]), {
    name : "Sensor",
    // not being connectable/scannable saves power (but you'll need to reboot to connect again with the IDE!)
    //connectable : false, scannable : false,
  });
}

// Enable highest power advertising (on nRF52)
NRF.setTxPower(4);
// Update advertising now
updateAdvertising();
// Update advertising every 10 seconds...
setInterval(updateAdvertising, 10000);
```

See below for information on events and a list of allowable device types.

`getAdvertisement` adds an incrementing BTHome packet ID, which ensures that the data sent by the
device will only be treated as a 'new' packet the next time `getAdvertisement` is called. This
stops duplicate events and other data flooding your Home Assistant instance.

**Note:** No size checking is performed, so if you advertise too much data,
Espruino will start to remove characters from the device name to make room
for the increased data length. As such it's best to try and keep your
device name as short as possible.


Device Types
------------


The allowed device types are (most of) what's mentioned in https://bthome.io/format
and the names have been kept as similar as possible

### Values

 * `battery` - 0..100, int
 * `temperature` - degrees C, floating point
 * `count` - 0..255, int
 * `count16` - 0..65535, int
 * `count32` - 0..0xFFFFFFFF, int
 * `current` - amps, floating point
 * `duration` - seconds, floating point
 * `energy` - kWh, floating point
 * `gas` - gas (m3), int (32 bit)
 * `humidity` - humidity %, int
 * `humidity16` - humidity %, floating point
 * `moisture` - moisture %, floating point
 * `power` - power (W), floating point
 * `pressure` - pressure (hPa), floating point
 * `rotation` - rotation in degrees, floating point (0.1 degree)
 * `volume` - volume (L), floating point (0 .. 6553.5)
 * `voltage` - voltage (V), floating point
 * `co2` - CO2 level (ppm), int
 * `tvoc` - TVOC (volatile compounds) level (ug/m3), int
 * `text` - text string

### Events

 * `button_event` - Call with `v` as one of: `none`,`press`,`double_press`,`triple_press`,`long_press`,`long_double_press` or `long_triple_press`
 * `dimmer_event` - Call this with am integer `v` value - 0 for no movement, negative for left or positive for right

As mentioned in the [BTHome docs](https://bthome.io/format), events are handled in Home Assistant 2023.5 and higher. You don't need to add a button/dimmer event if
a button hasn't been pressed, however it may be easier to keep the field in, and if you want to have more than one button on a device then to get an event on the
second button you need to define the first button with no event, for example:

```JS
require("BTHome").getAdvertisement([
  { type: "button_event", v: "none" },
  { type: "button_event", v: "press" }
]);
```

Each time you update the advertising, the packet ID will increase, and another event will be sent to Home Assistant. As such we'd recommend that
you make sure you clear the event flag after updating the advertisement.

**Note:** Most BTHome scanners won't spend 100% of the time scanning - ESPHome scans for only 30ms out of 320ms by default ([see here](https://esphome.io/components/esp32_ble_tracker.html#configuration-variables)).
To ensure you get events reported quickly and reliably it can be a good idea to increase the advertising interval when you have an event to report, and then to lower the interval again after to save power.

For example, to report a button event, as well as battery and temperature:

```JS
var slowTimeout; //< After 60s we revert to slow advertising

// Update the data we're advertising here
function updateAdvertising(buttonState) {
  NRF.setAdvertising(require("BTHome").getAdvertisement([
    {
      type : "battery",
      v : E.getBattery()
    },
    {
      type : "temperature",
      v : E.getTemperature()
    },
    {
      type: "button_event",
      v: buttonState
    },
  ]), {
    name : "Sensor",
    interval: (buttonState!="none")?20:2000, // fast when we have a button press, slow otherwise
    // not being connectable/scannable saves power (but you'll need to reboot to connect again with the IDE!)
    //connectable : false, scannable : false,
  });
  /* After 60s, call updateAdvertising again to update battery/temp
  and to ensure we're advertising slowly */
  if (slowTimeout) clearTimeout(slowTimeout);
  slowTimeout = setTimeout(function() {
    slowTimeout = undefined;
    updateAdvertising("none" /* no button pressed */);
  }, 60000);
}

// When a button is pressed, update advertising with the event
setWatch(function(e) {
  var buttonState = ((e.time - e.lastTime) > 0.5) ? "long_press" : "press";
  updateAdvertising(buttonState);
}, BTN, {edge:"falling", repeat:true})

// Update advertising now
updateAdvertising("none");

// Enable highest power advertising (4 on nRF52, 8 on nRF52840)
NRF.setTxPower(4);
```

* APPLOADER_APP: bthome

### Booleans

Just supply these with a single boolean value as v, for example: `{type:"door", v:true}`

 * `battery_low`
 * `battery_charge`
 * `cold`
 * `connected`
 * `door`
 * `garage_door`
 * `generic` - generic boolean
 * `boolean`
 * `heat`
 * `light`
 * `locked`
 * `motion`
 * `moving`
 * `occupancy`
 * `opening`
 * `power_on`
 * `presence`
 * `problem`
 * `tamper`
 * `vibration`


### Custom data

You may find that the BTHome module doesn't provide a data type you're interested in. In this case you can provide your own
entry using the `type:"raw"`. In this case `v` should be an array of bytes matching what's shown in https://bthome.io/format/

For example to add the boolean `plug`:

```JS
require("BTHome").getAdvertisement([
    { // a 'raw' data
      type : "raw",
      v : [0x24, pluggedIn ? 1 : 0] // MUST be an array
    },
    { // normal decls
      type : "temperature",
      v : E.getTemperature()
    },
  ])
```


Bidirectional Communication
----------------------------

At the moment, BTHome devices can only transmit data (not be connected to), however you
can use the [LED BLE Library](ble_led) to make your device appear to be a Bluetooth Light
which is supported by the [LED BLE integration](https://www.home-assistant.io/integrations/led_ble/) in Home Assistant.

You can use both this and the `ble_led` library at the same time, just be sure to keep the advertising name beginning with
`LEDBLE` as this is what Home Assistant uses to detect the LED lights.


Notes
------

If you don't need to be connected to, you can increase battery life
of your device substantially by making it non-scannable and non-connectable. Note that you then won't be able
to connect to reprogram it until you reset it!

The default advertising interval is 375m and you can also make that longer if you don't have updates to send
very often.

You can also increase signal strength with `NRF.setTxPower(power)`.

```JS
NRF.setAdvertising(require("BTHome").getAdvertisement([
  {
    type : "temperature",
    v : E.getTemperature()
  }
]), { name : "Sensor1", scannable: false, connectable: false, interval: 600 });
NRF.setTxPower(4); // NRF52840 devices like Bangle.js 2 can use 8!
```

**Espruino will not normally advertise when you're connected to it,** but
on firmwares 2v19 and later you can add `whenConnected:true` to the options at the
end of the `NRF.setAdvertising` call to override that.


References
----------

There are:

* [Pre-made Bangle.js apps](https://banglejs.com/apps/?q=bthome) which will make your [Bangle.js watch](/Bangle.js2)
appear in BTHome
* [Pre-made Puck.js apps](https://espruino.github.io/EspruinoApps/?q=bthome) which will make your [Puck.js](/Puck.js)
appear in BTHome

Some tutorials use BTHome:

* APPEND_USES: BTHome

It's also mentioned on the forum in:

* [Integration with Home Assistant](https://forum.espruino.com/conversations/361380/)
* [Home Assistant / EspHome/ BTHome / Bluetooth Proxies](https://forum.espruino.com/conversations/382301/)
