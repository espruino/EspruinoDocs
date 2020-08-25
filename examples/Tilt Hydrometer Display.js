/*<!-- Copyright (c) 2019 Gordon Williams. See the file LICENSE for copying permission. -->
Tilt Hydrometer Brew Display with Pixl.js
=========================================

* KEYWORDS: Tilt,Hydrometer,Tilt Hydrometer,Brew,Brewing,Beer
* USES: Pixl.js,Graphics,TiltHydrometer

![Tilt Hydrometer Display](Tilt Hydrometer Display.png)

The [Tilt Hydrometer](https://tilthydrometer.com/) is a nice easy way to
get real-time information about the specific gravity and temperature of
beer that you're brewing.

Usually it connects to a phone or Raspberry Pi, but if you want a simple
always-on display for it then you can use this example (or use it
as a base for other projects!).

![](data:image/bmp;base64,Qk0gBAAAAAAAACAAAAAMAAAAgABAAAEAAQD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwOB+A/gOAAAAAAAAAAAAAcDh/wP+DgAAAAAAAAAAAAHA4f+H/g4AAAAAAAAAAAABwAPPj58HAAAAAAAAAAAAAcADx88PBwAAAAAAAAAAAAHAB4PfBwcAAAAAAAAAAAABwAeDwAcDAAAAAAAAAAAAAcAHgcAHA4AAAAAAAAAAAAHAB4HADwOAAAAAAAAAAAABwAeBz58DwAAAAAAAAAAAAcAHgc/+AcAAAAAAAAAAAAHAB4HP/AHgAAAAAAAAAAAZwAeDzvAA8AAAAAAAAAAAP8ADg88AAPAAAAAAAAAAAD/AA4PHAAB4AAAAAAAAAAAfwAHHxwAAeAAAAAAAAAAAD8AB/4f/f/wAAAAAAAAAAAPAAP8H/3/8AAAAAAAAAAABwAB/B/9//AAAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAGjk4iAAAAAAAAAAAAAAAACo7kRgAAAAAAAAAAAAAAAArCrEoAAAAAAAAAAAAAAAAIrKDqAAAAAAAAAAAAAAAABgAEQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//B/BwP4AAAAAAAAAAAAAf/x/wcP+AAAAAAAAAAAAAD/8++HH3wAAAAAAAAAAAAA+APHwB4+AAAAAAAAAAAAAHgHg8A8HgAAAAAAAAAAAAA8B4HAPA4AAAAAAAAAAAAAHgADwAAeAAAAAAAAAAAAAA8AA8AAHgAAAAAAAAAAAAAPAA+AAHwAAAAAAAAAAAAAB4A/gAH8AAAAAAAAAAAAAAPgPwAB+AAAAAAAAAAAAAAB4D8AAfgAAAAAAAAAAAAAAPAPgAB8AAAAAAAAAAAAAeDwB4AAPAAAAAAAAAAAAAHg94eAPDwAAAAAAAAAAAAA8fPHgB48AAAAAAAAAAAAAP/h/wAP+AAAAAAAAAAAAAB/4f8AD/gAAAAAAAAAAAAADwB+AAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAEbsaOJoYAAAAAAAAAAAAABI6ojkqIAAAAAAAAAAAAAATursJKzgAAAAAAAAAAAAAETMSs6qQAAAAAAAAAAAAADgAAAEAAAAAAAAAAAAAAAA)

Simply upload this to [Pixl.js](/Pixl.js) and after a few seconds it'll display
the [Tilt Hydrometer's](https://tilthydrometer.com/) current reading Temperature
and Gravity reading.

The code will work on any Bluetooth LE capable Espruino board - if you're not
using a Pixl you can add your own display with the Graphics instance as the `g` variable,
or you can just replace `displayInfo`.

*/


function displayInfo(reading) {
  g.clear();
  if (!reading) {
    g.drawString("No Tilt found");
  } else {
    g.drawString("Temperature",0,0);
    g.drawString("Gravity",0,30);
    g.setFontVector(20);
    g.setFontAlign(0,-1);
    g.drawString(reading.F.toFixed(1),64,6);
    g.drawString(reading.gravity,64,36);
    g.setFontAlign(-1,-1);
    g.setFontBitmap();
    g.drawString(reading.color, 55, 57);
  }
  g.flip();
}

function arrayBufferToHex (arrayBuffer){
  return (new Uint8Array(arrayBuffer)).slice().map(x=>(256+x).toString(16).substr(-2)).join("");
}

var TILT_DEVICES = {
    'a495bb30c5b14b44b5121370f02d74de': 'Black',
    'a495bb60c5b14b44b5121370f02d74de': 'Blue',
    'a495bb20c5b14b44b5121370f02d74de': 'Green',
    'a495bb50c5b14b44b5121370f02d74de': 'Orange',
    'a495bb80c5b14b44b5121370f02d74de': 'Pink',
    'a495bb40c5b14b44b5121370f02d74de': 'Purple',
    'a495bb10c5b14b44b5121370f02d74de': 'Red',
    'a495bb70c5b14b44b5121370f02d74de': 'Yellow',
};

var failures = 0;

function takeReading() {
  // scan for 5 seconds max
  NRF.setScan(function(device) {
    d = new DataView(device.manufacturerData);
    if (d.getUint8(4) == 0xbb) {
      var hexData = arrayBufferToHex(device.manufacturerData);
      var tempF = d.getUint16(18);
      var tempC = ( tempF - 32) * 5 / 9;
      var gravity = d.getUint16(20) / 1000.0;
      var color = TILT_DEVICES[hexData.substr(4,32)];
      readings= {
        C:tempC,
        F:tempF,
        gravity:gravity,
        d:device.manufacturerData,
        color: color,
      };
      failures=0;
      NRF.setScan();
      if (notFoundTimeout) clearTimeout(notFoundTimeout);
      notFoundTimeout = undefined;
      displayInfo(readings);
    }
  }, { filters: [{ manufacturerData: { 0x004C: {} } }]});
  // stop scanning after 5 seconds
  var notFoundTimeout = setTimeout(function() {
    NRF.setScan();
    notFoundTimeout = undefined;
    failures++;
    if (failures>5) displayInfo();
  }, 5000);
}

// Scan every minute
setInterval(function() {
  takeReading();
}, 60*1000);
// Scan once at boot/upload
takeReading();
