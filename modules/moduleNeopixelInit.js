/* Copyright (c) 2018 Robin G Cox  See the file LICENSE for copying permission */




//process.memory();
//process.env;




//var exports={};







//LED power on indicator

//http://www.espruino.com/Pico#line=8,9
//Lower right most pin 5 o'clock
//digitalWrite(A5, 1);
//var on  = 0;
//var off = 1;

//Usage: led test
//var ledTest = new neopixelInitLED([A5]);
//ledTest.on();
//ledTest.off();

/* copy across to left pane
var l = new neopixelInitLED([A5])
l.on();
l.off();
l.get();
l.set(A5);
*/


function neopixelInitLED(pin) {
 // debugger;
  this.p = pin[0];
}

// To drive the LED not Neopixel we need to make the output Lo - LED Anode to 3V through 220 ohm
neopixelInitLED.prototype.on  = function() { this.p.reset(); };
neopixelInitLED.prototype.off = function() { this.p.set(); };
neopixelInitLED.prototype.get = function() { return this.p; };
neopixelInitLED.prototype.set = function(obj) { this.p = obj; };


exports = neopixelInitLED;



/*
exports.create = function() {
//  return new neopixelInit([A5]);
  return new neopixelInitLED([A5]);
};
*/
/*
function t() {
  var ledTest = new neopixelInitLED([A5]);
ledTest.on();
//ledTest.off();
}
*/












/*
Color
Hue Sat
https://www.w3schools.com/colors/colors_picker.asp?color=80ced6
https://www.w3schools.com/colors/
140 CSS color names
https://www.w3schools.com/cssref/css_colors.asp
*/




/*
var C = {
  MY : 0x001,          // description
  PRIVATE : 0x001,     // description
  CONSTANTS : 0x00423  // description
};
*/

//exports MY_CONST_TEST;
//exports C;

/*
const colorRGBRainbowRed = { r:255, g:0, b:0 };
const colorRGBRainbowOrn = { r:171, g:85, b:0 };
const colorRGBRainbowYel = { r:171, g:171, b:0 };
const colorRGBRainbowGrn = { r:0, g:255, b:0 };

const colorRGBRainbowAqu = { r:0, g:171, b:85 };
const colorRGBRainbowBlu = { r:0, g:0, b:255 };
const colorRGBRainbowPur = { r:85, g:0, b:171 };
const colorRGBRainbowPnk = { r:171, g:0, b:85 };
*/

//  RED : 0x00FF0000,


//https://www.w3schools.com/js/js_json_objects.asp
//https://www.w3schools.com/js/js_json_datatypes.asp
//https://www.w3schools.com/js/js_json_syntax.asp
/*
var RGB = {
  "RED"    : "FF0000",
  "ORANGE" : "AB5500",
  "YELLOW" : "ABAB00",
  "GREEN"  : "00FF00",
  
  "AQUA"   : "00AB55",
  "BLUE"   : "0000FF",
  "PURPLE" : "550055",
  "PINK"   : "AB0055"
};
*/

/*
var RGB = {
  Red    : "FF0000",
  Orange : "AB5500",
  Yellow : "ABAB00",
  Green  : "00FF00",
  
  Aqua   : "00AB55",
  Blue   : "0000FF",
  Purple : "550055",
  Pink   : "AB0055"
};

*/



//var objJSON = JSON.parse( RGB );


/*
var objJSON = JSON.parse( RGB );




var RGB = {
  RED    : 'FF0000',
  ORANGE : 'FFA500',
  YELLOW : 'FFFF00',
  GREEN  : '00FF00',
  
  AQUA   : '00FFFF',
  BLUE   : '0000FF',
  PURPLE : '800080',
  PINK   : 'FFC0CB'
}
*/






//http://forum.espruino.com/conversations/295679/
//var sensorReadings = '{ "restempvalue" : 0, "phvalue" : 0, "ecvalue" : 0 }';
//var sensorObj = JSON.parse(sensorReadings);
//={ "restempvalue": 0, "phvalue": 0, "ecvalue": 0 }

/*
var sr = '{ "rtv" : 1, "phv" : 3, "ecv" : 7 }';
var objsr = JSON.parse(sr);

objsr.phv
=3


//https://stackoverflow.com/questions/39822814/iterate-through-entire-json-object-without-knowing-any-keys

var arr = JSON.parse(sr);



var objRGB = JSON.parse(JSON.stringify(RGB));

var arr = JSON.parse(objRGB);
var arr = objRGB;

var key;

for (key in arr) {
  if (arr.hasOwnProperty(key)) {
    console.log(key);
    console.log(arr[key]);
  }
}




*/







//Constants


// Default strip length - Number of LEDs to illuminate
/*
NeopixelWS2812.prototype.NUM_PIXELS = 8;
// 
NeopixelWS2812.prototype.data = new Uint8ClampedArray(NeopixelWS2812.prototype.NUM_PIXELS*3);
*/
//var NUM_PIXELS = 8;
const NUM_PIXELS = 8;


