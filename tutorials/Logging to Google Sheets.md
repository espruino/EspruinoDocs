<!--- Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Logging to Google Sheets
===============================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Logging+to+Google+Sheets. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Wifi,Thermometer,Google Sheets,Google Forms,IoT,ESP8266,HTTPS,TLS
* USES: Internet,Pico,ESP8266,HTTPS,EspruinoWiFi

Introduction
-------------

Often you'll want to take some measurements and then upload them to an online service. There are [some examples of common services here](/IoT+Services), but perhaps one of the most approachable ways to get at your data is just to put it on a [Google Spreadsheet](https://www.google.com/sheets/about/), which you can do by uploading data using [Google Forms](https://www.google.com/forms/about/)

With the Espruino Pico's HTTPS support you can now do this. In this example we'll use an [[ESP8266]] WiFi module to upload the STM32 chip's temperature to Google every minute.

**Note:** In the past this example used an explicit HTTPS key and certificates,
but this is not needed so has been left out. For details on using certificates, see
[[Storing HTTPS Certificates]].

You'll Need
----------

* One [Espruino Pico](/Pico)
* A [[ESP8266]] WiFi module

Or an Espruino [Espruino WiFi](/WiFi)

Wiring Up
--------

For the [Espruino WiFi](/WiFi) you don't have any wiring up to do.

Just follow [the instructions](/ESP8266) for wiring up the ESP8266 module - it's easier to use an adaptor shim for it

Software
--------

* Make sure your Device's firmware is up to date. You need at least `1v92`
* Copy and paste the code below into the right-hand side of the Web IDE
* Change the WiFi name and password at the top of the code
* Delete the `onInit` function at the bottom that's **not** for your board


```
var WIFI_NAME = "";
var WIFI_OPTIONS = { password : "" };

var wifi;

// Actually send a form
function sendForm() {
  // This uploads to https://docs.google.com/spreadsheets/d/1R1D6GKK5MvtjS-PDEPHdqIqKSYX4kG4dPHkj_lkL1P0/pubhtml
  LED1.set(); // light red LED while we're working
  var content = "entry.1093163892="+encodeURIComponent(E.getTemperature());
  var options = {
    host: 'docs.google.com',
    port: '443',
    path:'/forms/d/1bBV4map47MPRWfaHYCEd1ByR4f_sm3LSd3oRdYkiVKg/formResponse',
    protocol: "https:",
    method:'POST',
    headers: { 
      "Content-Type":"application/x-www-form-urlencoded",
      "Content-Length":content.length
    }
  };

  console.log("Connecting to Google");
  require("http").request(options, function(res)  {
    console.log("Connected to Google");
    var nRecv = 0;
    res.on('data', function(data) { nRecv += data.length; });
    res.on('close', function(data) {
      LED1.reset(); // turn red LED off when finished
      console.log("Google connection closed, "+nRecv+" bytes received");
    });
  }).end(content);
}

function onConnected(err) {
  if (err) throw err;
  wifi.getIP(function(e,ip) {
    LED2.set();
    console.log(ip);
    setInterval(sendForm, 60000); // once a minute
  });
}

// For Espruino Pico
function onInit() {
  clearInterval();
  // initialise the ESP8266, after a delay
  setTimeout(function() {
    digitalWrite(B9,1); // enable on Pico Shim V2
    Serial2.setup(115200, { rx: A3, tx : A2 });
    wifi = require("ESP8266WiFi_0v25").connect(Serial2, function(err) {  
      if (err) throw err;
      console.log("Connecting to WiFi");
      wifi.connect(WIFI_NAME,WIFI_OPTIONS.password, onConnected);
    });
  }, 2000); 
}

// For Espruino WiFi
function onInit() {
  wifi = require("EspruinoWiFi");
  wifi.connect(WIFI_NAME, WIFI_OPTIONS, onConnected);
}
```

* Now go to `drive.google.com` (you need to be logged in with your Google account)
* Click `New`, `more`, `Google Forms`
* Edit the title
* Add a First item with title `Temperature` and set the question type to `Text`
* Click `Done`
* Click `Send form` and copy the URL you're given
* Open it in the web browser, right-click and `view source`
* Search for `<form` and copy the `/forms/...` but out of the `action` parameter and paste it into `path` in `sendForm`
* Search for `<input type="text"` and copy the `name` parameter out and paste it into where it says `var content =` in `sendForm` - make sure there is an `=` on the end.
* Now upload the code to Espruino, and type `save()` to save it to flash - it should now start running.

Logging more data is easy - you can just add more items to your form and can append extra items to the `content` variable. The content is just like a URL... To add more items, you need to separate them with an `&` character.
