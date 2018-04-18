<!--- Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
YouTube View Counter
======================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/YouTube+View+Counter. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: YouTube,Views,JSON,HTTPS,Google API
* USES: Internet,EspruinoWiFi,MAX7219,Graphics

[[http://youtu.be/NLYScs3R488]]


You'll Need
----------

* An Espruino [[WiFi]]
* A [[MAX7219]] 32x8 Pixel LED display


Wiring Up
--------

Just connect as follows:

| MAX7219 | Espruino |
|---------|----------|
| VCC     | VUSB or 3.3V |
| GND     | GND      |
| DOUT    | B3       |
| CS      | B4       |
| CLK     | B5       |

**Note:** Due to the ordering of the wires on the [[MAX7219]] board and the
colouring of the supplied ribbon cable, be really careful not to accidentally
connect up the voltage backwards.

The [[MAX7219]] board should run off of 3.3v or 5v. 5v will be brighter and will put
less strain on the 3.3v line (also used by WiFi).

Since we're using software [[SPI]] here, you can use any available GPIO pins for the [[MAX7219]].


Software
--------

Use this software on the right-hand side of the Web IDE, making sure you change the
WiFi, Video and API key details at the top. See the video for how to get a working
API key.


```
var WIFI_NAME = "espruino";
var WIFI_OPTIONS = { password : "testtest" };
var VIDEO_ID = "aZ4MKhqvz2w";
var API_KEY = "";

var disp;
var g = Graphics.createArrayBuffer(32, 8, 1);
g.flip = function() { disp.raw(g.buffer); };

require("Font4x8Numeric").add(Graphics);
g.setFont4x8Numeric();

var wifi;

var count = 0;
var lastCount = 0;
var interval;

function drawCount() {
  g.clear();
  var c = count.toString();
  g.drawString(c, g.getWidth()-g.stringWidth(c));
  g.flip();
}

function updateCount(newCount) {
  if (interval) clearInterval(interval);
  interval = undefined;
  var diff = newCount - lastCount;
  if (lastCount===0 || diff<=0) {
    lastCount = newCount;
    count = newCount;
    drawCount();
    return;
  }
  lastCount = count;
  count = newCount;
  drawCount();
  interval = setInterval(function() {
    count++;
    drawCount();
  }, 60000/diff);
}

function getPage() {
  require("http").get("https://www.googleapis.com/youtube/v3/videos?part=statistics&id="+VIDEO_ID+"&key="+API_KEY, function(res) {
    var data = "";
    res.on('data', function(d) { data += d; });
    res.on('close', function() {
      var json = JSON.parse(data);
      updateCount(json.items[0].statistics.viewCount);
    });
  });
}

function onInit() {
  var spi = new SPI();
  spi.setup({ mosi:B3, sck:B5 });
  disp = require("MAX7219").connect(spi, B4, 4);

  wifi = require("EspruinoWiFi");
  wifi.connect(WIFI_NAME, WIFI_OPTIONS, function(err) {
    if (err) {
      console.log("Connection error: "+err);
      return;
    }
    console.log("Connected!");
    // Update immediately
    getPage();
    // Now update every 60 seconds
    setInterval(getPage, 60000);
  });
}
```

**Note:** This code uses a 4x8 font (mentioned in the video, but not shown) which will
allow you to get more digits (8) on the display.
