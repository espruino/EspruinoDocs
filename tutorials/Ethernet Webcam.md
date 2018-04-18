<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Ethernet Webcam Display
====================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Ethernet+Webcam. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Webcam,Ethernet,Internet,
* USES: Internet,WIZnet,HTTP,RGB123,Graphics

[[http://youtu.be/yK7VKg68uII]]

Introduction
-----------

In modern Web Browsers, JavaScript provides exposes some amazingly powerful features. One of these is the `webkitGetUserMedia` function, which allows you to access a computer's WebCam (with permission!).

In this example, we'll use the Espruino board to serve up a webpage which accesses the WebCam and then sends a low-resolution image back to the Espruino board, which can then display it on an LED matrix.

You'll Need
----------

* An [[RGB123]] matrix - I've used a 16x16
* A [[WIZnet]] W5500 module
* A Laptop/Tablet with a Webcam

Wiring Up
--------

* Wire the [[RGB123]] up as described on the [[RGB123]] page
* Wire the [[WIZnet]] W5500 up as described on the [[WIZnet]] page

Software
-------

The first step is to make a webpage that gets the image from a webcam. The code below is pretty basic, with very minimal error checking.

```HTML
<html>
<body>
<!-- The video element that will contain the WebCam image -->
<video autoplay></video>
<!-- The canvas that we'll use to make the WebCam image smaller - 16x16 because that's the size of the RGB123 matrix -->
<canvas id='canvas' width='16' height='16'></canvas>
<!-- The script to handle the processing -->
<script language='javascript'>
// initialise the WebCam - see https://developer.mozilla.org/en-US/docs/Web/API/Navigator.getUserMedia
if(navigator.webkitGetUserMedia!=null) {
 var options = { video:true,audio:false };
 navigator.webkitGetUserMedia(options,
  function(stream) {
   var video = document.querySelector('video');
   video.src = window.webkitURL.createObjectURL(stream);
  }, function(e) { console.log("error");  }
 );
}
// Every 5 seconds...
setInterval(function() {
 // find the video and canvas elements
 var video = document.querySelector('video');
 var canvas = document.getElementById('canvas');
 var ctx = canvas.getContext('2d');
 // resample the WebCam image down to 16x16 pixels
 ctx.drawImage(video,0,0,16,16);
 var data = ctx.getImageData(0,0,16,16);
 // Now build a string from the image data. There are better ways,
 // but all we do here is for each pixel's red, green and blue values
 // we store a character between A (char code 65) and P (char code 80)
 var s = "";
 for(n=0; n<data.width*data.height; n++) {
  s += String.fromCharCode(65+data.data[n*4+2]/16);
  s += String.fromCharCode(65+data.data[n*4]/16);
  s += String.fromCharCode(65+data.data[n*4+1]/16);
 }
 // finally send the data down HTTP, using the 'special' webpage '/set'
 var xmlHttp = new XMLHttpRequest();
 xmlHttp.open( "GET", "/set?rgb="+s, false );
 xmlHttp.send( null );
}, 5000);
</script>
</body>
</html>
```

Then, you need to package it up into a string that can be stored in Espruino. You could have saved it to a file on an SD card, but storing the webpage as a string means that Espruino doesn't need a card to operate. To do this I simply removed the comments (to save on space) and opened the file in the [[File Converter] page.

And this is the code for the Espruino itself - see the inline comments:

```JavaScript
// The webpage from above
var page = "<html>\n<body>\n<video autoplay></video> \n<canvas id='canvas' width='16' height='16'></canvas>  \n<script language='javascript'>     \nif(navigator.webkitGetUserMedia!=null) { \n var options = { video:true,audio:false };      \n navigator.webkitGetUserMedia(options, \n  function(stream) { \n   var video = document.querySelector('video'); \n   video.src = window.webkitURL.createObjectURL(stream); \n  }, function(e) { console.log(\"error\");  } \n ); \n} \n\nsetInterval(function() {\n var video = document.querySelector('video'); \n var canvas = document.getElementById('canvas'); \n var ctx = canvas.getContext('2d'); \n ctx.drawImage(video,0,0,16,16); \n var data = ctx.getImageData(0,0,16,16);  \n var s = \"\";\n for(n=0; n<data.width*data.height; n++) {  \n  s += String.fromCharCode(65+data.data[n*4+2]/16);\n  s += String.fromCharCode(65+data.data[n*4]/16);  \n  s += String.fromCharCode(65+data.data[n*4+1]/16);    \n }  \n var xmlHttp = new XMLHttpRequest();\n xmlHttp.open( \"GET\", \"/set?rgb=\"+s, false );\n xmlHttp.send( null );\n}, 5000);\n</script>\n</body>\n</html>\n";

// This is called whenever a webpage is requested
function onPageRequest(req,res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  // work out what page was requested
  var rurl = url.parse(req.url,true);
  if (rurl.pathname=="/") {
    // If the page was the main webpage, send it out
    res.write(page);
  } else if (rurl.pathname=="/set") {
    // if the page was our '/set' webpage...
    // Create a 16x16 image structure
    var img = {
      width : 16, height : 16, bpp : 24,
      buffer : new Uint8Array(16*16*3)
    };
    // Fill it with the data we got sent
    var s = rurl.query.rgb;
    for (var i=0;i<768;i++)
      img.buffer[i] = s.charCodeAt(i)-65;
    // Draw it onto the LED display's buffer
    leds.drawImage(img, 0, 0);
    // Finally send the data to the display
    leds.flip();
  }
  // Finish sending our webpage response
  res.end();
}

// Set up LEDs
SPI2.setup({baud:3200000, mosi:B15});
var leds = Graphics.createArrayBuffer(16,16,24,{zigzag:true});
leds.flip = function() { SPI2.send4bit(leds.buffer, 0b0001, 0b0011); };
leds.clear();

// Set up ethernet and our webserver
var eth;
function onInit() {
  var eth = require("WIZnet").connect();
  console.log(eth.getIP());
  require("http").createServer(onPageRequest).listen(80);
}

onInit();
```

Just copy and paste the code into the right-hand side of the Web IDE, and click `Send to Espruino`. It should start working instantly!

The Espruino's IP address will be printed when it starts up, so you'll know where you have to connect to share your webcam.
