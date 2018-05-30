<!--- Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
IoT Services
==========

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/IoT+Services. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,IoT,Server,Service,Broker,Cloud Services,Hosted Services,Data Services,Cubitic,Xively,IFTTT,Dweet,Internet
* USES: Internet,ESP8266,CC3000,WIZnet,GSM

There are [quite a lot](http://postscapes.com/companies/iot-cloud-services) of IoT cloud service providers around at the moment. We've collected some sample code for a selection of them below. If you've got some code you'd like to share, please contribute it (you can submit changes via [this page on GitHub](https://github.com/espruino/EspruinoDocs/blob/master/info/IoT%20Services.md)).

**Note:** To avoid duplication, all of this code expects that you already have an [Internet connection](/Internet).


Vizibles
--------

[Vizibles](https://vizibles.com) is an IoT platform with both, data collection and action triggering roles, for your things.

They offer a [custom firmware for ESP8266](https://github.com/Enxine/ViziblesArduino/releases), which makes all the hard work of connecting to the platform,
and an Espruino module for interfacing with it. This makes very easy writing applications with sensors and actuators in Espruino for the Vizibles platform.

```
var vz-options = {
  'keyID': 'MY KEY ID',
  'keySecret' : 'MY KEY SECRET',
  'id' : 'example'
};

//Connect to the Vizibles platform
var cloud = require('Vizibles').init(Serial2, function (d) {
   cloud.connect(vz-options, null, connected);   
});  

//Define some functions to be called from the cloud
var lightOn = function(d) {
  //Turn on the LED
  digitalWrite(LED2,1);
  //Publish the change to the cloud
  cloud.update({status : 'on'});
};
var lightOff = function(d) {
  //Turn off the LED
  digitalWrite(LED2,0);
  //Publish the change to the cloud
  cloud.update({status : 'off'});
};

//publish those functions once connected
var connected = function(d) {
 cloud.expose('lightOn', lightOn, function(d){
   if(d=='Ok'){
     cloud.expose('lightOff', lightOff, function(d){
       if(d!='Ok'){
         connected();
       }
     });
   } else {
     connected();
   }
});  
```

Cubitic.io
---------

[cubitic.io](http://www.cubitic.io) is a predictive analytics platform for IoT.

They're in private beta at the moment, so drop them an e-mail if you want to experiment with their service.

```
var CUBITIC = {
  APPID : YOUR_APP_ID,
  TOKEN : YOUR_TOKEN
};

function putCubitic(event, data) {
  content = JSON.stringify(data);
  var options = {
    host: 'api.cubitic.io',
    port: '80',
    path:'/v1/event/'+event,
    method:'POST',
    headers: {
      "Content-Type":"application/json",
      "cubitic-appid":CUBITIC.APPID,
      "Authorization":"Bearer "+CUBITIC.TOKEN,
      "Content-Length":content.length
    }
  };
  require("http").request(options, function(res)  {
    var d = "";
    res.on('data', function(data) { d+= data; });
    res.on('close', function(data) {
      console.log("Closed: "+d);
    });
  }).end(content);
}

function getCubitic(event, callback) {
  var options = {
    host: 'api.cubitic.io',
    port: '80',
    path:'/v1/event/'+event,
    method:'GET',
    headers: {
      "cubitic-appid":CUBITIC.APPID,
      "Authorization":"Bearer "+CUBITIC.TOKEN
    }
  };
  require("http").request(options, function(res)  {
    var d = "";
    res.on('data', function(data) { d+= data; });
    res.on('close', function(data) {
      var j = JSON.parse(d);
      if (callback) callback((j&&j.result)?j.result:undefined);
    });
  }).end();
}

// Send data...
putCubitic("TemperatureMeasured",
     {
      "value": E.getTemperature(),
      "units": "C",
      "location" : {
        "lat": 51.652,
        "long": -1.268
      }
     });
```



Dweet.io
-------

*Ridiculously simple messaging (and alerts) for the Internet of Things.*

[Dweet](http://dweet.io/) is like a really easy to use Twitter. Post messages, and then get the latest 'dweet' or stream updates. The free version has no security (but also no signup process!) - for prototyping where you want to communicate with devices without running a server it's great.


```
// Espruino 1v81 and later don't need this function
function encodeURIComponent(s) {
  var ok = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~";
  var r = "";
  for (var i=0;i<s.length;i++) {
    if (ok.indexOf(s[i])>=0) r+=s[i];
    else r+= "%"+(256+s.charCodeAt(i)).toString(16).toUpperCase().substr(-2);
  }
  return r;
}

function putDweet(dweet_name, a, callback) {
  var data = "";
  for (var n in a) {
    if (data.length) data+="&";
    data += encodeURIComponent(n)+"="+encodeURIComponent(a[n]);
  }
  var options = {
    host: 'dweet.io',
    port: '80',
    path:'/dweet/for/'+dweet_name+"?"+data,
    method:'POST'
  };
  require("http").request(options, function(res)  {
    var d = "";
    res.on('data', function(data) { d+=data; });
    res.on('close', function(data) {
      if (callback) callback(d);
    });
 }).end();
}

function getDweet(dweet_name, callback) {
  require("http").get('dweet.io/get/latest/dweet/for/'+dweet_name, function(res)  {
    var d = "";
    res.on('data', function(data) { d+=data; });
    res.on('close', function(data) {
      var j = JSON.parse(d);
      if (callback) callback((j&&j.with&&j.with.length)?j.with[0].content:undefined);
    });
 });
}

putDweet("espruino", {hello:"world2"}, function(response) {
  console.log(response);
});
// read with http://dweet.io/get/latest/dweet/for/espruino

// and getting latest:
getDweet("espruino", console.log);
```



Xively
------

Xively lets you push data, and provides a nice site where you can view graphs of your information, manage devices, and add HTTP POST requests that will be made when a condition occurs.

You can get the relevant ID and API key by creating an account with them and adding a device. The details you need are displayed down the right-hand side.

```
var XIVELY = {
  ID : YOUR_FEED_ID,
  APIKEY : "YOUR_API_KEY"
};

function putXively(a, callback) {
    var data = {
     version : "1.0.0",
     datastreams : []
    };
    for (var i in a)
      data.datastreams.push({id:i, current_value:a[i]});
    content = JSON.stringify(data);
    var options = {
      host: 'api.xively.com',
      port: '80',
      path:'/v2/feeds/'+XIVELY.ID,
      method:'PUT',
      headers: { "X-ApiKey": XIVELY.APIKEY, "Content-Length":content.length }
    };
    var req = require("http").request(options, function(res)  {
      var d = "";
      res.on('data', function(data) { d += data; });
      res.on('close', function(data) {
        if (callback) callback(data);
      });
     });
    req.end(content);
}

putXively({ humidity : 0.5, temperature : 25 });
```

IFTTT - If This Then That
----------------------

[IFTTT](https://ifttt.com) lets you make recipes of the form 'if this happens then do that'. They have a [Maker Channel](http://blog.ifttt.com/post/121786069098/introducing-the-maker-channel) now, which means you can trigger loads of random stuff (tweeting, emails, etc) to happen on the net *really easily*

To use it:

* Go to  [IFTTT](http://ifttt.com) and make an account
* Go to https://ifttt.com/maker, enable it, copy your secret key and put it in the code below.
* Create a recipe, click `this` and choose `Maker`, then `Receive a web request`
* Put `button_pressed` as the event name
* Click `that` and choose whatever you want to happen
* Make sure you click all the way through the options to enable your recipe

```
var IFTTTKEY = "...";

function sendEvent(event, callback) {
  require("http").get("http://maker.ifttt.com/trigger/"+event+"/with/key/"+IFTTTKEY, function(res) {
    var d = "";
    res.on('data', function(data) { d += data; });
    res.on('close', function() {
      if (callback) callback(d);
    });
  });
}

sendEvent("button_pressed");
```

Using Espruino as the 'that' in 'if this then that' is more difficult at the moment. [IFTTT](https://ifttt.com) expects to send an HTTP POST request to a web server, which means that you'd have to expose your Espruino to the internet (by configuring your broadband router to forward connections to it). You could however get IFTTT to make a request to [Dweet](http://dweet.io/) (see above), which you could then poll using Espruino.


Google Sheets / Google Forms
------------------------------

There is a [tutorial on this here](/Logging to Google Sheets)

This is currently only possible on the Espruino [[Pico]] board, because HTTPS communications are needed.
