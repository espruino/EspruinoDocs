<!--- Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Font Converter
========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Font+Converter. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Font,Create,Convert
* USES: Graphics

This page helps you to convert a font into JavaScript that can be used
with Espruino's [Graphics](/Graphics) library.

How it works:

* Use one of the two methods below to select a font
* Check the options
* Click 'Go'
* Copy and paste the generated font code into your Espruino project

<form id="fontForm">

<table style="margin-left: 0">
  <tr>
    <td width="50%">
      <h4>Use an external font:</h4>
      <ul>
        <li>Go to <a href="https://fonts.google.com/">https://fonts.google.com/</a>, find a font</li>
        <li>Click <code>Select This Style</code></li>
        <li>Copy the <code>&lt;link href=...</code> line</li>
        <li>Paste it into the text box below</li>
        <li>Or use a link to .otf or .woff file, or the name of a font installed on your computer</li>
      </ul>
      <p>
        <input id="fontLink" type="text" style="width: 330px; margin-left: 24px;" value="<link href=&quot;https://fonts.googleapis.com/css2?family=Open+Sans+Condensed:wght@700&display=swap&quot; rel=&quot;stylesheet&quot;>" size="80"></input>
      </p>
    </td>
    <td width="50%" style="vertical-align:top;">
      <h4>OR use a font file:</h4>
      <ul>
        <li>Select a .otf or .woff font file on your computer</li>
        <li>Enter a name for your font in the text box below</li>
      </ul>
      <p style="margin-left:24px; ">
        <input id="fontFile" type="file" onchange="onChangeFontFile()" />
      </p>
      <p style="margin-left:24px; ">
        <span>Font name: </span>
        <input id="fontFileName" type="text" value="CustomFontName" />
      </p>
    </td>
  </tr>
</table>

<h4>Set font options:</h4>
<div style="margin-left: 24px">
  Size : <input type="range" min="4" max="150" value="16" class="slider" style="width:500px" id="fontSize"><span id="fontSizeText">16</span><br/>
  BPP : <select id="fontBPP">
    <option value="1" selected>1 bpp (black & white)</option>
    <option value="2">2 bpp</option>
    <option value="4">4 bpp</option>
  </select><br/>
  Range : <select id="fontRange">
    <option value="ASCII">ASCII (32-127)</option>
    <option value="ASCIICAPS" selected>ASCII capitals (32-127)</option>
    <option value="ISO8859-1">ISO8859-1 / ISO Latin (32-255)</option>
    <option value="Numeric">Numeric (46-58)</option>
  </select><br/>
  Align to increase sharpness : <input type="checkbox" id="fontJitter"></input><br/>
  </form>
</div>
<button id="calculateFont" style="font-size: 14pt;">Go!</button><br/>

<span style="display:none;" id="fontTest" >This is a test of the font</span><br/>
<canvas width="256" height="256" id="fontcanvas" style="display:none"></canvas>
<textarea id="result" style="width:100%;display:none" rows="16"></textarea>
<canvas id="fontPreview" style="display:none;border:1px solid black;width:100%;image-rendering: pixelated;"></canvas>
<script>
var fontRanges = {
 "ASCII" : {min:32, max:127, txt:"This is a test of the font"},
 "ASCIICAPS" : {min:32, max:93, txt:"THIS IS A TEST OF THE FONT"},
 "ISO8859-1" : {min:32, max:255, txt:"This is a test of the font"},
 "Numeric" : {min:46, max:58, txt:"0.123456789:/"},
};
// Each character can be moved around slightly in order to ensure the maximum
// amount of 'solid' pixels
var FONT_JITTER = false;
var cssNode;

