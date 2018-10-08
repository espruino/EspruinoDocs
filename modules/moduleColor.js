/* Copyright (c) 2018 Robin G Cox  See the file LICENSE for copying permission */

/* Neopixel library for Espruino tm using WS2811 WS2812
 * Enables rapid development of Neopixel projects providing underlying methods for color, 
 *   palettes and effects, and including fade in/out, brightness and Gamma correction
 *
 *      File:  NeopixelCore.js
 *   Project:  Neopixel library for Espruino tm
 *    Module:  NeopixelCore{}  NeopixelColors{}  NeopixelEffects{}
 *    Author:  Robin G. Cox
 * Copyright:  Robin G. Cox © 2018 owner Sleuthware All rights reserved

 *   Version:  1.0.a.18411007
 *   Created:  Sat 2018.09.29
 
 
 *   Contact:  @Robin   http://forum.espruino.com/microcosms/116/    Home >> Official Espruino Boards >> JavaScript
 * Technical:  Note that Official Espruino Boards are required for this module as keyword 'compiled' is used throughout
 *    Tested:  Espruino 1v99 - See http://www.espruino.com/Compilation 'compiled'
 *Dependency:  System module require("neopixel")
 *   Updates:  Sun 2018.10.07 rgc Deployed to GitHub initial module testing
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
 * to maintain other accepted best practices in order to remove ambiguity
 *
 * Usage:
 
 
 
 
 
 
 * require("NeopixelCore").neopixelInit(options);
 * var options = { 'pinLedTest':'[A5]','pinNeopixel':pinAryNeopixel[1],'optionBase':OPTION_BASE_ZERO };
 * var neo = new neopixelInit( options );
 * Type: help()  or  h()  for accessor methods list
 */




//https://www.w3schools.com/cssref/css_colors.asp




//var exports={};




/*




*/






/*
var exports={};


exports.Color;



var RGB = require("https://github.com/sleuthware/EspruinoDocs/blob/master/modules/moduleNeopixelColors.js");
*/




/*

// Create a copy of our constants array
var RGB = require("https://github.com/sleuthware/EspruinoDocs/blob/master/modules/moduleNeopixelColors.js");

var col = new Color("Aqua");

var col = new Color("00ffab");

*/








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
class Color {

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
      if (s != "0x") {
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
exports.Color = Color;
//exports.Color.cvrtHexToDec = Color.cvrtHexToDec;
exports.cvrtHexToDec = Color.cvrtHexToDec;





//[eof]