//neopixelInit.prototype.NUM_PIXELS = NUM_PIXELS;
//neopixelInit.prototype.NUM_PIXELS_TRIPPLETS = NUM_PIXELS*3;
//exports = neopixelInit.prototype.NUM_PIXELS_TRIPPLETS;

//https://cdn-shop.adafruit.com/datasheets/WS2812.pdf  GRB
//https://cdn-shop.adafruit.com/datasheets/WS2811.pdf  RGB
const RGB_SEQ_GRB = "GRB";
const RGB_SEQ_RGB = "RGB";
const RGB_SEQ_WS2812 = RGB_SEQ_GRB;
const RGB_SEQ_WS2811 = RGB_SEQ_RGB;
  
  
var RGB_SEQ = RGB_SEQ_WS2812;
  
  
  
  
var RGBSEQ = "GRB";
//var RGBSEQ = "RGB";

var OPTION_BASE_ZERO = 0;
var OPTION_BASE_ONE  = 1;

var OPTION_BASE = OPTION_BASE_ZERO;
//neopixelInit.prototype.OPTION_BASE = OPTION_BASE_ZERO;
//exports = neopixelInit.prototype.OPTION_BASE;


/*
  http://fastled.io/docs/3.1/hsv2rgb_8cpp_source.html

"colorpalettes.cpp"
  158 // Gradient palette "Rainbow_gp",
  159 // provided for situations where you're going
  160 // to use a number of other gradient palettes, AND
  161 // you want a 'standard' FastLED rainbow as well.
  162 
  163 DEFINE_GRADIENT_PALETTE( Rainbow_gp ) {
  164       0,  255,  0,  0, // Red
  165      32,  171, 85,  0, // Orange
  166      64,  171,171,  0, // Yellow
  167      96,    0,255,  0, // Green
  168     128,    0,171, 85, // Aqua
  169     160,    0,  0,255, // Blue
  170     192,   85,  0,171, // Purple
  171     224,  171,  0, 85, // Pink
  172     255,  255,  0,  0};// and back to Red
*/
  
  
  
  
  
  

/* Rainbow colors
   roygbiv - RGB format
 255,  0,  0  Red
 171, 85,  0  Orange
 171,171,  0  Yellow
   0,255,  0  Green
   0,171, 85  Aqua
   0,  0,255  Blue
  85,  0,171  Purple
 171,  0, 85  Pink
*/

var objRGB = [ 255, 0, 0 ];

var colorRGB = { r:255, g:0, b:0 };

var objR = colorRGB.r;
var objG = colorRGB.g;
var objB = colorRGB.b;

//console.log( objR );

//Range 0-255
const colorRGBRainbowRed = { r:255, g:0, b:0 };
const colorRGBRainbowOrn = { r:171, g:85, b:0 };
const colorRGBRainbowYel = { r:171, g:171, b:0 };
const colorRGBRainbowGrn = { r:0, g:255, b:0 };

const colorRGBRainbowAqu = { r:0, g:171, b:85 };
const colorRGBRainbowBlu = { r:0, g:0, b:255 };
const colorRGBRainbowPur = { r:85, g:0, b:171 };
const colorRGBRainbowPnk = { r:171, g:0, b:85 };

const aryRainbow = [
  colorRGBRainbowRed,
  colorRGBRainbowOrn,
  colorRGBRainbowYel,
  colorRGBRainbowGrn,
  colorRGBRainbowAqu,
  colorRGBRainbowBlu,
  colorRGBRainbowPur,
  colorRGBRainbowPnk
];

exports = colorRGBRainbowRed;
exports = colorRGBRainbowOrn;
exports = colorRGBRainbowYel;
exports = colorRGBRainbowGrn;

exports = colorRGBRainbowAqu;
exports = colorRGBRainbowBlu;
exports = colorRGBRainbowPur;
exports = colorRGBRainbowPnk;

exports = aryRainbow;

//??? neopixelInit.prototype.OPTION_BASE = OPTION_BASE_ZERO;




// Gamma
const MAX_GAMMA = 256;

const DEF_BRIGHTNESS = 70;






var g = E.compiledC(`
// void set(int, int)
// int get(int)
int gc[256] = {
 42,43,44,45,46,47,48,42
};
void set(int idx, int val){
  gc[idx] = val;
}
int get(int idx){
  return( gc[idx] );
}
`);











//Neopixel



//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes


//neopixelInit.prototype.neopixelInit = class {
//neopixelInit.prototype.NeopixelInit = class {
class NeopixelInit {

//function neopixelInit( options ) {

  //http://www.espruino.com/WS2811
  //We'd suggest you wire up as follows. The only condition is that the
  //data wire is connected to an SPI MOSI port on the Espruino Board:

