/* Copyright (c) 2018 Robin G Cox  See the file LICENSE for copying permission */

/* Work in progress - to avoid change duplication - contact author first */

/* Neopixel library for Espruino tm using WS2811 WS2812
 * Enables rapid development of Neopixel projects providing underlying methods for color,
 *   palettes and effects, and including fade in/out, brightness and Gamma correction
 *
 *      File:  NeopixelCore.js
 *   Project:  Neopixel library for Espruino tm
 *    Module:  NeopixelCore{}  Color{}  Colors{}  NeopixelEffects{}  NeopixelEx{}
 *    Author:  Robin G. Cox
 * Copyright:  Robin G. Cox © 2018 owner Sleuthware All rights reserved
 *   Version:  1.0.b.18441028
 *   Created:  Sat 2018.09.01
 *   Contact:  @Robin   http://forum.espruino.com/microcosms/116/    Home >> Official Espruino Boards >> JavaScript
 * Technical:  Note that Official Espruino Boards are required for this module as keyword 'compiled' is used throughout
 *    Tested:  Espruino 1v99 on Pico_R1_3 - See http://www.espruino.com/Compilation 'compiled'
 *Dependency:  Requires at a minimum 1v99 - System module require("neopixel") - hdwr SPI MOSI pin(s)
 *   Updates:  Sat 2018.10.20 rgc  Deployed to GitHub initial module testing 1.0.a.18360904
 *             Sat 2018.10.20 rgc  Completed header block and JSDoc comments 1.0.a.18421020
 *             Sun 2018.10.28 rgc  Added flat string mod for timing comparison 1.0.b.18441028
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
 * Portions adapted from C++ code file and article from:
 * Adafruit_NeoPixel.cpp
 * https://learn.adafruit.com/
 * hsv2rgb.cpp
 * http://fastled.io/
 *
 * Naming and Coding Conventions
 * https://docs.npmjs.com/misc/coding-style
 * While every attempt was made to conform to npm's conventions author reserves the right
 *  to maintain other accepted best practices in order to resolve ambiguity
 * https://www.w3.org/wiki/JavaScript_best_practices
 * Author adopts Hungarian notation naming scheme having the advantage being that you know
 *  what something is supposed to be and not just what it is. This means that any individual
 *  that peeks under the covers will quickly grasp what that code block is doing. Pascal case
 *  is used for class names and Camel case for function names. I personally detest a single block
 *  delimiter per line as locating the closing delimiter can be daunting with nested statements.
 *  They are used here, as the WebIDE requires them to enter code lines in the console left-hand pane.
 *
 * Future: HSL to RGB, smaller footprint for Pixl, pin array selection, simultaneous pin output,
 *  hopeful resolution to flat string-compiledC speed improvement, "compiled"; keyword anomaly,
 *  multi-step fade smoothing, transitions one color to another color
 *
 *
 * Usage:
 *  Create an instance specifically for a Pico with default output on pin B15 for an eight
 *   Neopixel display without Gamma correction and an initial brightness at seventy percent
 *   Note: A Pico has three SPI MOSI pins defined as B5,B15,A7
 *
 *  var NeopixelCore = require("NeopixelCore");
 *  var options = {  'pinLed':[A5]
 *       ,'pinAryNeopixel':[B5,B15,A7], 'pinAryNeoIdx':1
 *       ,'useGamma':false, 'nBrightness':70
 *       ,'numPixels':8  };
 *  var n = new NeopixelCore( options );
 *  n.setdata( rainbow );
 *  n.update( "fade" );
 *
 *  n.help();  for accessor methods list
 *
 * opt:
 *  var neo = (require("NeopixelCore"))(options);
 *  runStoryBoard( neo );
 *
 */


// Constants global

var C = {
  OPTION_BASE_ZERO : "Zero",
  OPTION_BASE_ONE  : "One",

  BRIGHTNESS_DEF : 70,
  NUM_PIXELS_DEF : 8,

  PIN_PICO_LED : [A5],
  PIN_PICO_NEOPIXEL : [B15],

  RGB_SEQ_GRB : "GRB",
  RGB_SEQ_RGB : "RGB",
  RGB_SEQ_WS2812 : "GRB",
  RGB_SEQ_WS2811 : "RGB",

  GAMMA_MAX     : 256,
  GAMMA_MAX_IN  : 255,
  GAMMA_MAX_OUT : 255,
  GAMMA_FACTOR  : 2.4,

  UQ : 42  // Ultimate question the answer to life
};



