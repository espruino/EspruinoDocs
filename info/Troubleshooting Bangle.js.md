<!--- Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bangle.js Troubleshooting
=========================

* KEYWORDS: Troubleshooting,Trouble,Problems,Help,Broken,Not Working

What follows is a quick list of potential problems and solutions. If your problem isn't covered here, please post in the [Bangle.js Forum](http://forum.espruino.com/microcosms/1424/).

Please also check out the [Bluetooth specific troubleshooting page](http://www.espruino.com/Troubleshooting+BLE)

* APPEND_TOC

### I can't upload apps, and the IDE just says `-> Terminal` when connected

On Firmwares shipped on KickStarter Bangle.js there was a bug. Please leave `Debug Info` set to `Hide` (the default) in Bangle.js's `Settings`, then update to the latest Bootloader version using https://banglejs.com/apps (which will allow everything to work even with `Debug Info` set to `Show`).


### My Bangle.js no longer boots to the clock

This may be because the JS bootloader has been overwritten, which can
be done if you use `Save to Flash` to write code in the IDE.

* Go to https://banglejs.com/apps
* Click `About -> Install default apps` which will erase everything and return Bangle.js to default (or try installing just `Bootloader` from library)
