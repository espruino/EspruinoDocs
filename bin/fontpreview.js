#!/bin/node
/* Creates a URL-encoded preview image of an Espruino bitmap font */

global.atob = function(a) {
    return Buffer.from(a, 'base64').toString('binary');
};

function getFontPreview(path) {
  var file = require("fs").readFileSync(__dirname+"/"+path).toString();
  // Hacks to cope with usage of heatshrink decompress
  // when it's not a legit node.js module
  var E = {
    toString : function(a) {
      return new Uint8Array(a).reduce((p,c)=>p+String.fromCharCode(c),"");
    }
  };
  file = file.replace("require('heatshrink').decompress","hsdecompress");
  function hsdecompress(data) {
    if ("string" == typeof data) {
      var d = new Uint8Array(data.length);
      for (var i=0;i<d.length;i++)
        d[i] = data.charCodeAt(i);
      data = d;
    }
    return require("../../EspruinoWebTools/heatshrink.js").decompress(data);
  }
  // load font module
  var exports = {};
  eval(file);
  var fontLib = exports;
  function Graphics() {
  }
  fontLib.add(Graphics);

  var fontFnName = Object.keys(Graphics.prototype)[0];

  var fontData, fontOffset, fontWidth, fontHeight, fontMaxWidth;
  Graphics.prototype.setFontCustom = function(_fontData, _offset, _width, _height) {
    fontData = _fontData;
    fontOffset = _offset;
    fontWidth = _width;
    if ("string"==typeof _width) {
      fontWidth = new Uint8Array(256);
      for (var i=0;i<_width.length;i++) fontWidth[i] = _width.charCodeAt(i);
    }
    if ("number"==typeof _width) {
      fontWidth = new Uint8Array(256);
      fontWidth.fill(_width);
    }
    fontMaxWidth = 0;
    fontWidth.forEach(x=>fontMaxWidth=Math.max(fontMaxWidth,x));
    fontHeight = _height;
  };
  Graphics.prototype[fontFnName]();
  function getCharWidth(ch) {
    ch -= fontOffset;
    if (ch<0) return fontWidth[0];
    return 0|fontWidth[ch];
  }
  function drawChar(ch,px,py) {
    ch -= fontOffset;
    if (ch<0) return;
    var cy = 0;
    for (var i=0;i<ch;i++) cy+=fontWidth[i];
    var o = cy*fontHeight;
    for (var x=0;x<fontWidth[ch];x++)
      for (var y=0;y<fontHeight;y++) {
        if (fontData.charCodeAt(o>>3) & (128>>(o&7)))
          setPixel(px+x,py+y);
        o++;
      }
  }

  var TESTLINES =   [
    "0.123456789abcdefABCDEF",
    "This is a Test of the Font"];
  var testWidths = [];
  TESTLINES.forEach((s,y)=>{
    testWidths[y] = 0;
    for (var ch of s) {
     var ch = ch.charCodeAt();
     testWidths[y] += getCharWidth(ch);
   }
 });

  var SPACINGX = fontMaxWidth;
  var SPACINGY = fontHeight;
  var ROWS = (fontOffset<32)?16:14;
  var WIDTH = Math.max(16*SPACINGX+4,testWidths[0],testWidths[1]);
  var HEIGHT = (ROWS+2)*SPACINGY+4;
  var MINIMAL = false;
  if (WIDTH > 300) {
    MINIMAL = true;
    WIDTH = testWidths[0];
    HEIGHT = 1*SPACINGY;
  }
  // Create Image Header
  var rowstride = ((WIDTH+31) >> 5) << 2;
  var headerLen = 14+ 12 + 6/*palette*/;
  var l = headerLen + HEIGHT*rowstride;
  var imgData = new Uint8Array(l);
  imgData[0]=66;
  imgData[1]=77;
  imgData[2]=l;
  imgData[3]=l>>8;  // plus 2 more bytes for size
  imgData[10]=headerLen;
  // BITMAPCOREHEADER
  imgData[14]=12; // sizeof(BITMAPCOREHEADER)
  imgData[18]=WIDTH;
  imgData[19]=WIDTH>>8;
  imgData[20]=HEIGHT;
  imgData[21]=HEIGHT>>8;
  imgData[22]=1;
  imgData[24]=1; // bpp
  imgData[26]=255; // palette white
  imgData[27]=255;
  imgData[28]=255;
  function setPixel(x,y) { if (y<0 || x<0 || x>=WIDTH || y>=HEIGHT) return; imgData[headerLen + (x>>3) + ((HEIGHT-(y+1))*rowstride)] |= 128>>(x&7); }
  function getPixel(x,y) { return imgData[headerLen + (x>>3) + ((HEIGHT-(y+1))*rowstride)] & (128>>(x&7)); }

  // Draw
  //for (var i=0;i<HEIGHT;i++) setPixel(i,i);
  // borders
  if (!MINIMAL) {
    for (var i=2*SPACINGY;i<=(2+ROWS)*SPACINGY+2;i++) {
      setPixel(0,i);
      setPixel(16*SPACINGX+3,i);
    }
    for (var i=0;i<=16*SPACINGX+3;i++) {
      setPixel(i,(2+ROWS)*SPACINGY+3);
      setPixel(i,2*SPACINGY);
    }
  }
  // draw all chars in grid
  if (!MINIMAL) {
    var starty = 16-ROWS;
    for (var y=starty;y<16;y++)
      for (var x=0;x<16;x++)
         drawChar(x+(y*16), 2+(x*SPACINGX), 2+((y+2-starty)*SPACINGY));
  }
  // draw test text
  TESTLINES.forEach((s,y)=>{
  if (MINIMAL && y>0) return;
  var x=0;
  for (var ch of s) {
     var ch = ch.charCodeAt();
     drawChar(ch, x, y*SPACINGY);
     x += getCharWidth(ch);
   }
  });
  // test output
  /*for (var y=0;y<HEIGHT;y++) {
    var s = "";
    for (var x=0;x<WIDTH;x++) s += getPixel(x,y)?"#":" ";
    console.log(s);
  }*/
  // Output URL encoded
  return "data:image/bmp;base64,"+ Buffer.from(imgData).toString('base64');
}

//console.log(getFontPreview("../modules/FontDennis8.js"));
//console.log(getFontPreview("../modules/FontCopasetic40x58Numeric.js"));
console.log(getFontPreview("../modules/FontTeletext10x18Ascii.js"));
exports.getFontPreview = getFontPreview;