// Constants local

const colorRGBRainbowRed = { r: 255, g: 0, b: 0 };
const colorRGBRainbowOrn = { r: 171, g: 85, b: 0 };
const colorRGBRainbowYel = { r: 171, g: 171, b: 0 };
const colorRGBRainbowGrn = { r: 0, g: 255, b: 0 };
const colorRGBRainbowAqu = { r: 0, g: 171, b: 85 };
const colorRGBRainbowBlu = { r: 0, g: 0, b: 255 };
const colorRGBRainbowPur = { r: 85, g: 0, b: 171 };
const colorRGBRainbowPnk = { r: 171, g: 0, b: 85 };

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







/**
 * Class NeopixelCore contains underlying methods for color, palettes and effects,
 *  and including fade in/out, brightness and Gamma correction.
 * @class
 *
 * @constructor
 *
 * @param   {object}   options   A Javasciprt Object consisting of configuration parameters and their arguments
 *
 *
 * @property   {number}   pinLed        A specific output pin for LED status indication - ex [A5] - If specified, blocks array specification during init
 * @property   {number}   pinAryLed     (opt) An array of pins that may be used for LED status indication
 * @property   {number}   pinAryLedIdx  (opt) The index into the array of pins specifying the current seleted LED output pin
 *
 * @property   {number}   pinNeopixel   A specific Neopixel output pin - ex [B15] - If specified, blocks array specification during init - For hdwr specific devices an SPI MOSI pin
 * @property   {number}   pinAryNeopixel   (opt) An array of pins that may be used for Neopixel output
 * @property   {number}   pinAryNeoIdx  (opt) The index into the array of pins specifying the current seleted Neopixel output pin
 *
 * @property   {number}   numPixels     Count of the number of Neopixels to output data to - typically a meter strip ex 1,8,30,60,144,300
 * @property   {string}   rgbSeq        Constant used to indicate RGB format mapped for hardware type - ex see constant  C.RGB_SEQ_WS2812
 *
 * @property   {number}   nBrightness   During construtor initialization set the output brightness - range 0-100 a percentage of full brightness
 *
 * @property   {boolean}  useGamma      Display the output using Gamma corrected values
 * @property   {number}   gfactor       Factor used to calculate Gamma corrected values - range 1.0-3.6  typ 2.4-2.6
 */
class NeopixelCore {


