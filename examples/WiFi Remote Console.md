<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Wifi Remote Console
===============================

* KEYWORDS: Wifi,Web Server,Remote Console
* USES: Internet,CC3000

![Screenshot](screenshot.png)

Introduction
-----------

This is a simple example of programming Espruino via WiFi. 

There's a WebServer on the CC3000 which serves up a webpage that contains a text box. When you type a command in the text box, the webserver sends the command over HTTP to Espruino, where it is executed and the result is returned. 

You'll Need
----------

* One [Espruino Board](/EspruinoBoard)
* A [[CC3000]] WiFi module

Wiring Up
--------

* Follow [the instructions](/CC3000) for wiring up the CC3000 module

Software
-------

Connect to the Espruino, copy and paste this into the right-hand side of the Web IDE (replacing the Access point name and password with your WiFi Access Point's name and password), and then click the `Send to Espruino` button.

```
var mainPage = "<html><body>\n<div id=\"console\" style=\"width:100%;height:100%;overflow:auto;\">Type in the text box below...<br/></div>\n<textarea id=\"jscode\" style=\"position:absolute;left:0px;bottom:0px;width:100%;\"></textarea>\n<script>\n  document.getElementById(\"jscode\").onkeypress = function(k) {    \n    if (k.keyCode == 13) { // newline\n      k.preventDefault();\n      var e = document.getElementById(\"jscode\");\n      var cmd = e.value;    \n      e.value = \"\";\n      var c = document.getElementById(\"console\");\n      c.innerHTML += \"&gt;\"+cmd+\"<br//>\";\n      console.log(\"Sending command \"+cmd);\n\n      var xmlhttp=new XMLHttpRequest();\n      xmlhttp.onload = function() {      \n        console.log(\"Got response \"+this.responseText);\n        c.innerHTML += \"=\"+this.responseText+\"<br//>\";\n      };\n      xmlhttp.open(\"GET\",\"/cmd?eval=\"+cmd,false);\n      xmlhttp.send();\n    } else if (k.keyCode == 10) { // Ctrl+enter\n      k.preventDefault();\n      document.getElementById(\"jscode\").value+=\"\\n\";\n    }\n  }\n</script>\n</body></html>\n";


function onPage(req, res) {
  var rurl = url.parse(req.url,true);
  if (rurl.pathname=="/") {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(mainPage);
  } else if (rurl.pathname=="/cmd") {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    var value = "";
    console.log(rurl);
    if (rurl.query && rurl.query.eval)
      value = eval(rurl.query.eval);
    res.end(value);
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end("Not Found.");
  }
}

var wlan = 0;
function onInit() {
  clearInterval();
  setTimeout(function() {
    wlan = require("CC3000").connect();
    wlan.connect( "AccessPointName", "WPA2key", function (s) { 
      if (s=="dhcp") {
        console.log("My IP is "+wlan.getIP().ip);
        require("http").createServer(onPage).listen(80);
      }
    });
  }, 100);
}

onInit();
```

And now you're done. The CC3000 takes a while to initialise so you may have to wait a minute or two - when connected it'll print its IP address. You can then connect to that with a web browser and can start sending commands!

**Note:** The variable `mainPage` is created using the [[File Converter]] page and the following HTML file. You can write the file directly to the SD card and can use that, but this method means that you don't need an SD card at all.

```HTML
<html><body>
<div id="console" style="width:100%;height:100%;overflow:auto;">Type in the text box below...<br/></div>
<textarea id="jscode" style="position:absolute;left:0px;bottom:0px;width:100%;"></textarea>
<script>
  document.getElementById("jscode").onkeypress = function(k) {    
    if (k.keyCode == 13) { // newline
      k.preventDefault();
      var e = document.getElementById("jscode");
      var cmd = e.value;    
      e.value = "";
      var c = document.getElementById("console");
      c.innerHTML += "&gt;"+cmd+"<br//>";
      console.log("Sending command "+cmd);

      var xmlhttp=new XMLHttpRequest();
      xmlhttp.onload = function() {
        console.log("Got response "+this.responseText);
        c.innerHTML += "="+this.responseText+"<br//>";
      };
      xmlhttp.open("GET","/cmd?eval="+cmd,false);
      xmlhttp.send();
    } else if (k.keyCode == 10) { // Ctrl+enter
      k.preventDefault();
      document.getElementById("jscode").value+="\n";
    }
  }
</script>
</body></html>
```
