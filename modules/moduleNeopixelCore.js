/* Copyright (c) 2018 Robin G Cox  See the file LICENSE for copying permission */
/* Neopixel library for Espruino tm using WS2811 WS2812
 * Enables rapid development of Neopixel projects providing underlying methods for color and palettes
 *
 *      File:  moduleNeopixelInit.js
 *   Project:  Neopixel library for Espruino tm
 *    Module:  neopixelSetup{}  neopixelSetupEffects{}  neopixelSetupDevel{}
 *    Author:  Robin G. Cox
 * Copyright:  Robin G. Cox © 2018 owner Sleuthware All rights reserved
 *   Version:  1.0.a.18330904
 *   Created:  Sat 2018.09.01
 *   Contact:  @Robin   http://forum.espruino.com/profiles/116219/
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
 *
 * Usage:
 * require("neopixelInit").neopixelInit(options);
 * var options = { 'pinLedTest':'[A5]','pinNeopixel':pinAryNeopixel[1],'optionBase':OPTION_BASE_ZERO };
 * var neo = new neopixelInit( options );
 * Type: help()  or  h()  for accessor methods list
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





//var exports={};


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




const NUM_PIXELS = 8;

var TT = { NUM_PIXELS : 8 };


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
  
  DEF_BRIGHTNESS   : 70,
  MAX_GAMMA        : 256,

  
  CONSTANTS : 0x023   // description
};


var objRGB = [255, 0, 0];

var colorRGB = {
  r: 255,
  g: 0,
  b: 0
};

var objR = colorRGB.r;
var objG = colorRGB.g;
var objB = colorRGB.b;


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
/*
exports = colorRGBRainbowRed;
exports = colorRGBRainbowOrn;
exports = colorRGBRainbowYel;
exports = colorRGBRainbowGrn;

exports = colorRGBRainbowAqu;
exports = colorRGBRainbowBlu;
exports = colorRGBRainbowPur;
exports = colorRGBRainbowPnk;
*/
exports.aryRainbow = aryRainbow;




//const MAX_GAMMA = 256;

//const DEF_BRIGHTNESS = 70;






class Color {

  constructor(obj, name) {


    if (typeof obj == "string") {
      
      // See if is a name or a specified RGB or hex value
      var isValid = this.isValidRGB(obj);

      if( isValid ) {
         this.colorName = "notassigned";
         this.colorRGB = obj;
  
  
        if( typeof name == 'string' ) {
          this.colorName = name;
        }
  
  
           console.log( "Color: obj " + obj );

            this.colorR = obj.substring(0, 2);
            this.colorG = obj.substring(2, 4);
            this.colorB = obj.substring(4, 6);


      /*
      var cvrt = this.cvrtHexStToHexN(obj);
      if (typeof cvrt == "number") {
        
        
           console.log( "Color: cvrt " + cvrt );
         
        
            this.colorName = "notassigned";
//            this.colorRGB = cvrt.substring(2, 8);
      }
*/
      
      

    // if( isValid )
    } else {
        
      
      
      var objRGB = JSON.parse(JSON.stringify(RGB));
      var key;
//Sconsole.log( "Color: objRGB " + objRGB );

      for (key in objRGB) {
        if (objRGB.hasOwnProperty(key)) {

          if (obj.toUpperCase() == key.toUpperCase()) {
            console.log("Color: " + obj.toUpperCase() + "  " + objRGB[key]);

            if (objRGB[key].length != 6) {
              return (NaN);
            }

//Sconsole.log( "Color: match key " + key );

            this.colorName = key;
            this.colorRGB = objRGB[key];

            this.colorR = objRGB[key].substring(0, 2);
            this.colorG = objRGB[key].substring(2, 4);
            this.colorB = objRGB[key].substring(4, 6);
/*
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
*/


          }

        //if (objRGB.hasOwnProperty(key))
        }
      //for (key in objRGB)  
      }



    //else  if( isValid )   
    }
//            this.colorR = objRGB[key].substring(0, 2);
//            this.colorG = objRGB[key].substring(2, 4);
//            this.colorB = objRGB[key].substring(4, 6);

    //if (typeof obj == "string")
    }
    
//S    console.log( "Color: match aft else" );

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
    
    
    
    
    
    this.colorA = "FF";
    this.colorARGB = "ffffffff";


    return (this.colorObjJson);
  //constructor(obj)    
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
  
  
  

  cvrtHexToDec(hex) {

    if (typeof(hex) == "number") hex = hex.toString(16);
    if ((typeof(hex) != "string") && (typeof(hex) != "number")) return ("NaN");
    var shex = hex;
    var s = hex.substring(0, 2);
    if (s != "0x") {
      shex = "0x" + hex.toString(16);
    }
    var decimal = Number(shex);
    return decimal;
  }


  cvrtDecToHex(decimal, padding) {
    var hex = Number(decimal).toString(16);
    padding = typeof(padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
      hex = "0" + hex;
    }

    return hex;
  }

  cvrtHexStToHexN(hex) {
    var shex = NaN;
    if (typeof(hex) == "string") {
      var s = hex.substring(0, 2);
      if (s != "0x") {
        shex = "0x" + hex.toString(16);
      }

    }
    return this.cvrtHexToDec(shex);
  }

  
//  https://stackoverflow.com/questions/8027423/how-to-check-if-a-string-is-a-valid-hex-color-representation
  isValidRGB(val){
  return( (typeof val == "string") && (val.length == 6)
         && !isNaN( parseInt(val, 16) ) );
  }
  

}
exports.Color = Color;











class NeopixelInit {




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

