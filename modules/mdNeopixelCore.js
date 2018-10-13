/* Copyright (c) 2018 Robin G Cox  See the file LICENSE for copying permission */

/* Work in progress - to avoid change duplication - contact author first */

/* Neopixel library for Espruino tm using WS2811 WS2812
 * Enables rapid development of Neopixel projects providing underlying methods for color, 
 *   palettes and effects, and including fade in/out, brightness and Gamma correction
 *
 *      File:  NeopixelCore.js
 *   Project:  Neopixel library for Espruino tm
 *    Module:  NeopixelCore{}  NeopixelColors{}  NeopixelEffects{}
 *    Author:  Robin G. Cox
 * Copyright:  Robin G. Cox © 2018 owner Sleuthware All rights reserved
 *   Version:  1.0.a.18330904
 *   Created:  Sat 2018.09.01
 *   Contact:  @Robin   http://forum.espruino.com/microcosms/116/    Home >> Official Espruino Boards >> JavaScript
 * Technical:  Note that Official Espruino Boards are required for this module as keyword 'compiled' is used throughout
 *    Tested:  Espruino 1v99 - See http://www.espruino.com/Compilation 'compiled'
 *Dependency:  Requires at a minimum 1v99 - System module require("neopixel")
 *   Updates:
 *
 * Author grants derivative works as long as this header and comments remain intact
 * Permission is required for commercial use
 *
 * Special thanks to @allObjects, @MaBe and @Gordon for their feedback, suggestions and code snippets
 *
 * Hardware tested on:
 * Neopixel WS2812 SK6812
 * Strip CJMCU-2812-8
 * CJMCU 8 Bit WS2812 5050 RGB LED Driver Development Board
 * https://www.parallax.com/sites/default/files/downloads/28085-WS2812B-RGB-LED-Datasheet.pdf
 *
 * Adapted from C++ code file and article from:
 * Adafruit_NeoPixel.cpp
 * https://learn.adafruit.com/
 * hsv2rgb.cpp
 * http://fastled.io/
 *
 * Naming and Coding Conventions
 * https://docs.npmjs.com/misc/coding-style
 * While every attempt was made to conform to npm's conventions author reserves the right
 *  to maintain other accepted best practices in order to remove ambiguity
 * https://www.w3.org/wiki/JavaScript_best_practices
 * Author adopts Hungarian notation naming scheme having the advantage being that you know 
 *  what something is supposed to be and not just what it is. This means that any individual
 *  that peeks under the covers will quickly grasp what that code block is doing. Pascal case 
 *  is used for class names and Camel case for function names. I personally detest a single block 
 *  delimiter per line as locating the closing delimiter can be daunting with nested statements. 
 *  They are used here, as the WebIDE requires them to enter code lines in the console left-hand pane.
 
 *

 * Future: HSL to RGB, smaller footprint for Pixl, pin array selection, simultaneous pin output


 *
 * Usage:
 
 
 
 
 
 
 * require("NeopixelCore").neopixelInit(options);
 * var options = { 'pinLedTest':'[A5]','pinNeopixel':pinAryNeopixel[1],'optionBase':OPTION_BASE_ZERO };
 * var neo = new neopixelInit( options );
 * Type: help()  or  h()  for accessor methods list
 */



 
 
 
 
 
 /*
 naming conventions
https://docs.npmjs.com/misc/coding-style
*/
 
 
 /*
 https://github.com/jsdoc3/jsdoc
 https://github.com/shri/JSDoc-Style-Guide#classes
 https://github.com/shri/JSDoc-Style-Guide#functions
 https://codeburst.io/generate-docs-and-host-it-with-jsdoc-and-github-pages-113b9dae9acb
 
 
 neopixel
 https://github.com/espruino/Espruino/tree/master/libs/neopixel
 
 */
 
 
 
 
 
 
/* 
  *   Contact:  @Robin   http://forum.espruino.com/profiles/116219/
*/

/*
https://github.com/espruino/Espruino/tree/master/libs/neopixel
https://github.com/espruino/Espruino/blob/master/libs/neopixel/jswrap_neopixel.c

For Pico
B15,A7,B5  SPI MOSI pin otherwise error

L150
IOEventFlags device = jshGetFromDevicePinFunction(spiDevice);
  if (!spiDevice || !device) {
    jsExceptionHere(JSET_ERROR, "No suitable SPI device found for this pin\n");
    return false;

    
Unlike Tx-Rx wiring SPI is MOSI-MOSI   

https://en.wikipedia.org/wiki/Serial_Peripheral_Interface_Bus
The Pico is the master so MOSI is an output to the input pin of the slave device    

Under 'Data Transmission'
During each SPI clock cycle, a full duplex data transmission occurs. The master sends a bit 
on the MOSI line and the slave reads it, while the slave sends a bit on the MISO line and the 
master reads it. This sequence is maintained even when only one-directional data transfer is intended.

    
*/



//process.memory();
//process.env;








//Module modeled after:
//http://www.espruino.com/modules/GroveRelay.js
//http://www.espruino.com/modules/MySensors.js
//http://www.espruino.com/modules/Ping.js


//Reference
//http://www.espruino.com/Writing+Modules
//http://www.espruino.com/InlineC


//Reference
//X11 Color Names
//https://www.w3.org/TR/css-color-3/     https://www.w3schools.com/cssref/css_colors.asp     https://en.wikipedia.org/wiki/X11_color_names



//Reference
//http://www.espruino.com/WS2811
//http://www.espruino.com/Individually+Addressable+LEDs
//https://www.espruino.com/Pico+Buttons


//https://cdn-shop.adafruit.com/product-files/1138/SK6812+LED+datasheet+.pdf
//GRB not RGB
//G7 G6 G5 G4 G3 G2 G1 G0 R7 R6 R5 R4 R3 R2 R1 R0 B7 B6 B5 B4 B3 B2 B1 B0


// https://developers.google.com/closure/compiler/docs/js-for-compiler
// http://closure-compiler.appspot.com/home








var exports={};


// @param
// https://developers.google.com/closure/compiler/docs/js-for-compiler#tag-param
//  /**
//  * Queries a Baz for items.
//  * @param {number} groupNum Subgroup id to query.
//  * @param {string|number|null} term An itemName,
//  *     or itemId, or null to search everything.
//  * @return {string} Formatted string representation
//  */


/**
* Creates an accessor to turn on an LED indicator
* @param {obj} pin array - use element 0

*/

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


exports.neopixelInitLED = neopixelInitLED;



/**
 * A class to represent user's cars.
 * @class
 *
 * @constructor
 *
 * @property licensePlate the car's license plate number
 * @property vehicleType  the type of car
 */
//function Car(licensePlate) {
//  this.licensePlate = licensePlate;
//  this.vehicleType = "sedan";
//}

// To drive the LED not Neopixel we need to make the output Lo - LED Anode 3V - e.g. on::reset()

class NeopixelCoreLED {

  constructor(pin) {
    this.p = pin[0];
  }
  on(obj) {
    this.p.reset();
  }
  off(obj) {
    this.p.set();
  }
  getp() {
    return this.p;
  }
  setp(obj) {
    this.p = obj;
  }
}
exports.NeopixelCoreLED = NeopixelCoreLED;

//Design change as get() not observed but is under prototype.get()
//Uncaught SyntaxError: 'get' and 'set' and not supported in Espruino
// at line 14 col 3
//  }

//Usage:
//var nl = new NeopixelCoreLED([A5]);
//nl.on();








//const NUM_PIXELS = 8;

//var TT = { NUM_PIXELS : 8 };


const RGB_SEQ_GRB = "GRB";
const RGB_SEQ_RGB = "RGB";
const RGB_SEQ_WS2812 = RGB_SEQ_GRB;
const RGB_SEQ_WS2811 = RGB_SEQ_RGB;


var RGB_SEQ = RGB_SEQ_WS2812;




var RGBSEQ = "GRB";

//const OPTION_BASE_ZERO = 0;
//const OPTION_BASE_ONE = 1;

//var OPTION_BASE = OPTION_BASE_ZERO;


/*
MOD123.prototype.C = {
  MY : 0x013,         // description
  PUBLIC : 0x0541,    // description
  CONSTANTS : 0x023   // description
};
*/
/*
NeopixelInit.prototype.C = {
  OPTION_BASE_ZERO : "Zero",
  OPTION_BASE_ONE  : "One",
  CONSTANTS : 0x023   // description
};
*/


var C = {
  OPTION_BASE_ZERO : "Zero",
  OPTION_BASE_ONE  : "One",
  
  BRIGHTNESS_DEF   : 70,

  
  
  RGB_SEQ_GRB : "GRB",
  RGB_SEQ_RGB : "RGB",
  RGB_SEQ_WS2812 : "GRB",
  RGB_SEQ_WS2811 : "RGB",
  

  GAMMA_MAX     : 256,
  GAMMA_MAX_IN  : 255,
  GAMMA_MAX_OUT : 255,
  GAMMA_FACTOR  : 2.4,
 
 
  UQ : 42  // Ultimate question the answer to life
  
//  CONSTANTS : 0x023   // description
};

exports.C = C;


/* from below hangs sys - is trailing comma??
NeopixelInit.prototype.CONST = {
//  GAMMA : C.MAX_GAMMA,
  
  GAMMA_MAX_IN  : 255,
  GAMMA_MAX_OUT : 255,
  GAMMA_FACTOR  : 2.4,
  
  
};


//exports.NeopixelInit = NeopixelInit;
exports.CONST = CONST;
*/

var objRGB = [255, 0, 0];

var colorRGB = {
  r: 255,
  g: 0,
  b: 0
};

var objR = colorRGB.r;
var objG = colorRGB.g;
var objB = colorRGB.b;


//>getidxg(171)
//L[2087] val: 171 ag[216] 171
//=undefined
//>getidxg(85)
//L[2087] val: 85 ag[161] 85

//Orn 216,161,0   D8 A1 00

const colorRGBRainbowRed = {
  r: 255,
  g: 0,
  b: 0
};
const colorRGBRainbowOrn = {
  r: 171,
  g: 85,
  b: 0
};
const colorRGBRainbowYel = {
  r: 171,
  g: 171,
  b: 0
};
const colorRGBRainbowGrn = {
  r: 0,
  g: 255,
  b: 0
};

const colorRGBRainbowAqu = {
  r: 0,
  g: 171,
  b: 85
};
const colorRGBRainbowBlu = {
  r: 0,
  g: 0,
  b: 255
};
const colorRGBRainbowPur = {
  r: 85,
  g: 0,
  b: 171
};
const colorRGBRainbowPnk = {
  r: 171,
  g: 0,
  b: 85
};

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

//exports = colorRGBRainbowRed;
//exports = colorRGBRainbowOrn;
//exports = colorRGBRainbowYel;
//exports = colorRGBRainbowGrn;

//exports = colorRGBRainbowAqu;
//exports = colorRGBRainbowBlu;
//exports = colorRGBRainbowPur;
//exports = colorRGBRainbowPnk;

exports.aryRainbow = aryRainbow;




//const MAX_GAMMA = 256;

//const DEF_BRIGHTNESS = 70;







/**
 * Class Color creates a color object given it's X11Color name. Returns in Javascript object notation the
 *  individual color values for easy individual color manipulation. Although Camel case is used to store
 *  the name, matching is done by converting to lower case
 * @class  Color
 *
 * @constructor  obj, name
 *
 * @property  decR decG decB  the individual color value in decimal form
 * @property  hexR hexG hexB  the hex representation for the individual color value
 */
class C$olor {

  constructor( obj, name ) {

    if( typeof obj == "string" ) {
      
      // See if is a name or a specified RGB or hex value
      var isValid = this.isValidRGB(obj);

      if( isValid ) {
        this.colorName = "notassigned";
        this.colorRGB = obj;
        if( typeof name == 'string' ) {
          this.colorName = name;
        }
  
        //console.log( "Color: obj " + obj );
        this.colorR = obj.substring(0, 2);
        this.colorG = obj.substring(2, 4);
        this.colorB = obj.substring(4, 6);

      // if( isValid )
      } else {
      
        var objRGB = JSON.parse( JSON.stringify(RGB) );
        var key;
        //console.log( "Color: objRGB " + objRGB );

        for (key in objRGB) {
          if (objRGB.hasOwnProperty(key)) {

            if (obj.toUpperCase() == key.toUpperCase()) {
              console.log("Color: " + obj.toUpperCase() + "  " + objRGB[key]);

              if (objRGB[key].length != 6) {
                return (NaN);
              }

              //console.log( "Color: match key " + key );
              this.colorName = key;
              this.colorRGB = objRGB[key];

              this.colorR = objRGB[key].substring(0, 2);
              this.colorG = objRGB[key].substring(2, 4);
              this.colorB = objRGB[key].substring(4, 6);
            }
          //if (objRGB.hasOwnProperty(key))
          }
        //for (key in objRGB)  
        }

      //else  if( isValid )   
      }
    //if (typeof obj == "string")
    }
    
    //console.log( "Color: match aft else" );
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
    // Future development    
    this.colorA = "FF";
    this.colorARGB = "ffffffff";

    return this.colorObjJson;
  //constructor()    
  }

  setColorA(colorValDec) {
    this.colorA = colorValDec;
  }
  setColorR(colorValDec) {
    this.colorR = colorValDec;
  }
  setColorG(colorValDec) {
    this.colorG = colorValDec;
  }
  setColorB(colorValDec) {
    this.colorB = colorValDec;
  }

  setColorARGB(colorValHex) {
    this.colorARGB = colorValHex;
  }
  setColorARGBJson(colorValJson) {
    this.colorValJson = colorValJson;
  }
  setColorName(name) {
    this.colorName = name;
  }


  getColorA() {
    return (this.colorA);
  }
  getColorR() {
    return (this.colorR);
  }
  getColorG() {
    return (this.colorG);
  }
  getColorB() {
    return (this.colorB);
  }

  getColorARGB() {
    return (this.colorARGB);
  }
  getColorARGBJson() {
    return (this.colorValJson);
  }
  getColorName(name) {
    return (this.colorName);
  }
  getColorJSON() {
    var vals = {};
    vals.r = this.decR;
    vals.g = this.decG;
    vals.b = this.decB;
    vals.n = this.colorName;
    this.colorObjJson = JSON.parse(JSON.stringify(vals));    
    return (this.colorObjJson);
  }
  
  cvrtHexToDec( hex ) {
    if( typeof(hex) == "number" ) hex = hex.toString(16);
    if( (typeof(hex) != "string") && (typeof(hex) != "number") ) return ("NaN");
    var shex = hex;
    var s = hex.substring(0, 2);
    if( s != "0x" ) {
      shex = "0x" + hex.toString(16);
    }
    var decimal = Number(shex);
    return decimal;
  }

  cvrtDecToHex( decimal, padding ) {
    var hex = Number(decimal).toString(16);
    padding = typeof(padding) === "undefined" || padding === null ? padding = 2 : padding;

    while( hex.length < padding ) {
      hex = "0" + hex;
    }
    return hex;
  }

  cvrtHexStToHexN( hex ) {
    var shex = NaN;
    if( typeof(hex) == "string" ) {
      var s = hex.substring(0, 2);
      if( s != "0x" ) {
        shex = "0x" + hex.toString(16);
      }
    }
    return this.cvrtHexToDec(shex);
  }
  