  constructor( options ) {

    if( typeof options != "object" ) options = {};
    // Future option base one
    options.optionBase = options.optionBase || C.OPTION_BASE_ZERO;
    options.pinLed = options.pinLed || C.PIN_PICO_LED;
    options.pinAryLed = options.pinAryLed || C.PIN_PICO_LED;
    options.pinAryLedIdx = options.pinAryLedIdx || 0;
    var nPinLed = options.pinAryLed[options.pinAryLedIdx];
    this.pinLed = nPinLed;
    this.pinAryLed = options.pinAryLed;
    this.pinAryLedIdx = options.pinAryLedIdx;

    options.pinNeopixel = options.pinNeopixel || C.PIN_PICO_NEOPIXEL;
    options.pinAryNeopixel = options.pinAryNeopixel || C.PIN_PICO_NEOPIXEL;
    options.pinAryNeoIdx = options.pinAryNeoIdx || 0;
    var nPinNeo = options.pinAryNeopixel[options.pinAryNeoIdx];
    this.pinNeopixel = nPinNeo;
    this.pinAryNeopixel = options.pinAryNeopixel;
    this.pinAryNeoIdx = options.pinAryNeoIdx;

    options.numPixels = options.numPixels || C.NUM_PIXELS_DEF;
    options.rgbSeq = options.rgbSeq || C.RGB_SEQ_WS2812;
    options.nBrightness = options.nBrightness || C.BRIGHTNESS_DEF;
    options.useGamma = options.useGamma || false;
    options.gfactor = options.gfactor || C.GAMMA_FACTOR;


    var nArySizeRGB = options.numPixels * 3;

    var strg = E.toString({data : 0, count : C.GAMMA_MAX});
    var strd = E.toString({data : 0, count : nArySizeRGB});
    var strr = E.toString({data : 0, count : nArySizeRGB});
    var strb = E.toString({data : 0, count : nArySizeRGB});
    var strc = E.toString({data : 0, count : nArySizeRGB});
    var strf = E.toString({data : 0, count : nArySizeRGB});

    this.fsd = strd;
    this.fsf = strf;

    this.ad = new Uint8ClampedArray(E.toArrayBuffer(strd));
    this.ar = new Uint8ClampedArray(E.toArrayBuffer(strr));
    this.ab = new Uint8ClampedArray(E.toArrayBuffer(strb));
    this.ac = new Uint8ClampedArray(E.toArrayBuffer(strc));
    this.af = new Uint8ClampedArray(E.toArrayBuffer(strf));
    this.ag = new Uint8ClampedArray(E.toArrayBuffer(strg));


    this.NUM_PIXELS = options.numPixels;
    this.NUM_ELEMENTS = nArySizeRGB;
    this.RGB_SEQ = options.rgbSeq;
    this.nBrightness = options.nBrightness;
    this.useGamma = options.useGamma;
    this._setGamma( C.GAMMA_MAX_IN, C.GAMMA_MAX_OUT, options.gfactor );
  }




/**
 * ledon() illuminates the current specified LED -
 *   To drive the LED not Neopixel we need to make the output Lo - LED Anode 3V - e.g. on::reset()
 *
 * @param   {null}   null  There are no parameters
 *
 * @returns {null}
 */
  ledon() {
    this.pinLed.reset();
  }
/**
 * ledoff() darkens the specified LED
 *   To darken the LED not Neopixel we need to make the output Hi - LED Anode 3V - e.g. off::set()
 *
 * @param   {null}   null  There are no parameters
 *
 * @returns {null}
 */
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
    return this.RGB_SEQ;
  }

  getBrightness() {
    return this.bightness;
  }


  getColorPixel( offset ) {
    var idx = offset*3;
    var vals = {};
    vals.r = this.ar[idx+0];
    vals.g = this.ar[idx+1];
    vals.b = this.ar[idx+2];
    // vals.n = this.colorName;
    var colorObjJson = JSON.parse(JSON.stringify(vals));
    return( colorObjJson );
  }

  getColorPixelB( offset ) {
    var idx = offset*3;
    var vals = {};
    vals.r = this.ab[idx+0];
    vals.g = this.ab[idx+1];
    vals.b = this.ab[idx+2];
    // vals.n = this.colorName;
    var colorObjJson = JSON.parse(JSON.stringify(vals));
    return( colorObjJson );
  }


/**
 * setBrightness() sets the output brightness as a percentage of full range. Function update() may follow to output immediately
 *
 * @param   {number}   obj   A perentage in the range 0-100
 *
 * @returns {null}
 */
  setBrightness( obj ) {
    this.nBrightness = obj;
  }

  setUseGamma( obj ) {
    this.useGamma = obj;
  }

  getUseGamma() {
    return this.useGamma;
  }


/**
 * setPinLed() reassigns the current LED output pin to the one specified at the array index
 *
 * @param   {number}   idx    Index into the array of LED pins previously set
 *   May only be set when an array of output pins is supplied during initialization, or
 *   an error is thrown
 *
 * @returns {null}
 */
  setPinLed( idx ) {
    try {
      if( ( idx < this.pinAryLed.length ) && ( this.pinAryLed.length >=0 ) ) {
        this.pinAryLedIdx = idx;
        var nPin = this.pinAryLed[this.pinAryLedIdx];
        this.pinLed = nPin;
      }
    } catch(e) {
      console.log( "L[387] setPinLed() catch() idx " + idx + " " + e.toString() );
      throw e.toString();
    }
  }

/**
 * setPinNeo() reassigns the current LED output pin to the one specified at the array index
 *
 * @param   {number}   idx    Index into the array of LED pins previously set
 *   May only be set when an array of output pins is supplied during initialization, or
 *   an error is thrown
 *
 * @returns {null}
 */
  setPinNeo( idx ) {
    try {
      if( ( idx < this.pinAryNeopixel.length ) && ( this.pinAryNeopixel.length >=0 ) ) {
        this.pinAryNeoIdx = idx;
        var nPin = this.pinAryNeopixel[this.pinAryNeoIdx];
        this.pinNeopixel = nPin;
      }
    } catch(e) {
      console.log( "L[409] setPinNeo() catch() idx " + idx + " " + e.toString() );
      throw e.toString();
    }
  }


  _mapBrightness() {
    var idx = 0;
    for( var i=0; i<this.ar.length; i++ ) {
      var nRGBCur = this.ar[i];
      var nPcntBr = Math.floor( nRGBCur * this.nBrightness / 100 );
      this.ab[i] = nPcntBr;
      this.af[i] = nPcntBr;
    }
  }


  _applyGamma() {
    for( var i=0; i<this.ac.length; i++ ) {
      var nRGBCur = this.af[i];
      this.ac[i] = this.ag[nRGBCur];
    }
  }



  _aryinit() {
    for( var i=0; i<this.NUM_ELEMENTS; i++ ) {
      this.ad[i] = 0;
      this.ar[i] = 0;
      this.ab[i] = 0;
      this.ac[i] = 0;
      this.af[i] = 0;
    }
  }


