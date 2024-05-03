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
    <option value="1" selected>1 bpp (black &amp; white)</option>
    <option value="2">2 bpp</option>
    <option value="4">4 bpp</option>
  </select><br/>
  Range : <select id="fontRange">
    <option value="">Loading...</option>
  </select><br/>
  Align to increase sharpness : <input type="checkbox" id="fontJitter"></input><br/>
  Use compression : <input type="checkbox" id="useHeatshrink"></input><br/>
</div>
</form>
<button id="calculateJSFont" style="font-size: 14pt;">Get JS</button>
<button id="calculatePBFFont" style="font-size: 14pt;">Get PBF File</button>
<br/>
<span style="display:none;" id="fontTest" >This is a test of the font</span><br/>
<canvas width="256" height="256" id="fontcanvas" style="display:none"></canvas>
<textarea id="result" style="width:100%;display:none" rows="16"></textarea>
<p id="fontPreviewP">
<canvas id="fontPreview" style="display:none;border:1px solid black;width:100%;image-rendering: pixelated;"></canvas>
</p>
<script src="https://espruino.github.io/EspruinoWebTools/heatshrink.js"></script>
<script src="https://espruino.github.io/EspruinoWebTools/fontconverter.js"></script>
<script>
var fontRanges = fontconverter.getRanges();
document.getElementById("fontRange").innerHTML = Object.keys(fontRanges).map(id => `<option value="${id}">${id} (${fontRanges[id].charCount} chars)</option>`).join("\n");

// Each character can be moved around slightly in order to ensure the maximum
// amount of 'solid' pixels
var FONT_JITTER = false;
var cssNode;

function downloadURL(data, fileName)  {
  const a = document.createElement('a')
  a.href = data
  a.download = fileName
  document.body.appendChild(a)
  a.style.display = 'none'
  a.click()
  a.remove()
};

