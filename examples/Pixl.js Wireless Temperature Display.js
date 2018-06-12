/*<!-- Copyright (c) 2018 Gordon Williams. See the file LICENSE for copying permission. -->
Pixl.js Wireless Temperature Display
=====================================

* KEYWORDS: Temperature Sensor,Display
* USES: Pixl.js,Puck.js,Graphics,BLE

![Pixl.js Wireless Temperature Display](Pixl.js Wireless Temperature Display.jpg)

Here we're using the on-chip temperature sensor of [Puck.js](/Puck.js) devices
to turn them into beacons. They'll advertise the temperature and battery level
as 'manufacturer data', with Espruino's own manufacturer code `0x590`.

[Pixl.js](/Pixl.js) then scans for advertising packets once a minute and displays a list
of all devices it has found that are advertising with the manufacturer code `0x590`,
along with their battery level and temperature.

**Note:** [Pixl.js Wireless Weather Station](/Pixl.js Wireless Weather Station)
is very similar but uses a [Thingy:52](/Thingy52) as a sensor. The Weather
Station example uses significantly more power as it scans constantly (this
scans for 1 second every minute).
*/

// -------------------------------------------------------------------
// Upload the following to one or more Puck.js and disconnect
//  - advertising only starts once disconnected

function updateBT() {
  NRF.setAdvertising({}, {
    manufacturer: 0x590,
    manufacturerData: [Puck.getBatteryPercentage(), E.getTemperature()]
  });
}

setInterval(updateBT, 6000);
updateBT();

// -------------------------------------------------------------------
// Upload the following to a Pixl.js

function scanForDevices() {
  NRF.findDevices(function(devs) {
    g.clear();
    var idx = 0;
    devs.forEach(function(dev) {
      if (dev.manufacturer!=0x590) return;
      var d = new DataView(dev.manufacturerData);
      g.drawString(`${dev.name}: ${d.getInt8(1)}'C (${d.getUint8(0)}% bat)`,0,idx*6);
      idx++;
    });
    if (!idx) g.drawString("(no devices found)");
    g.flip();
  }, 1000); // scan for 1 sec
}

setInterval(scanForDevices, 60000); // update once a minute
scanForDevices();