  //ref image:  http://www.espruino.com/Pico
  //SPI2 MOSI  B15
  //SPI1 MOSI  A7
  //SPI3 MOSI  B5

//  debugger;
////  var pinAryNeopixel = new Array(A7,B15,B5);
  //pinAryLEDTest[0] = [A5];
//  var pinAryLEDTest = new Array(A5,0,0);
  
  
  constructor( options ) {
  
//    debugger;
    
  if( typeof options != "object" ) options = {};
  options.optionBase  = options.optionBase  || OPTION_BASE_ZERO;
  options.pinAryNeopixel = options.pinAryNeopixel || PIN_PICO_NEOPIXEL;
//  options.pinAryNIdxDefault = options.pinAryNIdxDefault || PIN_PICO_NEOPIXEL;
  options.pinAryNeoIdx = options.pinAryNeoIdx || 0;
  options.pinLedTest  = options.pinLedTest  || PIN_PICO_LED;

    options.pinAryLedTest  = options.pinAryLedTest  || PIN_PICO_LED;
    options.pinAryLedTestIdx  = options.pinAryLedTestIdx  || 0;

   options.numPixels   = options.numPixels   || NUM_PIXELS;
 options.rgbSeq      = options.rgbSeq      || RGB_SEQ_WS2812;

    options.brightness = options.brightness ||  DEF_BRIGHTNESS;
    options.useGamma = options.useGamma || false;
    
    
    
  this.rgbSeq = options.rgbSeq;
//  const RGB_SEQ_GRB = "GRB";
//const RGB_SEQ_RGB = "RGB";
//const RGB_SEQ_WS2812 = RGB_SEQ_GRB;
//const RGB_SEQ_WS2811 = RGB_SEQ_RGB;//
//var RGB_SEQ = RGB_SEQ_WS2812;
//  var RGBSEQ = "GRB";
///var RGBSEQ = "RGB";

  
//  this.led = new neopixelInitLED( options.pinLedTest );
//  this.led = options.pinLedTest;
//  this.led = "[A5]";
//works  this.led = A5;
  var nValPin = options.pinAryNeopixel[ options.pinAryNeoIdx ];

    console.log( "L[450] nPinLed " + options.pinAryNeoIdx );

console.log( "L[451] nPinLed " + options.pinAryNeopixel[0] );
console.log( "L[451] nPinLed " + options.pinAryNeopixel[ options.pinAryNeoIdx ] );
    console.log( "L[450] nPinLed " + nValPin );

  
  this.pinNeopixel = nValPin;
  //  this.pinNeopixel = B15;

  console.log( "L[451] nPinLed " + options.pinAryLedTestIdx );

console.log( "L[451] nPinLed " + options.pinAryLedTest[0] );
console.log( "L[451] nPinLed " + options.pinAryLedTest[ options.pinAryLedTestIdx ] );
  
    var nPinLed = options.pinAryLedTest[ options.pinAryLedTestIdx ];
//  this.pinNeopixel = nValPin;

  this.pinLed = nPinLed;
//  this.led = options.pinLedTest;
//??  this.p = options.pinLedTest;
  //0906 this.p = pinAryLEDTest[0];
//  this.p = options.pinLedTest;
//  this.p = [A5];
//out  this.p = pinAryLEDTest[0];
  
 //   this.p = new neopixelInitLED( options.pinLedTest );
//debugger;
  
  //Uncaught Error: Field or method "1" does not already exist, and can't create it on Pin
// at line 412 col 43
//  this.pinNeopixel = options.pinNeopixel[1];

//ul error   this.pinNeopixel = options.pinNeopixel[1];
//  this.pinNeopixel = B15;
  
  
  
  
//ref     options.numPixels   = options.numPixels   || NUM_PIXELS;

  //Uncaught Error: Data length must be a multiple of 3 (RGB). at line 2 col 58

  
  // We use Uint8ClampedArray as our values are 0-255
  var nArySizeRGB = options.numPixels * 3;
  this.aryDisp = new Uint8ClampedArray( nArySizeRGB );
  this.aryPrep = new Uint8ClampedArray( nArySizeRGB );
  this.aryBrig = new Uint8ClampedArray( nArySizeRGB );
  this.aryGcor = new Uint8ClampedArray( nArySizeRGB );

  this.aryGamm = new Uint8ClampedArray( MAX_GAMMA );

    
  this.ad = new Uint8ClampedArray( nArySizeRGB );
  this.ar = new Uint8ClampedArray( nArySizeRGB );
  this.ab = new Uint8ClampedArray( nArySizeRGB );
  this.ac = new Uint8ClampedArray( nArySizeRGB );

  this.ag = new Uint8ClampedArray( MAX_GAMMA );
    
    
    
  this.brightness = options.brightness;
  this.useGamma = options.useGamma;
    
    
//  this.arr = var arr = new Uint8ClampedArray(NUM_PIXELS*3);
//  this.aryPrep = var aryPrep = new Uint8ClampedArray(NUM_PIXELS*3);
//??  this.arr = new Uint8ClampedArray(NUM_PIXELS*3);
//??  this.aryPrep = new Uint8ClampedArray(NUM_PIXELS*3);

  this.NUM_PIXELS = options.numPixels;
    
    
    
    // Run
    this.gam();
    //constructor()
  }

  
  
//NeopixelInit.prototype.ledon  = function() { this.pinLed.reset(); };
//NeopixelInit.prototype.ledoff = function() { this.pinLed.set(); };
  
