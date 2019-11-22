#!/bin/node
/* Creates a URL-encoded preview image of an Espruino bitmap font */

global.atob = function(a) {
    return new Buffer(a, 'base64').toString('binary');
};

function getFontPreview(path) {
  var fontLib = require(path);
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

  var SPACING = Math.max(fontMaxWidth, fontHeight)+1;
  var WIDTH = 16*SPACING+4;
  var HEIGHT = 16*SPACING+4;
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
  function setPixel(x,y) { if (x<WIDTH) imgData[headerLen + (x>>3) + ((HEIGHT-(y+1))*rowstride)] |= 128>>(x&7); }
  function getPixel(x,y) { return imgData[headerLen + (x>>3) + ((HEIGHT-(y+1))*rowstride)] & (128>>(x&7)); }

  // Draw
  //for (var i=0;i<HEIGHT;i++) setPixel(i,i);

  for (var i=2*SPACING;i<16*SPACING+2;i++) {
    setPixel(0,i);
    setPixel(16*SPACING+1,i);
  }
  for (var i=0;i<16*SPACING+2;i++) {
    setPixel(i,16*SPACING+2);
    setPixel(i,2*SPACING);
  }
  for (var y=2;y<16;y++)
    for (var x=0;x<16;x++)
       drawChar(x+(y*16), 2+(x*SPACING), 2+ (y*SPACING));
  ["0.123456789abcdefABCDEF",
  "This is a Test of the Font"].forEach((s,y)=>{
    var x=0;
    for (var ch of s) {
       var ch = ch.charCodeAt();
       drawChar(ch, x, y*SPACING);
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
  return "data:image/bmp;base64,"+new Buffer(imgData).toString('base64');
}

console.log(getFontPreview("../modules/FontDennis8.js"));
exports.getFontPreview = getFontPreview;
