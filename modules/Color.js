/* Copyright (c) 2018 Robin G Cox  See the file LICENSE for copying permission */

/* Work in progress - to avoid change duplication - contact author first */

/* Class Color builds a color object in decimal form given an X11Color name or creates a user defined color
 *  object given hex, decimal JSON string. Specifically for Neopixel projects
 *
 *      File:  Color.js
 *   Project:  Neopixel library for Espruino tm
 *    Module:  Color{}  Colors{}  NeopixelCore{}  NeopixelEffects{}
 *    Author:  Robin G. Cox
 * Copyright:  Robin G. Cox © 2018 owner Sleuthware All rights reserved
 *   Version:  1.0.a.18421020
 *   Created:  Sat 2018.09.29
 *   Contact:  @Robin   http://forum.espruino.com/microcosms/116/    Home >> Official Espruino Boards >> JavaScript
 * Technical:  method isValidRGB( val )   https://stackoverflow.com/questions/8027423/how-to-check-if-a-string-is-a-valid-hex-color-representation
 *    Tested:  Espruino 1v99 on Pico_R1_3
 *Dependency:  module require("Colors")
 *   Updates:  Sun 2018.10.07 rgc  Deployed to GitHub initial module testing 1.0.a.18390929
 *             Sat 2018.10.20 rgc  Completed header block and JSDoc comments 1.0.a.18421020
 *
 * Author grants derivative works as long as this header and comments remain intact
 * Permission is required for commercial use
 *
 * Usage:
 *
 *   const RGB = require("Colors");
 *   var Color = require("Color");
 *   var colorDkCyan = new Color("DarkCyan");
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
      
      var isValid = this.isValidRGB(obj);

      if( isValid ) {
        this.colorName = "notassigned";
        this.colorRGB = obj;
        
        if( typeof name == 'string' ) {
          this.colorName = name;
        }
  
        this.colorR = obj.substring(0, 2);
        this.colorG = obj.substring(2, 4);
        this.colorB = obj.substring(4, 6);

      } else {
      
        var objRGB = JSON.parse( JSON.stringify(RGB) );
        var key;

        for (key in objRGB) {
          if (objRGB.hasOwnProperty(key)) {

            if( obj.toUpperCase() == key.toUpperCase() ) {
              if( objRGB[key].length != 6 ) {
                return(NaN);
              }

              this.colorName = key;
              this.colorRGB = objRGB[key];

              this.colorR = objRGB[key].substring(0, 2);
              this.colorG = objRGB[key].substring(2, 4);
              this.colorB = objRGB[key].substring(4, 6);
            }
          }
        }

      }
    }
    
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
    // Future development along with HSL to RGB  
    this.colorA = "FF";
    this.colorARGB = "ffffffff";

    return this.colorObjJson;
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

  getColorDecJSON() {
    var vals = {};
    vals.r = this.decR;
    vals.g = this.decG;
    vals.b = this.decB;
    vals.n = this.colorName;
    this.colorObjJson = JSON.parse(JSON.stringify(vals));    
    return (this.colorObjJson);
  }

  getColorHexJSON() {
    var vals = {};
    vals.r = this.hexR;
    vals.g = this.hexG;
    vals.b = this.hexB;
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
  
  isValidRGB( val ) {
    return( (typeof val == "string") && (val.length == 6)
         && !isNaN( parseInt(val, 16) ) );
  }

}
exports = Color;

exports.cvrtHexToDec = Color.cvrtHexToDec;
exports.cvrtDecToHex = Color.cvrtDecToHex;

exports.getColorDecJSON = Color.getColorDecJSON;
exports.getColorHexJSON = Color.getColorHexJSON;



// https://stackoverflow.com/questions/8027423/how-to-check-if-a-string-is-a-valid-hex-color-representation
// isValidRGB( val )



//[eof]
