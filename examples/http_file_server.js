/* 
HTTP File Server
================

* KEYWORDS: WiFi,Wireless,File Server
* USES: Internet,CC3000,SD Card

This is a simple HTTP file server that serves files off of the SD card...

All you need to do is copy it in and change the Wifi Name and Key near the bottom.

Wiring
------

Just connect the [[CC3000]] connected as described on the [[CC3000]] page.

*/

function onPageRequest(req, res) { 
  var a = url.parse(req.url, true);
  if (a.pathname.substr(-1)=="/") { // a slash at the end, list the directory
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write("<html><body><p>Contents of "+a.pathname+"</p><ul>");
    require("fs").readdir(a.pathname.substr(0,a.pathname.length-1)).map(function(f) { 
      res.write('<li><a href="'+a.pathname+f+'">'+f+'</a></li>');
    });
    res.end("</ul></body></html>");
  } else { // No slash, try and open file
    var f = E.openFile(a.pathname, "r");
    if (f !== undefined) { // File open succeeded - send it!
      res.writeHead(200, {'Content-Type': 'text/plain'});
      f.pipe(res); // streams the file to the HTTP response
    } else { // couldn't open file
      // first check if this was a directory             
      if (require("fs").readdir()!==undefined) { 
        // it was a directory - forward us to a page with the '/' on the end
        res.writeHead(301, {'Location': a.pathname+"/", 'Content-Type': 'text/plain'});  
        res.end("Moved");                                
      } else {                                              
        // else not found - send a 404 message
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end("404: Page "+a.pathname+" not found");
      }
    }
  }
}

var wlan;

function onInit() {
  wlan = require("CC3000").connect();
  wlan.connect( "YOUR_WIFI_NAME", "YOUR_WIFI_KEY", function (s) { 
    if (s=="dhcp") {
      console.log("My IP is "+wlan.getIP().ip);
      require("http").createServer(onPageRequest).listen(80);
    }
  });
}

onInit();