  // https://stackoverflow.com/questions/8027423/how-to-check-if-a-string-is-a-valid-hex-color-representation
  isValidRGB( val ) {
    return( (typeof val == "string") && (val.length == 6)
         && !isNaN( parseInt(val, 16) ) );
  }

}
//exports.Color = Color;
//exports.Color.cvrtHexToDec = Color.cvrtHexToDec;
//exports.cvrtHexToDec = Color.cvrtHexToDec;







  
  
/**
 * Takes 2 numbers and returns their sum.
 * @param   {number} a     the first number
 * @param   {number} b     the second number
 * @param   {number} [c=0] the optional third number
 *
 * @returns {number} the sum of a and b
 */
//function addNumbers(a, b, c) {
//  if (typeof c === "undefined") {
//    c = 0;
//  }
//  return a + b + c;
//}







//Note: During cleanup found that slice kills a clamped array - E.getAddressOf returns not a flat string
// a={};  =new Uint8ClampedArray([0, 255, 0, 85, 171,  ... 85, 171, 0, 171, 85])
//  "ad": new Uint8ClampedArray(24),
//  "ar": [ 0, 255, 0, 85, 171,  ... 85, 171, 0, 171, 85 ],

//  setdata(obj) {
//    this.ar = obj.slice(0);
//  }

//ex: http://forum.espruino.com/conversations/325997/#comment14438893
//var addr = E.getAddressOf(this.ad,true);
//var addr = E.getAddressOf(n.ad,true);
//if (!addr) throw new Error("Not a Flat String");
//console.log( "addr: " + addr );


var compc = E.compiledC(`
//void slice(int,int,int);
//void applyg(int,int,int,int);
void slice(unsigned char *datadest, unsigned char *datasrc, int size) {

for( int i=0; i<size; i++ ) {
  *(datadest++) = *(datasrc++);
}

}
void applyg(unsigned char *datadest, unsigned char *datasrc, unsigned char *datag, int size) {

for( int i=0; i<size; i++ ) {
  int nRGBCur = *(datasrc+i);
  *(datadest++) = *(datag+nRGBCur);
}

}

`);
exports.compc = compc;
//exports = compc;

//compc.slice(a,n.ar,24)

/*
var compc = E.compiledC(`
//void slice(int,int,int);
void slice(unsigned char *datadest, unsigned char *datasrc, int size) {

for( int i=0; i<size; i++ ) {
  *(datadest++) = *(datasrc++);
}

}

`);
*/

/*
no
  int nRGBCur = *(datasrc[i]);
  *(datadest++) = *(datag[nRGBCur]);

  */



/**
 * Class NeopixelCore contains underlying methods for color, palettes and effects,
 *  and including fade in/out, brightness and Gamma correction.
 * @class
 *
 * @constructor
 *
 * @property licensePlate the car's license plate number
 * @property vehicleType  the type of car
 
 
 
     options.optionBase = options.optionBase || C.OPTION_BASE_ZERO;
    options.optionBase = options.optionBase || 0;
    options.pinAryNeopixel = options.pinAryNeopixel || PIN_PICO_NEOPIXEL;
    options.pinAryNeoIdx = options.pinAryNeoIdx || 0;
    options.pinLedTest = options.pinLedTest || PIN_PICO_LED;

    options.pinAryLedTest = options.pinAryLedTest || PIN_PICO_LED;
    options.pinAryLedTestIdx = options.pinAryLedTestIdx || 0;

//    options.numPixels = options.numPixels || NUM_PIXELS;
//    options.numPixels = options.numPixels || TT.NUM_PIXELS;
    options.numPixels = options.numPixels || 8;
//    options.rgbSeq = options.rgbSeq || RGB_SEQ_WS2812;
options.rgbSeq = options.rgbSeq || "GRB";

    options.brightness = options.brightness || C.BRIGHTNESS_DEF;
    options.useGamma = options.useGamma || false;
    options.gfactor = options.gfactor || C.GAMMA_FACTOR;


    this.rgbSeq = options.rgbSeq;

 
 
 */
//function Car(licensePlate) {
//  this.licensePlate = licensePlate;
//  this.vehicleType = "sedan";
//}



class NeopixelCore {




  constructor(options) {


    if (typeof options != "object") options = {};
    options.optionBase = options.optionBase || C.OPTION_BASE_ZERO;
    options.optionBase = options.optionBase || 0;
    options.pinAryNeopixel = options.pinAryNeopixel || PIN_PICO_NEOPIXEL;
    options.pinAryNeoIdx = options.pinAryNeoIdx || 0;
    options.pinLedTest = options.pinLedTest || PIN_PICO_LED;

    options.pinAryLedTest = options.pinAryLedTest || PIN_PICO_LED;
    options.pinAryLedTestIdx = options.pinAryLedTestIdx || 0;

//    options.numPixels = options.numPixels || NUM_PIXELS;
//    options.numPixels = options.numPixels || TT.NUM_PIXELS;
    options.numPixels = options.numPixels || 8;
//    options.rgbSeq = options.rgbSeq || RGB_SEQ_WS2812;
options.rgbSeq = options.rgbSeq || "GRB";

    options.brightness = options.brightness || C.BRIGHTNESS_DEF;
    options.useGamma = options.useGamma || false;
    options.gfactor = options.gfactor || C.GAMMA_FACTOR;


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
//    this.aryDisp = new Uint8ClampedArray(nArySizeRGB);
//    this.aryPrep = new Uint8ClampedArray(nArySizeRGB);
//    this.aryBrig = new Uint8ClampedArray(nArySizeRGB);
//    this.aryGcor = new Uint8ClampedArray(nArySizeRGB);
//const MAX_GAMMA = 256;
//    this.aryGamm = new Uint8ClampedArray(C.GAMMA_MAX);

/*
    this.ad = new Uint8ClampedArray(nArySizeRGB);
    this.ar = new Uint8ClampedArray(nArySizeRGB);
    this.ab = new Uint8ClampedArray(nArySizeRGB);
    this.ac = new Uint8ClampedArray(nArySizeRGB);

    this.af = new Uint8ClampedArray(nArySizeRGB);

    this.ag = new Uint8ClampedArray(C.GAMMA_MAX);
*/
//http://forum.espruino.com/conversations/326573/#comment14454980
//http://forum.espruino.com/conversations/316941/
//var NUM_BYTES = 24;
//var flat_str = E.toString({data : 0, count : NUM_BYTES});
//var arr = new Uint8Array(E.toArrayBuffer(flat_str));
//var addr = E.getAddressOf(flat_str);
/*
    var fstr = E.toString({data : 0, count : nArySizeRGB});
    this.ad = new Uint8ClampedArray(E.toArrayBuffer(fstr));
    this.ar = new Uint8ClampedArray(E.toArrayBuffer(fstr));
    this.ab = new Uint8ClampedArray(E.toArrayBuffer(fstr));
    this.ac = new Uint8ClampedArray(E.toArrayBuffer(fstr));
    this.af = new Uint8ClampedArray(E.toArrayBuffer(fstr));
    var gstr = E.toString({data : 0, count : C.GAMMA_MAX});
    this.ag = new Uint8ClampedArray(E.toArrayBuffer(gstr));
  */  


    console.log( "L[876] constructor nArySizeRGB " + nArySizeRGB );
    console.log( "L[877] constructor C.GAMMA_MAX " + C.GAMMA_MAX );

    var strd = E.toString({data : 0, count : nArySizeRGB});
    this.ad = new Uint8ClampedArray(E.toArrayBuffer(strd));
    var strr = E.toString({data : 0, count : nArySizeRGB});
    this.ar = new Uint8ClampedArray(E.toArrayBuffer(strr));
    var strb = E.toString({data : 0, count : nArySizeRGB});
    this.ab = new Uint8ClampedArray(E.toArrayBuffer(strb));
    var strc = E.toString({data : 0, count : nArySizeRGB});
    this.ac = new Uint8ClampedArray(E.toArrayBuffer(strc));
    var strf = E.toString({data : 0, count : nArySizeRGB});
    this.af = new Uint8ClampedArray(E.toArrayBuffer(strf));
    var strg = E.toString({data : 0, count : C.GAMMA_MAX});
    this.ag = new Uint8ClampedArray(E.toArrayBuffer(strg));
    
    
    
    
    

    this.brightness = options.brightness;
    this.useGamma = options.useGamma;
//    this.useGamma = 1;



    this.NUM_PIXELS = options.numPixels;
    this.NUM_ELEMENTS = nArySizeRGB;

    
    this._aryinit();
    
//    this.setGamma( CONST.GAMMA_MAX_IN, CONST.GAMMA_MAX_OUT, options.gfactor );
    this._setGamma( C.GAMMA_MAX_IN, C.GAMMA_MAX_OUT, options.gfactor );
//    this.setGamma( 255, 255, 2.4 );

  /*
  this.setGamma( gin, gout, gfactor ) {
NeopixelInit.prototype.CONST = {
  GAMMA : C.MAX_GAMMA,
  
  GAMMA_MAX_IN  : 255,
  GAMMA_MAX_OUT : 255,
  GAMMA_FACTOR  : 2.4,
  
  
};  
  */
 

 //   this.gam();
  }




  ledon() {
    this.pinLed.reset();
  }
  ledoff() {
    this.pinLed.set();
  }


  getnumpixels() {
    return this.NUM_PIXELS;
  }
  getaryprep() {
    return this.aryPrep;
  }
  getlenaryprep() {
    return this.aryPrep.length;
  }
  getarydisp() {
    return this.aryDisp;
  }
  getlenarydisp() {
    return this.aryDisp.length;
  }
  getrgbseq() {
    return this.rgbSeq;
  }

  getBrightness() {
    return this.bightness;
  }
  
  
  
  getColorPixel(offset) {
    var idx = offset*3;
//    return this.ar[idx];

                var vals = {};
            vals.r = this.ar[idx+0];
            vals.g = this.ar[idx+1];
            vals.b = this.ar[idx+2];
//            vals.n = this.colorName;
            var colorObjJson = JSON.parse(JSON.stringify(vals));    
    return( colorObjJson );

  }
  getColorPixelB(offset) {
    var idx = offset*3;
                var vals = {};
            vals.r = this.ab[idx+0];
            vals.g = this.ab[idx+1];
            vals.b = this.ab[idx+2];
//            vals.n = this.colorName;
            var colorObjJson = JSON.parse(JSON.stringify(vals));    
    return( colorObjJson );
  }
  
  
  
  setBrightness(obj) {
    this.brightness = obj;
  }


  setUseGamma(obj) {
    this.useGamma = obj;
  }

  getUseGamma() {
    return this.useGamma;
  }


// As this is done during constructor no need for speed
  mapBrightness() {
    var idx = 0;
    for (var i = 0; i < this.ar.length; i++) {

      var nRGBCur = this.ar[i];
      var nPcntBr = Math.floor(nRGBCur * this.brightness / 100);
      this.ab[i] = nPcntBr;
      //make          arr[i] = aryGamma[ nNewG ];
//Update the fade array
      this.af[i] = nPcntBr;


//S      console.log("L[491] nPcntBr " + this.ab[i]);

    }
  }

//raw -> bright -> fade -> corr -> disp
  applyGamma() {
    // Could this be done with slice ?
/*
    for( var i=0; i<this.ab.length; i++ ) {
      var nRGBCur = this.ab[i];
 //S     console.log("L[504] nRGBCur " + this.ab[i]);
  //        this.ac[i] = g.get(nRGBCur);
      //      console.log( "L[619] g.get(i) " +  g.get(nRGBCur) );
      this.ac[i] = this.ag[nRGBCur];
 //S     console.log("L[619] this.ac[i] " + this.ac[i]);
*/

/*SAVE
    for( var i=0; i<this.ac.length; i++ ) {
      var nRGBCur = this.af[i];
      this.ac[i] = this.ag[nRGBCur];
    }
*/

/*
    for( var i=0; i<this.ac.length; i++ ) {
      var nRGBCur = this.af[i];
      this.ac[i] = this.ag[nRGBCur];
    }
*/



    var addrsrc = E.getAddressOf(this.af,true);
    if(!addrsrc) throw new Error("Not a Flat String - applyGamma src");
//    console.log( "addrsrc: " + addrsrc );
   
    var addrdest = E.getAddressOf(this.ac,true);
    if(!addrdest) throw new Error("Not a Flat String - applyGamma dest");
//    console.log( "addrdest: " + addrdest );
    var addrg = E.getAddressOf(this.ag,true);
    if(!addrg) throw new Error("Not a Flat String - applyGamma g");

//void applyg(unsigned char *datadest, unsigned char *datasrc, unsigned char *datag, int size) {
//    compc.applyg( addrdest, addrsrc, addrg, this.ag.length );
compc.applyg( addrdest, addrsrc, addrg, this.NUM_ELEMENTS );
//compc.applyg( addrdest, addrsrc, addrg, 38 );




  }

  //  this.ac = new Uint8ClampedArray( nArySizeRGB );
  //  this.ag = new Uint8ClampedArray( MAX_GAMMA );


  dispG() {
    for (var i = 0; i < this.ab.length; i++) {

      //       console.log( "L[632] g.get(i) " +  g.get(i) );
//      console.log("L[632] g.get(i) " + this.ag[i]);
      console.log("L[632] this.ac[i] " + this.ac[i]);
    }
  }


  
  
  
  
  
  
  
  
  
  


//*************************************  
  
