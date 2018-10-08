/*<!-- Copyright (c) 2018 Gordon Williams. See the file LICENSE for copying permission. -->
Pixl.js Wireless Weather Station
=====================================

* KEYWORDS: Temperature Sensor,Display
* USES: Pixl.js,Thingy52,Graphics,BLE

![Pixl.js Wireless Weather Station](Pixl.js Wireless Weather Station.jpg)

In the [Pixl.js Wireless Temperature Display](/Pixl.js Wireless Temperature Display) example
we used a [Puck.js](/Puck.js) to transmit temperature information.

Here we're using the on-chip sensors from a [Thingy:52](/Thingy52) in a similar
way, but are packing more information in. The Thingys will advertise
as 'manufacturer data' with Espruino's own manufacturer code `0x590`.

[Pixl.js](/Pixl.js) then scans constantly for advertising packets and displays
the decoded data from any device it finds that advertises with the manufacturer
code `0x590`.

**Note:** Scanning all the time uses a lot of power, and isn't suitable for
battery operated devices. If you need to run off a battery consider using
a solution like [Pixl.js Wireless Temperature Display](/Pixl.js Wireless Temperature Display)
which will only scan for a second once a minute.
*/

// -------------------------------------------------------------------
// Upload the following to a Thingy:52 and disconnect
//  - advertising only starts once disconnected

var pressure= {};

function onInit() {
  setTimeout(function() {
    // save the latest pressure data
    Thingy.onPressure(d=>pressure=d);
    // When we get a gas reading, update the advertising
    Thingy.onGas(function(data) {
      var a = new Uint8Array(8);
      var d = new DataView(a.buffer);
      d.setUint16(0, data.eCO2);
      d.setUint16(2, data.TVOC);
      d.setUint16(4, pressure.pressure);
      d.setUint16(6, pressure.temperature*100);

      NRF.setAdvertising({},{manufacturer: 0x590, manufacturerData: a});
    });
  },1000);
}

onInit(); // remove this line if you're planning on saving to flash

// -------------------------------------------------------------------
// Upload the following to a Pixl.js

require("Font8x12").add(Graphics);

function updateDisplay(data) {
  var d = new DataView(data);
  var res = [
   "eCO2 = " +  d.getUint16(0),
   "TVOC2 = " + d.getUint16(2),
   "Pressure = " + d.getUint16(4),
   "Temperature = " + d.getUint16(6)/100
  ];

  g.clear();
  g.setFont8x12();
  g.drawString(res.join("\n"));
  g.flip();
}

function onInit() {
  NRF.setScan(function(dev) {
    if (dev.manufacturer == 0x590)
      updateDisplay(dev.manufacturerData);
  });
}

onInit(); // remove this line if you're planning on saving to flash
