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
 *   Version:  1.0.b.18431028
 *   Created:  Sat 2018.09.29
 *   Contact:  @Robin   http://forum.espruino.com/microcosms/116/    Home >> Official Espruino Boards >> JavaScript
 * Technical:  method isValidRGB( val )   https://stackoverflow.com/questions/8027423/how-to-check-if-a-string-is-a-valid-hex-color-representation
 *    Tested:  Espruino 1v99 on Pico_R1_3
 *Dependency:  module require("Colors")
 *   Updates:  Sun 2018.10.07 rgc  Deployed to GitHub initial module testing 1.0.a.18390929
 *             Sat 2018.10.20 rgc  Completed header block and JSDoc comments 1.0.a.18421020
 *             Sun 2018.10.28 rgc  Converted to static cvrtHexToDec() 1.0.b.18431028
 *
 * Author grants derivative works as long as this header and comments remain intact
 * Permission is required for commercial use
 *
 * Usage:
 *
 *   const RGB = require("Colors");
 *   var Color = require("Color");
 *   var colorDkCyan = new Color("DarkCyan");
 *   var decimal = Color.cvrtHexToDec("fe");
 */



/**
 * Class Color creates a color object given it's X11Color name. Returns in Javascript object notation the
 *  individual color values for easy individual color manipulation. Although Camel case is used to store
 *  the name, matching is done by converting to lower case
 * @class
 *
 * @constructor
 *
 * @property  decR  the individual red color value in decimal form
 * @property  decG  the individual green color value in decimal form
 * @property  decB  the individual blue color value in decimal form
 * @property  hexR  the hex representation for the individual red color value
 * @property  hexG  the hex representation for the individual green color value
 * @property  hexB  the hex representation for the individual blue color value
 *
 * Reference
 * For a visual color swatch list for comparison see 4.3. Extended color keywords
 * {@link https://www.w3.org/TR/css-color-3/}
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

        var objRGB = require("Colors");
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

    this.decR = Color.cvrtHexToDec(this.colorR);
    this.decG = Color.cvrtHexToDec(this.colorG);
    this.decB = Color.cvrtHexToDec(this.colorB);

    this.hexR = Color.cvrtHexStToHexN(this.colorR);
    this.hexG = Color.cvrtHexStToHexN(this.colorG);
    this.hexB = Color.cvrtHexStToHexN(this.colorB);

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

/**
 * Static function cvrtHexToDec() will convert the hex number supplied to it's decimal equivalent
 *
 * @param   {number}   hex  The desired hex number to convert either as a number or hex string equivalent
 *
 * @returns {number}   decimal  The converted value as a base 10 decimal
 */
  static cvrtHexToDec( hex ) {
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

/**
 * Static function cvrtDecToHex() will convert the decimal number supplied to it's hex number equivalent padded with leading zeros if desired
 *
 * @param   {number}   decimal   The desired number to convert
 * @param   {number}   padding   The number of left place holders of value zero
 *
 * @returns {number}   hex       The converted value in hex
 */
  static cvrtDecToHex( decimal, padding ) {
    var hex = Number(decimal).toString(16);
    padding = typeof(padding) === "undefined" || padding === null ? padding = 2 : padding;

    while( hex.length < padding ) {
      hex = "0" + hex;
    }
    return hex;
  }

/**
 * Static function cvrtHexStToHexN() will convert a hex string to it's hex equivalent number
 *
 * @param   {string}   hex  The desired hex number to convert
 *
 * @returns {number}   decimal  The converted value as a base 10 decimal
 */
  static cvrtHexStToHexN( hex ) {
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