  _aryinit() {
    for( var i=0; i<this.NUM_ELEMENTS; i++ ) {
      this.ad[i] = 0;
      this.ar[i] = 0;
      this.ab[i] = 0;
      this.ac[i] = 0;
      this.af[i] = 0;
//      this.ag[i] = 0;
    }  
  }  
  
  
  
  
/**
 * Gamma Correction
 * _setGamma() creates the gamma correction values required for a more pleasing visual output
 *
 * @param   {number} gin     Top end of INPUT range     0 - 255
 * @param   {number} gout    Top end of OUTPUT range    0 - 255
 * @param   {number} gfactor Gamma correction factor  1.0 - 3.5
 *
 * @returns {null}
 *
 * Reference
 * @link {https://cdn-learn.adafruit.com/downloads/pdf/led-tricks-gamma-correction.pdf}
 */
  _setGamma( gin, gout, gfactor ) {
//    "compiled";
    var gamma = ( (gin < 1.0) || (gin > 5.0) ) ? C.GAMMA_FACTOR : gfactor;
    var max_in = ( (gin < 0) || (gin > C.GAMMA_MAX_IN) ) ? C.GAMMA_MAX_IN : gin;
    var max_out = ( (gout < 0) || (gout > C.GAMMA_MAX_OUT) ) ? C.GAMMA_MAX_OUT : gout;
    
    for( var i=0; i<=max_in; i++ ) {
      //if ((i & 15) === 0) console.log("\n ");
      var resultpow = ( Math.pow(i / max_in, gamma) * max_out + 0.5 );
      //console.log("L[653] [" + i + "] " + resultpow);
      var fmt = resultpow.toFixed(0);
      this.ag[i] = fmt;
      //console.log("L[653] [" + i + "] " + fmt);
    }
  }
 
 
 



 
 
//Evil setInterval - November 03, 2013 - Blog by Ayman Farhat. Built with Pelican
//https://www.thecodeship.com/web-development/alternative-to-javascript-evil-setinterval/
  
/**
 * interval() is a more robust replacement for setInterval() allowing for a specified number of repetitions
 *
 * @param   {function} func   The function that executes after the given wait duration
 * @param   {number}   wait   A time unit in milliseconds to defer until the specified function will execute
 * @param   {number}   times  The number of repetitions this interval will execute before returning
 *
 * @returns {null}
 *
 * Reference
 * Evil setInterval - November 03, 2013 - Blog by Ayman Farhat. Built with Pelican
 * @link {https://www.thecodeship.com/web-development/alternative-to-javascript-evil-setinterval/}
 */  
  interval( func, wait, times ) {

//  console.log("L[1216]interval() wait: " + wait );
//  console.log("L[1217]interval() times: " + times );
//  console.log("L[1218]interval() func typeof " + typeof func );          
  
  var interv = function( w, t ) {
      
    if( t <= 0 ) return 'done';
      
    return function() {

      if( typeof t === "undefined" || t-- > 0 ) {

//        console.log("L[1228]interval() B4 setTimeout()  w: " + w + "  t: " + t );
        setTimeout(interv, w);
            
        try {
//          console.log("L[1239]interval() try()    B4 func.call" );
          //https://stackoverflow.com/questions/332422/get-the-name-of-an-objects-type
          //if( typeof func !== "undefined" )
          //undefined  console.log("L[1239]interval() name func " + func.name );
          //undefined  console.log("L[1239]interval() name func " + func.constructor.name );
          //undefined  console.log("L[1239]interval() name func " + func.constructor );
          //no compile console.log("L[1239]interval() name func " + functionName( func ) );

          func.call(null);
          // wait3sec();  step();
//          console.log("L[1241]interval() try()    Aft func.call" );
        } catch(e) {
          t = 0;
//          console.log("L[1243]interval() catch() ################# " + e.toString() );
          throw e.toString();
        }

      } else {
        interv = "done"; 
      }
      // These are queued up until last timeout    
//      console.log("L[1246]interval() Aft if  ###" );          
//      console.log("L[1247]interval() t w " + t + "  " + w );
//      console.log("L[1247]interval() t w " + t + "  " + w + "   free: " + process.memory().free );
            
    }; // return function()
    //unreach   console.log("L[1250]interval() B4 clo end ###" );
 
  // var interv = function(w, t)
  }( wait, times );

  try {
//    console.log("L[1256]interval() B4   ### interv " + typeof(interv) );
//    console.log("L[1257]interval() times wait " + times + "  " + wait );

   if( interv !== 'undefined' )
      setTimeout(interv, wait);

//    console.log("L[1262]interval() Aft  ### interv " + typeof(interv) );
     
  } catch(e) {
//    console.log("L[1290]interval() catch()  ***********" + e.toString() );
    throw e.toString();
  }
}
//interval

//exports.interval = interval;
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 /*
 
 
 
 var C = {
  OPTION_BASE_ZERO : "Zero",
  OPTION_BASE_ONE  : "One",
  
  BRIGHTNESS_DEF   : 70,


  GAMMA_MAX     : 256,
  GAMMA_MAX_IN  : 255,
  GAMMA_MAX_OUT : 255,
  GAMMA_FACTOR  : 2.4,
 
  
  CONSTANTS : 0x023   // description
};
function addNumbers(a, b, c) {
  if (typeof c === "undefined") {
    c = 0;
  }
  return a + b + c;
}
*/








/*
  gam() {

    var dGam = 2.5;

    var gamma = 2.8;

    gamma = dGam;
    var max_in = 255;
    var max_out = 255;


    var idx = 0;

    for (var i = 0; i <= max_in; i++) {

      if ((i & 15) === 0) print("\n ");

      var resultpow = (Math.pow(i / max_in, gamma) * max_out + 0.5);


//S      console.log("L[653] [" + i + "] " + resultpow);
      //     console.log("L[653] resultmult [" + i  + "] " + resultmult);
      var fmt = resultpow.toFixed(0);



      //        g.set(idx++,fmt);
      //  this.ac = new Uint8ClampedArray( nArySizeRGB );
      //  this.ag = new Uint8ClampedArray( MAX_GAMMA );
      this.ag[idx++] = fmt;

//S      console.log("L[653] [" + i + "] " + fmt);



    }

  }
*/



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
n.setdata(a);
n.dispA();
n.update();

n.dispA();

n.dispG();

*/


  buildRainbow() {
    var aryRGB = new Uint8ClampedArray(this.getnumpixels());
    aryRGB = aryRainbow;
//und    var aryRGB = new Uint8ClampedArray(this.aryRainbow.length);
//    aryRGB = this.aryRainbow;

//    var aryRainbowPrep = new Uint8ClampedArray(this.getlenarydisp());
    var aryRainbowPrep = new Uint8ClampedArray(this.NUM_ELEMENTS);
    console.log("L[1060] getrgbseq " + this.getrgbseq());

    var idx = 0;
    // Separate individual color arguments and create the ordered linear array
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


      // for
    }

//    for (var i = 0; i < aryRainbowPrep.length; i++) {



      //      this.aryPrep[i] = aryRainbowPrep[i];
//    }



    return( aryRainbowPrep );
    //buildRainbow() 
  }




  //neopixelInit.prototype.mapone = function( offset, color ) {
  maponeOBS(offset, color) {

    var idx = 0;
    //  debugger;
    var iStart = offset * 3;

    //    var OPTION_BASE_ZERO = OPTION_BASE_ZERO;
    //  if( (settings.optionBase !== undefined) && (settings.optionBase !== null) )
    //{
    //this.optionBase = settings.optionBase;
    //neopixelInit.prototype.OPTION_BASE_ZERO = OPTION_BASE_ZERO;

    //if( neopixelInit.prototype.OPTION_BASE == OPTION_BASE_ONE )
    //if( this.optionBase == OPTION_BASE_ONE )
    //  iStart-= 3;


//S    console.log("L[536] offset " + offset.toString());
//S    console.log("L[536] iStart " + iStart.toString());



    //  for( var i=0; i<aryPrep.length; i++ ) {
    //  for( var i=0; i<this.aryPrep.length; i++ ) {
    for (var i = 0; i < this.ar.length; i++) {
      if (iStart == i) {
        //    if( RGBSEQ == "GRB" )
        if (this.getrgbseq() == RGB_SEQ_GRB)

        {
          //      var g = fetch( color, "g" );
          var g = color.g;
//s          console.log("L[346] g " + g);

          //    aryPrep[idx++] = g;
          //    this.aryPrep[idx++] = g;
          this.ar[idx++] = g;
//s          console.log("L[311g] aryPrep[" + (idx - 1).toString() + "] " + this.ar[idx - 1]);

          //      var r = fetch( color, "r" );
          var r = color.r;
//s          console.log("L[346] r " + r);

          //      this.aryPrep[idx++] = r;
          //  console.log( "L[311r] aryPrep[" + (idx-1).toString() + "] " + this.aryPrep[idx-1] );
          this.ar[idx++] = r;
//s          console.log("L[311r] aryPrep[" + (idx - 1).toString() + "] " + this.ar[idx - 1]);

          //      var b = fetch( color, "b" );
          var b = color.b;
//s          console.log("L[346] b " + b);


          //      this.aryPrep[idx++] = b;
          //  console.log( "L[556b] aryPrep[" + (idx-1).toString() + "] " + this.aryPrep[idx-1] );
          this.ar[idx++] = b;
//s          console.log("L[556b] aryPrep[" + (idx - 1).toString() + "] " + this.ar[idx - 1]);

          break;
        }
      } else {
        idx++;
        //      idx++;
        //    idx++;

      }


    }

    //mapone
  }


  mapone(offset, color) {
//  turnon(offset, color) {
    var idx = offset * 3;
        switch(this.getrgbseq())
        {
          
          case RGB_SEQ_GRB:
          // var g = color.g;
//s          console.log("L[346] g " + g);

          //    aryPrep[idx++] = g;
          //    this.aryPrep[idx++] = g;
//S          this.ar[idx++] = g;
          this.ar[idx++] = color.g;
          this.ar[idx++] = color.r;
          this.ar[idx++] = color.b;
          break;
          
          case RGB_SEQ_RGB:
          // var g = color.g;
//s          console.log("L[346] g " + g);

          //    aryPrep[idx++] = g;
          //    this.aryPrep[idx++] = g;
//S          this.ar[idx++] = g;
          this.ar[idx++] = color.r;
          this.ar[idx++] = color.g;
          this.ar[idx++] = color.b;
          break;
          
        }

  }

  //no longer used
  fadeonOBSS(offset, color) {
    var idx = offset * 3;
 //       switch(this.getrgbseq())
   //     {
//          case RGB_SEQ_GRB:
  //        this.ab[idx++] = color.g;
    //      this.ab[idx++] = color.r;
      //    this.ab[idx++] = color.b;
        //  break;
          
//          case RGB_SEQ_RGB:
          this.ab[idx++] = color.r;
          this.ab[idx++] = color.g;
          this.ab[idx++] = color.b;
  //        break;
    //    }
  }  
  
  
  
  fade( idx, step, inout ) {
//  "compiled";
  //  var color = n.getColorPixelB(idx);
// Get brightness adjusted values
var offset = idx;
// Fade out moves towards zero
var stepabs = ( inout == "out" ) ? step*(-1) : step;

    var idx = offset*3;
                var vals = {};
            vals.r = this.af[idx+0];
            vals.g = this.af[idx+1];
            vals.b = this.af[idx+2];
if( inout == "out" ) {
    vals.r+= stepabs;
  if( vals.r < 0 ) vals.r = 0;
    vals.g+= stepabs;
  if( vals.g < 0 ) vals.g = 0;
    vals.b+= stepabs;
  if( vals.b < 0 ) vals.b = 0;
}

  // We need the max color to count up towards
//  var colormax = n.getColorPixel(idx);
//  var rx = colormax.r;
//      console.log("L[1350]  r ***********   ********** " + r );
//  var gx = colormax.g;
//      console.log("L[1350]  r ***********   ********** " + g );
//  var bx = colormax.b;

if( inout == "in" ) {
                var maxs = {};
            maxs.r = this.ab[idx+0];
            maxs.g = this.ab[idx+1];
            maxs.b = this.ab[idx+2];

            
            
  if( vals.r < maxs.r )
    vals.r+= step;
  if( vals.r > maxs.r ) vals.r = maxs.r;
  if( vals.r > 255 ) vals.r = 255;

  if( vals.g < maxs.g )
    vals.g+= step;
  if( vals.g > maxs.g ) vals.g = maxs.g;
  if( vals.g > 255 ) vals.g = 255;
  
  if( vals.b < maxs.b )
    vals.b+= step;
  if( vals.b > maxs.b ) vals.b = maxs.b;
  if( vals.b > 255 ) vals.b = 255;



/*
  if( vals.r > 255 ) vals.r = 255;
  if( vals.g > 255 ) vals.g = 255;
  if( vals.b > 255 ) vals.b = 255;
  */
            
            
            
  /*
  if( vals.r <= (maxs.r-step) )
    vals.r+= step;
  if( vals.r > 255 ) vals.r = 255;

  if( vals.g <= (maxs.g-step) )
    vals.g+= step;
  if( vals.g > 255 ) vals.g = 255;
  
  if( vals.b <= (maxs.b-step) )
    vals.b+= step;
  if( vals.b > 255 ) vals.b = 255;
*/
  
  
  
  }
  this.af[idx+0] = vals.r;
  this.af[idx+1] = vals.g;
  this.af[idx+2] = vals.b;
  
  
  //fade()
}
  
  
  
  
  
  
  
  
//function fadeAll( nDelay, step, inout ) {
  fadeAllHERE( nDelay, step, inout ) {
//  "compiled";
  nStep = step;
     
    
     
//fadeAll()    
}
  
  
  
  
  
  
  
  
  
  
// During cleanup found that slice kills a clamped array - E.getAddressOf returns not a flat string
// a={};  =new Uint8ClampedArray([0, 255, 0, 85, 171,  ... 85, 171, 0, 171, 85])
//  "ad": new Uint8ClampedArray(24),
//  "ar": [ 0, 255, 0, 85, 171,  ... 85, 171, 0, 171, 85 ],

//  setdata(obj) {
//    this.ar = obj.slice(0);
//  }

_setdata( dest, src, size, id ) {
  
//n._setdata( n.ad, n.ac, n.NUM_ELEMENTS, "dadsac" )
//n._setdata( n.ad, n.ab, n.NUM_ELEMENTS, "dadsab" );
//f
//n._setdata( n.ad, n.af, n.NUM_ELEMENTS, "dadsaf" );
//if( id == "dadsac" ) this.ad = src.slice(0);
//if( id == "dadsab" ) this.ad = src.slice(0);
//if( id == "dadsaf" ) this.ad = src.slice(0);
   
this.ad = src.slice(0);
}

  W_setdata( dest, src, size, id ) {

      console.log( "_setdata size: " + size + " " + id );
debugger;
  var t = getTime();
  var elaspsed = 0;
   console.log( "start _setdata ",(getTime()-t) + " " + t );
try {
//    var addrsrc = E.getAddressOf(src,true);
    var addrsrc = E.getAddressOf(src,false);
//    if(!addrsrc) throw new Error("Not a Flat String - _setdata src");
    if(!addrsrc) throw new Error("Not a Flat String - _setdata src " + id + " " + src);
    console.log( "addrsrc: " + addrsrc );
   
//    var addrdest = E.getAddressOf(dest,true);
    var addrdest = E.getAddressOf(dest,false);
//    if(!addrdest) throw new Error("Not a Flat String - _setdata dest");
    if(!addrdest) throw new Error("Not a Flat String - _setdata dest " + id + " " + dest);
    console.log( "addrdest: " + addrdest );

    //void slice(unsigned char *datadest, unsigned char *datasrc, int size) {
    compc.slice( addrdest, addrsrc, size );
    } catch( e ) {
      
      
    console.log( "[L1486 _setdata] " + id + " " + e.toString() );  
    }
    
        elapsed = getTime()-t;
//console.log("elapsed " + elapsed );



  }

/*
function setdata(obj,n,size) {
  
  var addrobj = E.getAddressOf(obj,true);
  if (!addrobj) throw new Error("Not a Flat String - src");
  console.log( "addrobj: " + addrobj );
 
//  var addrr = E.getAddressOf(this.ar,true);
  var addrr = E.getAddressOf(n.ar,true);
  if (!addrr) throw new Error("Not a Flat String - dest");
  console.log( "addrr: " + addrr );

  //void slicer(unsigned char *datasrc, unsigned char *datadest, int size) {
  compc.slicer(addrobj,addrr,size);

}
*/  
  
  
  
  load( arydata ) {
    
//      setdata( dest, src, size )
    this._setdata( this.ar, arydata, arydata.length, "darsuk" );

  }
  load2( arydata ) {
    this.ar = arydata;
  }  
  

  //neopixelInit.prototype.setaryprep = function(obj) { 
  setaryprep(obj) {

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

var t = getTime();
  var elaspsed = 0;
   print("start copy ",(getTime()-t) + " " + t); 
    
    this.ad = this.ar.slice(0);

        elapsed = getTime()-t;
         print("elapsed " + elapsed );



  }