  ledon() { this.pinLed.reset(); }
  ledoff() { this.pinLed.set(); }

  
//  neopixelInit.prototype.getnumpixels  = function() { return this.NUM_PIXELS; };
//neopixelInit.prototype.getarydisp  = function() { return this.aryDisp; };
//neopixelInit.prototype.getlenarydisp  = function() { return this.aryDisp.length; };
// options.rgbSeq      = options.rgbSeq      || RGB_SEQ_WS2812;
//  const RGB_SEQ_GRB = "GRB";
//const RGB_SEQ_RGB = "RGB";
//neopixelInit.prototype.getrgbseq = function() { return this.rgbSeq; };
  getnumpixels() { return this.NUM_PIXELS; }
  getaryprep() { return this.aryPrep; }
  getlenaryprep() { return this.aryPrep.length; }
  getarydisp() { return this.aryDisp; }
  getlenarydisp() { return this.aryDisp.length; }
  getrgbseq() { return this.rgbSeq; }
  
  getBrightness() { return this.bightness; }
  setBrightness( obj ) { this.brightness = obj; }

  
  setUseGamma( obj ) { this.useGamma = obj; }
  
  
  
  /*
  
  //      this.brightness = options.brightness;
  //this.useGamma = options.useGamma;

    var nArySizeRGB = options.numPixels * 3;

    this.aryDisp = new Uint8ClampedArray( nArySizeRGB );
  this.aryPrep = new Uint8ClampedArray( nArySizeRGB );
  this.aryBrig = new Uint8ClampedArray( nArySizeRGB );
  this.aryGcor = new Uint8ClampedArray( nArySizeRGB );
*/ 
  
  
  
  

// Brightness
// A percentage range 0-100
// Lower part of table are zero - offset of 5  step 2.5  round .5 up
// Convert percentage to index where 100% == 255
//   0 ::   5
//  10 ::  30
//  25 ::  67
//  50 :: 130
//  75 :: 192
// 100 :: 255
  
  
  mapBrightness() {
      var idx = 0;
//  debugger;
//  for( var i=0; i<aryRainbowHex.length; i++ ) {
//  for( var i=0; i<this.aryPrep.length; i++ ) {
  for( var i=0; i<this.ar.length; i++ ) {

//    var nRGBCur = aryPrep[i];
    var nRGBCur = this.ar[i];
    // This has a range of 0-255
     var nPcntBr = Math.floor( nRGBCur * this.brightness / 100 );
this.ab[i] = nPcntBr;
//make          arr[i] = aryGamma[ nNewG ];

    
      console.log( "L[491] nPcntBr " + this.ab[i] );

  }
  }  
  
  
  applyGamma() {
      for( var i=0; i<this.ab.length; i++ ) {
    var nRGBCur = this.ab[i];
      console.log( "L[504] nRGBCur " + this.ab[i] );

        
        this.ac[i] = g.get(nRGBCur);
      console.log( "L[619] g.get(i) " +  g.get(nRGBCur) );
        
        
      }
    
    
  }
  
  
  
