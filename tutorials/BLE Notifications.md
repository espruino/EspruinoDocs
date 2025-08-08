<!--- Copyright (c) 2025 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bluetooth Characteristic Notifications
=======================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/BLE+Notifications. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,BLE,Bluetooth,Notifications,Notify,Indicate,Indication,Characteristic,characteristicvaluechanged,startNotifications
* USES: BLE,Only BLE

Bluetooth LE supports Notifications on Characteristics. These are sent when a characteristic changes
and are a way for a peripheral to 'push' data.

For example for the built-in serial connection Espruino uses Nordic UART, and for
this it uses characteristic `"6e400003-b5a3-f393-e0a9-e50e24dcca9e"` with Notifications,
and notifies whenever there are characters for it to transmit.

## Peripheral

When using Espruino as a peripheral (a device that is connected *to*, from some other device), you need to use
[`NRF.setServices`](https://www.espruino.com/Reference#l_NRF_setServices) to define your services, and ensure
that `notify:true` is set to enable notifications on that characteristic:

```JS
NRF.setServices({
  "df71f80f-0000-0b00-0a4f-a4908e7d86ee": { // service
    "df71f80f-0001-0b00-0a4f-a4908e7d86ee": { // characteristic
      readable: true, // optional - can the connecting device request a read of this?
      notify: true,
      value: [0x00], // initial value
    },
    // ... more characteristics
  }
});
```

Then, when you want to change a notification, you just call [`NRF.updateServices`](https://www.espruino.com/Reference#l_NRF_updateServices)
with the values you want to update, and `notify:true` if you want to send a notification:

```JS
/// Now send an update
function sendValue(v) {
  NRF.updateServices({
    "df71f80f-0000-0b00-0a4f-a4908e7d86ee": { // service
      "df71f80f-0001-0b00-0a4f-a4908e7d86ee": { // characteristic
        value: [v],
        notify: true
      } // you only need to mention the characteristics you want to update
    }
  });
}
```

For an example of this in use, you can see the [BLE MIDI library](https://www.espruino.com/BLE+MIDI) - ([see the source here](https://github.com/espruino/EspruinoDocs/blob/master/modules/ble_midi.js))

## Central

When using Espruino as a central (a device that initiates the connection to a peripheral)
the API is just the standard Web Bluetooth API. Once you have the [BluetoothRemoteGATTCharacteristic](https://www.espruino.com/Reference#BluetoothRemoteGATTCharacteristic),
you just need to:

* Handle [the `characteristicvaluechanged` event](https://www.espruino.com/Reference#l_BluetoothRemoteGATTCharacteristic_characteristicvaluechanged)
* Enable Notifications [with `BluetoothRemoteGATTCharacteristic.startNotifications`](https://www.espruino.com/Reference#l_BluetoothRemoteGATTCharacteristic_startNotifications)

When disconnecting, notifications are automatically disabled, but you can also call [with `stopNotifications`](https://www.espruino.com/Reference#l_BluetoothRemoteGATTCharacteristic_stopNotifications)
to disable them if you need to when connected.

```JS
// And example of connecting to an Espruino device via Nordic UART
var gatt;
NRF.connect("pu:ck:js:ad:dr:es random").then(function(g) {
  gatt = g;
  return gatt.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
}).then(function(service) {
  return service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e"); // get the characteristic
}).then(function(characteristic) {
  characteristic.on('characteristicvaluechanged', function(event) { // respond to notifications
    console.log("RX: "+JSON.stringify(event.target.value.buffer));
  });
  return characteristic.startNotifications(); // enable reception of notifications
}).then(function() {
  console.log("Done!");
});
```

For an example of this in use, you can see the [`ble_uart` library](https://www.espruino.com/BLE+UART) - ([see the source here](https://github.com/espruino/EspruinoDocs/blob/master/modules/ble_uart.js))