//raw -> bright -> fade -> corr -> disp   ar->ab->af->ac->ad

//  update() {
  update(fade) {

//   if (typeof options != "object") options = {};

if( typeof fade == "undefined" )
    {
//      console.log( "L[1756] call to this.mapBrightness()" );
    this.mapBrightness();
//    console.log( "L[1756] update this.useGamma " + this.useGamma );
    if( this.useGamma ) this.applyGamma();


//S    console.log("L[756] update this.useGamma " + this.useGamma);
//console.log("L[756] update this.useGamma " + this.useGamma);


//OBS    this.ad = (this.useGamma) ? this.ac.slice(0) : this.ab.slice(0);
//nope (this.useGamma) ? compc.slice( this.ac, this.ad, this.NUM_PIXELS*3 ) : compc.slice( this.ab, this.ad, this.NUM_PIXELS*3 );;

//if(this.useGamma)
//  compc.slice( this.ac, this.ad, this.NUM_PIXELS*3 );
//else
//  compc.slice( this.ab, this.ad, this.NUM_PIXELS*3 );

//if(this.useGamma)
//  setdata( this.ac, this.ad, this.NUM_PIXELS*3 );
//else
//  setdata( this.ab, this.ad, this.NUM_PIXELS*3 );

//n.setdata( n.ab, n.ad, n.NUM_PIXELS*3 );

//    console.log( "L[1786] update this.NUM_ELEMENTS " + this.NUM_ELEMENTS );


//(this.useGamma) ? this.setdata( this.ad, this.ac, this.NUM_PIXELS*3 ) : this._setdata( this.ad, this.ab, this.NUM_PIXELS*3 );
(this.useGamma) ? this._setdata( this.ad, this.ac, this.NUM_ELEMENTS, "dadsac" ) : this._setdata( this.ad, this.ab, this.NUM_ELEMENTS, "dadsab" );
  }
else
{
  
  if( fade == "fade" )
    this._setdata( this.ad, this.af, this.NUM_ELEMENTS, "dadsaf" );
//    this.setdata( this.ad, this.af, this.NUM_PIXELS*3 );

  
  
}


    require("neopixel").write(this.pinNeopixel, this.ad);


  }
  
  
  


// ex: http://forum.espruino.com/conversations/325997/#comment14438893
//var addr = E.getAddressOf(this.ad,true);
//var addr = E.getAddressOf(n.ad,true);
//  if (!addr) throw new Error("Not a Flat String");
//console.log( "addr: " + addr );

  
  
  
  updatefadeOBS() {

// this.applyGamma();
// var nRGBCur = this.af[i];
// this.ac[i] = this.ag[nRGBCur];

//S    if( this.useGamma ) this.applyGamma();
//S    this.ad = (this.useGamma) ? this.ac.slice(0) : this.af.slice(0);

//OBS this.ad = this.af.slice(0);

//nope  compc.slice( this.af, this.ad, this.NUM_PIXELS*3 );


//this._setdata( this.ad, this.af, this.NUM_PIXELS*3 );
this._setdata( this.ad, this.af, this.NUM_ELEMENTS, "dadsaf" );

    require("neopixel").write(this.pinNeopixel, this.ad);
  }

  alloff() {


    for (var i = 0; i < this.NUM_PIXELS * 3; i++) {
      this.ad[i] = 0;
    }

    console.log("L[550] this.pinNeopixel " + this.pinNeopixel);



    require("neopixel").write(this.pinNeopixel, this.ad);


  }




  cleardata() {
    for (var i = 0; i < this.NUM_PIXELS * 3; i++) {
      this.ar[i] = 0;
    }
  }

  cleararyprep() {


    for (var i = 0; i < this.NUM_PIXELS * 3; i++) {
      this.aryPrep[i] = 0;
    }

    console.log("L[550] cleararyprep " + this.pinNeopixel);




  }




  disp() {

    console.log("L[296a] this.NUM_PIXELS " + this.NUM_PIXELS);

    for (var i = 0; i < this.NUM_PIXELS * 3; i++) {
      console.log("L[296] i " + i);
      console.log("L[296] " + this.aryDisp[i] + " " + this.aryDisp[i + 1] + " " + this.aryDisp[i + 2]);
      i++;
      i++;
    }
    console.log("    ");

    var sSeq = (this.getrgbseq() == RGB_SEQ_GRB) ? RGB_SEQ_GRB : RGB_SEQ_RGB;
    console.log("    " + sSeq);



    for (i = 0; i < this.NUM_PIXELS * 3; i++) {
      console.log("L[296] i " + i);
      console.log("L[299] " + this.aryPrep[i] + " " + this.aryPrep[i + 1] + " " + this.aryPrep[i + 2]);
      i++;
      i++;
    }


  }
  //disp



  dispA() {

    console.log("L[834] this.NUM_PIXELS " + this.NUM_PIXELS + "   " + this.rgbSeq );
    console.log("L[835]    Disp    GCorr   Fade    Brig   Raw");

    for (var i = 0; i < this.ad.length; i++) {
//      console.log("L[296] i " + i + "   [" + (i%3==0) + "]" );  //true

if(i%3==0)
      console.log("L[296] i " + i + "   [" + (i/3) + "]" );  
else
  console.log("L[296] i " + i );

    console.log("L[840] " + this.ad[i + 0] + " " + this.ad[i + 1] + " " + this.ad[i + 2]);

      console.log("L[844] cor     " + this.ac[i + 0] + " " + this.ac[i + 1] + " " + this.ac[i + 2]);

      console.log("L[845] f             " + this.af[i + 0] + " " + this.af[i + 1] + " " + this.af[i + 2]);

      console.log("L[846]  br                 " + this.ab[i + 0] + " " + this.ab[i + 1] + " " + this.ab[i + 2]);

      console.log("L[847] raw                     " + this.ar[i + 0] + " " + this.ar[i + 1] + " " + this.ar[i + 2]);



      i++;
      i++;
    }

  //dispA()
  }



//class NeopixelCore{}
}

exports = NeopixelCore;





// Create a local NeopixelCore class definition
//var NeopixelCore = require("NeopixelCore");

//exports.NeopixelCore = NeopixelCore;
//Uncaught Error: Constructor should be a function, but is Object
// at line 2 col 180
//...":50,"numPixels":30};n=new NeopixelCore(options);n.alloff();...








/*
function neopixelInit(options) {
  this.p = pin[0];
}
*/


/*
NeopixelInit.prototype.C = {
  OPTION_BASE_ZERO : "Zero",
  OPTION_BASE_ONE  : "One",
  CONSTANTS : 0x023   // description
};

var C = {
  OPTION_BASE_ZERO : "Zero",
  OPTION_BASE_ONE  : "One",
  
  DEF_BRIGHTNESS   : 70,
  MAX_GAMMA        : 256,

  
  CONSTANTS : 0x023   // description
};

*/


//>n.CONST.GAMMA
//=256
/*hangs system
NeopixelInit.prototype.CONST = {
//  GAMMA : C.MAX_GAMMA,
  
  GAMMA_MAX_IN  : 255,
  GAMMA_MAX_OUT : 255,
  GAMMA_FACTOR  : 2.4,
  
  
};


//exports.NeopixelInit = NeopixelInit;
exports.CONST = CONST;
*/

/*
//Evil setInterval - November 03, 2013 - Blog by Ayman Farhat. Built with Pelican
//https://www.thecodeship.com/web-development/alternative-to-javascript-evil-setinterval/

function interval( func, wait, times ) {

//  console.log("L[1216]interval() wait: " + wait );
//  console.log("L[1217]interval() times: " + times );
//  console.log("L[1218]interval() func typeof " + typeof func );          
  
  var interv = function( w, t ) {
      
    if( t <= 0 ) return 'done';
      
    return function() {

      if( typeof t === "undefined" || t-- > 0 ) {

//        console.log("L[1228]interval() B4 setTimeout()  w: " + w + "  t: " + t );
        setTimeout(interv, w);
            
        try {
//          console.log("L[1239]interval() try()    B4 func.call" );
          //https://stackoverflow.com/questions/332422/get-the-name-of-an-objects-type
          //if( typeof func !== "undefined" )
          //undefined  console.log("L[1239]interval() name func " + func.name );
          //undefined  console.log("L[1239]interval() name func " + func.constructor.name );
          //undefined  console.log("L[1239]interval() name func " + func.constructor );
          //no compile console.log("L[1239]interval() name func " + functionName( func ) );

          func.call(null);
          // wait3sec();  step();
//          console.log("L[1241]interval() try()    Aft func.call" );
        } catch(e) {
          t = 0;
//          console.log("L[1243]interval() catch() ################# " + e.toString() );
          throw e.toString();
        }

      } else {
        interv = "done"; 
      }
      // These are queued up until last timeout    
//      console.log("L[1246]interval() Aft if  ###" );          
//      console.log("L[1247]interval() t w " + t + "  " + w );
//      console.log("L[1247]interval() t w " + t + "  " + w + "   free: " + process.memory().free );
            
    }; // return function()
    //unreach   console.log("L[1250]interval() B4 clo end ###" );
 
  // var interv = function(w, t)
  }( wait, times );

  try {
//    console.log("L[1256]interval() B4   ### interv " + typeof(interv) );
//    console.log("L[1257]interval() times wait " + times + "  " + wait );

   if( interv !== 'undefined' )
      setTimeout(interv, wait);

//    console.log("L[1262]interval() Aft  ### interv " + typeof(interv) );
     
  } catch(e) {
//    console.log("L[1290]interval() catch()  ***********" + e.toString() );
    throw e.toString();
  }
}
//interval

exports.interval = interval;
*/

/*
function interval( func, wait, times ) {

  console.log("L[1216]interval() wait: " + wait );
  console.log("L[1217]interval() times: " + times );
  console.log("L[1218]interval() func typeof " + typeof func );          
  
  var interv = function( w, t ) {
      
    if( t <= 0 ) return 'done';
      
    return function() {

      if( typeof t === "undefined" || t-- > 0 ) {

        console.log("L[1228]interval() B4 setTimeout()  w: " + w + "  t: " + t );
        setTimeout(interv, w);
            
        try {
          console.log("L[1239]interval() try()    B4 func.call" );
          //https://stackoverflow.com/questions/332422/get-the-name-of-an-objects-type
          //if( typeof func !== "undefined" )
          //undefined  console.log("L[1239]interval() name func " + func.name );
          //undefined  console.log("L[1239]interval() name func " + func.constructor.name );
          //undefined  console.log("L[1239]interval() name func " + func.constructor );
          //no compile console.log("L[1239]interval() name func " + functionName( func ) );

          func.call(null);
          // wait3sec();  step();
          console.log("L[1241]interval() try()    Aft func.call" );
        } catch(e) {
          t = 0;
          console.log("L[1243]interval() catch() ################# " + e.toString() );
          throw e.toString();
        }

      } else {
        interv = "done"; 
      }
      // These are queued up until last timeout    
      console.log("L[1246]interval() Aft if  ###" );          
      console.log("L[1247]interval() t w " + t + "  " + w );
            
    }; // return function()
    //unreach   console.log("L[1250]interval() B4 clo end ###" );
 
  // var interv = function(w, t)
  }( wait, times );

  try {
    console.log("L[1256]interval() B4   ### interv " + typeof(interv) );
    console.log("L[1257]interval() times wait " + times + "  " + wait );

   if( interv !== 'undefined' )
      setTimeout(interv, wait);

    console.log("L[1262]interval() Aft  ### interv " + typeof(interv) );
     
  } catch(e) {
    console.log("L[1290]interval() catch()  ***********" + e.toString() );
    throw e.toString();
  }
}
//interval
*/



//https://stackoverflow.com/questions/2648293/how-to-get-the-function-name-from-within-that-function
/* issue with either .exec() or regex expression
function functionName( func )
{
    // Match:
    // - ^          the beginning of the string
    // - function   the word 'function'
    // - \s+        at least some white space
    // - ([\w\$]+)  capture one or more valid JavaScript identifier characters
    // - \s*        optionally followed by white space (in theory there won't be any here,
    //              so if performance is an issue this can be omitted[1]
    // - \(         followed by an opening brace
    //
    var result = /^function\s+([\w\$]+)\s*\(/.exec( func.toString() );

    return  result  ?  result[ 1 ]  :  ''; // for an anonymous function there won't be a match
}
*/


/*
>a=new Constants();
=exports: {  }
>a.CONST.GAMMA
=256
*/
/*
class Constants {
  
  
  constructor() {
  //this.OPTION_BASE_ZERO = "Zero";
 
  }
}

Constants.prototype.CONST = {
  GAMMA : C.MAX_GAMMA
  
};

exports = Constants;
*/


//var exports={};






//exports.NeopixelInit();

/*
function drb() {
  var options = { 'pinLedTest':[A5]
    ,'pinAryNeopixel':[B5,B15],'pinAryNeoIdx':1
    ,'pinAryLedTest':[A3,A4,A5],'pinAryLedTestIdx':2
    ,'useGamma':true,'brightness':70
//    ,'optionBase':OPTION_BASE_ZERO };
};
  var n = new NeopixelInit( options );
  n.alloff();
  var aryRB = n.buildRainbow();
//n.setaryprep( aryRB );
  n.setdata( aryRB );
  // nb.disp();
//  n.copy();
  n.update();
}
*/






/*

//Display R G B dual stop light
function drgb() {
  var options = { 'pinLedTest':[A5]
    ,'pinAryNeopixel':[B5,B15],'pinAryNeoIdx':1
    ,'pinAryLedTest':[A3,A4,A5],'pinAryLedTestIdx':2
    ,'useGamma':true,'brightness':70
//    ,'optionBase':OPTION_BASE_ZERO };
};
  var n = new NeopixelInit( options );
  n.alloff();

  var colR = { r:255, g:0, b:0 };
  var colG = { r:0, g:255, b:0 };
  var colB = { r:0, g:0, b:255 };

  n.mapone(0,colR);
  n.mapone(1,colR);

  n.mapone(3,colG);
  n.mapone(4,colG);

  n.mapone(6,colB);
  n.mapone(7,colB);

  n.update();
}
*/


//Wed 2018.10.10 'Module Color not found'
//loadModule(Color)
//ERROR: Found module, but search took too long.
// - https://github.com/sleuthware/EspruinoDocs/blob/master/modules/moduleNeopixelColors.js requires []
//const RGB = require("https://github.com/sleuthware/EspruinoDocs/blob/master/modules/moduleNeopixelColors.js");
const RGB = require("moduleNeopixelColors");
//var Color = require("https://github.com/sleuthware/EspruinoDocs/blob/master/modules/moduleNeopixelColor.js");
//var Color = new Color();

//S var Color = require("https://github.com/sleuthware/EspruinoDocs/blob/master/modules/moduleColor.js");


//S var colorCyan = new (require("Color"))("cyan");

var Color = require("Color");

var colr = new Color("YellowGreen");




/*

// Create a copy of our constants array
var RGB = require("https://github.com/sleuthware/EspruinoDocs/blob/master/modules/moduleNeopixelColors.js");

var col = new Color("Aqua");
var col = new Color("YellowGreen");




var col = new Color("00ffab");

*/

