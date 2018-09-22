


//https://www.w3schools.com/cssref/css_colors.asp




//var exports={};




class Color {

  constructor(obj) {


    if (typeof obj == "string") {
      
      // See if is a name or a specified RGB or hex value
      var isHex = this.isHexColor(obj);
if( isHex ) {
                  this.colorName = "notassigned";
            this.colorRGB = obj;
  
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
      
      


    } else {
        
      
      
      var objRGB = JSON.parse(JSON.stringify(RGB));
      var key;
console.log( "Color: objRGB " + objRGB );

      for (key in objRGB) {
        if (objRGB.hasOwnProperty(key)) {

          if (obj.toUpperCase() == key.toUpperCase()) {
            console.log("Color: " + obj.toUpperCase() + "  " + objRGB[key]);

            if (objRGB[key].length != 6) {
              return (NaN);
            }

console.log( "Color: match key " + key );

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



   
    } // else
//            this.colorR = objRGB[key].substring(0, 2);
//            this.colorG = objRGB[key].substring(2, 4);
//            this.colorB = objRGB[key].substring(4, 6);

    //if (typeof obj == "string")
    }
    
    console.log( "Color: match aft else" );

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
  isHexColor(val){
  return( (typeof val == "string") && (val.length == 6)
         && !isNaN( parseInt(val, 16) ) );
  }
  

}
exports = Color;






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