   dispG() {
      for( var i=0; i<this.ab.length; i++ ) {
        
       console.log( "L[632] g.get(i) " +  g.get(i) );
      } 
   }
  
  
  
  
//gamma correction
//https://cdn-learn.adafruit.com/downloads/pdf/led-tricks-gamma-correction.pdf

  
  //var dGam = 2.5;

//function ga() {
//function gam(dGam) {

  
   gam() {

   var dGam = 2.5;

var gamma = 2.8; // Correction factor
  
  gamma = dGam;
var max_in = 255; // Top end of INPUT range
    var max_out = 255; // Top end of OUTPUT range

  
  var idx = 0;
  
//  for( var i=0; i<=max_in; i++ ) {
      for( var i=0; i<=max_in; i++ ) {

//if(i > 0) print(',');
if((i & 15) === 0) print("\n ");

//var resultpow = (int)(pow((float)i / (float)max_in, gamma) * max_out + 0.5));
var resultpow = (Math.pow(i / max_in, gamma) * max_out + 0.5);

    
      console.log("L[653] [" + i  + "] " + resultpow);
 //     console.log("L[653] resultmult [" + i  + "] " + resultmult);
var fmt = resultpow.toFixed(0);
    
        
        
        g.set(idx++,fmt);
        
        
    console.log("L[653] [" + i  + "] " + fmt);

    
    
  }
  
}


  
  
  
  
  
  
  
  
//    this.brightness = options.brightness;
  //this.useGamma = options.useGamma;

  
    /*
    
    
    
    
var options = { 'pinLedTest':[A5]
,'pinAryNeopixel':[B5,B15],'pinAryNeoIdx':1
,'pinAryLedTest':[A3,A4,A5],'pinAryLedTestIdx':2
,'useGamma':false,'brightness':100
,'optionBase':OPTION_BASE_ZERO };


var options = { 'pinLedTest':[A5]
,'pinAryNeopixel':[B5,B15],'pinAryNeoIdx':1
,'pinAryLedTest':[A3,A4,A5],'pinAryLedTestIdx':2
,'useGamma':true,'brightness':70
,'optionBase':OPTION_BASE_ZERO };
    



var n = new NeopixelInit( options );
n.ledon();

var a = n.buildRainbow();
//neo.copy();
n.setdata(a);
n.dispA();
n.update();

n.dispA();

n.dispG();

*/

  
  buildRainbow() {
    var aryRGB = new Uint8ClampedArray( this.getnumpixels() );  
    aryRGB = aryRainbow;
  
      var aryRainbowPrep = new Uint8ClampedArray( this.getlenarydisp() );  
   console.log( "L[1060] getrgbseq " + this.getrgbseq() );

  var idx = 0;
  // Separate individual color arguments and create the ordered linear array
    for( var i=0; i<aryRGB.length; i++ ) {

   console.log( "L[1068] aryRGB r " + aryRGB[i].r );
   console.log( "L[1068] aryRGB g " + aryRGB[i].g );
   console.log( "L[1068] aryRGB b " + aryRGB[i].b );
       
  if( this.getrgbseq() == RGB_SEQ_GRB )
  {
   console.log( "L[468] this.getrgbseq() " + this.getrgbseq() );
   aryRainbowPrep[idx++] = aryRGB[i].g;
   aryRainbowPrep[idx++] = aryRGB[i].r;
   aryRainbowPrep[idx++] = aryRGB[i].b;
  }
else
{
   aryRainbowPrep[idx++] = aryRGB[i].r;
   aryRainbowPrep[idx++] = aryRGB[i].g;
   aryRainbowPrep[idx++] = aryRGB[i].b;
  
}
      
      
      // for
      }

      for( var i=0; i<aryRainbowPrep.length; i++ ) {
  
        
        
  //      this.aryPrep[i] = aryRainbowPrep[i];
      }
    
    
    
    return( aryRainbowPrep );
   //buildRainbow() 
  }
  
  
  
  
  
  
//neopixelInit.prototype.mapone = function( offset, color ) {
mapone ( offset, color ) {
  
  var idx = 0;
//  debugger;
  var iStart = offset*3;
  
  //    var OPTION_BASE_ZERO = OPTION_BASE_ZERO;
//  if( (settings.optionBase !== undefined) && (settings.optionBase !== null) )
  //{
    //this.optionBase = settings.optionBase;
//neopixelInit.prototype.OPTION_BASE_ZERO = OPTION_BASE_ZERO;

//if( neopixelInit.prototype.OPTION_BASE == OPTION_BASE_ONE )
//if( this.optionBase == OPTION_BASE_ONE )
//  iStart-= 3;
  

      console.log( "L[536] offset " + offset.toString() );
      console.log( "L[536] iStart " + iStart.toString() );
  
  
  
//  for( var i=0; i<aryPrep.length; i++ ) {
//  for( var i=0; i<this.aryPrep.length; i++ ) {
  for( var i=0; i<this.ar.length; i++ ) {
    if( iStart == i )
    {
//    if( RGBSEQ == "GRB" )
     if( this.getrgbseq() == RGB_SEQ_GRB )
   
    {
//      var g = fetch( color, "g" );
      var g = color.g;
      console.log( "L[346] g " + g );

//    aryPrep[idx++] = g;
//    this.aryPrep[idx++] = g;
    this.ar[idx++] = g;
    console.log( "L[311g] aryPrep[" + (idx-1).toString() + "] " + this.ar[idx-1] );

//      var r = fetch( color, "r" );
      var r = color.r;
      console.log( "L[346] r " + r );
      
//      this.aryPrep[idx++] = r;
  //  console.log( "L[311r] aryPrep[" + (idx-1).toString() + "] " + this.aryPrep[idx-1] );
      this.ar[idx++] = r;
    console.log( "L[311r] aryPrep[" + (idx-1).toString() + "] " + this.ar[idx-1] );

//      var b = fetch( color, "b" );
      var b = color.b;
      console.log( "L[346] b " + b );
      
      
//      this.aryPrep[idx++] = b;
  //  console.log( "L[556b] aryPrep[" + (idx-1).toString() + "] " + this.aryPrep[idx-1] );
      this.ar[idx++] = b;
    console.log( "L[556b] aryPrep[" + (idx-1).toString() + "] " + this.ar[idx-1] );
      
      break;
    }
    }
    else
    {
      idx++;
//      idx++;
  //    idx++;
      
    }
    
    
  }
  
}
  
  
  
  
  
  
  