    options.brightness = options.brightness || C.DEF_BRIGHTNESS;
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
//const MAX_GAMMA = 256;
    this.aryGamm = new Uint8ClampedArray(C.MAX_GAMMA);


    this.ad = new Uint8ClampedArray(nArySizeRGB);
    this.ar = new Uint8ClampedArray(nArySizeRGB);
    this.ab = new Uint8ClampedArray(nArySizeRGB);
    this.ac = new Uint8ClampedArray(nArySizeRGB);

    this.ag = new Uint8ClampedArray(C.MAX_GAMMA);



    this.brightness = options.brightness;
    this.useGamma = options.useGamma;



    this.NUM_PIXELS = options.numPixels;



    this.gam();
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




  mapBrightness() {
    var idx = 0;
    for (var i = 0; i < this.ar.length; i++) {

      var nRGBCur = this.ar[i];
      var nPcntBr = Math.floor(nRGBCur * this.brightness / 100);
      this.ab[i] = nPcntBr;
      //make          arr[i] = aryGamma[ nNewG ];


//S      console.log("L[491] nPcntBr " + this.ab[i]);

    }
  }


  applyGamma() {
    for (var i = 0; i < this.ab.length; i++) {
      var nRGBCur = this.ab[i];
 //S     console.log("L[504] nRGBCur " + this.ab[i]);


      //        this.ac[i] = g.get(nRGBCur);
      //      console.log( "L[619] g.get(i) " +  g.get(nRGBCur) );


      this.ac[i] = this.ag[nRGBCur];
 //S     console.log("L[619] this.ac[i] " + this.ac[i]);



    }


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




  //gamma correction
  //https://cdn-learn.adafruit.com/downloads/pdf/led-tricks-gamma-correction.pdf




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

    var aryRainbowPrep = new Uint8ClampedArray(this.getlenarydisp());
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

    for (var i = 0; i < aryRainbowPrep.length; i++) {



      //      this.aryPrep[i] = aryRainbowPrep[i];
    }



    return (aryRainbowPrep);
    //buildRainbow() 
  }




  //neopixelInit.prototype.mapone = function( offset, color ) {
  mapone(offset, color) {

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


  turnon(offset, color) {
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

  
  fadeon(offset, color) {
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
  
  
  
  
  
  
  

  setdata(obj) {
    this.ar = obj.slice(0);
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

    this.ad = this.ar.slice(0);




  }




  update() {




    this.mapBrightness();
    this.applyGamma();


//S    console.log("L[756] update " + this.useGamma);


    this.ad = (this.useGamma) ? this.ac.slice(0) : this.ab.slice(0);


    require("neopixel").write(this.pinNeopixel, this.ad);


  }
  updatefade() {
    this.applyGamma();
    this.ad = (this.useGamma) ? this.ac.slice(0) : this.ab.slice(0);
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

  //dispA()
  }



//class NeopixelInit{}
}




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
NeopixelInit.prototype.CONST = {
  GAMMA : C.MAX_GAMMA
  
};


exports.NeopixelInit = NeopixelInit;
//exports = CONST;



function interval(func, wait, times){

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
//interval

exports.interval = interval;



//var RGB = require("https://github.com/sleuthware/EspruinoDocs/blob/master/modules/moduleNeopixelColors.js");







//[eof]

