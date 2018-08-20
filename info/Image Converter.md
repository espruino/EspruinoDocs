<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Converting Bitmaps for Graphics
==========================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Image+Converter. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: File,String,Bitmap,Image,Picture,Conversion,Graphics
* USES: Graphics

This page helps you to convert an image file into a JS object that can
be used with Espruino. It currently only converts 1 bit images.

See the [Graphics](/Graphics) library page for more information.

<input type="file" id="fileLoader"/><br/>
<input type="checkbox" id="diffusion" onchange="imageLoaded()"/>Diffusion?</input>
<input type="checkbox" id="invert" onchange="imageLoaded()"/>invert?</input>

<canvas id="canvas" style="display:none;"></canvas>

<h2>Result</h2>
<p><p id="ressize">...</p></p>
<textarea id="resdata" style="display:none;"></textarea>

<script>
  var img;
  function imageLoaded() {
    if (img === undefined) return;
    var diffusion = document.getElementById("diffusion").checked;
    var invert = document.getElementById("invert").checked;
    var canvas = document.getElementById("canvas")
    canvas.width = img.width*2;
    canvas.height = img.height;
    canvas.style = "display:block;border:1px solid black;margin:8px;"
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img,0,0);
    var imageData = ctx.getImageData(0, 0, img.width, img.height);
    var data = imageData.data;
    var bitData = new Uint8Array((img.width*img.height+7)>>3);
    var n = 0;
    for (var y=0; y<img.height; y++) {
      //var s = "";
      for (var x=0; x<img.width; x++) {
        var c = (data[n*4]+data[n*4+1]+data[n*4+2])/ 3;
        var thresh = 128;
        if (diffusion) thresh=Math.random()*254+1;
        if (invert) c=255-c;
        if (c>thresh) {
          bitData[n>>3] |= 128>>(n&7);
          data[n*4]=255;
          data[n*4+1]=255;
          data[n*4+2]=255;
          //s+="1";
        } else {
          data[n*4]=0;
          data[n*4+1]=0;
          data[n*4+2]=0;
          //s+="0";
        }
        data[n*4+3]=255;
        n++;
      }
      //console.log(s);
    }
    var str = "";
    for (n=0; n<bitData.length; n++)
      str += String.fromCharCode(bitData[n]);
    var imgstr = "var img = {\n";
    imgstr += "  width : "+img.width+", height : "+img.height+", bpp : 1,\n";
    imgstr += "  transparent : 0,\n";
    imgstr += '  buffer : E.toArrayBuffer(atob("'+btoa(str)+'"))\n';
    imgstr += "};\n";
    ctx.putImageData(imageData,img.width,0);
    document.getElementById("ressize").innerHTML = str.length+" Characters";
    document.getElementById("resdata").innerHTML = imgstr;
    document.getElementById("resdata").style = "width:650px;height:300px;";
  }
  $("#fileLoader").change(function(event) {
      if (event.target.files.length != 1) return;
      var reader = new FileReader();
      reader.onload = function(event) {
        img = new Image();
        img.onload = imageLoaded;
        img.src = event.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
    });
</script>