    setdata( obj ) { this.ar = obj.slice(0); }
  
  
  
//neopixelInit.prototype.setaryprep = function(obj) { 
  setaryprep( obj ) {
    
//    debugger;
    var ob = obj;
    
  this.aryPrep = obj.slice(0); 

  
  /*
  for(var i=0;i<obj.length;i++) {
    console.log( "L[796] " + obj[i] );
        }
  
  this.aryPrep = obj; 
          
                                                   obj.bind(this);
                                                   
      for(var i=0;i<this.aryPrep.length;i++) {
        console.log( "L[796] " + this.aryPrep[i] );
                                             
      }
      */
                                                  }
  
  
  
  
  
//neopixelInit.prototype.copy = function() {
  copy() {
    //https://stackoverflow.com/questions/17907233/making-one-array-exactly-equal-to-another
  //a = [1,2,3]
//copyArray = a.slice(0)
 
//  this.aryPrep[0] = 255;
    /* works
    for(var i=0;i<this.aryDisp.length;i++) {
 //       console.log( "L[796] " + arr[i] + " " + arr[1] + " " + arr[2] );

   this.aryDisp[i] = this.aryPrep[i];
  }
  */
//S    this.aryDisp = this.aryPrep.slice(0);
    this.ad = this.ar.slice(0);
    
    
/*    
       console.log( "L[1060] getrgbseq " + this.getrgbseq );

  var idx = 0;
  // Separate individual color arguments and create the ordered linear array
    for( var i=0; i<aryRGB.length; i++ ) {

   console.log( "L[1068] aryRGB r " + aryRGB[i].r );
   console.log( "L[1068] aryRGB g " + aryRGB[i].g );
   console.log( "L[1068] aryRGB b " + aryRGB[i].b );
       
  if( this.getrgbseq == RGB_SEQ_GRB )
*/
    
    
//       console.log( "L[796] copy" + arr[0] + " " + arr[1] + " " + arr[2] );
//  require("neopixel").write(neo.pinNeo, arr);
}

  
  
  
  
//neopixelInit.prototype.update = function() {
  update() {
    
    
    
    
    
    this.mapBrightness();
    this.applyGamma();
    
    
       console.log( "L[756] update " + this.useGamma );

//      this.brightness = options.brightness;
  //this.useGamma = options.useGamma;

   /* 
    // If Gamma set
        this.ad = this.ag.slice(0);
 // Else
        this.ad = this.ab.slice(0);
 */
    this.ad = (this.useGamma) ? this.ac.slice(0) : this.ab.slice(0);
    
    
//  this.aryDisp[0] = 127;
//  this.aryDisp[1] = 127;
//  this.aryDisp[2] = 0;
//  require("neopixel").write(neo.pinNeopixel, this.aryDisp);
//  require("neopixel").write(B15, [0,127,127]);
//  require("neopixel").write(B15, this.aryPrep);
//  require("neopixel").write(this.pinNeopixel, this.aryPrep);
//S  require("neopixel").write(this.pinNeopixel, this.aryDisp);
  require("neopixel").write(this.pinNeopixel, this.ad);
    
    
}
  
  
//  neopixelInit.prototype.alloff = function() {
  alloff() {
//  this.aryDisp[0] = [127,127,0];
//  require("neopixel").write(neo.pinNeopixel, this.aryDisp);
//  require("neopixel").write(B15, [0,127,127]);
  
  
    for(var i=0;i<this.NUM_PIXELS*3;i++) {
//    this.aryDisp[i] = 0;
    this.ad[i] = 0;
  }
//  for(i=0;i<this.NUM_PIXELS*3;i++) {
//    this.aryPrep[i] = 0;
//  }
  
      console.log( "L[550] this.pinNeopixel " + this.pinNeopixel );
// this.pinNeopixel = nValPin;

  
  
//    require("neopixel").write(B15, this.aryDisp);
//S    require("neopixel").write(this.pinNeopixel, this.aryDisp);
    require("neopixel").write(this.pinNeopixel, this.ad);

  
}
  
  
  
  
  
    cleardata() {
    for(var i=0;i<this.NUM_PIXELS*3;i++) {
    this.ar[i] = 0;
  }
    }
  