function getg( elem ) {
  console.log( "L[2071] ag[" + elem + "] " + n.ag[elem] );
}

function getidxg( val ) {
  for( var i=0; i<256; i++ ) {
    if( n.ag[i] == val )
      console.log( "L[2087] val: " + val + " ag[" + i + "] " + n.ag[i] );
  }
}

function prow( idx ) {
  var pnum = "";
  var pout = "";
  for( var i=0; i<16; i++ ) {
    pnum = pnum + " " + (idx+i).toString();
  }
  for( var i=0; i<16; i++ ) {
    pout = pout + " " + n.ag[ idx+i ];
  }
  console.log( "L[2099] " + pnum );
  console.log( "L[209x] " + pout );
}
//L[2099]  240 241 242 243 244 245 246 247 248 249 250 251 252 253 254 255
//L[209x]  220 223 225 227 229 232 234 236 239 241 243 246 248 250 253 255
//  "aryRainbow": [
//    { "r": 255, "g": 0, "b": 0 },
//    { "r": 171, "g": 85, "b": 0 },
//    { "r": 171, "g": 171, "b": 0 },
//    { "r": 0, "g": 255, "b": 0 },
//    { "r": 0, "g": 171, "b": 85 },
//    { "r": 0, "g": 0, "b": 255 },
//    { "r": 85, "g": 0, "b": 171 },
//    { "r": 171, "g": 0, "b": 85 }
//   ],
//>getidxg(171)
//L[2087] val: 171 ag[216] 171
//=undefined
//>getidxg(85)
//L[2087] val: 85 ag[161] 85






var nCol = 0;

function stepOBS() {
  
  var options = { 'pinLedTest':[A5]
    ,'pinAryNeopixel':[B5,B15],'pinAryNeoIdx':1
    ,'pinAryLedTest':[A3,A4,A5],'pinAryLedTestIdx':2
    ,'useGamma':true,'brightness':70
//    ,'optionBase':OPTION_BASE_ZERO };
};

  var n = new NeopixelInit( options );
  n.alloff();

  var col = new Color("DarkCyan");

  n.mapone(nCol,col);
  n.update();
  
  
  nCol++;
  if( nCol >= 8 ) { nCol = 0; };
  
}


function allon() {
  
  var col = new Color("DarkCyan");
//  for( var i=0; i<this.NUM_PIXELS; i++ ) { 
  for( var i=0; i<n.NUM_PIXELS; i++ ) { 
//  n.turnon(i,col);
  n.mapone(i,col);
  }
//n.alloff();
  n.update();
}


function tao() {
    var options = { 'pinLedTest':[A5]
    ,'pinAryNeopixel':[B5,B15,A7],'pinAryNeoIdx':1
//pixl    ,'pinAryNeopixel':[A5,A7],'pinAryNeoIdx':0
    ,'pinAryLedTest':[A3,A4,A5],'pinAryLedTestIdx':2
//    ,'numPixels':8
//    ,'useGamma':false,'brightness':70
    ,'useGamma':false,'brightness':60
//    ,'useGamma':true,'brightness':50
//    ,'numPixels':30
    ,'numPixels':8
//    ,'optionBase':OPTION_BASE_ZERO };
};




//  var n = new NeopixelInit( options );
// * require("NeopixelCore").neopixelInit(options);

  n = new NeopixelCore( options );

  n.alloff();
  
}



// ex: http://forum.espruino.com/conversations/325997/#comment14438893
//var addr = E.getAddressOf(this.ad,true);
//var addr = E.getAddressOf(n.ad,true);
//  if (!addr) throw new Error("Not a Flat String");
//console.log( "addr: " + addr );
//do not uncomment causes hang


var compcOBS = E.compiledC(`
//void slicer(int,int,int);
void slicer(unsigned char *datasrc, unsigned char *datadest, int size) {

for( int i=0; i<size; i++ ) {
  *(datadest++) = *(datasrc++);
}

}

`);

//compc.slicer(a,n.ar,24)




  
// During cleanup found that slice kills a clamped array  
// a={};  =new Uint8ClampedArray([0, 255, 0, 85, 171,  ... 85, 171, 0, 171, 85])
//  "ad": new Uint8ClampedArray(24),
//  "ar": [ 0, 255, 0, 85, 171,  ... 85, 171, 0, 171, 85 ],
//  setdata(obj) {
//    this.ar = obj.slice(0);
//  }


function setdataOBS(obj,n,size) {
  
  var addrobj = E.getAddressOf(obj,true);
  if (!addrobj) throw new Error("Not a Flat String - src");
  console.log( "addrobj: " + addrobj );
 
//  var addrr = E.getAddressOf(this.ar,true);
  var addrr = E.getAddressOf(n.ar,true);
  if (!addrr) throw new Error("Not a Flat String - dest");
  console.log( "addrr: " + addrr );

  //void slicer(unsigned char *datasrc, unsigned char *datadest, int size) {
  compc.slicer(addrobj,addrr,size);

}

//Test  n.setdata(a);
//setdata(a,n,24);






function t4() {
var t = getTime();
  var elaspsed = 0;
   print("start t4()",(getTime()-t) + " " + t); 
  
  for(var i=0;i<10;i++) {
    n.copy();
  }
         elapsed = getTime()-t;
         print("elapsed " + elapsed );
}


function t5() {
var t = getTime();
  var elaspsed = 0;
  n._setdata(n.ar,a,n.NUM_PIXELS*3);
   print("start t5()",(getTime()-t) + " " + t); 
  
  for(var i=0;i<10;i++) {
    n.update();
  }
         elapsed = getTime()-t;
         print("    ");
         print("elapsed t5()" + elapsed );
}






//With minification
//>Uncaught ReferenceError: "$jscomp" is not defined
// at line 37 col 88
//...this.name="Square"};$jscomp.inherits(MyNeo,NeopixelCore);MyN...
                    
//Without it I get low memory errors process.memory().free  54

/* future
class MyNeo extends NeopixelCore {
  constructor(options) {
    // Here, it calls the parent class' constructor with lengths
    // provided for the Polygon's width and height
    super(options);
    // Note: In derived classes, super() must be called before you
    // can use 'this'. Leaving this out will cause a reference error.
    this.name = 'Square';
  }
//  get area() {
//    return this.height * this.width;
//  }
  dispG() {
    for (var i = 0; i < this.ab.length; i++) {

      //       console.log( "L[632] g.get(i) " +  g.get(i) );
//      console.log("L[632] g.get(i) " + this.ag[i]);
      console.log("L[632] this.ac[i] " + this.ac[i]);
    }
  }
  dispA() {
    for (var i = 0; i < this.ab.length; i++) {

      //       console.log( "L[632] g.get(i) " +  g.get(i) );
//      console.log("L[632] g.get(i) " + this.ag[i]);
      console.log("L[632] this.ar[i] " + this.ar[i]);
      console.log("L[632]       this.ad[i] " + this.ad[i]);
      console.log("L[632]       n.ad[i] " + n.ad[i]);
    }
  }

}
*/

/*
  var myoptions = { 'pinLedTest':[A5]
    ,'pinAryNeopixel':[B5,B15,A7],'pinAryNeoIdx':1
    ,'pinAryLedTest':[A3,A4,A5],'pinAryLedTestIdx':2
    ,'numPixels':8
    ,'useGamma':true,'brightness':50
};

var myNeo = new MyNeo(myoptions);
myNeo.dispG();
*/










/////

var n ={};


/* Nope this kills upload
  var options = { 'pinLedTest':[A5]
    ,'pinAryNeopixel':[B5,B15],'pinAryNeoIdx':1
    ,'pinAryLedTest':[A3,A4,A5],'pinAryLedTestIdx':2
    ,'useGamma':true,'brightness':70
//    ,'optionBase':OPTION_BASE_ZERO };
};

  n = new NeopixelCore( options );
  n.alloff();
*/




  var col = {};
  var colOff = {};
  
  
  
  
  
  
  
  
  
  

//Tue2018.09.25
function ts() {
  var options = { 'pinLedTest':[A5]
    ,'pinAryNeopixel':[B5,B15,A7],'pinAryNeoIdx':1
//pixl    ,'pinAryNeopixel':[A5,A7],'pinAryNeoIdx':0
    ,'pinAryLedTest':[A3,A4,A5],'pinAryLedTestIdx':2
//    ,'numPixels':8
    ,'useGamma':false,'brightness':70
//    ,'useGamma':true,'brightness':50
//    ,'numPixels':30
    ,'numPixels':8
//    ,'optionBase':OPTION_BASE_ZERO };
};


  var options = { 'pinLedTest':[A5]
    ,'pinAryNeopixel':[B5,B15,A7],'pinAryNeoIdx':1
//pixl    ,'pinAryNeopixel':[A5,A7],'pinAryNeoIdx':0
    ,'pinAryLedTest':[A3,A4,A5],'pinAryLedTestIdx':2
//    ,'numPixels':8
//    ,'useGamma':false,'brightness':70
    ,'useGamma':true,'brightness':50
//    ,'numPixels':30
    ,'numPixels':8
//    ,'optionBase':OPTION_BASE_ZERO };
};




//  var n = new NeopixelInit( options );
// * require("NeopixelCore").neopixelInit(options);

  n = new NeopixelCore( options );

  n.alloff();
  
//  step( n );  
  
  
col = new Color("DarkCyan");
col = new Color("BlueViolet");
col = new Color("brown");
col = new Color("seagreen");

colOff = new Color("Black");
  
//  storyBoard( 150 );
//S  runScene(10);
  
  
  mRB();
//  showRB();

  
//ts()  
}


function ts1() {  
  mRB();
  showRB();
}



var nColLast = 'undefined';

//function step( n ) {
function step() {
  
//  var col = new Color("DarkCyan");

//  var colOff = new Color("Black");
  
  if( nColLast != 'undefined' )
  n.mapone(nColLast,colOff);

  nColLast = ( nColLast != 'undefined' ) ? nCol : 0;
//S  console.log( "L[1033]  nColLast[" + (nColLast).toString() + "] " + nCol);
   
  n.mapone(nCol,col);
//n.alloff();
  n.update();
  
  
  nCol++;
  if( nCol >= 8 ) { nCol = 0; };
  
}


function stepd() {
  
//  var col = new Color("DarkCyan");

//  var colOff = new Color("Black");
  
  if( nColLast != 'undefined' )
  n.mapone(nColLast,colOff);

  nColLast = ( nColLast != 'undefined' ) ? nCol : 0;
//S  console.log( "L[1033]  nColLast[" + (nColLast).toString() + "] " + nCol);
   
  n.mapone(nCol,col);
//n.alloff();
  n.update();
  
  
  nCol--;
  if( nCol <= 0 ) { nCol = 8; };
  
}





var col0 = {};

var col1 = {};
var col2 = {};
var col3 = {};
var col4 = {};

var col5 = {};
var col6 = {};
var col7 = {};
var col8 = {};




function sc() {
  col0 = new Color("BlueViolet");
  col1 = new Color("Thistle");
  col2 = new Color("Teal");
  col3 = new Color("YellowGreen");
  col4 = new Color("Tomato");

  col5 = new Color("Silver");
  col6 = new Color("Crimson");
  col7 = new Color("DarkKhaki");
  col8 = new Color("DarkMagenta");
}
  
  
  

//  var nA = new Array(0,0,0,0, 0,0,0,0, 0,0);
  var nA = new Array(100);
  var nA2 = new Array(0,0,0,0, 0,0,0,0, 0,0);
var randomPixel = 0;







    function stepsp() {


var numPixels = 60;
var numColors = 8;

  nA2 = new Array(
  col0, col1, col2, col3,
  col4, col5, col6, col7);


    
  
//var      ran = Math.floor(Math.random() * this.NUM_PIXELS);
//var randomPixel = 0;

    do {
//      ran = random(8);                // Pick a new random pixel

    //Both included
    ran = Math.floor(Math.random() * numPixels);
    
//S    console.log( "L[818] ran[" + (ran).toString() + "] " );
    } while(randomPixel == ran);       // but not the same as last 

randomPixel = ran;
//S     console.log( "L[822]             nA[" + nA.toString() + "] " );
        nA[ran] =     nA[ran] + 1;




  var  ranCol = Math.floor(Math.random() * numColors);
col = nA2[ranCol];
//nope  col = "col" + ranCol;


nCol = ran;
  
    if( nColLast != 'undefined' )
  n.mapone(nColLast,colOff);

  nColLast = ( nColLast != 'undefined' ) ? nCol : 0;
//S  console.log( "L[1033]  nColLast[" + (nColLast).toString() + "] " + nCol);

    n.mapone(nCol,col);
//n.alloff();
  n.update();

}

    
    
    
    
/* before rnd
function stepsp() {
  
  
//var      ran = Math.floor(Math.random() * this.NUM_PIXELS);
//var randomPixel = 0;

    do {
//      ran = random(8);                // Pick a new random pixel

    //Both included
    ran = Math.floor(Math.random() * 8);
    
//S    console.log( "L[818] ran[" + (ran).toString() + "] " );
    } while(randomPixel == ran);       // but not the same as last 

randomPixel = ran;
//S     console.log( "L[822]             nA[" + nA.toString() + "] " );
        nA[ran] =     nA[ran] + 1;







nCol = ran;
  
    if( nColLast != 'undefined' )
  n.mapone(nColLast,colOff);

  nColLast = ( nColLast != 'undefined' ) ? nCol : 0;
//S  console.log( "L[1033]  nColLast[" + (nColLast).toString() + "] " + nCol);

    n.mapone(nCol,col);
//n.alloff();
  n.update();

}
*/


function runSceneSP( nTimes, delay ) {
  
//  var delay = 1;

  
  var time = 300;
  var time = 30;
  var time = 5;
//var delay = 1;
//var delay = 3;
//var delay = 130;
//var delay = 430;
var t = getTime();
  var elaspsed = 0;
   print("start ",(getTime()-t) + " " + t); 

      var x = 0;
    var intervalID = setInterval(function () {

// intervalVar = interval( step, time, nTimes);
stepsp();
      if (++x == nTimes) {
           clearInterval(intervalID);
        elapsed = getTime()-t;
//         print("elapsed " + elapsed );
       }
//S print("1599 compiled ",(getTime()-t) + " " + x + " " + (getTime()-t)/nTimes); 

    }, delay);
  
 print("1500 compiled ",(getTime()-t)); 
}








var intervalVar = 0;

//function storyBoard( nTimes ) {
function runScene( nTimes ) {
  
  var time = 300;
  var time = 30;
  var time = 5;
var delay = 10;

      var x = 0;
    var intervalID = setInterval(function () {

// intervalVar = interval( step, time, nTimes);
step();
      if (++x == nTimes) {
           clearInterval(intervalID);
       }
    }, delay);
}

//https://stackoverflow.com/questions/2956966/javascript-telling-setinterval-to-only-fire-x-amount-of-times
/*

function setIntervalX(callback, delay, repetitions) {
    var x = 0;
    var intervalID = window.setInterval(function () {

       callback();

       if (++x === repetitions) {
           window.clearInterval(intervalID);
       }
    }, delay);
}
Then you can call the new setInvervalX() function as follows:

// This will be repeated every for 5 times with 1 second intervals:
setIntervalX(function () {
    // Your logic here
}, 1000, 5);


*/






