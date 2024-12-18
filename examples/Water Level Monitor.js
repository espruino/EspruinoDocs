/*<!-- Copyright (c) 2024 Gordon Williams. See the file LICENSE for copying permission. -->
Water Level Monitor
====================

* KEYWORDS: Water,Level,Christmas,Xmas,Home Assistant,Float
* USES: Puck.js,Bangle.js,BLE,BTHome

![Water Level Monitor](Water Level Monitor/setup.jpg)

Sometimes it's really useful to be able to measure water level, for example to keep an eye on water in a Christmas Tree.

An easy way to do this is to attach a device that can measure acceleration (and hence angle) to a float via a hinge mechanism. Its angle will then change based on the water level.

This code advertises the water level, battery level and temperature  in a [BTHome (https://bthome.io/)](https://bthome.io/) compatible format,
which can then be used in https://www.home-assistant.io/ where the data can be recorded and an 'Automation' can be set up to send notifications
to your phone when the water level is too low.

![history](Water Level Monitor/history.png)

This uses the https://www.espruino.com/BTHome library to advertise information over Bluetooth LE.

## Usage

Create a swinging float by bending a bit of wire and glueing a ping-pong ball to the end, then attach you device - I used Hot Glue for this.

* [Puck.js](/Puck.js) should have the lanyard attachment point pointing towards the ping-pong ball.
* [Bangle.js 2](/Bangle.js2) should be with the screen downwards, and the button pointing towards the ping-pong ball.

Copy the app below to the right-hand side of the Web IDE. For debugging you may want to change `60000` (1 minute) to something faster like `1000` for 1 sec.

* On Puck.js, upload to `Flash`
* On Bangle.js upload to a file called `waterlvl.boot.js` in `Storage` which should allow it to run in the background alongside other apps

Now you can check the percentage value reported for different angles by typing `v` and enter into the left-hand side of the Web IDE. If they need changing you can check the values from `Math.atan2(a.z,a.x)` and change the
values in `(2-Math.atan2(a.z,a.x))*200)` accordingly.

Remember to return `setInterval` to `60000` or below to keep battery usage to a minimum (Puck.js should last for almost a year), then re-upload and disconnect from the Web IDE. Once disconnected the Puck should then appear in Home Assistant's new device page.

*/
var a,v;

function updateAdvertising() {
  // read accelerometer (Bangle or Puck.js)
  a = global.Puck ? Puck.accel().acc : Bangle.getAccel();
  // turn angle into a percentage
  v = E.clip(Math.round((2-Math.atan2(a.z,a.x))*200),0,100);

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
      type : "count16",
      v : v
    },
  ]), {
    name : "Water", interval:1000,
    // not being connectable/scannable saves power (but you'll need to reboot to connect again with the IDE!)
    //connectable : false, scannable : false,
  });
}

NRF.setTxPower(4);
updateAdvertising();
setInterval(updateAdvertising, 60000); // 1 minute