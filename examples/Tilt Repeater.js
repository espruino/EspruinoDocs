/*<!-- Copyright (c) 2019 Noah Baron. See the file LICENSE for copying permission. -->
Tilt Hydrometer Repeater
=========================

* KEYWORDS: Tilt,Hydrometer,Tilt Hydrometer,Brew,Brewing,Beer
* USES: Only BLE,TiltHydrometer

![Tilt Repeater](Tilt Repeater.png)

The [Tilt Hydrometer](https://tilthydrometer.com/) is a nice easy way to
get real-time information about the specific gravity and temperature of
beer that you're brewing.

It broadcasts information about your brew to your Phone through Bluetooth LE,
however if you are brewing in Stainless Steel containers or in a garage then
you might have problems getting a high enough signal strength to put your
phone somewhere convenient.

Just upload the code below to any Bluetooth LE capable Espruino board, and
put the board within range of [the Tilt](https://tilthydrometer.com/). It'll
scan for the reading from the Tilt and will then broadcast it at a higher
signal strength, increasing the range.

Uploading
-----

* Use `Save on send` set to `Direct to flash` in the Web IDE settings when uploading
* You will need Espruino 2v01 or later installed on your device
* Copy the code below to the right-hand side of the IDE and click 'Upload'

Notes
-----

* Baron Brew [sell their own Espruino-based Repeater](https://tilthydrometer.com/blogs/news/extending-range-in-stainless-fermentors-with-the-tilt-repeater-1)
so if you want an easy way to get started or just want to support them, we'd suggest you use that.
* Baron Brew keep the latest version of this software [in their own GitHub Repository](https://github.com/baronbrew/tilt-repeater-js)
* Scanning requires quite a lot of energy and so the repeater requires around 300uA of power on average. When running off a device like [Puck.js](/Puck.js) that
only has a small watch battery, it will flatten in a few weeks. We'd recommend using a rechargeable battery or an external power source instead.

*/


function arrayBufferToHex (arrayBuffer){
  return (new Uint8Array(arrayBuffer)).slice().map(x=>(256+x).toString(16).substr(-2)).join("");
}

function startScan (){
  NRF.setScan(function(d) {
    var hexData = arrayBufferToHex(d.manufacturerData);
    if (hexData.substr(8,4) == 'bb' + color + '0'){//matches key portion of iBeacon UUID for a Tilt
      changeInterval(tiltInterval, 980); //after finding a Tilt, scan for the next advertisement in 980ms. (assumes a 20ms processing time)
      digitalPulse(LED2, 1, 3);//flash green LED to indicate a connection
      NRF.setScan();//stop scanning since tilt has been found
      //console.log(hexData);
      var majorValue = parseInt(hexData.substr(36,4),16);//set values to repeat
      var minorValue = parseInt(hexData.substr(40,4),16);//set values to repeat
      var uuidValue = parseInt(color + hexData[11], 16);//convert tilt color to hex value for use in UUID
      //console.log(majorValue, minorValue, uuidValue);
      NRF.setAdvertising(require("ble_ibeacon").get({ uuid : [0xa4, 0x95, 0xbb, uuidValue, 0xc5, 0xb1, 0x4b, 0x44, 0xb5, 0x12, 0x13, 0x70, 0xf0, 0x2d, 0x74, 0xde], major : majorValue, minor : minorValue, rssi : -59 }),{interval:1000});
      scanCounter = 0;
    }
  }, { filters: [{ manufacturerData: { 0x004C: {} } }] });
  //try to sync
  if (scanCounter == 1){
    changeInterval(tiltInterval, 1000);//change to 1 second interval after initial interval of 980ms (assumes 20ms processing time no longer needed)
  }
  //fast search if not found in sync
  if (scanCounter == 120){//starting scanning 4x more frequently if tilt not found after 120 tries
    changeInterval(tiltInterval, 190);
    scanCounter = 2;//skips changing scan to 1 second interval, keeps scanning 4x
  }
  scanCounter++;
  //console.log(scanCounter);
  //stop scan after x ms
  setTimeout(function () { NRF.setScan(); }, 110);//main function to duty cycle scanning, scan is actually only 10ms, assumes 100ms for scanning to start up
}

// fix for powersave issue in 2v01 and earlier
digitalWrite(D7,0);
//enable watchdog timer - disabling because when asleep it causes a reboot
//E.enableWatchdog(5);

// set power
NRF.setTxPower(4);
// intialize global variables
var scanCounter = 0;//number of scans counted starts from 0
var color = 0;//no tilt color selected state
var presses = 9;//not advertising state
var tiltInterval;//global variable for managing tilt scan frequency
// remove all watches
clearWatch();
//cleart intervals and timeouts
clearInterval();
clearTimeout();
setWatch(function() {
  presses++;
  //conditional for presses past valid color (8)
  if (presses == 9){//turns off advertising and scanning, flashed red LED to indicate turned off
    NRF.sleep();
    clearInterval(tiltInterval);
    digitalPulse(LED1, 1, 50);
    return;
  }
  if (presses > 9){
    presses = 1;//start over with presses (color)
    NRF.wake();
    tiltInterval = setInterval(function (){ startScan(); }, 190);//start with frequent scan
    digitalPulse(LED2, 1, 50);
  }else if (presses < 9) {
      digitalPulse(LED2, 1, 50);
  }
  //jump to fast search
  scanCounter = 120;//skip to 120 to maintain frequent scanning
  var uuidValue = parseInt('0x' + presses + '0');
  //start advertising initial repeated color whith zeros for sg and temp values
  NRF.setAdvertising(require("ble_ibeacon").get({ uuid : [0xa4, 0x95, 0xbb, uuidValue, 0xc5, 0xb1, 0x4b, 0x44, 0xb5, 0x12, 0x13, 0x70, 0xf0, 0x2d, 0x74, 0xde], major : 0, minor : 0, rssi : -59 }),{interval:500});
  color = presses;
}, BTN, { repeat: true, debounce : 50, edge: "rising" });