//    setTimeout(function () {
//  console.log("Hello World");
//}, 1000);

function runScenePr( nTimes ) {
  
//    for( var i=0; i<3; i++ )
    {
//  intv = setInterval( function(){ ta4(); }, 9000 );
//      t9();
    }
  
//  var time = 11000;
//  var time = 14100;
//  var time = 4100;
  var time = 300;
  var time = 30;
  var time = 5;
//    for( var i=0; i<3; i++ )
  {
 //   time+= dDelay[i];
//     var intervalVar = interval(ta4, time, 15);

//     intervalVar = interval( step( n ), time, nTimes);
     intervalVar = n.interval( step, time, nTimes);
//     intervalVar = interval( ta4, time, nTimes);

//     intervalVar = interval(
  //   function( n ) {
     
    // }
   //  , time, 15);
    
  }

}

//ref  function t9() { clearInterval( intv ); }
function k9() { clearInterval( intervalVar ); }





function runSceneD( nTimes ) {
  
  var time = 11;
//    for( var i=0; i<3; i++ )
  {
 //   time+= dDelay[i];
//     var intervalVar = interval(ta4, time, 15);

//     intervalVar = interval( step( n ), time, nTimes);
     intervalVar = n.interval( stepd, time, nTimes);
//     intervalVar = interval( ta4, time, nTimes);

//     intervalVar = interval(
  //   function( n ) {
     
    // }
   //  , time, 15);
    
  }

}







function callSB( nTimes ) {
//   for( var i=0; i<nTimes; i++ )

  var time = 1000;
  var intervalVar = n.interval(storyBoard, time, nTimes);
// storyBoard();
  var time = 13000;
  var intervalVar = n.interval(storyBoardRB, time, nTimes);
  
}


function runSB(nTimes) {
/*
  ts();
  mRB();
  showRB();
*/
  n.alloff();
  setTimeout(function () {
    var time = 10;
  var intervalVar = n.interval(storyBoard, time, nTimes);
}, 2000);
}
//    setTimeout(function () {
//  console.log("Hello World");
//}, 1000);



var ciLoop;

function cl() { clearInterval( ciLoop ); }

function loop() {
  var delay = 15000;
  ciLoop = intervalID = setInterval(function () {

    runSB(1);
  }, delay);
    // setInterval
  
  
}







function fadeAllOBS( nDelay, step ) {
//  "compiled";
  nStep = step;
//  var time = 300;
//  var time = 30;
  var time = 5;
var delay = 10;
var nTimes = 256;
//var nTimes = 4;


var t = getTime();
  var elaspsed = 0;
  
   print("start ",(getTime()-t) + " " + t); 
 
//err     var ary = new Uint8ClampedArray(16);

  
  
//     var nArySizeRGB = this.numPixels * 3;
//    var aryOff = new Uint8ClampedArray(this.NUM_PIXELS);
    var aryOff = new Uint8ClampedArray(n.NUM_PIXELS);
//    var aryOff = new Array(n.NUM_PIXELS);
 
 
 
 
      var x = 0;
  var limitLower = 0;
//  var limitUpper = this.NUM_PIXELS;
  var limitUpper = n.NUM_PIXELS;
  
  
    var intervalID = setInterval(function () {

if( x > 35 ) nTimes = 0;      
//if( x > 15 ) nTimes = 0;      
//if( x > 5 ) nTimes = 0;      

//SS      console.log("L[1381]  x ***********   ********** " + x );
                        elapsed = getTime()-t;
    //SS     print("elapsed st of new sI " + elapsed );
 
// intervalVar = interval( step, time, nTimes);
//for(var idx=0; idx<this.NUM_PIXELS; idx++) {
for(var idx=0; idx<n.NUM_PIXELS; idx++) {
//    fade(idx, step);
//function fade( idx, step, inout ) {



var tf = new getTime();
  var ef= 0;

    n.fade( idx, step, "out" );

//    n.updatefade();

  ef = getTime()-tf;
 //S        print("   fade() elapsed " + ef );

    
    
    
  // Check for fadded
        var color = n.getColorPixelB(idx);
if( (color.r === 0) && (color.g === 0) && (color.b === 0) )
  aryOff[idx] = 1;
  
//  for(var i=limitLower; i<this.NUM_PIXELS; i++)
  for(var i=limitLower; i<n.NUM_PIXELS; i++)
  {
//  console.log("L[1655] " + idx + " aryOff[i] " + aryOff[i+0] + aryOff[i+1] + aryOff[i+2] + aryOff[i+3] + " " +
//             aryOff[i+4] + aryOff[i+5] + aryOff[i+6] + aryOff[i+7]
//             );
    if( aryOff[i] === 0 )
    {
//            console.log("L[1660]  limiLower   ********** break" );

      break;
    }
    if( aryOff[i] == 1 )
    {
       limiLower = i+1; 
//      console.log("L[1658]  limiLower   ********** " + limiLower );
    }
    
//    if( limitLower == (this.NUM_PIXELS-1) )
    if( limitLower == (n.NUM_PIXELS-1) )
    {
      nTimes = 0;
      console.log("L[1659]  $$$$$$$$$$  reset " + limiLower );
      console.log("L[1659]  $$$$$$$$$$  reset " + limiLower );
      console.log("L[1659]  $$$$$$$$$$  reset " + limiLower );
      console.log("L[1659]  $$$$$$$$$$  reset " + limiLower );
      console.log("L[1659]  $$$$$$$$$$  reset " + limiLower );
      break;
    }
  //for(var i=limitLower;
  }    

//      console.log("L[2026]  x ***********   ********** " + x + " " + nTimes );
  
  
        if (nTimes == 0) {
      console.log("L[2029]  $$$$$$$$$$  Forced clearInterval" );
          clearInterval(intervalID);
          
                             elapsed = getTime()-t;
         print("elapsed " + elapsed );
 print("2041  1500 compiled ",(getTime()-t)); 

//break;
//this ani'nt so
//Uncaught SyntaxError: BREAK statement outside of SWITCH, FOR or WHILE loop
// at line 55 col 1
//break;
       }

        if (x > 35) {
      console.log("L[2029]  $$$$$$$$$$  Forced clearInterval" );
          clearInterval(intervalID);
       }
 
  
  
  //for(var idx=0
  }
  
      n.updatefade();

      
      if (++x >= nTimes) {
      console.log("L[1959]  $$$$$$$$$$  Forced clearInterval" );
           clearInterval(intervalID);
           
                   elapsed = getTime()-t;
         print("elapsed " + elapsed );
 print("1500 compiled ",(getTime()-t)); 
           
       }
       
       
    }, nDelay);
    // setInterval
    
     print("1500 compiled ",(getTime()-t)); 
     
    
     
//fadeAll()    
}


var nStep = 5;

function fadeOBS( idx, step ) {
//  var color =   getColorPixel(idx) {
  var color = n.getColorPixelB(idx);
//debugger;
//      console.log("L[1350]  color ***********   ********** " + color );
//      console.log("L[1350]  color idx ***********   ********** " + idx );

  var r = color.r;
//      console.log("L[1350]  r ***********   ********** " + r );
  var g = color.g;
//      console.log("L[1350]  r ***********   ********** " + g );
  var b = color.b;
//      console.log("L[1350]  r ***********   ********** " + b );

  //  r.Fade = r - 1;
//  if( r.Fade < 0 ) rFade = 0;
    r-= step;
  if( r < 0 ) r = 0;
    g-= step;
  if( g < 0 ) g = 0;
    b-= step;
  if( b < 0 ) b = 0;
  
  var newColor = new Color();
newColor.r = r;
newColor.g = g;
newColor.b = b;
  
//  newColor.setColorR(r);
//  newColor.setColorG(g);
//  newColor.setColorB(b);
//  var colorAdj = new Color( newColor );
//n.turnon( idx, colorAdj );
n.fadeon( idx, newColor );

}


//raw -> bright -> fade -> corr -> disp   ar->ab->af->ac->ad

function fadeCLASS( idx, step, inout ) {
//  var color = n.getColorPixelB(idx);
// Get brightness adjusted values
var offset = idx;
// Fade out moves towards zero
var stepabs = ( inout == "out" ) ? step*(-1) : step;

    var idx = offset*3;
                var vals = {};
            vals.r = this.af[idx];
            vals.g = this.af[idx+1];
            vals.b = this.af[idx+2];
if( inout == "out" ) {
    vals.r+= stepabs;
  if( r < 0 ) r = 0;
    vals.g+= stepabs;
  if( g < 0 ) g = 0;
    vals.b+= stepabs;
  if( b < 0 ) b = 0;
}

  // We need the max color to count up towards
//  var colormax = n.getColorPixel(idx);
//  var rx = colormax.r;
//      console.log("L[1350]  r ***********   ********** " + r );
//  var gx = colormax.g;
//      console.log("L[1350]  r ***********   ********** " + g );
//  var bx = colormax.b;

if( inout == "in" ) {
                var maxs = {};
            maxs.r = this.ab[idx];
            maxs.g = this.ab[idx+1];
            maxs.b = this.ab[idx+2];

  
  if( vals.r < maxs.r )
    vals.r+= step;
  if( vals.r > 255 ) vals.r = 255;

  if( vals.g < maxs.g )
    vals.g+= step;
  if( vals.g > 255 ) vals.g = 255;
  
  if( vals.b < maxs.b )
    vals.b+= step;
  if( vals.b > 255 ) vals.b = 255;
}
  this.af[idx] = vals.r;
  this.af[idx+1] = vals.g;
  this.af[idx+2] = vals.b;
  
  
  //fade()
}




function getMaxRGB( nStep ) {
//    var limitLower = 0;
//  var limitUpper = this.NUM_PIXELS;
//  var limitUpper = n.NUM_PIXELS;
  
  // Must loop at least one time
//  var countIntv = 0;
  var rangeUpper = 1;
  var stepsCalc = 1;
//var nStep = 1;

  for(var idx=0; idx<n.NUM_PIXELS; idx++) {

  
    for(var i=0; i<3; i++) {
  var offset = ([idx+i]*3);
console.log( "offset " + offset + "  type " + typeof( offset ) );

//  var valRGB = n.ad[0];
  var valRGB = n.ab[i];
//  var valRGB = n.af[offset];
//  var valRGB = this.af[offset];

//console.log( "valRGB " + valRGB + "  rangeUpper " + rangeUpper );

  rangeUpper = ( valRGB > rangeUpper ) ? valRGB : rangeUpper;
  
  stepsCalc = Math.ceil( rangeUpper / nStep ) + 1;
  
//  nTimes = stepsCalc;
  
//console.log( "nTimes " + nTimes + "  rangeUpper " + rangeUpper + "  stepsCal " + stepsCal );
console.log( "  rangeUpper " + rangeUpper + "  stepsCal " + stepsCalc );

  //for i
  }
  saveTimes = stepsCalc;
  console.log( "     " );
  //for idx
  }
  return { 'rangeUpper' : rangeUpper, 'stepsCalc' : stepsCalc };
}  

// Fade in class

function fadeAll( nDelay, step, inout ) {
//  "compiled";


  nStep = step;
//  var time = 300;
//  var time = 30;
  var time = 5;
var delay = 10;
var nTimes = 256;
//var nTimes = 4;
var saveTimes;

if( nDelay > 0 ) delay = nDelay;

var stepabs = ( inout == "out" ) ? step*(-1) : step;



var t = getTime();
  var elaspsed = 0;
  
   print("start ",(getTime()-t) + " " + t); 
 
 
 
 
      var x = 0;
  var limitLower = 0;
//  var limitUpper = this.NUM_PIXELS;
  var limitUpper = n.NUM_PIXELS;
  
  // Must loop at least one time
  var countIntv = 0;
  var rangeUpper = 1;
  var stepsCalc = 1;
 //not here either 
 
 
 
// if(false)
//  for(var idx=0; idx<n.NUM_PIXELS; idx++) {

  
//    for(var i=0; i<3; i++) {
//  var offset = ([idx+i]*3);
//print( "offset " + offset + "  type " + typeof( offset ) );

////  var valRGB = n.ad[0];
//  var valRGB = n.ab[i];
////  var valRGB = n.af[offset];
////  var valRGB = this.af[offset];

////console.log( "valRGB " + valRGB + "  rangeUpper " + rangeUpper );

//  rangeUpper = ( valRGB > rangeUpper ) ? valRGB : rangeUpper;
  
//  stepsCal = Math.ceil( rangeUpper / nStep ) + 1;
  
//  nTimes = stepsCalc;
  
//console.log( "nTimes " + nTimes + "  rangeUpper " + rangeUpper + "  stepsCal " + stepsCal );

  //for i
//  }
//  saveTimes = stepsCalc;
  
  //for idx
//  }
// return;
  
    nTimes = saveTimes;

    
    //getMaxRGB( nStep )
//      return { 'rangeUpper' : rangeUpper, 'stepsCalc' : stepsCalc };

    var objRet = getMaxRGB( step );
    stepsCalc = objRet.stepsCalc;
    rangeUpper = objRet.rangeUpper;
    
    
//console.log( "3017 nTimes " + nTimes + "  rangeUpper " + rangeUpper + "  stepsCal " + stepsCal );
      nTimes = stepsCalc + 1;
console.log( "3018 nTimes " + nTimes + "  rangeUpper " + rangeUpper + "  stepsCalc " + stepsCalc );

    var intervalID = setInterval(function () {
console.log( "3018 intervalID " + intervalID ); 
 
//if( x > 35 ) nTimes = 0;      
//if( x > 15 ) nTimes = 0;      
//if( x > 5 ) nTimes = 0;      
//if( x > 1 ) nTimes = 0;      

//SS      console.log("L[1381]  x ***********   ********** " + x );
                        elapsed = getTime()-t;
    //SS     print("elapsed st of new sI " + elapsed );
 
// intervalVar = interval( step, time, nTimes);
//for(var idx=0; idx<this.NUM_PIXELS; idx++) {
for(var idx=0; idx<n.NUM_PIXELS; idx++) {
//    fade(idx, step);
//function fade( idx, step, inout ) {

// Set after all pixels have been reviewed
//if(false)
//if( idx == 0 )
//{
  
//  for(var n=0; n<3; n++) {
//  var offset = ([idx+n]*3);
//print( "offset " + offset + "  type " + typeof( offset ) );

//  var valRGB = n.ad[0];
////  var valRGB = n.af[offset];
////  var valRGB = this.af[offset];

//  rangeUpper = ( valRGB > rangeUpper ) ? valRGB : rangeUpper;
  
//  stepsCal = Math.ceil( rangeUpper / stepsCalc ) + 1;
  
//  nTimes = stepsCalc;
//  }
//}


var tf = new getTime();
  var ef= 0;

//    n.fade( idx, step, "out" );
    n.fade( idx, step, inout );

//    n.updatefade();

  ef = getTime()-tf;
 //S        print("   fade() elapsed " + ef );


  
        if (nTimes == 0) {
      console.log("L[2029]  $$$$$$$$$$  Forced clearInterval" );
          clearInterval(intervalID);
          
                             elapsed = getTime()-t;
         print("elapsed " + elapsed );
 print("2041  1500 compiled ",(getTime()-t)); 
       }

//        if (x > 35) {
//      console.log("L[2029]  $$$$$$$$$$  Forced clearInterval" );
//          clearInterval(intervalID);
//       }
 
  
  
  //for(var idx=0
  }
  
  countIntv++;
  
//      n.updatefade();
      n.update("fade");

      
      if (++x >= nTimes) {
      console.log("L[1959]  $$$$$$$$$$  Forced clearInterval x nTimes [" + x + "] " + nTimes );
           clearInterval(intervalID);
           
                   elapsed = getTime()-t;
         print("elapsed " + elapsed );
 print("1500 compiled ",(getTime()-t)); 
           
       }
       
       
    }, delay);
    // setInterval
console.log( "3118 intervalID " + intervalID ); 
     
     print("1500 compiled ",(getTime()-t)); 
 console.log("1500 countIntv " + countIntv ); 
     
    
     
//fadeAll()    
}