// Called by loadFontAndCalculate when the font is actually loaded
function createFont(fontName, fontHeight, BPP, fontRange, outputFmt) {
  if (outputFmt=="JS" && fontRange.charCount>1500) {
    window.alert("Can't output this font range as JS as it contains more than 1500 characters")
    return;
  }

  var canvas = document.getElementById("fontcanvas");
  var ctx = canvas.getContext("2d", { willReadFrequently: true });
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
      if (yOffset>0) console.log("Nudging character "+JSON.stringify(ch)+" up by "+yOffset+" pixels so it fits");
      if (yOffset<0) console.log("Nudging character "+JSON.stringify(ch)+" down by "+(-yOffset)+" pixels so it fits");
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
  prevCtx.height = fontHeight*17;
  var prevImg = prevCtx.createImageData(fontHeight, fontHeight);

  var fontData = [];
  var minY = 10000, maxY = -1;
  var font = new fontconverter.Font({ bpp : BPP, range : fontRange.range, height : fontHeight } );
  font.fmWidth = fontHeight*2;
  font.fmHeight = fontHeight;
  font.id = fontName.replace(/[^A-Za-z0-9]/g,"");
  fontRange.range.forEach(range => {
    for (var ch=range.min;ch<=range.max;ch++) {
      let img = drawCh(String.fromCharCode(ch));
      let imgBits = new Uint8Array(img.width*img.height);
      prevImg.data.fill(255);
      for (var x=0;x<img.width;x++) {
        for (var y=0;y<img.height;y++) {
          var idx = (x + y*img.width)*4;
          // get greyscale
          var c = (img.data[idx]+img.data[idx+1]+img.data[idx+2]) / 3;
          // shift down to BPP with rounding
          c = (c + (127>>BPP)) >> (8-BPP);
          if (c>=(1<<BPP)) c = (1<<BPP)-1;
          // Save
          imgBits[x + (y*img.width)] = c;
          // Preview image
          var n = (x+(y*fontHeight))*4;
          c <<= 8-BPP;
          c |= c>>BPP;
          c |= c>>(BPP*2);
          c |= c>>(BPP*4);
          var prevCol = 255 - c;
          prevImg.data[n] = prevImg.data[n+1] = prevImg.data[n+2] = prevCol;
        }
      }
      if (ch<256) // only preview the first 256
        prevCtx.putImageData( prevImg, (ch&15)*fontHeight, (1+(ch>>4))*fontHeight );
      // actually add the glyph
      let glyph = font.getGlyph(ch, (x,y) => {
        if (y<0 || y>=img.height) return 0;
        if (x<0 || x>=img.width) return 0;
        return imgBits[x + (y*img.width)];
      });
      if (ch==32) {
        glyph.advance = img.width; // force space width to image width
      }
      if (glyph) font.glyphs[ch] = glyph;
    }
  });
  // draw grid lines
  prevCtx.strokeStyle = "red";
  prevCtx.lineWidth = 0.1;
  for (var i=0;i<16;i++) {
    prevCtx.moveTo(0, fontHeight*(i+1));
    prevCtx.lineTo(fontHeight*16, fontHeight*(i+1));
    prevCtx.moveTo(fontHeight*i, fontHeight);
    prevCtx.lineTo(fontHeight*i, fontHeight*17);
  }
  prevCtx.stroke();
  // draw preview string
  let previewBmp = font.renderString(fontRange.text);
  prevImg = prevCtx.createImageData(previewBmp.width, previewBmp.height);
  prevImg.data.set(new Uint8Array(previewBmp.data.buffer));
  prevCtx.putImageData( prevImg, 0, 0 );

  //font.debugChars(); // debug to console
  // Output result
  if (outputFmt=="JS") {
    var result = document.getElementById("result");
    result.style.display = "inherit";
    result.value = font.getJS({
      compressed : document.getElementById("useHeatshrink").checked
    }).trim();
  } else if (outputFmt=="PBF") {
    let pbfData = font.getPBF();
    let blob = new Blob([pbfData.buffer], {type: 'application/octet-stream'});
    let url = window.URL.createObjectURL(blob);
    downloadURL(url, font.id+".pbf");
  } else throw new Error("Unknown output format");
  // resize the font preview box
  onWindowResize();
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

// Loads the font in, and when loaded calls loadFontAndCalculate
function getFontLinkAndName(outputFmt) {
  var fontFile = document.getElementById('fontFile').files[0];
  if(fontFile) {
    var fontName = document.getElementById('fontFileName').value.trim();
    console.log("fontLink: Found font file upload - creating data url");
    // use FileReader to load font file & read as base64 data URL string
    const reader = new FileReader();
    reader.addEventListener("load", function onLoadFontData() {
      const dataUrl = reader.result;
      console.log("fontLink: loaded data URL");
      loadFontAndCalculate(dataUrl, fontName, outputFmt);
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
    loadFontAndCalculate(fontLink, fontName, outputFmt);
  }

}

// Called by getFontLinkAndName when the font is loaded
function loadFontAndCalculate(fontLink, fontName, outputFmt) {
  console.log("URL: " + (fontLink ? fontLink.substring(0, 500) : "[none]"));
  console.log("Family: " + fontName);
  var fontHeight = parseInt(document.getElementById('fontSize').value);
  var fontBPP = parseInt(document.getElementById("fontBPP").value);
  var fontRangeName =  document.getElementById("fontRange").value;
  var fontRange = fontRanges[fontRangeName];
  if (!fontRange) throw new Error("Unknown font range");
  FONT_JITTER = document.getElementById("fontJitter").checked;

  document.getElementById('fontTest').style = `font-family: '${fontName}';font-size: ${fontHeight}px`;
  document.getElementById('fontTest').innerText = fontRange.text;

  function callback() {
    createFont(fontName, fontHeight, fontBPP, fontRange, outputFmt);
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

document.getElementById("calculateJSFont").addEventListener('click',function(e) {
  e.preventDefault();
  getFontLinkAndName("JS");
});
document.getElementById("calculatePBFFont").addEventListener('click',function(e) {
  e.preventDefault();
  getFontLinkAndName("PBF");
});
document.getElementById('fontSize').addEventListener('mousemove',function() {
  document.getElementById('fontSizeText').innerHTML = document.getElementById('fontSize').value;
});
document.getElementById("fontForm").addEventListener('submit', function(e) { // when a font is actually uploaded via the file box
  e.preventDefault();
  getFontLinkAndName("JS");
});

function onWindowResize() {
  var w = document.getElementById("fontPreviewP").offsetWidth;
  var preview = document.getElementById("fontPreview");
  var cw = preview.width;
  if (cw > w) preview.style.width="100%";
  else preview.style.width = Math.max(cw,Math.floor(w/cw)*cw)+"px";
}

window.addEventListener("resize", onWindowResize);
</script>
