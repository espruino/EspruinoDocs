<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Converting Bitmaps for Graphics
==========================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Image+Converter. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: File,String,Bitmap,Image,Picture,Conversion,Graphics,Tools
* USES: Graphics

This page helps you to convert an image file into a JS object that can
be used with Espruino.

See the [Graphics](/Graphics) library page for more information.

<script src="/js/heatshrink.js"></script>
<script src="/js/imageconverter.js"></script>

<p>An online image converter for Espruino...</p>

<input type="file" id="fileLoader"/><br/>
<input type="checkbox" id="compression" onchange="imageLoaded()">Use Compression?</input><br/>
<input type="checkbox" id="transparent" onchange="imageLoaded()" checked>Transparency?</input><br/>
Diffusion:
<select id="diffusion" onchange="imageLoaded()">
<option value="none" selected="selected">Flat</option>
<option value="random1">Random small</option>
<option value="random2">Random large</option>
<option value="error">Error Diffusion</option>
<option value="errorrandom">Randomised Error Diffusion</option>
</select><br/>

Brightness:<input type="range" id="brightness" min="-255" max="255" value="0" onchange="imageLoaded()"></input><br/>
Colours: <select id="colorStyle" onchange="imageLoaded()">
<option value="1bit" selected="selected">1 bit black/white</option>
<option value="1bitinverted">1 bit white/black</option>
<option value="2bitbw">2 bit black & white</option>
<option value="4bit">4 bit RGBA</option>
<option value="4bitmac">4 bit Mac palette</option>
<option value="web">8 bit Web palette</option>
<option value="vga">8 bit VGA palette</option>
<option value="rgb565">16 bit RGB565</option>
</select><br/>
Output As: <select id="outputStyle" onchange="imageLoaded()">
<option value="object" selected="selected">Image Object</option>
<option value="string">Image String</option>
</select><br/>

<canvas id="canvas" style="display:none;"></canvas>

<h2>Result</h2>
<p><span id="ressize">...</span></p>
<textarea id="resdata" style="display:none;"></textarea>

<script>
  var img;
  function imageLoaded() {
    if (img === undefined) return;
    var options = {};
    var diffusionSelect = document.getElementById("diffusion");
    options.diffusion = diffusionSelect.options[diffusionSelect.selectedIndex].value;
    options.compression = document.getElementById("compression").checked;
    options.transparent = document.getElementById("transparent").checked;
    options.brightness = 0|document.getElementById("brightness").value;
    var colorSelect = document.getElementById("colorStyle");
    options.mode = colorSelect.options[colorSelect.selectedIndex].value;
    if (options.mode=="1bitinverted") {
      options.mode="1bit";
      options.inverted=true;
    }
    var outputSelect = document.getElementById("outputStyle");
    options.output = outputSelect.options[outputSelect.selectedIndex].value;

    var canvas = document.getElementById("canvas")
    canvas.width = img.width*2;
    canvas.height = img.height;
    canvas.style = "display:block;border:1px solid black;margin:8px;"
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img,0,0);

    var imgstr = "";

    if (true) {
      var imageData = ctx.getImageData(0, 0, img.width, img.height);
      var rgba = imageData.data;
      options.rgbaOut = rgba;
      options.width = img.width;
      options.height = img.height;
      imgstr = "var img = "+imageconverter.RGBAtoString(rgba, options);
      ctx.putImageData(imageData,img.width,0);
    }/* else { // output the image as slices
      var SLICEHEIGHT = 8;
      for (var y=0;y<img.height;y+=SLICEHEIGHT) {
        var imageData = ctx.getImageData(0, y, img.width, SLICEHEIGHT);
        var rgba = imageData.data;
        options.rgbaOut = rgba;
        options.width = img.width;
        options.height = SLICEHEIGHT;
        imgstr += "require('Storage').write('im"+(y/SLICEHEIGHT)+"',"+imageconverter.RGBAtoString(rgba, options)+")\n";
        ctx.putImageData(imageData,img.width,y);
      }
    }*/

    // checkerboard for transparency on original image
    var imageData = ctx.getImageData(0, 0, img.width, img.height);
    imageconverter.RGBAtoCheckerboard(imageData.data, options)
    ctx.putImageData(imageData,0,0);

    document.getElementById("ressize").innerHTML = imgstr.length+" Characters";
    document.getElementById("resdata").innerHTML = imgstr;
    document.getElementById("resdata").style = "width:650px;height:300px;";
  }
  function handleFileSelect(event) {
      if (event.target.files.length != 1) return;
      var reader = new FileReader();
      reader.onload = function(event) {
        img = new Image();
        img.onload = imageLoaded;
        img.src = event.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
    };
    document.getElementById('fileLoader').addEventListener('change', handleFileSelect, false);
</script>
