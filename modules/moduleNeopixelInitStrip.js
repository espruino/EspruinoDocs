function neopixelInitLED(pin) {
  this.p = pin[0];
}
neopixelInitLED.prototype.on = function() {
  this.p.reset();
};
neopixelInitLED.prototype.off = function() {
  this.p.set();
};
neopixelInitLED.prototype.get = function() {
  return this.p;
};
neopixelInitLED.prototype.set = function(obj) {
  this.p = obj;
};
exports = neopixelInitLED;
var NUM_PIXELS = 8;
var RGB_SEQ_GRB = "GRB";
var RGB_SEQ_RGB = "RGB";
var RGB_SEQ_WS2812 = RGB_SEQ_GRB;
var RGB_SEQ_WS2811 = RGB_SEQ_RGB;
var RGB_SEQ = RGB_SEQ_WS2812;
var RGBSEQ = "GRB";
var OPTION_BASE_ZERO = 0;
var OPTION_BASE_ONE = 1;
var OPTION_BASE = OPTION_BASE_ZERO;
var objRGB = [255, 0, 0];
var colorRGB = {r:255, g:0, b:0};
var objR = colorRGB.r;
var objG = colorRGB.g;
var objB = colorRGB.b;
var colorRGBRainbowRed = {r:255, g:0, b:0};
var colorRGBRainbowOrn = {r:171, g:85, b:0};
var colorRGBRainbowYel = {r:171, g:171, b:0};
var colorRGBRainbowGrn = {r:0, g:255, b:0};
var colorRGBRainbowAqu = {r:0, g:171, b:85};
var colorRGBRainbowBlu = {r:0, g:0, b:255};
var colorRGBRainbowPur = {r:85, g:0, b:171};
var colorRGBRainbowPnk = {r:171, g:0, b:85};
var aryRainbow = [colorRGBRainbowRed, colorRGBRainbowOrn, colorRGBRainbowYel, colorRGBRainbowGrn, colorRGBRainbowAqu, colorRGBRainbowBlu, colorRGBRainbowPur, colorRGBRainbowPnk];
exports = colorRGBRainbowRed;
exports = colorRGBRainbowOrn;
exports = colorRGBRainbowYel;
exports = colorRGBRainbowGrn;
exports = colorRGBRainbowAqu;
exports = colorRGBRainbowBlu;
exports = colorRGBRainbowPur;
exports = colorRGBRainbowPnk;
exports = aryRainbow;
var MAX_GAMMA = 256;
var DEF_BRIGHTNESS = 70;
var g = E.compiledC("\n// void set(int, int)\n// int get(int)\nint gc[256] = {\n 42,43,44,45,46,47,48,42\n};\nvoid set(int idx, int val){\n  gc[idx] = val;\n}\nint get(int idx){\n  return( gc[idx] );\n}\n");
var NeopixelInit = function(options) {
  if (typeof options != "object") {
    options = {};
  }
  options.optionBase = options.optionBase || OPTION_BASE_ZERO;
  options.pinAryNeopixel = options.pinAryNeopixel || PIN_PICO_NEOPIXEL;
  options.pinAryNeoIdx = options.pinAryNeoIdx || 0;
  options.pinLedTest = options.pinLedTest || PIN_PICO_LED;
  options.pinAryLedTest = options.pinAryLedTest || PIN_PICO_LED;
  options.pinAryLedTestIdx = options.pinAryLedTestIdx || 0;
  options.numPixels = options.numPixels || NUM_PIXELS;
  options.rgbSeq = options.rgbSeq || RGB_SEQ_WS2812;
  options.brightness = options.brightness || DEF_BRIGHTNESS;
  options.useGamma = options.useGamma || false;
  this.rgbSeq = options.rgbSeq;
  var nValPin = options.pinAryNeopixel[options.pinAryNeoIdx];
  console.log("L[450] nPinLed " + options.pinAryNeoIdx);
  console.log("L[451] nPinLed " + options.pinAryNeopixel[0]);
  console.log("L[451] nPinLed " + options.pinAryNeopixel[options.pinAryNeoIdx]);
  console.log("L[450] nPinLed " + nValPin);
  this.pinNeopixel = nValPin;
  console.log("L[451] nPinLed " + options.pinAryLedTestIdx);
  console.log("L[451] nPinLed " + options.pinAryLedTest[0]);
  console.log("L[451] nPinLed " + options.pinAryLedTest[options.pinAryLedTestIdx]);
  var nPinLed = options.pinAryLedTest[options.pinAryLedTestIdx];
  this.pinLed = nPinLed;
  var nArySizeRGB = options.numPixels * 3;
  this.aryDisp = new Uint8ClampedArray(nArySizeRGB);
  this.aryPrep = new Uint8ClampedArray(nArySizeRGB);
  this.aryBrig = new Uint8ClampedArray(nArySizeRGB);
  this.aryGcor = new Uint8ClampedArray(nArySizeRGB);
  this.aryGamm = new Uint8ClampedArray(MAX_GAMMA);
  this.ad = new Uint8ClampedArray(nArySizeRGB);
  this.ar = new Uint8ClampedArray(nArySizeRGB);
  this.ab = new Uint8ClampedArray(nArySizeRGB);
  this.ac = new Uint8ClampedArray(nArySizeRGB);
  this.ag = new Uint8ClampedArray(MAX_GAMMA);
  this.brightness = options.brightness;
  this.useGamma = options.useGamma;
  this.NUM_PIXELS = options.numPixels;
  this.gam();
};
NeopixelInit.prototype.ledon = function() {
  this.pinLed.reset();
};
NeopixelInit.prototype.ledoff = function() {
  this.pinLed.set();
};
NeopixelInit.prototype.getnumpixels = function() {
  return this.NUM_PIXELS;
};
NeopixelInit.prototype.getaryprep = function() {
  return this.aryPrep;
};
NeopixelInit.prototype.getlenaryprep = function() {
  return this.aryPrep.length;
};
NeopixelInit.prototype.getarydisp = function() {
  return this.aryDisp;
};
NeopixelInit.prototype.getlenarydisp = function() {
  return this.aryDisp.length;
};
NeopixelInit.prototype.getrgbseq = function() {
  return this.rgbSeq;
};
NeopixelInit.prototype.getBrightness = function() {
  return this.bightness;
};
NeopixelInit.prototype.setBrightness = function(obj) {
  this.brightness = obj;
};
NeopixelInit.prototype.setUseGamma = function(obj) {
  this.useGamma = obj;
};
NeopixelInit.prototype.mapBrightness = function() {
  var idx = 0;
  for (var i = 0; i < this.ar.length; i++) {
    var nRGBCur = this.ar[i];
    var nPcntBr = Math.floor(nRGBCur * this.brightness / 100);
    this.ab[i] = nPcntBr;
    console.log("L[491] nPcntBr " + this.ab[i]);
  }
};
NeopixelInit.prototype.applyGamma = function() {
  for (var i = 0; i < this.ab.length; i++) {
    var nRGBCur = this.ab[i];
    console.log("L[504] nRGBCur " + this.ab[i]);
    this.ac[i] = g.get(nRGBCur);
    console.log("L[619] g.get(i) " + g.get(nRGBCur));
  }
};
NeopixelInit.prototype.dispG = function() {
  for (var i = 0; i < this.ab.length; i++) {
    console.log("L[632] g.get(i) " + g.get(i));
  }
};
NeopixelInit.prototype.gam = function() {
  var dGam = 2.5;
  var gamma = 2.8;
  gamma = dGam;
  var max_in = 255;
  var max_out = 255;
  var idx = 0;
  for (var i = 0; i <= max_in; i++) {
    if ((i & 15) === 0) {
      print("\n ");
    }
    var resultpow = Math.pow(i / max_in, gamma) * max_out + 0.5;
    console.log("L[653] [" + i + "] " + resultpow);
    var fmt = resultpow.toFixed(0);
    g.set(idx++, fmt);
    console.log("L[653] [" + i + "] " + fmt);
  }
};
NeopixelInit.prototype.buildRainbow = function() {
  var aryRGB = new Uint8ClampedArray(this.getnumpixels());
  aryRGB = aryRainbow;
  var aryRainbowPrep = new Uint8ClampedArray(this.getlenarydisp());
  console.log("L[1060] getrgbseq " + this.getrgbseq());
  var idx = 0;
  for (var i = 0; i < aryRGB.length; i++) {
    console.log("L[1068] aryRGB r " + aryRGB[i].r);
    console.log("L[1068] aryRGB g " + aryRGB[i].g);
    console.log("L[1068] aryRGB b " + aryRGB[i].b);
    if (this.getrgbseq() == RGB_SEQ_GRB) {
      console.log("L[468] this.getrgbseq() " + this.getrgbseq());
      aryRainbowPrep[idx++] = aryRGB[i].g;
      aryRainbowPrep[idx++] = aryRGB[i].r;
      aryRainbowPrep[idx++] = aryRGB[i].b;
    } else {
      aryRainbowPrep[idx++] = aryRGB[i].r;
      aryRainbowPrep[idx++] = aryRGB[i].g;
      aryRainbowPrep[idx++] = aryRGB[i].b;
    }
  }
  for (var i = 0; i < aryRainbowPrep.length; i++) {
  }
  return aryRainbowPrep;
};
NeopixelInit.prototype.mapone = function(offset, color) {
  var idx = 0;
  var iStart = offset * 3;
  console.log("L[536] offset " + offset.toString());
  console.log("L[536] iStart " + iStart.toString());
  for (var i = 0; i < this.ar.length; i++) {
    if (iStart == i) {
      if (this.getrgbseq() == RGB_SEQ_GRB) {
        var g = color.g;
        console.log("L[346] g " + g);
        this.ar[idx++] = g;
        console.log("L[311g] aryPrep[" + (idx - 1).toString() + "] " + this.ar[idx - 1]);
        var r = color.r;
        console.log("L[346] r " + r);
        this.ar[idx++] = r;
        console.log("L[311r] aryPrep[" + (idx - 1).toString() + "] " + this.ar[idx - 1]);
        var b = color.b;
        console.log("L[346] b " + b);
        this.ar[idx++] = b;
        console.log("L[556b] aryPrep[" + (idx - 1).toString() + "] " + this.ar[idx - 1]);
        break;
      }
    } else {
      idx++;
    }
  }
};
NeopixelInit.prototype.setdata = function(obj) {
  this.ar = obj.slice(0);
};
NeopixelInit.prototype.setaryprep = function(obj) {
  var ob = obj;
  this.aryPrep = obj.slice(0);
};
NeopixelInit.prototype.copy = function() {
  this.ad = this.ar.slice(0);
};
NeopixelInit.prototype.update = function() {
  this.mapBrightness();
  this.applyGamma();
  console.log("L[756] update " + this.useGamma);
  this.ad = this.useGamma ? this.ac.slice(0) : this.ab.slice(0);
  require("neopixel").write(this.pinNeopixel, this.ad);
};
NeopixelInit.prototype.alloff = function() {
  for (var i = 0; i < this.NUM_PIXELS * 3; i++) {
    this.ad[i] = 0;
  }
  console.log("L[550] this.pinNeopixel " + this.pinNeopixel);
  require("neopixel").write(this.pinNeopixel, this.ad);
};
NeopixelInit.prototype.cleardata = function() {
  for (var i = 0; i < this.NUM_PIXELS * 3; i++) {
    this.ar[i] = 0;
  }
};
NeopixelInit.prototype.cleararyprep = function() {
  for (var i = 0; i < this.NUM_PIXELS * 3; i++) {
    this.aryPrep[i] = 0;
  }
  console.log("L[550] cleararyprep " + this.pinNeopixel);
};
NeopixelInit.prototype.disp = function() {
  console.log("L[296a] this.NUM_PIXELS " + this.NUM_PIXELS);
  for (var i = 0; i < this.NUM_PIXELS * 3; i++) {
    console.log("L[296] i " + i);
    console.log("L[296] " + this.aryDisp[i] + " " + this.aryDisp[i + 1] + " " + this.aryDisp[i + 2]);
    i++;
    i++;
  }
  console.log("    ");
  var sSeq = this.getrgbseq() == RGB_SEQ_GRB ? RGB_SEQ_GRB : RGB_SEQ_RGB;
  console.log("    " + sSeq);
  for (i = 0; i < this.NUM_PIXELS * 3; i++) {
    console.log("L[296] i " + i);
    console.log("L[299] " + this.aryPrep[i] + " " + this.aryPrep[i + 1] + " " + this.aryPrep[i + 2]);
    i++;
    i++;
  }
};
NeopixelInit.prototype.dispA = function() {
  console.log("L[834] this.NUM_PIXELS " + this.NUM_PIXELS);
  console.log("L[835]    Disp    Corr   Brig   Raw");
  for (var i = 0; i < this.ad.length; i++) {
    console.log("L[296] i " + i);
    console.log("L[840] " + this.ad[i + 0] + " " + this.ad[i + 1] + " " + this.ad[i + 2]);
    console.log("L[844] cor     " + this.ac[i + 0] + " " + this.ac[i + 1] + " " + this.ac[i + 2]);
    console.log("L[844]  br                 " + this.ab[i + 0] + " " + this.ab[i + 1] + " " + this.ab[i + 2]);
    console.log("L[844] raw                     " + this.ar[i + 0] + " " + this.ar[i + 1] + " " + this.ar[i + 2]);
    i++;
    i++;
  }
};
exports = NeopixelInit;
var Color = function(obj) {
  if (typeof obj == "string") {
    var objRGB = JSON.parse(JSON.stringify(RGB));
    var key;
    for (key in objRGB) {
      if (objRGB.hasOwnProperty(key)) {
        if (obj.toUpperCase() == key.toUpperCase()) {
          console.log("Color: " + obj.toUpperCase() + "  " + objRGB[key]);
          if (objRGB[key].length != 6) {
            return NaN;
          }
          this.colorName = key;
          this.colorRGB = objRGB[key];
          this.colorR = objRGB[key].substring(0, 2);
          this.colorG = objRGB[key].substring(2, 4);
          this.colorB = objRGB[key].substring(4, 6);
          this.decR = this.cvrtHexToDec(this.colorR);
          this.decG = this.cvrtHexToDec(this.colorG);
          this.decB = this.cvrtHexToDec(this.colorB);
          this.hexR = this.cvrtHexStToHexN(this.colorR);
          this.hexG = this.cvrtHexStToHexN(this.colorG);
          this.hexB = this.cvrtHexStToHexN(this.colorB);
          var vals = {};
          vals.r = this.decR;
          vals.g = this.decG;
          vals.b = this.decB;
          vals.n = this.colorName;
          this.colorObjJson = JSON.parse(JSON.stringify(vals));
        }
      }
    }
  }
  this.colorA = "FF";
  this.colorARGB = "ffffffff";
  return this.colorObjJson;
};
Color.prototype.setColorA = function(colorValDec) {
  this.colorA = colorValDec;
};
Color.prototype.setColorR = function(colorValDec) {
  this.colorR = colorValDec;
};
Color.prototype.setColorG = function(colorValDec) {
  this.colorG = colorValDec;
};
Color.prototype.setColorB = function(colorValDec) {
  this.colorB = colorValDec;
};
Color.prototype.setColorARGB = function(colorValHex) {
  this.colorARGB = colorValHex;
};
Color.prototype.setColorARGBJson = function(colorValJson) {
  this.colorValJson = colorValJson;
};
Color.prototype.getColorA = function() {
  return this.colorA;
};
Color.prototype.getColorR = function() {
  return this.colorR;
};
Color.prototype.getColorG = function() {
  return this.colorG;
};
Color.prototype.getColorB = function() {
  return this.colorB;
};
Color.prototype.getColorARGB = function() {
  return this.colorARGB;
};
Color.prototype.getColorARGBJson = function() {
  return this.colorValJson;
};
Color.prototype.cvrtHexToDec = function(hex) {
  if (typeof hex == "number") {
    hex = hex.toString(16);
  }
  if (typeof hex != "string" && typeof hex != "number") {
    return "NaN";
  }
  var shex = hex;
  var s = hex.substring(0, 2);
  if (s != "0x") {
    shex = "0x" + hex.toString(16);
  }
  var decimal = Number(shex);
  return decimal;
};
Color.prototype.cvrtDecToHex = function(decimal, padding) {
  var hex = Number(decimal).toString(16);
  padding = typeof padding === "undefined" || padding === null ? padding = 2 : padding;
  while (hex.length < padding) {
    hex = "0" + hex;
  }
  return hex;
};
Color.prototype.cvrtHexStToHexN = function(hex) {
  var shex = NaN;
  if (typeof hex == "string") {
    var s = hex.substring(0, 2);
    if (s != "0x") {
      shex = "0x" + hex.toString(16);
    }
  }
  return shex;
};
exports = Color;
