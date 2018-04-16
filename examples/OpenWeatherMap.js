/*
<!--- Copyright (c) 2018 Joachim Klein. See the file LICENSE for copying permission. -->
Open Weather Map Example
=========================

* KEYWORDS: Weather, Temperature, Internet, Wifi
* USES: wifi, http, Internet

Introduction
-----------

This example shows how to download data from open weather map.
http://openweathermap.com/

To access open weather map you have to register their.
Open Weather Map allows you to download different data about
- current Weather conditions,
- past Weather conditions,
- Weather Forecast.

Also it is possible to setup an own Weather Station and send data to open Weather Map.

You find more details about the API and the data you can download here:
http://openweathermap.com/api

Example: Download Current Weather Data
--------------------------------------

This example just downloads the current weather condition of a given location ID.
You only have to fill in your network ID, Network Password and your open Weather Map API Key.
This example was tested with ESP32 and should also work with any other Espruino with network connection (wifi).

Time in this example is GMT! This is important if you like to use sunrise and sunset time.
*/
var wifi = require("Wifi");
var http = require("http");

// Request your own Key at: http://openweathermap.com/
var API_Key = "<your API Key>";
var Location = "2912573";
var OWM = "https://api.openweathermap.org/data/2.5/weather";
var SSID = "<your network ID>";
var PSWD = "<your network PSWD>";


function OnConnect ( ) {
  print ("Wifi Connected");
}

/*
 if you like to see more details just dump the entire data!
*/
function DumpWeather( OWMData ) {

  /* remove comment below to see full data */
  // console.log(OWMData);
  console.log("Temperature: " +  (OWMData.main.temp-273.15));
  console.log("Pressure:    " +  (OWMData.main.pressure) + "hPa");
  console.log("Humidity:    " +  (OWMData.main.humidity) +"%");
  console.log("Wind speed:  " +  OWMData.wind.speed + "m/s");
  console.log("Weather:     " +  OWMData.weather[0].description);
  var SRD = new Date(OWMData.sys.sunrise*1000);
  console.log("Sunrise:     " +  SRD.getHours() + ":" +SRD.getMinutes());
  var SSD = new Date(OWMData.sys.sunset*1000);
  console.log("Sunset:      " +  SSD.getHours() + ":" +SSD.getMinutes());
  var SAM = new Date(OWMData.dt*1000);
  console.log("Sample:      " +  SAM.getHours() + ":" +SAM.getMinutes());

}

function DoInit() {
  print(wifi.getStatus()  );
  print(wifi.stopAP()  );
  //wifi.setHostname("MyDevice");
  wifi.connect(SSID, { password:PSWD}, function(err) { OnConnect(err); } );
  print(wifi.getStatus()  );


  print ("Request: "+OWM+"?id="+Location+"&APPID="+API_Key);
  http.get(OWM+"?id="+Location+"&APPID="+API_Key, function(res) {
    var contents = "";
    res.on('data', function(data) { contents += data; });
    res.on('close', function() { DumpWeather(JSON.parse(contents)); });
  });

  wifi.on('disconnected', function(details) {
    print("Lost Connection" + details );
  });
}

DoInit();
