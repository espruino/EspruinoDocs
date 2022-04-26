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
<input type="checkbox" id="compression" onchange="imageLoaded()"> Use Compression?</input><br/>
<input type="checkbox" id="alphaToColor" onchange="imageLoaded()"> Transparency to Color</input><br/>
<input type="checkbox" id="transparent" onchange="imageLoaded()" checked> Transparency?</input><br/>
<input type="checkbox" id="inverted" onchange="imageLoaded()"> Inverted?</input><br/>
<input type="checkbox" id="autoCrop" onchange="imageLoaded()"> Crop?</input><br/>
Diffusion: <select id="diffusion" onchange="imageLoaded()"></select><br/>

Brightness: <span id="brightnessv"></span>
<input type="range" id="brightness" min="-127" max="127" value="0" onchange="imageLoaded()"></input><br/>
Contrast: <span id="contrastv"></span>
<input type="range" id="contrast" min="-255" max="255" value="0" onchange="imageLoaded()"></input><br/>

Colours: <select id="colorStyle" onchange="imageLoaded()"></select><br/>
Output As: <select id="outputStyle" onchange="imageLoaded()">
</select><br/>

<canvas id="canvas" style="display:none;"></canvas>

<h2>Result</h2>
<p><span id="ressize">...</span></p>
<textarea id="resdata" style="display:none;"></textarea>

<script>
  imageconverter.setFormatOptions(document.getElementById("colorStyle"));
  imageconverter.setDiffusionOptions(document.getElementById("diffusion"));
  imageconverter.setOutputOptions(document.getElementById("outputStyle"));

  var img;
  function imageLoaded() {
    if (img === undefined) return;
    var options = {};
    var diffusionSelect = document.getElementById("diffusion");
    options.diffusion = diffusionSelect.options[diffusionSelect.selectedIndex].value;
    options.compression = document.getElementById("compression").checked;
    options.alphaToColor = document.getElementById("alphaToColor").checked;
    options.transparent = document.getElementById("transparent").checked;
    options.inverted = document.getElementById("inverted").checked;
    options.autoCrop = document.getElementById("autoCrop").checked;
    options.brightness = 0|document.getElementById("brightness").value;
    document.getElementById("brightnessv").innerText = options.brightness;
    options.contrast = 0|document.getElementById("contrast").value;
    document.getElementById("contrastv").innerText = options.contrast;
    var colorSelect = document.getElementById("colorStyle");
    options.mode = colorSelect.options[colorSelect.selectedIndex].value;
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
      ctx.fillStyle = 'white';
      ctx.fillRect(options.width, 0, img.width, img.height);
      var rgba = imageData.data;
      options.rgbaOut = rgba;
      options.width = img.width;
      options.height = img.height;
      imgstr = imageconverter.RGBAtoString(rgba, options);
      var outputImageData = new ImageData(options.rgbaOut, options.width, options.height);
      ctx.putImageData(outputImageData,img.width,0);
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
    imageconverter.RGBAtoCheckerboard(imageData.data, {width:img.width,height:img.height});
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