// **
// * Gamma Correction
// * _setGamma() creates the gamma correction values required for a more pleasing visual output
// *
// * @param   {number} gin     Top end of INPUT range     0 - 255
// * @param   {number} gout    Top end of OUTPUT range    0 - 255
// * @param   {number} gfactor Gamma correction factor  1.0 - 3.5
// *
// * @returns {null}
// *
// * Reference
// * {@link https://cdn-learn.adafruit.com/downloads/pdf/led-tricks-gamma-correction.pdf}
// *
  _setGamma( gin, gout, gfactor ) {
    "compiled";
    var gamma = ( (gin < 1.0) || (gin > 5.0) ) ? C.GAMMA_FACTOR : gfactor;
    var max_in = ( (gin < 0) || (gin > C.GAMMA_MAX_IN) ) ? C.GAMMA_MAX_IN : gin;
    var max_out = ( (gout < 0) || (gout > C.GAMMA_MAX_OUT) ) ? C.GAMMA_MAX_OUT : gout;

    for( var i=0; i<=max_in; i++ ) {
      //if ((i & 15) === 0) console.log("\n ");
      var resultpow = ( Math.pow(i / max_in, gamma) * max_out + 0.5 );
      var fmt = resultpow.toFixed(0);
      this.ag[i] = fmt;
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
 * {@link https://www.thecodeship.com/web-development/alternative-to-javascript-evil-setinterval/}
 */
  interval( func, wait, times ) {

    var interv = function( w, t ) {

    if( t <= 0 ) return 'done';

    return function() {

      if( typeof t === "undefined" || t-- > 0 ) {

        setTimeout( interv, w );

        try {
          func.call(null);
          // wait3sec();  step();
        } catch(e) {
          t = 0;
          throw e.toString();
        }

      } else {
        interv = "done";
      }
    };
    }( wait, times );

    try {
     if( interv !== 'undefined' )
        setTimeout( interv, wait );
    } catch(e) {
      throw e.toString();
    }

  }




/**
 * Function fade() will fade 'in'-'out' a specific Neopixels at the given step
 *
 * @param   {number}   idx    The Neopixel to fade at the specified offset
 * @param   {number}   nStep  The amount of change - max range 0-255
 * @param   {string}   inout  A constant representing fade towards black 'out' or to set color 'in'
 *
 * Output values are range limited to remain inside 0-255 including end points
 * @returns {null}
 */
  fade( idx, nStep, inout ) {
  "compiled";
    var offset = idx;
    var stepabs = ( inout == "out" ) ? nStep*(-1) : nStep;
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

    if( inout == "in" ) {
      var maxs = {};
      if( this.useGamma ) {
        maxs.r = this.ac[idx+0];
        maxs.g = this.ac[idx+1];
        maxs.b = this.ac[idx+2];
      } else {
        maxs.r = this.ab[idx+0];
        maxs.g = this.ab[idx+1];
        maxs.b = this.ab[idx+2];
      }

      if( vals.r < maxs.r )
        vals.r+= stepabs;
      if( vals.r > maxs.r ) vals.r = maxs.r;
      if( vals.r > 255 ) vals.r = 255;

      if( vals.g < maxs.g )
        vals.g+= stepabs;
      if( vals.g > maxs.g ) vals.g = maxs.g;
      if( vals.g > 255 ) vals.g = 255;

      if( vals.b < maxs.b )
        vals.b+= stepabs;
      if( vals.b > maxs.b ) vals.b = maxs.b;
      if( vals.b > 255 ) vals.b = 255;
    }

    this.af[idx+0] = vals.r;
    this.af[idx+1] = vals.g;
    this.af[idx+2] = vals.b;

    return( { 'r':vals.r, 'g':vals.g, 'b':vals.b } );
  }




  // Must loop at least one time

  _getMaxRGB( nStep ) {
  "compiled";
    var nRangeUpper = 1;
    var nStepsCalc  = 1;

    for( var idx=0; idx<this.NUM_PIXELS; idx++ ) {
      for( var i=0; i<3; i++ ) {
        var offset = (idx+i);
        var valRGB = ( this.useGamma ) ? this.ac[offset] : this.ab[offset];
        nRangeUpper = ( valRGB > nRangeUpper ) ? valRGB : nRangeUpper;
        nStepsCalc  = Math.ceil( nRangeUpper / nStep ) + 1;
      }
    }

    return { 'rangeUpper' : nRangeUpper, 'stepsCalc' : nStepsCalc };
  }




  _fadeall( nStep, inout ) {
  "compiled";

    for( var idx=0; idx<this.NUM_PIXELS; idx++ ) {
      var objRet = this.fade( idx, nStep, inout );
    }

    this.update("fade");
  }






  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
  //raw -> bright -> fade -> corr -> disp   ar->ab->af->ac->ad

/**
 * Function fadeall() will fade 'in'-'out' all the current visible Neopixels at a given rate and step
 *
 * @param   {number}   nDelay The duration between steps in milliseconds
 * @param   {number}   nStep  The amount of change at each delay interval - suggested 1-6
 * @param   {string}   inout  A constant representing fade towards black 'out' or fade to set color 'in'
 *
 * @returns {null}
 */
  fadeall( nDelay, nStep, inout ) {
  "compiled";
    var x = 0;
    var nWatchdog = 256;
    var nTimes = 256;

    if( nDelay < 0 ) nDelay = 0;
    var stepabs = ( inout == "out" ) ? nStep*(-1) : nStep;

    // Profiling
    //r t = getTime();
    //r elaspsed = 0;
    var countIntv = 0;
    var nRangeUpper = 1;
    var nStepCalc = 1;

    var objRet  = this._getMaxRGB( nStep );
    nRangeUpper = objRet.rangeUpper;
    nStepsCalc  = objRet.stepsCalc;
    nTimes = nStepsCalc + 1;

    if( inout.toLowerCase() == "out" )
    ( this.useGamma ) ? this.af.set( this.ac ) : this.af.set( this.ab );

    var intervalId = this.interval( ()=>{this._fadeall(nStep,inout);}, nDelay, nTimes );
  }





/**
 * buildRainbow() will create a palette of rainbow colors ROY-G-BIV
 *
 * @param   {null}   null  There are no parameters
 *
 * @returns {null}
 */
  buildRainbow() {
    var aryRGB = new Uint8ClampedArray( aryRainbow.length );
    aryRGB = aryRainbow;
    var aryRainbowPrep = new Uint8ClampedArray( aryRainbow.length*3 );

    var idx = 0;
    for( var i=0; i<aryRGB.length; i++ ) {

      if( this.getrgbseq() == C.RGB_SEQ_GRB ) {
        aryRainbowPrep[idx++] = aryRGB[i].g;
        aryRainbowPrep[idx++] = aryRGB[i].r;
        aryRainbowPrep[idx++] = aryRGB[i].b;
      } else {
        aryRainbowPrep[idx++] = aryRGB[i].r;
        aryRainbowPrep[idx++] = aryRGB[i].g;
        aryRainbowPrep[idx++] = aryRGB[i].b;
      }
    }

    return( aryRainbowPrep );
  }






/**
 * mapone() will set the desired Neopixel to the specified color
 * @func
 *
 * @param   {number}   offset  A value representing the position of the desired Neopixel to set color for
 * @param   {object}   color   A color representation in Javascript Object notation - see Color class
 *
 * @returns {null}
 *
 * Reference
 * More information on class Color used to create color objects in JSON notation
 * {@link https://github.com/espruino/EspruinoDocs/tree/master/modules/color.md}
 */
  mapone( offset, color ) {
  "compiled";
    var idx = offset * 3;
    switch( this.getrgbseq() )
    {
      case C.RGB_SEQ_GRB:
        this.ar[idx++] = color.g;
        this.ar[idx++] = color.r;
        this.ar[idx++] = color.b;
        break;

      case C.RGB_SEQ_RGB:
        this.ar[idx++] = color.r;
        this.ar[idx++] = color.g;
        this.ar[idx++] = color.b;
        break;
    }
  }




// FStr_
  _setdata( dest, src, size, id ) {
  "compiled";
    try {

      var addrsrc = E.getAddressOf(src,false);
      if(!addrsrc) throw new Error("Not a Flat String - _setdata src " + id + " " + src);

      var addrdest = E.getAddressOf(dest,false);
      if(!addrdest) throw new Error("Not a Flat String - _setdata dest " + id + " " + dest);

      compc.slice( addrdest, addrsrc, size );

    } catch( e ) {
      console.log( "[L790] _setdata() " + id + " " + e.toString() );
    }
  }










/**
 * Function load() assigns a RGB formatted string sequence to our Neopixel internal preparation array for output
 * @func
 *
 * @param   {number}   arydata  A sequence of RGB formatted values
 *
 * @returns {null}
 */
  load( arydata ) {
    this.ar.set( arydata );
  }


  FStr_load( arydata ) {
    this._setdata( this.fsr, arydata, arydata.length, "darsuk  load()" );
  }








//raw -> bright -> fade -> corr -> disp   ar->ab->af->ac->ad

/**
 * update() transfers the previously set RGB formatted string array to the SPI MSOI pin for output
 *
 * @param   {string}   fade    (opt) Flag indicating a special case for fade in/out - is only 'fade'
 *
 * @returns {null}
 */
  update(fade) {

    if( typeof fade == "undefined" ) {

      this._mapBrightness();

      if( this.useGamma ) this._applyGamma();

      //FStr_ (this.useGamma) ? this._setdata( this.fsd, this.fsc, this.NUM_ELEMENTS, "dadsac" ) : this._setdata( this.fsd, this.fsb, this.NUM_ELEMENTS, "dadsab" );
      ( this.useGamma ) ? this.ad.set( this.ac ) : this.ad.set( this.ab );
      ( this.useGamma ) ? this.af.set( this.ac ) : this.af.set( this.ab );

    } else {

      if( fade == "fade" ) {

        this.ad.set( this.af )
        // this._setdata( this.fsd, this.fsf, this.NUM_ELEMENTS, "dadsaf  update()" );
      }

    }
    require("neopixel").write(this.pinNeopixel, this.ad);
  }





/**
 * alloff() darkens all illuminated Neopixels
 *
 * @param   {null}   null  There are no parameters
 *
 * @returns {null}
 */
  alloff() {
    for( var i=0; i<this.NUM_ELEMENTS; i++ ) {
      this.ad[i] = 0;
    }
    require("neopixel").write(this.pinNeopixel, this.ad);
  }



/**
 * allon() illuminates all previously color assigned Neopixels
 *
 * @param   {null}   null  There are no parameters
 *
 * @returns {null}
 */
  allon() {
    this.update();
  }


/**
 * setall() assigns the specified color to all Neopixels
 *
 * @param   {object}   Color   An instance of the Color class
 *
 * @returns {null}
 */
  setall( color ) {
    "compiled";
    for( var i=0; i<this.NUM_PIXELS; i++ ) {
      this.mapone( i, color );
    }
  }



  help() {

    console.log( "    " );

    console.log( "  https://github.com/espruino/EspruinoDocs/tree/master/modules/Colors.md");

    console.log( "  const RGB = require(\"Colors\");" );
    console.log( "  var Color = require(\"Color\");" );
    console.log( "  var color = new Color(\"BlueViolet\");" );
    console.log( "  X11Color names swatches   https://www.w3.org/TR/css-color-3/" );

    console.log( "    " );
    console.log( "    " );

    console.log( "  https://github.com/espruino/EspruinoDocs/tree/master/modules/NeopixelCore.md");

    console.log( "  var NeopixelCore = require(\"NeopixelCore\");" );
    console.log( "  var options = {  'pinLed':[A5]" );
    console.log( "       ,'pinAryNeopixel':[B5,B15,A7], 'pinAryNeoIdx':1" );
    console.log( "       ,'useGamma':false, 'nBrightness':70" );

    console.log( "       ,'numPixels':8  };" );
    console.log( "  var n = new NeopixelCore( options ); " );
    console.log( "  n.setdata( rainbow );" );
    console.log( "  n.update( \"fade\" );" );

    console.log( "    " );
    console.log( "    " );

    console.log( "  https://github.com/espruino/EspruinoDocs/tree/master/tutorials/neopixel/NeopixelCore.html");
    console.log( "    " );

    console.log( "  fade( idx, nStep, inout )" );
    console.log( "  fadeall( nDelay, nStep, inout )" );
    console.log( "  interval( func, wait, times )" );
    console.log( "  load( array )" );
    console.log( "  mapone( offset, color )" );
    console.log( "  update( 'fade' )" );
    console.log( "    " );

  }


}
//class NeopixelCore{}

exports = NeopixelCore;
exports.C = C;


// http://forum.espruino.com/conversations/327037/


//[eof]