/*
function fadeAll( nDelay, step, inout ) {
//  "compiled";
  nStep = step;
//  var time = 300;
//  var time = 30;
  var time = 5;
var delay = 10;
var nTimes = 256;
//var nTimes = 4;
var saveTimes;

if( nDelay > 0 ) delay = nDelay;

var stepabs = ( inout == "out" ) ? step*(-1) : step;



var t = getTime();
  var elaspsed = 0;
  
   print("start ",(getTime()-t) + " " + t); 
 
 
 
 
      var x = 0;
  var limitLower = 0;
//  var limitUpper = this.NUM_PIXELS;
  var limitUpper = n.NUM_PIXELS;
  
  // Must loop at least one time
  var countIntv = 0;
  var rangeUpper = 1;
  var stepsCalc = 1;
 //not here either 
 
  for(var idx=0; idx<n.NUM_PIXELS; idx++) {

  
    for(var i=0; i<3; i++) {
  var offset = ([idx+i]*3);
print( "offset " + offset + "  type " + typeof( offset ) );

//  var valRGB = n.ad[0];
  var valRGB = n.ab[i];
//  var valRGB = n.af[offset];
//  var valRGB = this.af[offset];

//console.log( "valRGB " + valRGB + "  rangeUpper " + rangeUpper );

  rangeUpper = ( valRGB > rangeUpper ) ? valRGB : rangeUpper;
  
  stepsCal = Math.ceil( rangeUpper / nStep ) + 1;
  
  nTimes = stepsCalc;
  
//console.log( "nTimes " + nTimes + "  rangeUpper " + rangeUpper + "  stepsCal " + stepsCal );

  //for i
  }
  saveTimes = stepsCalc;
  
  //for idx
  }
// return;
  
    nTimes = saveTimes;

//console.log( "3017 nTimes " + nTimes + "  rangeUpper " + rangeUpper + "  stepsCal " + stepsCal );
      nTimes = stepsCal + 1;
console.log( "3018 nTimes " + nTimes + "  rangeUpper " + rangeUpper + "  stepsCal " + stepsCal );

    var intervalID = setInterval(function () {
console.log( "3018 intervalID " + intervalID ); 
 
//if( x > 35 ) nTimes = 0;      
//if( x > 15 ) nTimes = 0;      
//if( x > 5 ) nTimes = 0;      
//if( x > 1 ) nTimes = 0;      

//SS      console.log("L[1381]  x ***********   ********** " + x );
                        elapsed = getTime()-t;
    //SS     print("elapsed st of new sI " + elapsed );
 
// intervalVar = interval( step, time, nTimes);
//for(var idx=0; idx<this.NUM_PIXELS; idx++) {
for(var idx=0; idx<n.NUM_PIXELS; idx++) {
//    fade(idx, step);
//function fade( idx, step, inout ) {

// Set after all pixels have been reviewed
//if(false)
//if( idx == 0 )
//{
  
//  for(var n=0; n<3; n++) {
//  var offset = ([idx+n]*3);
//print( "offset " + offset + "  type " + typeof( offset ) );

//  var valRGB = n.ad[0];
////  var valRGB = n.af[offset];
////  var valRGB = this.af[offset];

//  rangeUpper = ( valRGB > rangeUpper ) ? valRGB : rangeUpper;
  
//  stepsCal = Math.ceil( rangeUpper / stepsCalc ) + 1;
  
//  nTimes = stepsCalc;
//  }
//}


var tf = new getTime();
  var ef= 0;

//    n.fade( idx, step, "out" );
    n.fade( idx, step, inout );

//    n.updatefade();

  ef = getTime()-tf;
 //S        print("   fade() elapsed " + ef );


  
        if (nTimes == 0) {
      console.log("L[2029]  $$$$$$$$$$  Forced clearInterval" );
          clearInterval(intervalID);
          
                             elapsed = getTime()-t;
         print("elapsed " + elapsed );
 print("2041  1500 compiled ",(getTime()-t)); 
       }

//        if (x > 35) {
//      console.log("L[2029]  $$$$$$$$$$  Forced clearInterval" );
//          clearInterval(intervalID);
//       }
 
  
  
  //for(var idx=0
  }
  
  countIntv++;
  
//      n.updatefade();
      n.update("fade");

      
      if (++x >= nTimes) {
      console.log("L[1959]  $$$$$$$$$$  Forced clearInterval x nTimes [" + x + "] " + nTimes );
           clearInterval(intervalID);
           
                   elapsed = getTime()-t;
         print("elapsed " + elapsed );
 print("1500 compiled ",(getTime()-t)); 
           
       }
       
       
    }, delay);
    // setInterval
console.log( "3118 intervalID " + intervalID ); 
     
     print("1500 compiled ",(getTime()-t)); 
 console.log("1500 countIntv " + countIntv ); 
     
    
     
//fadeAll()    
}



*/


function fa() {
  
//  fadeAll(20,10,"out");
//  n.fadeAll(20,1,"out");
  fadeAll(20,1,"out");
}
function fi() {
  
//  fadeAll(20,10,"out");
//  n.fadeAll(20,3,"in");
  fadeAll(20,3,"in");
}

function sd(obj) {
    this.af = obj.slice(0);
  }





/*
>test()
offset 0  type number
Uncaught Error: Field or method "3" does not already exist, and can't create it on undefined
 at line 6 col 25
  var valRGB = this.ad[3];
                        ^
in function "test" called from line 1 col 6
test()
*/

function test(n) {
  
  var idx=0;
    for(var n=0; n<3; n++) {
  var offset = ([idx+n]*3);
print( "offset " + offset + "  type " + typeof( offset ) );

  var valRGB = this.ad[3];
  var valRGB = n.af[4];
  var valRGB = n.ad[0];
//  var valRGB = n.af[offset];
//  var valRGB = this.af[offset];

//  rangeUpper = ( valRGB > rangeUpper ) ? valRGB : rangeUpper;
  
//  stepsCal = Math.ceil( rangeUpper / stepsCalc ) + 1;
  
//  nTimes = stepsCalc;
  }
  
}













//Fade in


function fadeinAll( nDelay, step ) {
  
  nStep = step;
  var time = 300;
  var time = 30;
  var time = 5;
var delay = 10;
var nTimes = 256;
//var nTimes = 4;
  
//     var nArySizeRGB = this.numPixels * 3;
//    var aryOff = new Uint8ClampedArray(this.NUM_PIXELS);
    var aryOff = new Uint8ClampedArray(n.NUM_PIXELS);
 
      var x = 0;
  var limitLower = 0;
//  var limitUpper = this.NUM_PIXELS;
  var limitUpper = n.NUM_PIXELS;
    var intervalID = setInterval(function () {

//if( x > 35 ) nTimes = 0;      
if( x > 15 ) nTimes = 0;      
      console.log("L[1381]  x ***********   ********** " + x );
      
// intervalVar = interval( step, time, nTimes);
//for(var idx=0; idx<this.NUM_PIXELS; idx++) {
for(var idx=0; idx<n.NUM_PIXELS; idx++) {
    fadein(idx, step);
    n.updatefade();

  // Check for fadded
        var color = n.getColorPixelB(idx);
if( (color.r === 0) && (color.g === 0) && (color.b === 0) )
  aryOff[idx] = 1;
  
//  for(var i=limitLower; i<this.NUM_PIXELS; i++)
  for(var i=limitLower; i<n.NUM_PIXELS; i++)
  {
  console.log("L[1655] " + idx + " aryOff[i] " + aryOff[i+0] + aryOff[i+1] + aryOff[i+2] + aryOff[i+3] + " " +
             aryOff[i+4] + aryOff[i+5] + aryOff[i+6] + aryOff[i+7]
             );
    if( aryOff[i] === 0 )
    {
            console.log("L[1660]  limiLower   ********** break" );

      break;
    }
    if( aryOff[i] == 1 )
    {
       limiLower = i+1; 
      console.log("L[1658]  limiLower   ********** " + limiLower );
    }
    
//    if( limitLower == (this.NUM_PIXELS-1) )
    if( limitLower == (n.NUM_PIXELS-1) )
    {
      nTimes = 0;
      console.log("L[1659]  $$$$$$$$$$  reset " + limiLower );
      break;
    }
  }    

  
  //for(var idx=0
  }
      if (++x >= nTimes) {
           clearInterval(intervalID);
       }
    }, nDelay);
}




function fadein( idx, step ) {
//  var color =   getColorPixel(idx) {
  var color = n.getColorPixelB(idx);
//debugger;
//      console.log("L[1350]  color ***********   ********** " + color );
//      console.log("L[1350]  color idx ***********   ********** " + idx );

  var r = color.r;
//      console.log("L[1350]  r ***********   ********** " + r );
  var g = color.g;
//      console.log("L[1350]  r ***********   ********** " + g );
  var b = color.b;
//      console.log("L[1350]  r ***********   ********** " + b );

  //  r.Fade = r - 1;
//  if( r.Fade < 0 ) rFade = 0;
/*
    r-= step;
  if( r < 0 ) r = 0;
    g-= step;
  if( g < 0 ) g = 0;
    b-= step;
  if( b < 0 ) b = 0;
*/

  // We need the max color to count up towards
  var colormax = n.getColorPixel(idx);
  var rx = colormax.r;
//      console.log("L[1350]  r ***********   ********** " + r );
  var gx = colormax.g;
//      console.log("L[1350]  r ***********   ********** " + g );
  var bx = colormax.b;

  
  
  if( r < rx )
    r+= step;
  if( r > 255 ) r = 255;

  if( g < gx )
    g+= step;
  if( g > 255 ) g = 255;
  
  if( b < bx )
    b+= step;
  if( b > 255 ) b = 255;


  
  var newColor = new Color();
newColor.r = r;
newColor.g = g;
newColor.b = b;
  
//  newColor.setColorR(r);
//  newColor.setColorG(g);
//  newColor.setColorB(b);
//  var colorAdj = new Color( newColor );
//n.turnon( idx, colorAdj );
n.fadeon( idx, newColor );

}






function off() {
  n.cleardata();
  n.update();
}
  

//https://stackoverflow.com/questions/15410384/javascript-setinterval-function-with-arguments
//Use an anonymous function


function storyBoard( nTimes ) {
 
//var obj    = [ n.alloff, setColorSparkle, runScene(30), wait3, n.alloff, runSceneD(51) ];
//var dDelay = [ 10,       10,              3000,         1000,        10,  4000 ];
  
//var obj    = [ n.alloff, setColorSparkle, runScene(30) ];
//S var obj    = [ n.alloff, setColorSparkle, function(){runScene(30);} ];
//var dDelay = [ 10,       10,              3000 ];
  
var obj    = [ off, setColorSparkle, function(){runScene(30);}, off,
                   setColorSparkle, function(){runSceneSP(50);}, off,
              
              showRB, wait3, off, function(){runSceneD(51);}, off,
              showRB, wait3, function(){fadeAll(20,10, "out");}              
             ];
var dDelay = [ 2000,       10,              50,                2000,
               10,              50,                2000,
              1700,   3000,  2,    60,                         5000,
              1000, 1000, 4000
             ];
    
  var time=1000;
  var nLoops = nTimes;
  var nLoops = 3;
  
//n  do {
      console.log("L[1480] " + nLoops + " ***********   ********** " + nLoops );

  for( var i=0; i<obj.length; i++ )
  {
    console.log("        ");
    console.log("        ");
    console.log("        ");
    time+= dDelay[i];
//     var intervalVar = interval(obj[i], time, 1);
     var intervalVar = n.interval(obj[i], time, 1);
//debugger;
//    console.log("L[1240]  loop i ***********   ********** " + i );
    console.log("L[1240]  loop i *********** " + i + "   free: " + process.memory().free );
    
  }
//n  } while ( nLoops-- >= 0 );

//  return( "done" );
//  return( true );
  
  
var nSum = 0;
  for( var i=0; i<dDelay.length; i++ )
  {
 //   debugger;
    nSum+= dDelay[i];
    
  }
  
  return nSum;



//storyBoard()
}



function storyBoardF( nTimes ) {
 
  
var obj    = [
              
              showRB, wait3, function(){fadeAll(20,10, "out");},
function(){fadeAll(20,10, "in");}
              
             ];
var dDelay = [ 
              1000, 1000, 4000,
              4000
             ];
    
  var time=1000;
  var nLoops = nTimes;
  var nLoops = 3;
  
//n  do {
      console.log("L[1480] " + nLoops + " ***********   ********** " + nLoops );

  for( var i=0; i<obj.length; i++ )
  {
    console.log("        ");
    console.log("        ");
    console.log("        ");
    time+= dDelay[i];
     var intervalVar = n.interval(obj[i], time, 1);
//debugger;
//    console.log("L[1240]  loop i ***********   ********** " + i );
    console.log("L[1240]  loop i *********** " + i + "   free: " + process.memory().free );
    
  }
//n  } while ( nLoops-- >= 0 );

//  return( "done" );
//  return( true );
  
  
var nSum = 0;
  for( var i=0; i<dDelay.length; i++ )
  {
 //   debugger;
    nSum+= dDelay[i];
    
  }
  
  return nSum;



//storyBoard()
}











//    setTimeout(function () {
//  console.log("Hello World");
//}, 1000);
function storyBoardZ( nTimes ) {
  
var obj    = [ n.alloff, setColorSparkle, function(){runScene(30);}, n.alloff,
              showRB, wait3, n.alloff, function(){runSceneD(51);} ];
var dDelay = [ 2000,       10,              3000,                      10,
              1700,   1000,        10,  4000 ];
    
  var time=1000;

//      console.log("L[1480] " + nLoops + " ***********   ********** " + nLoops );

  for( var i=0; i<obj.length; i++ )
  {
    console.log("        ");
    console.log("        ");
    console.log("        ");
    
    setTimeout(function () {
    
//    time+= dDelay[i];
    time = dDelay[i];
     var intervalVar = n.interval(obj[i], time, 1);

    console.log("L[1240]  loop i ***********   ********** " + i );
    
    
    }, obj, dDelay, dDelay[i]);
    
    
  }
  
}












var a = {};
//    var aryOff = new Uint8ClampedArray(n.NUM_PIXELS);

//var a = new Uint8ClampedArray(n.NUM_PIXELS);
//var a = new Uint8ClampedArray(24);
//undef var a = new Uint8ClampedArray(n.NUM_ELEMENTS);
//var a = new Uint8ClampedArray(24);