  cleararyprep() {
//  this.aryDisp[0] = [127,127,0];
//  require("neopixel").write(neo.pinNeopixel, this.aryDisp);
//  require("neopixel").write(B15, [0,127,127]);
  
  
    for(var i=0;i<this.NUM_PIXELS*3;i++) {
    this.aryPrep[i] = 0;
  }
//  for(i=0;i<this.NUM_PIXELS*3;i++) {
//    this.aryPrep[i] = 0;
//  }
  
      console.log( "L[550] cleararyprep " + this.pinNeopixel );
// this.pinNeopixel = nValPin;

  
  
//    require("neopixel").write(B15, this.aryDisp);
 //   require("neopixel").write(this.pinNeopixel, this.aryDisp);

  
}  
  
  
  /*
var options = { 'pinLedTest':[A5],'pinAryNeopixel':[B5,B15],'pinAryNeoIdx':1,'pinAryLedTest':[A3,A4,A5],'pinAryLedTestIdx':2,'optionBase':OPTION_BASE_ZERO };

var neo = new NeopixelInit( options );
neo.ledon();
*/

  
//function disp() {
  disp() {
//neopixelInit.prototype.disp = function() {

console.log( "L[296a] this.NUM_PIXELS " + this.NUM_PIXELS );

    for(var i=0;i<this.NUM_PIXELS*3;i++) {
        console.log( "L[296] i " + i );
//        console.log( "L[296] " + arr[i] + " " + arr[i+1] + " " + arr[i+2] );
        console.log( "L[296] " + this.aryDisp[i] + " " + this.aryDisp[i+1] + " " + this.aryDisp[i+2] );
i++;
      i++;
//   arr[i] = arrPrep[i];
  }
        console.log( "    " );
                    
    var sSeq = ( this.getrgbseq() == RGB_SEQ_GRB ) ? RGB_SEQ_GRB : RGB_SEQ_RGB;
 //     if( this.getrgbseq() == RGB_SEQ_GRB )
        console.log( "    " + sSeq );

    
  
                    for(i=0;i<this.NUM_PIXELS*3;i++) {
        console.log( "L[296] i " + i );
//        console.log( "L[299] " + aryPrep[i] + " " + aryPrep[i+1] + " " + aryPrep[i+2] );
        console.log( "L[299] " + this.aryPrep[i] + " " + this.aryPrep[i+1] + " " + this.aryPrep[i+2] );
i++;
                      i++;
//   arr[i] = arrPrep[i];
  }

//  require("neopixel").write(neo.pinNeo, arr);

  // disp() {}
  }
 
//exports = disp;

//function d() { disp(); }
//function d() { neo.disp(); }

  
  
  
  
  
  
  
  
  
  
  
  
  
    /*
    var nArySizeRGB = options.numPixels * 3;

    this.aryDisp = new Uint8ClampedArray( nArySizeRGB );
  this.aryPrep = new Uint8ClampedArray( nArySizeRGB );
  this.aryBrig = new Uint8ClampedArray( nArySizeRGB );
  this.aryGcor = new Uint8ClampedArray( nArySizeRGB );



  this.ad = new Uint8ClampedArray( nArySizeRGB );
  this.ar = new Uint8ClampedArray( nArySizeRGB );
  this.ab = new Uint8ClampedArray( nArySizeRGB );
  this.ac = new Uint8ClampedArray( nArySizeRGB );

  this.ag = new Uint8ClampedArray( MAX_GAMMA );



*/ 
  dispA() {
//neopixelInit.prototype.disp = function() {

console.log( "L[834] this.NUM_PIXELS " + this.NUM_PIXELS );
console.log( "L[835]    Disp    Corr   Brig   Raw" );

//    for(var i=0;i<this.NUM_PIXELS*3;i++) {
    for(var i=0;i<this.ad.length;i++) {
        console.log( "L[296] i " + i );
//        console.log( "L[296] " + arr[i] + " " + arr[i+1] + " " + arr[i+2] );
        console.log( "L[840] " + this.ad[i+0] + " " + this.ad[i+1] + " " + this.ad[i+2] );

        console.log( "L[844] cor     " + this.ac[i+0] + " " + this.ac[i+1] + " " + this.ac[i+2] );
      
        console.log( "L[844]  br                 " + this.ab[i+0] + " " + this.ab[i+1] + " " + this.ab[i+2] );
      
        console.log( "L[844] raw                     " + this.ar[i+0] + " " + this.ar[i+1] + " " + this.ar[i+2] );
      
      
      
      i++;
      i++;
//   arr[i] = arrPrep[i];
  }

  
  }  
  
  
  
  
  
  
  
  
  
  //class NeopixelInit{}
  
}
//exports = neopixelInit;
exports = NeopixelInit;


/*
var options = { 'pinLedTest':[A5],'pinAryNeopixel':[B5,B15],'pinAryNeoIdx':1,'pinAryLedTest':[A3,A4,A5],'pinAryLedTestIdx':2,'optionBase':OPTION_BASE_ZERO };

var n = new NeopixelInit( options );
n.ledon();

n.mapBrightness();
n.dispA();
*/


//NeopixelInit.prototype.ledon  = function() { this.pinLed.reset(); };
//NeopixelInit.prototype.ledoff = function() { this.pinLed.set(); };












//exports.create = function(opt) {
//  return new NeopixelInit(opt);
//};








/*
var RGB = {
  "RED"    : "FF0000",
  "ORANGE" : "AB5500",
  "YELLOW" : "ABAB00",
  "GREEN"  : "00FF00",
  
  "AQUA"   : "00AB55",
  "BLUE"   : "0000FF",
  "PURPLE" : "550055",
  "PINK"   : "AB0055"
};
*/

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes

