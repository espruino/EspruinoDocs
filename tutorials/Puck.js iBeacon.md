<!--- Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Puck.js and iBeacons
=============================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Puck.js+iBeacon. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Modules,BLE,Bluetooth,EddyStone,FatBeacon,iBeacon,Beacon
* USES: Puck.js,BLE,Only BLE

**Note:** For Eddystone, see [this page](/Puck.js Eddystone)

[iBeacon](https://en.wikipedia.org/wiki/IBeacon) is a beacon format from Apple
that allows you to transmit information which can appear as a notification on
a user's iPhone.


All you need to do to use it is use the [[ble_ibeacon.js]] module:

```
require("ble_ibeacon").advertise({
  uuid : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // ibeacon uuid
  major : 0x0001, // optional
  minor : 0x0001, // optional
  rssi : -59 // optional RSSI at 1 meter distance in dBm
});
```

**Note:** you'll need to get an iBeacon UUID from Apple to use this.

From then on, Puck.js will broadcast to anything that will listen.

**Note:** Since you can't advertise while you're connected via Bluetooth LE,
you will have to disconnect from your Puck for it to start transmitting.

**To turn iBeacon advertising off** simply call `NRF.setAdvertising({});`

Advanced
--------

You can also use `require("ble_ibeacon").get` with the same options as
`advertise` to get the array of advertising data to use. You can
feed this directy into `NRF.setAdvertising()`'s first argument and
can set other options such as advertising rate.

In Puck.js 1v92 You can also supply an array of advertising data:

```
NRF.setAdvertising([
  require("ble_ibeacon").get(...),
  require("ble_eddystone").get(...)
  ], {interval:100});
```

In which case Puck.js will send each advertising packet in turn.

**This library's default behaviour is to overwrite Puck.js's advertising
(name, services, etc) with iBeacon.** However you can easily add the advertising
in addition to Espruino's existing advertising by setting the Eddystone
advertising inside the Advertising Scan Response:

```
NRF.setScanResponse(require("ble_ibeacon").get(...));
```
