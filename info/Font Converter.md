<!--- Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Font Converter
========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Font+Converter. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Font,Create,Convert
* USES: Graphics

This page helps you to convert a font into JavaScript that can be used
with Espruino's [Graphics](/Graphics) library.

How it works:

* Go to [https://fonts.google.com/](https://fonts.google.com/), find a font
* Click `Select This Style`
* Copy the `&lt;link href=...` line
* Paste it into the text box below
* Check the options
* Click 'Go'
* Copy and paste the font code out

<form>
<input id="fontLink" type="text" value="<link href=&quot;https://fonts.googleapis.com/css2?family=Open+Sans+Condensed:wght@700&display=swap&quot; rel=&quot;stylesheet&quot;>" size="80"></input><br/>
Size : <input type="range" min="4" max="90" value="16" class="slider" id="fontSize"><span id="fontSizeText">16</span><br/>
BPP : <select id="fontBPP">
  <option value="1" selected>1 bpp (black & white)</option>
  <option value="2">2 bpp</option>
  <option value="4">4 bpp</option>
</select><br/>
Range : <select id="fontRange">
  <option value="ASCII" selected>ASCII (32-127)</option>
  <option value="ISO8859-1">ISO8859-1 / ISO Latin (32-255)</option>
  <option value="Numeric">Numeric (46-58)</option>
</select><br/>
</form>
<button id="calculateFont">Go!</button><br/>

<span style="display:none;" id="fontTest" >This is a test of the font</span><br/>
<canvas width="256" height="256" id="fontcanvas" style="display:none"></canvas>
<textarea id="result" style="width:100%;display:none" rows="16"></textarea>
<canvas id="fontPreview" style="display:none;border:1px solid black"></canvas>
<script>
var fontRanges = {
 "ASCII" : {min:32, max:127},
 "ISO8859-1" : {min:32, max:255},
 "Numeric" : {min:46, max:58},
};
var cssNode;

function createFont(fontName, fontHeight, BPP, charMin, charMax) {
  var canvas = document.getElementById("fontcanvas");
  var ctx = canvas.getContext("2d");
  ctx.font = fontHeight+"px "+fontName;

  function drawCh(ch) {
    var xPos = 0;
    ctx.fillStyle = "black";
    ctx.fillRect(xPos,0,fontHeight*2,fontHeight);
    ctx.fillStyle = "white";  
    ctx.fillText(ch, xPos, fontHeight-2);  
    var chWidth = Math.round(ctx.measureText(ch).width);
    var img = { width:0, height:fontHeight, data:[] };
    if (chWidth)
      img = ctx.getImageData(xPos,0,chWidth,fontHeight);
    return img; // data/width/height
  }

  var preview = document.getElementById("fontPreview");
  preview.style.display = "inherit";
  var prevCtx = preview.getContext("2d");
  preview.width = fontHeight*16;
  preview.height = fontHeight*16;
  prevCtx.width = fontHeight*16;
  prevCtx.height = fontHeight*16;
  var prevImg = prevCtx.createImageData(fontHeight,fontHeight);

  var fontData = [];
  var fontWidths = [];
  for (var ch=charMin;ch<=charMax;ch++) {
    var img = drawCh(String.fromCharCode(ch));
    fontWidths.push(img.width);
    var bitData = 0, bitCount = 0;
    prevImg.data.fill(255);
    for (var x=0;x<img.width;x++) {
      var s = "";
      for (var y=0;y<img.height;y++) {
        var idx = (x + y*img.width)*4;
        // shift down to BPP with rounding
        var c = (((img.data[idx]+img.data[idx+1]+img.data[idx+2])/3) + (127>>BPP)) >> (8-BPP);
        if (c>=(1<<BPP)) c = (1<<BPP)-1;
        // debug
        s += " ,/#"[c>>(BPP-2)];
        var n = (x+(y*fontHeight))*4;
        var prevCol = 255 - (c << (8-BPP));
        prevImg.data[n] = prevImg.data[n+1] = prevImg.data[n+2] = prevCol;
        // add bit data
        bitData = (bitData<<BPP) | c;
        bitCount += BPP;
        if (bitCount>=8) {
          fontData.push(bitData);
          bitData = 0;
          bitCount = 0;
        }
      }
      //console.log(s);
    }
    prevCtx.putImageData( prevImg, (ch&15)*fontHeight, (ch>>4)*fontHeight );     
  }
  var result = document.getElementById("result");
  result.style.display = "inherit";
  result.innerHTML = `
var widths = atob("${btoa(String.fromCharCode.apply(null,fontWidths))}");
var font = atob("${btoa(String.fromCharCode.apply(null,fontData))}");
var scale = 2;
g.setFontCustom(font, ${charMin}, widths, ${fontHeight}+(scale<<8)+(${BPP}<<16));
  `.trim();
}

document.getElementById("calculateFont").addEventListener('click',function() {
  fontLink = document.getElementById('fontLink').value.trim();
  if (fontLink.startsWith("http")) {
    console.log("fontLink: Found bare URL");
  } else {
    var m = fontLink.match(/href="([^"]+)"/);
    if (m!==null) {
      console.log("fontLink: Found CSS Link");
      fontLink = m[1];
    } else {
      alert("Malformed Font link");
      return;
    }
  }
  console.log("URL:" + fontLink);  
  var fontName;
  var m = fontLink.match(/family=([\w+]+)/);
  if (m!==null) {
    fontName = m[1].replace(/\+/g," ");
  } else {
    alert("Unable to work out font family from link");
    return;
  }
  console.log("Family:" + fontName);  
  var fontHeight = parseInt(document.getElementById('fontSize').value);
  var fontBPP = parseInt(document.getElementById("fontBPP").value);
  var fontRangeName =  document.getElementById("fontRange").value;
  var fontRange = fontRanges[fontRangeName];
  if (!fontRange) throw new Error("Unknown font range");

  document.getElementById('fontTest').style = `font-family: '${fontName}';font-size: ${fontHeight}px`;


  function callback() {
    createFont(fontName, fontHeight, fontBPP, fontRange.min, fontRange.max);
  }


  if (cssNode && cssNode.href == fontLink) {
    console.log("Font already loaded");
    return callback();
  }
  if (cssNode) cssNode.remove();
  cssNode = document.createElement("link");
  cssNode.rel = "stylesheet";
  cssNode.type = "text/css";
  cssNode.href = fontLink;
  var head = document.getElementsByTagName("head")[0];
  head.appendChild(cssNode);

  console.log("Waiting for font load");
  cssNode.onload = function() {
    setTimeout(function() {
      console.log("Font loaded");
      callback();
    }, 100);
  };

});
document.getElementById('fontSize').addEventListener('change',function() {
  document.getElementById('fontSizeText').innerHTML = document.getElementById('fontSize').value;
});

</script>