class Color {
//NeopixelInit.prototype.Color = class {

//  constructor( aryRGB, namergb ) {
  constructor( obj ) {

//    debugger;
  
//    if( typeof objrgb != "object" ) objrgb = {};
  //  objrgb.namekey  = objrgb.namekey  || "NameKey";
    //objrgb.valuekey = objrgb.valuekey || "ValueKey";
//    if(( typeof aryRGB != "object" ) || ( typeof namergb != "string" ))
//      return( null );
    if( typeof obj == "string" ) {
      // Convert a Javascript Object to JSON string form then create a JSON object
      var objRGB = JSON.parse(JSON.stringify(RGB));
//var arr = JSON.parse(objRGB);
//var arr = objRGB;
      var key;

      for( key in objRGB ) {
        if (objRGB.hasOwnProperty(key)) {
        //console.log(key);
        //console.log(arr[key]);
          
          // Color located
          if ( obj.toUpperCase() == key.toUpperCase() ) {
            console.log( "Color: " + obj.toUpperCase() + "  " + objRGB[key] );
            
            if( objRGB[key].length != 6 ) { return( NaN ); }
            
//            this.colorName = key.toLowerCase();
            this.colorName = key;
            this.colorRGB = objRGB[key];
            
              //https://www.w3schools.com/jsref/jsref_substring.asp
  //This method extracts the characters in a string between 
  //"start" and "end", not including "end" itself.
  this.colorR = objRGB[key].substring(0,2);
  this.colorG = objRGB[key].substring(2,4);
  this.colorB = objRGB[key].substring(4,6);

          this.decR = this.cvrtHexToDec( this.colorR );
          this.decG = this.cvrtHexToDec( this.colorG );
          this.decB = this.cvrtHexToDec( this.colorB );
           
          this.hexR = this.cvrtHexStToHexN( this.colorR );
          this.hexG = this.cvrtHexStToHexN( this.colorG );
          this.hexB = this.cvrtHexStToHexN( this.colorB );
   /*         
   var combbars = {};
combbars.r = colorRGB.r;
combbars.g = colorRGB.g;
combbars.b = colorRGB.b;
var JSONconvert = JSON.stringify(combbars);
*/           
var vals = {};
            vals.r = this.decR;
            vals.g = this.decG;
            vals.b = this.decB;
            vals.n = this.colorName;
          this.colorObjJson = JSON.parse(JSON.stringify(vals));
            
     //      cvrtHexStToHexN( hex ) {
    
        //  cvrtDecToHex( decimal, padding ) {
    
          } //if Color located
          
          
        }
      } //for
  
      
      
    }
    this.colorA = "FF";
  //  this.colorR = 0xff;
    //this.colorG = 0xff;
   // this.colorB = 0xff;
    this.colorARGB = "ffffffff";
//    this.colorValJson = { 'r':'ff','g':'ff','b':'ff' };
    
    
    return( this.colorObjJson );
  }

  setColorA( colorValDec ) {
    this.colorA = colorValDec;
  }
  setColorR( colorValDec ) {
    this.colorR = colorValDec;
  }
  setColorG( colorValDec ) {
    this.colorG = colorValDec;
  }
  setColorB( colorValDec ) {
    this.colorB = colorValDec;
  }

  setColorARGB( colorValHex ) {
    this.colorARGB = colorValHex;
  }
  setColorARGBJson( colorValJson ) {
    this.colorValJson = colorValJson;
  }


  getColorA() {
    return( this.colorA );
  }
  getColorR() {
    return( this.colorR );
  }
  getColorG() {
    return( this.colorG );
  }
  getColorB() {
    return( this.colorB );
  }

  getColorARGB() {
    return( this.colorARGB );
  }
  getColorARGBJson() {
    return( this.colorValJson );
  }
  
  
  cvrtHexToDec( hex ) {
  //debugger;
  //var decimal = Number(hex).toString(10);
  //var s = "0x" + hex.toString();
  //console.log( "typeof: " + typeof(hex) );

  if( typeof(hex) == "number" ) hex = hex.toString(16);
  if( (typeof(hex) != "string") && (typeof(hex) != "number") ) return( "NaN" );
  // string function number object - all lower case  undefined null
  var shex = hex;
  //https://www.w3schools.com/jsref/jsref_substring.asp
  //This method extracts the characters in a string between 
  //"start" and "end", not including "end" itself.
  var s = hex.substring(0,2);
  if( s != "0x" ) { shex = "0x" + hex.toString(16); }
  var decimal = Number(shex);
  return decimal;
  }
  
  
  cvrtDecToHex( decimal, padding ) {
    var hex = Number(decimal).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
      hex = "0" + hex;
    }

    return hex;
  }
  
  cvrtHexStToHexN( hex ) {
    var shex = NaN;
    if(typeof(hex) == "string") {
  var s = hex.substring(0,2);
  if( s != "0x" ) { shex = "0x" + hex.toString(16); }
       
    }
    return( shex );
  }
  
  
}
exports = Color;
//neopixelInit.prototype.Color = class {
//exports = NeopixelInit.prototype.Color;
/*
col = new neopixelInit.prototype.Color();

*/

//NeopixelInit.prototype.aryRainbow  = function() { return aryRainbow; };





//var exports={};




//*** Start of usage code



//http://www.espruino.com/Writing+Modules
//require('NeopixelInit').myfunction();

//>Uncaught Error: Function "NeopixelInit" not found!
//exports.NeopixelInit();

//exports.NeopixelInit;







//[eof]
