<!--- Copyright (c) 2023 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
BTHome Library
==============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/BTHome. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Modules,BTHome,Bluetooth,BLE,BT Home,Home Assistant,HomeAssistant
* USES: BLE,Only BLE

[BTHome](https://bthome.io/) is an energy efficient but flexible BLE format for devices to broadcast their sensor data and button presses. It is supported by popular home automation platforms, like [Home Assistant](https://www.home-assistant.io/), out of the box.


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
  ]), { name : "Sensor1" });
}

// Update advertising now
updateAdvertising();
// Update advertising every 10 seconds...
setInterval(updateAdvertising, 10000);
```

See below for a list of allowable device types.

`getAdvertisement` adds a BTHome packet ID, which ensures that the data sent by the
device will only be

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
 * `humidity` - humidity %, int
 * `humidity16` - humidity %, floating point
 * `power` - power (W?), floating point
 * `pressure` - pressure (hPa), floating point
 * `voltage` - voltage (V), floating point
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
you make sure you clear the event flag after updating the advertisement. For example:

```JS
var buttonState = false;

function updateAdvertising() {
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
      v: buttonState ? "press" : "none"
    },
  ]), { name : "Sensor1" });
  // ensure that subsequent updates show button is not pressed
  buttonState = false;
}

// Update advertising now
updateAdvertising();
// Update advertising every 10 seconds...
setInterval(updateAdvertising, 10000);

// When a button is pressed, update advertising with the event
setWatch(function() {
  buttonState = true;
  updateAdvertising();
}, BTN, {edge:"rising", repeat:true})
```

### Booleans

Just supply these with a single boolean value as v, for example: `{type:"door", v:true}`

 * `battery_low`
 * `battery_charge`
 * `cold`
 * `connected`
 * `door`
 * `garage_door`
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

Notes
------

At the moment, BTHome devices can only transmit data (not be connected to), so you can increase battery life
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

There's an [app for Bangle.js](https://banglejs.com/apps/?q=bthome) which will make your [Bangle.js watch](https://www.espruino.com/Bangle.js2)
advertise the current temperature and air pressure.

Mentioned on the forum in:

* [Integration with Home Assistant](https://forum.espruino.com/conversations/361380/)
* [Home Assistant / EspHome/ BTHome / Bluetooth Proxies](https://forum.espruino.com/conversations/382301/)