/*
WiFi Xively Humidity/Temperature Sensor with Display
=================================

* KEYWORDS: WiFi,Wireless,Xively,IoT
* USES: Internet,CC3000,DHT11,PCD8544,Xively,Espruino Board,Graphics

![WiFi Humidity](wifi_humidity.jpg)

This is a Wireless Humidity/Temperature sensor that displays information as well as uploading it to [Xively](http://xively.com). For more information on using Xively or other services see the [[IoT Services]] page.

To set this up:

* Head over to [Xively](http://xively.com)
* Get an account
* Create a new 'Public Device'
* Create two channels on the device, `humidity`, and `temperature`
* Copy the API key and the Feed ID and replace the placeholders in the code below with them.
* Replace the placeholders for your WiFi access point name and key

Then all you have to do is copy the code to Espruino and type `onInit()` to start it off, or type `save()` to save it so that it runs automatically each time Espruino powers on.

Wiring
------

The [[CC3000]], [[PCD8544]] and [[DHT11]] have been arranged such that that can all be soldered onto the board.

[[CC3000]] connected as described on that page. An external aerial has been soldered on to increase the range.

[[PCD8544]] LCD connected as follows:

| LCD pin | Pin type | Example pin on Espruino Board |
|---------|----------|-------------------------------|
|  GND    | GND      | GND                           |
|  LIGHT  | Any      | A3                            |
|  VCC    | 3.3v     | 3.3                           |
|  CLK    | SPI SCK  | A5                            |
|  DIN    | SPI MOSI | A7                            |
|  DC     | Any      | A6                            |
|  CE     | Any      | B0                            |
|  RST    | Any      | B1                            |

**Note:** This can be done with a single piece of pin strip (with the DIN/DC pins bent so that they swap location). See the [Soldering an LCD directly to Espruino](/Onboard+LCD) page.


[[DHT11]] connected:

  | Device Pin | Espruino |
  | ---------- | -------- |
  | 1 (Vcc)    | A10      |
  | 2 (S)      | A9       |
  | 3 (NC)     | A8       |
  | 4 (GND)    | C11      |

*/

var g;
var wlan;
var dht;
var interval;
var ticksSinceConnect = 0;

function onInit() {
  // DHT11
  A10.write(1); // VCC for DHT11
  // A8 is NC
  C11.write(0); // GND for DHT11
  dht = require("DHT11").connect(A9);
  // LCD
  A3.reset(); // light
  SPI1.setup({ baud: 1000000, sck:A5, mosi:A7 });
  g = require("PCD8544").connect(SPI1,A6,B0,B1, function() {
    g.clear();
    g.drawString("Connecting....",5,20);
    g.flip();
  });
  // WiFi
  setTimeout(function() {
    wlan = require("CC3000").connect();
    g.clear();
    g.drawString("DHCP....",5,20);
    g.flip();
    wlan.connect( "YOUR_WIFI_NAME", "YOUR_WIFI_KEY", function (s) {
      if (s=="dhcp") {
        g.clear();
        g.drawString("DHCP Complete.",5,20);
        g.flip();

        if (interval!==undefined)
          clearInterval(interval);
        interval = setInterval(onTimer, 10000);
      }
    });
  }, 500);
}

function putXively(a) {
    content = JSON.stringify({
     version : "1.0.0",
     datastreams : [
       { id:"humidity", current_value: a.rh.toString() },
       { id:"temperature", current_value: a.temp.toString() }]
    });
    var options = {
      host: 'api.xively.com',
      port: '80',
      path:'/v2/feeds/YOUR_FEED_ID',
      method:'PUT',
      headers: { "X-ApiKey":"YOUR_API_KEY", "Content-Length":content.length }
    };
    var req = require("http").request(options, function(res)  {
      res.on('data', function(data) {
        console.log("-->"+data);
      });
      res.on('close', function(data) {
        console.log("==> Closed.");
        ticksSinceConnect = 0;
      });
     });
    req.end(content);
}


function onTimer() {
  dht.read(function (a) {
    g.clear();
    g.setFontBitmap();
    g.drawString("Temperature",1,0);
    g.drawString("Humidity",1,24);
    g.drawString("Offline:"+ticksSinceConnect,1,42);
    g.setFontVector(15);
    g.drawString(a.temp,48,0);
    g.drawString(a.rh,48,24);
    g.flip();

    putXively(a);
    ticksSinceConnect++;
  });
}

onInit();