function drb() {
  console.log("L[3677] len a " + a.length );
  var sout = "";
  for( var i=0; i<a.length; i++ ) {
    sout = sout + "[" + i + "] " + a[i]; 
  } 
  console.log( sout );
}



//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray
// From an ArrayBuffer
//var buffer = new ArrayBuffer(8);
//var z = new Uint8ClampedArray(buffer, 1, 4);
aa = {};

//http://forum.espruino.com/conversations/326573/#comment14454980
//http://forum.espruino.com/conversations/316941/

var NUM_BYTES = 24;
var flat_str = E.toString({data : 0, count : NUM_BYTES});
var arr = new Uint8Array(E.toArrayBuffer(flat_str));
var addr = E.getAddressOf(flat_str);

function mRB() {
//  a = new Uint8ClampedArray(n.NUM_ELEMENTS);
  a = n.buildRainbow();
var buffer = new ArrayBuffer(24);
  buffer = n.buildRainbow();
console.log("L[4118] buffer " + buffer);

  //undef  aa = new Uint8ClampedArray(a,0,a.length);
try {
  // All these create a 20 element E
//  aa = E.toString(new Uint8ClampedArray(a,0,a.length));
//  aa = E.toString(new Uint8ClampedArray(buffer,0,buffer.length));
//  aa = E.toString(new Uint8ClampedArray(buffer));
//  aa = E.toString(buffer);
//var NUM_BYTES = 24;
//var flat_str = E.toString({data : 0, count : NUM_BYTES});
//var arr = new Uint8Array(E.toArrayBuffer(flat_str));
//var addr = E.getAddressOf(flat_str);
//console.log( "L[4118] addr " + addr );
//arr = a;
arr = n.buildRainbow();
console.log( "L[4118] arr " + arr );

} catch(e){
console.log("L[4143] catch()   mRB ***" + e.toString());
                    throw e.toString();
                }
}

//http://forum.espruino.com/conversations/326573/#comment14454980
//http://forum.espruino.com/conversations/316941/
//example E.toString(new Uint8Array(8)). You could also then use E.toArrayBuffer on that String to create an ArrayBuffer 
//var str  = E.toString("\1\2\3\4\5\6"); // create a flat string
//print(c.sum(str.length, E.getAddressOf(str,true)));





function showRB() {
//  var a = n.buildRainbow();
//OBSn.setdata(a);
//n.setdata(a,n.ar,n.NUM_PIXELS*3);

console.log("L[3677] len a " + a.length );

//S n.setdata(n.ar,a,n.NUM_PIXELS*3);
//n.load(aa);
//Sn.load(arr);
n.load2(arr);
//eq     this._setdata( this.ar, arydata, arydata.length, "darsuk" );


//n.dispA();
console.log("L[3593] " + this.useGamma );
console.log("L[3593] " + this.NUM_ELEMENTS );
n.update();
}


/*
  update(fade) {
if( typeof fade == "undefined" )
    {
      console.log( "L[1756] call to this.mapBrightness()" );
    this.mapBrightness();
    console.log( "L[1756] update this.useGamma " + this.useGamma );
    if( this.useGamma ) this.applyGamma();
(this.useGamma) ? this._setdata( this.ad, this.ac, this.NUM_ELEMENTS, "dadsac" ) : this._setdata( this.ad, this.ab, this.NUM_ELEMENTS, "dadsab" );
  }
else
{
  if( fade == "fade" )
    this._setdata( this.ad, this.af, this.NUM_ELEMENTS, "dadsaf" );
require("neopixel").write(this.pinNeopixel, this.ad);

n.mapBrightness();
n.applyGamma();
//u
n._setdata( n.ad, n.ac, n.NUM_ELEMENTS, "dadsac" )

n._setdata( n.ad, n.ab, n.NUM_ELEMENTS, "dadsab" );

//f
n._setdata( n.ad, n.af, n.NUM_ELEMENTS, "dadsaf" );
    
require("neopixel").write(n.pinNeopixel, n.ad);



  load( arydata ) {
    this._setdata( this.ar, arydata, arydata.length, "darsuk" );
n._setdata( n.ar, arr, arr.length, "darsuk" );

  load2( arydata ) {
    this.ar = arydata;
n.ar = arydata;


*/





function pm() {
  print( process.memory() );
}







function storyBoardRB( nTimes ) {
 
var obj    = [ n.alloff, showRB, wait3, function(){fadeAll(20,10);} ];
var dDelay = [ 10,         3000, 1700, 3000 ];
    
  var time=1000;
  var nLoops = nTimes;
  var nLoops = 3;
  
//n  do {
      console.log("L[1480] " + nLoops + " ***********   ********** " + nLoops );

  for( var i=0; i<obj.length; i++ )
  {
    console.log("        ");
    console.log("        ");
    console.log("        ");
    time+= dDelay[i];
     var intervalVar = n.interval(obj[i], time, 1);
    
  }
//n  } while ( nLoops-- >= 0 );

//  return( "done" );
//  return( true );
  
  
var nSum = 0;
  for( var i=0; i<dDelay.length; i++ )
  {
 //   debugger;
    nSum+= dDelay[i];
    
  }
  
  return nSum;



//storyBoard()
}









// Code from sparkle


var colorRGB3 = { r:255, g:0, b:127 };
var colorRGB4 = { r:95, g:220, b:127 };
var colorTemp = { r:255, g:0, b:127 };



function setColorSparkle() {
  
   colorTemp = colorRGB4;
  colorRGB4 = colorRGB3;
  colorRGB3 = colorTemp;
}







function onTimer() {
  sparkle();
  require("neopixel").write(B15, arr);
}

var sI;

function st() {
  sI = setInterval(onTimer, 50);
}

function ci() { clearInterval( sI ); }

  var randomPixel = 0;
  var nC = 0;
//  var nA = new Array(8);
  var nA = new Array(0,0,0,0, 0,0,0,0, 0,0);


function sparkle() {

  var ran = 0;
//  var randomPixel = 0;
  var nCount = 990;
//  var nA = new Array(8);
  
  nC++;
//  if( nC > 29 ) kill();
  
  do {
//    console.log( "L[818]   " );
//    console.log( "   " );
//    console.log( "   " );
    
    
    do {
//      ran = random(8);                // Pick a new random pixel

    //Both included
//    ran = Math.floor(Math.random() * (8+1));
    ran = Math.floor(Math.random() * 8);
    
//S    console.log( "L[818] ran[" + (ran).toString() + "] " );
      
//    } while(ran == randomPixel);       // but not the same as last 
    } while(randomPixel == ran);       // but not the same as last 

//    console.log( "L[822] ran[" + (ran).toString() + "] " );
//    console.log( "L[822]                       ran[" + (ran).toString() + "] " );
randomPixel = ran;
//S     console.log( "L[822]             nA[" + nA.toString() + "] " );
   
    
//    nA[ran]+= 1;
        nA[ran] =     nA[ran] + 1;
    
 var idx = 0;
//  debugger;
    k();
    
//  for( var i=0; i<aryRainbowHex.length; i++ ) {
  for( var i=0; i<8; i++ ) {

//     arr[i+0] = 0;
  //   arr[i+1] = 0;
    // arr[i+2] = 0;

    
    
//    console.log( "L[833] i[" + (i).toString() + "] " );
    
    if( i == ran )
    {
      var ik = 6;
      if( RGBSEQ == "GRB" )
    {
//      var g = fetch( aryRainbowHex[ik], "g" );
  //    mapone( 4, colorRGB4 ); 
      var g = colorRGB4.g;
//      console.log( "L[846] g " + g );

    arr[idx++] = g;
//    console.log( "L[846a] arr[" + (idx-1).toString() + "] " + arr[idx-1] );

//      var r = fetch( aryRainbowHex[ik], "r" );
        var r = colorRGB4.r;
//    console.log( "L[846] r " + r );
      
      arr[idx++] = r;
//    console.log( "L[846b] arr[" + (idx-1).toString() + "] " + arr[idx-1] );

//      var b = fetch( aryRainbowHex[ik], "b" );
            var b = colorRGB4.b;

//      console.log( "L[846] b " + b );
      
      
      arr[idx++] = b;
//    console.log( "L[846c] arr[" + (idx-1).toString() + "] " + arr[idx-1] );
    }  
    
    }
    else
    {
     idx++;
      idx++;
      idx++;
    }
    
  //for  
  }
    
    
    
  {
  
//  require("neopixel").write(B15, arr);
  }
  
//??    var t=getTime()+3;while(getTime()<t);

//        setTimeout('' , 1000);
//??setTimeout('console.log("Hello World");', 400);
//    setTimeout(function () {
//  console.log("Hello World");
//}, 1000);

    
  //do  
  } while( nCount++ < 8 );
  
  
  
}


function s() { sparkle(); }






function ta4() {
    console.log("L[1347] B4    ### ta4() " );

  var options = { 'pinLedTest':[A5]
    ,'pinAryNeopixel':[B5,B15],'pinAryNeoIdx':1
    ,'pinAryLedTest':[A3,A4,A5],'pinAryLedTestIdx':2
    ,'useGamma':true,'brightness':70
//    ,'optionBase':OPTION_BASE_ZERO };
};
  var n = new NeopixelCore( options );
  n.alloff();

  
  
  
  
 /***SAVE orig sparkle 
  //ref 907   var funcs = [fss,fk,fsf,fk],
//var obj    = [ st,     ci, alloff, setColorSparkle, wait3sec, st,   ci, alloff, setColorSparkle, wait3sec ];
var obj    = [ st,     ci, n.alloff, setColorSparkle, wait3, st,   ci, n.alloff, setColorSparkle, wait3 ];
//var dDelay = [ 1000, 3000,     10,              10,       10, 20, 4000,     20,              10,       20 ];
var dDelay = [ 1000, 3000,     10,              10,    3000, 20, 4000,     20,              10,     3000 ];
***/
  
  
  
var obj    = [ n.alloff, setColorSparkle, step, wait3 ];
var dDelay = [ 10,       10,              1000, 1000 ];
  
  
  
  
  
  
//  setColorSparkle
  
  var time=1000;
  /*
  var intervalVar = interval(obj[0], (time=time+0), 1);
    console.log("L[1347a] Aft    ### ta()  obj[0] " + obj[0] );
    console.log("L[1347ab] Aft    ### ta()  obj[0] " + obj[0].name );
    console.log("L[1347abc] Aft    ### ta()  obj[0] " + obj[0].toString() );
  var intervalVar = interval(obj[1], (time=time+3000), 1);
  var intervalVar = interval(obj[2], (time=time+1000), 1);  
  
  var intervalVar = interval(obj[3], (time=time+1000), 1);
*/
  /*
  time+=1000;
  var intervalVar = interval(obj[0], time, 1);
  time+=3000;
  var intervalVar = interval(obj[1], time, 1);
*/
  var nLoops = 3;
  
//n  do {
      console.log("L[1480] " + nLoops + " ***********   ********** " + nLoops );

  for( var i=0; i<obj.length; i++ )
  {
    time+= dDelay[i];
     var intervalVar = n.interval(obj[i], time, 1);
    
  }
//n  } while ( nLoops-- >= 0 );

//  return( "done" );
//  return( true );
  
  
var nSum = 0;
  for( var i=0; i<dDelay.length; i++ )
  {
 //   debugger;
    nSum+= dDelay[i];
    
  }
  
  return nSum;
}
  

function wait3() {
//     var intervalVar = interval(function(){}, 3000, 1);
      console.log("L[1547] wait3() #############" );

}




var intv = 0;

function ta4a() {
  
//    for( var i=0; i<3; i++ )
    {
//  intv = setInterval( function(){ ta4(); }, 9000 );
//      t9();
    }
  
  var time = 11000;
  var time = 14100;
  var time = 4100;
  var time = 300;
//    for( var i=0; i<3; i++ )
  {
 //   time+= dDelay[i];
     var intervalVar = n.interval(ta4, time, 15);
    
  }

}

function t9() { clearInterval( intv ); }






function intervalX(func, wait, times){

console.log("L[449] wait: " + wait );
console.log("L[431] times: " + times );
                 console.log("L[1207] func typeof " + typeof func );          
  
    var interv = function(w, t){
      
      if( t <= 0 )
        return 'done';
      
        return function(){

          if(typeof t === "undefined" || t-- > 0){

              
console.log("L[1201] B4 setTimeout()  w t  " + w + "  t: " + t );
                setTimeout(interv, w);
              
            
/*            
console.log("L[1203] Aft setTimeout()    ****");
                try{
//                    func.call(null);
console.log("L[1205] call()    ****");
                  wait1sec();
 //                 wait3sec();
             //     wait05sec();
                  step();
                  copy();
                 //  wait3sec();
                }
                catch(e){
console.log("L[1225] catch()    ***********" + e.toString());
                    t = 0;
                    throw e.toString();
                }
*/            
            
            
            
               try{
console.log("L[1239] try()    B4 func.call " );
                 
//                    func.call(null);
//                   var a = func();
                   var a = func;

                 console.log("L[1243] Aft func.call    ###");          
                 console.log("L[1243] Aft func.call    ### " + typeof func + "  " + typeof a );          
                 func.call(null);
console.log("L[1239] try()    Aft func.call " );
                 
                }
                catch(e){
                    t = 0;
console.log("L[1243] catch()    ***********" + e.toString());
                    throw e.toString();
                }
            
            
            
            
            
            

            } // if

          else
          {
            
           interv = "done"; 
          }
          
          
          
       console.log("L[1219] Aft if    ###");          
  
          console.log("L[1247] t w " + t + "  " + w );
            
        }; // return function()

 //unreach       console.log("L[453] B4    ###");

      
      
    // var interv = function(w, t)
    }(wait, times);

  
  
  try {
    console.log("L[1282] B4    ### interv " + typeof(interv) );
    console.log("L[1283] B4    ###");
          console.log("L[1283] times wait " + times + "  " + wait );
if( interv !== 'undefined' )
    setTimeout(interv, wait);

    console.log("L[1284]Aft    ###");
    console.log("L[1301] Aft    ### interv " + typeof(interv) );
     
  }                catch(e){
console.log("L[1290] catch()    ***********" + e.toString());
                    throw e.toString();
                }

    
    
    
}





function ao() { n.alloff(); }




//function k() { alloff(); }

function k() {
    for(var i=0;i<this.NUM_PIXELS*3;i++) {
    arr[i] = 0;
  }

  require("neopixel").write(neo.pinNeo, arr);
}




function alloff() {
  // LED strip
  for(var i=0;i<NUM_PIXELS*3;i++) {
    arr[i] = 0;
  }
  
  //debugger;
  
  require("neopixel").write(B15, arr);
}


//function k() { allOff(); }
// require("neopixel").write(B15, [0,0,0]); // turn first LED Red



function kill() {
  ci();
  k();
  
  //test infinite
  cl();
  ao();
}

//setWatch(kill, BTN, { repeat: true, edge:'falling' });


E.on('init',function() {
  kill();
//  setWatch(kill, BTN1, { repeat: true, edge:'falling' });
//?
  setWatch(kill, BTN1, {repeat:true, edge:"both", irq:true});
  
  setWatch(kill, BTN, { repeat: true, edge:'falling' });

  //http://www.espruino.com/InlineC
  //setWatch(c.press, BTN1, {repeat:true, edge:"both", irq:true});
  
});





//[eof]

