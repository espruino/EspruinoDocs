/*
HTTP Image Loader
=================

* KEYWORDS: WiFi,Wireless,Image,Bitmap
* USES: Internet,CC3000,PCD8544,BMPLoader,Graphics

This code gets a 1 bit bitmap off the internet every 10 seconds, and displays it on a [[PCD8544]] LCD.

All you need to do is copy it in and change the Wifi Name and Key near the bottom. Note that the image doesn't change at all - ideally you'd connect this to a webpage that was able to send a customized image each time.

Wiring
------

Just connect the [[CC3000]] as described on the [[CC3000]] page, and the [[PCD8544]] as described on the [[Onboard LCD]] page.

*/

function get() {
  var bmpString = "";
  require("http").get("http://www.espruino.com/images/espruino_84_48_1bpp.bmp", function(res) {
    res.on('data', function(data) { bmpString += data; });
    res.on('close', function() {
      var img = require("BMPLoader").load(bmpString);
      g.drawImage(img, 0, 0);
      g.flip();
    });
  });
}

var wlan;
var interval = undefined;
var g;

function onInit() {
  A2.write(0); // LCD GND
  A4.write(1); // LCD VCC
  // setup LCD
  g = require("PCD8544").connect(SPI1,A6,B0,B1, function() {
    g.clear();
    g.drawString("Loading...",0,0);
    g.flip();
    // setup wlan
    wlan = require("CC3000").connect();
    wlan.connect( "YOUR_WIFI_NAME", "YOUR_WIFI_KEY", function (s) {
      g.clear();
      g.drawString(">"+s,0,0);
      g.flip();
      if (s=="dhcp") {
        console.log("My IP is "+wlan.getIP().ip);
        clearInterval(interval);
        setInterval(get, 10000);
      }
    });
  });
}

onInit();