function createFont(fontName, fontHeight, BPP, charMin, charMax) {
  var canvas = document.getElementById("fontcanvas");
  var ctx = canvas.getContext("2d");
  ctx.font = fontHeight+"px "+fontName;
  ctx.textBaseline = "bottom";

  function drawChSimple(ch, ox, oy) {
    var xPos = 0;
    var yPos = Math.round(fontHeight*0.5);
    ctx.fillStyle = "black";
    ctx.fillRect(xPos,0,fontHeight*2,fontHeight*2);
    ctx.fillStyle = "white";  
    ctx.fillText(ch, xPos + ox, fontHeight + yPos + oy);  
    
    var chWidth = Math.round(ctx.measureText(ch).width);
    var img = { width:0, height:fontHeight+1, data:[] };
    if (chWidth) {
      var yOffset = 0;  
      // sometimes fonts are too high up - if so, nudge them down
      do {
        img = ctx.getImageData(xPos,yPos+yOffset-1,chWidth,1);
        var allClear = true;
        for (var i=0;i<img.data.length;i+=4)
          if (img.data[i]) allClear = false;
        if (!allClear) yOffset--;          
      } while(!allClear && yOffset>-fontHeight);
      // Sometimes, fonts drop below the bottom of their
      // font box. In this case, we nudge them up by a pixel or two
      if (!yOffset) do {
        img = ctx.getImageData(xPos,fontHeight+yPos+yOffset,chWidth,1);
        var allClear = true;
        for (var i=0;i<img.data.length;i+=4)
          if (img.data[i]) allClear = false;
        if (!allClear) yOffset++;          
      } while(!allClear && yOffset<fontHeight);
      if (yOffset>0) console.log("Nudging character "+JSON.stringify(ch)+" up by "+yOffset+" pixels to it fits");
      if (yOffset<0) console.log("Nudging character "+JSON.stringify(ch)+" down by "+(-yOffset)+" pixels to it fits");
      // get image data
      img = ctx.getImageData(xPos,yPos+yOffset,chWidth,fontHeight);
    }
    return img; // data/width/height
  }

  // This one draws the same character at different offsets to try and get the clearest image
  // clearest image = most bright pixels
  function drawCh(ch) {
    var adjust = [{x:0,y:0}];
    if (FONT_JITTER) {
      adjust = [];
      for (var x=-0.5;x<0.5;x+=0.25)
        for (var y=-0.5;y<0.5;y+=0.25)
          adjust.push({x:x,y:y});
    }
    var bestPixelCnt, bestImg;
    adjust.forEach(a=>{
      var img = drawChSimple(ch, a.x, a.y);
      var greyPixelAmt = 0;
      for (var i=0;i<img.data.length;i+=4) {
        var greyAmt = img.data[i];
        if (greyAmt>128) greyAmt = 255-greyAmt;
        // the higher 'blurry' is, the more grey
        // the image is
        greyPixelAmt += greyAmt*greyAmt;
      }
      if (bestPixelCnt===undefined || greyPixelAmt < bestPixelCnt) {
        bestPixelCnt = greyPixelAmt;
        bestImg = img;
      }
    });
    return bestImg;
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
  var bitData = 0, bitCount = 0;
  var fontWidths = [];
  var maxCol = 0, maxP = 0;
  var minY = 10000, maxY = -1;
  for (var ch=charMin;ch<=charMax;ch++) {
    var img = drawCh(String.fromCharCode(ch));
    fontWidths.push(img.width);
    prevImg.data.fill(255);
    for (var x=0;x<img.width;x++) {
      var s = "";
      for (var y=0;y<img.height;y++) {
        var idx = (x + y*img.width)*4;
        // get greyscale
        var c = (img.data[idx]+img.data[idx+1]+img.data[idx+2]) / 3;
        if (c>maxCol)maxCol=c;          
        // shift down to BPP with rounding
        c = (c + (127>>BPP)) >> (8-BPP);
        if (c>=(1<<BPP)) c = (1<<BPP)-1;
        // debug
        if (c>maxP) maxP=c;
        if (c) {
          if (y > maxY) maxY = y;
          if (y < minY) minY = y;
        }
        //if (ch=="X".charCodeAt()) console.log(x,y,c);
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
  // draw grid lines
  prevCtx.strokeStyle = "red";
  prevCtx.lineWidth = 0.1;
  for (var i=0;i<16;i++) {
    prevCtx.moveTo(0, fontHeight*i);
    prevCtx.lineTo(fontHeight*16, fontHeight*i);
    prevCtx.moveTo(fontHeight*i, 0);
    prevCtx.lineTo(fontHeight*i, fontHeight*16);
  }
  prevCtx.stroke();

  //console.log("Max color value = "+maxCol+", in bpp "+maxP);
  // if all fonts are the same width...
  var fixedWidth = fontWidths.every(w=>w==fontWidths[0]);

  var result = document.getElementById("result");
  result.style.display = "inherit";
  result.innerHTML = `
Graphics.prototype.setFont${fontName.replace(/[^A-Za-z0-9]/g,"")} = function(scale) {
  // Actual height ${maxY+1-minY} (${maxY} - ${minY})
  this.setFontCustom(atob("${btoa(String.fromCharCode.apply(null,fontData))}"), ${charMin}, ${fixedWidth?fontWidths[0]:`atob("${btoa(String.fromCharCode.apply(null,fontWidths))}")`}, ${fontHeight}+(scale<<8)+(${BPP}<<16));
  return this;
}`.trim();  
}

function onChangeFontFile() {
  // when user selects a font file, prepopulate its font name based on the file name
  var fontFile = document.getElementById('fontFile').files[0];
  if(fontFile) {
    var fileName = fontFile.name.split('.')[0];
    var fontName = fileName.replace(/\W/g, ''); // remove non-alphanumeric chars
    document.getElementById('fontFileName').value = fontName;
  }
}

function getFontLinkAndName(callback) {
  var fontFile = document.getElementById('fontFile').files[0];
  if(fontFile) {
    var fontName = document.getElementById('fontFileName').value.trim();
    console.log("fontLink: Found font file upload - creating data url");
    // use FileReader to load font file & read as base64 data URL string
    const reader = new FileReader();
    reader.addEventListener("load", function onLoadFontData() {
      const dataUrl = reader.result;
      console.log("fontLink: loaded data URL");
      callback(dataUrl, fontName);
      reader.removeEventListener("load", onLoadFontData);
    }, false);
    reader.readAsDataURL(fontFile);

  } else {
    var fontLink = document.getElementById('fontLink').value.trim();
    var fontName = "Sans Serif";
    if(!fontLink.length) {
      alert("No font name, link or file provided");
      return;
    }
    if (fontLink.startsWith("http") || fontLink.startsWith("data:")) {
      console.log("fontLink: Found bare URL");
    } else if (fontLink.startsWith("<")) {
      console.log("fontLink: Found <link...");
      var m = fontLink.match(/href="([^"]+)"/);
      if (m!==null) {
        console.log("fontLink: Found CSS Link");
        fontLink = m[1];
      } else {
        alert("Malformed Font link");
        return;
      }
    } else {
      console.log("fontLink: Assuming it's a font name");
      fontName = fontLink;
      fontLink = "";
    }
    if (fontLink) {
      fontName = undefined;
      var m;
      m = fontLink.match(/family=([%\w+]+)/);
      if (m!==null)
        fontName = decodeURI(m[1].replace(/\+/g," "));
      if (fontName===undefined) {
        m = fontLink.match(/([^/]*)\.otf/);
        if (m!==null)
          fontName = decodeURI(m[1]);      
      }
      if (fontName===undefined) {
        alert("Unable to work out font family from link");
        return;
      }
      if (fontLink.includes("#"))
        fontLink = fontLink.substr(0,fontLink.indexOf("#"));
    }
    callback(fontLink, fontName);
  }

}

function loadFontAndCalculate(fontLink, fontName) {
  console.log("URL: " + (fontLink ? fontLink.substring(0, 500) : "[none]"));
  console.log("Family: " + fontName);
  var fontHeight = parseInt(document.getElementById('fontSize').value);
  var fontBPP = parseInt(document.getElementById("fontBPP").value);
  var fontRangeName =  document.getElementById("fontRange").value;
  var fontRange = fontRanges[fontRangeName];
  if (!fontRange) throw new Error("Unknown font range");
  FONT_JITTER = document.getElementById("fontJitter").checked;

  document.getElementById('fontTest').style = `font-family: '${fontName}';font-size: ${fontHeight}px`;
  document.getElementById('fontTest').innerText = fontRange.txt;

  function callback() {
    createFont(fontName, fontHeight, fontBPP, fontRange.min, fontRange.max);
  }

  if (fontLink=="" || (cssNode && cssNode.href == fontLink)) {
    console.log("Font already loaded");
    return callback();
  }
  if (cssNode) cssNode.remove();
  if (fontLink.match(/\.otf([?#].*)?/) || fontLink.match(/^data:/)) {
    cssNode = document.createElement("style");
    cssNode.innerText = '@font-face { font-family: '+fontName+'; src: url('+JSON.stringify(fontLink)+') format("opentype"); }';
    cssNode.href = fontLink;
  } else {
    // assume CSS
    cssNode = document.createElement("link");
    cssNode.rel = "stylesheet";
    cssNode.type = "text/css";
    cssNode.href = fontLink;
  }
  var head = document.getElementsByTagName("head")[0];
  head.appendChild(cssNode);

  console.log("Waiting for font load");
  cssNode.onload = function() {
    setTimeout(function() {
      console.log("Font loaded");
      callback();
    }, 100);
  };
}

document.getElementById("calculateFont").addEventListener('click',function(e) {
  e.preventDefault();
  getFontLinkAndName(loadFontAndCalculate);
});
document.getElementById('fontSize').addEventListener('mousemove',function() {
  document.getElementById('fontSizeText').innerHTML = document.getElementById('fontSize').value;
});
document.getElementById("fontForm").addEventListener('submit', function(e) {
  e.preventDefault();
  getFontLinkAndName(loadFontAndCalculate);
});
</script>
