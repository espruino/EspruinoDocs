<!--- Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Puck.js and Eddystone Beacons
=============================

* KEYWORDS: Module,Modules,BLE,Bluetooth,EddyStone,FatBeacon,iBeacon,Beacon
* USES: Puck.js

[Eddystone](https://github.com/google/eddystone) is an open beacon format from Google
that allows you to transmit a URL that will appear as a notification on
a user's phone.

Android phones > 4.4 will have support - but it may need enabling.
[See here](https://developers.google.com/beacons/) for more information.

All you need to do to use it is use the [[ble_eddystone.js]] module.:

```
require("ble_eddystone").advertise("goo.gl/B3J0Oc");
```

From then on, Puck.js will broadcast the URL to anything that will listen. It
is helpful if you use a descriptive title on the web page you're using, as this
will appear

**Note:** Since you can't advertise while you're connected via Bluetooth LE,
you will have to disconnect from your Puck for it to start transmitting.

While Puck.js can transmit pretty much anything, your phone will
only notify you

The URLs:

* Must be HTTPS URLs
* Must be [short](https://github.com/google/eddystone/tree/master/eddystone-url)

**To turn Eddystone advertising off** simply call `NRF.setAdvertising({});`

An Example
==========

* Go to the [Meme Generator website](https://imgflip.com/memegenerator)
* Generate a suitable image and copy the (https) URL
* Go to the [Goo.gl](https://goo.gl/) URL shortener
* Create a shortened URL and then copy it into a `require("ble_eddystone").advertise("goo.gl/abcdef");` command
* Once executed (and you have disconnected), Puck.js will start advertising Eddystone
* You can also call  `NRF.setAdvertising({});` to stop advertising
