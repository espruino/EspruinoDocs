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




const NUM_PIXELS = 8;



const RGB_SEQ_GRB = "GRB";
const RGB_SEQ_RGB = "RGB";
const RGB_SEQ_WS2812 = RGB_SEQ_GRB;
const RGB_SEQ_WS2811 = RGB_SEQ_RGB;


var RGB_SEQ = RGB_SEQ_WS2812;




var RGBSEQ = "GRB";

const OPTION_BASE_ZERO = 0;
const OPTION_BASE_ONE = 1;

var OPTION_BASE = OPTION_BASE_ZERO;




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

exports = colorRGBRainbowRed;
exports = colorRGBRainbowOrn;
exports = colorRGBRainbowYel;
exports = colorRGBRainbowGrn;

exports = colorRGBRainbowAqu;
exports = colorRGBRainbowBlu;
exports = colorRGBRainbowPur;
exports = colorRGBRainbowPnk;

exports = aryRainbow;




const MAX_GAMMA = 256;

const DEF_BRIGHTNESS = 70;




class NeopixelInit {




  constructor(options) {


    if (typeof options != "object") options = {};
//    options.optionBase = options.optionBase || OPTION_BASE_ZERO;
    options.optionBase = options.optionBase || 0;
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


      console.log("L[491] nPcntBr " + this.ab[i]);

    }
  }


  applyGamma() {
    for (var i = 0; i < this.ab.length; i++) {
      var nRGBCur = this.ab[i];
      console.log("L[504] nRGBCur " + this.ab[i]);


      //        this.ac[i] = g.get(nRGBCur);
      //      console.log( "L[619] g.get(i) " +  g.get(nRGBCur) );


      this.ac[i] = this.ag[i];
      console.log("L[619] g.get(i) " + this.ac[i]);



    }


  }

  //  this.ac = new Uint8ClampedArray( nArySizeRGB );
  //  this.ag = new Uint8ClampedArray( MAX_GAMMA );


  dispG() {
    for (var i = 0; i < this.ab.length; i++) {

      //       console.log( "L[632] g.get(i) " +  g.get(i) );
      console.log("L[632] g.get(i) " + this.ag[i]);
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


      console.log("L[653] [" + i + "] " + resultpow);
      //     console.log("L[653] resultmult [" + i  + "] " + resultmult);
      var fmt = resultpow.toFixed(0);



      //        g.set(idx++,fmt);
      //  this.ac = new Uint8ClampedArray( nArySizeRGB );
      //  this.ag = new Uint8ClampedArray( MAX_GAMMA );
      this.ag[idx++] = fmt;

      console.log("L[653] [" + i + "] " + fmt);



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


    console.log("L[536] offset " + offset.toString());
    console.log("L[536] iStart " + iStart.toString());



    //  for( var i=0; i<aryPrep.length; i++ ) {
    //  for( var i=0; i<this.aryPrep.length; i++ ) {
    for (var i = 0; i < this.ar.length; i++) {
      if (iStart == i) {
        //    if( RGBSEQ == "GRB" )
        if (this.getrgbseq() == RGB_SEQ_GRB)

        {
          //      var g = fetch( color, "g" );
          var g = color.g;
          console.log("L[346] g " + g);

          //    aryPrep[idx++] = g;
          //    this.aryPrep[idx++] = g;
          this.ar[idx++] = g;
          console.log("L[311g] aryPrep[" + (idx - 1).toString() + "] " + this.ar[idx - 1]);

          //      var r = fetch( color, "r" );
          var r = color.r;
          console.log("L[346] r " + r);

          //      this.aryPrep[idx++] = r;
          //  console.log( "L[311r] aryPrep[" + (idx-1).toString() + "] " + this.aryPrep[idx-1] );
          this.ar[idx++] = r;
          console.log("L[311r] aryPrep[" + (idx - 1).toString() + "] " + this.ar[idx - 1]);

          //      var b = fetch( color, "b" );
          var b = color.b;
          console.log("L[346] b " + b);


          //      this.aryPrep[idx++] = b;
          //  console.log( "L[556b] aryPrep[" + (idx-1).toString() + "] " + this.aryPrep[idx-1] );
          this.ar[idx++] = b;
          console.log("L[556b] aryPrep[" + (idx - 1).toString() + "] " + this.ar[idx - 1]);

          break;
        }
      } else {
        idx++;
        //      idx++;
        //    idx++;

      }


    }

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


    console.log("L[756] update " + this.useGamma);


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


  }




}
exports = NeopixelInit;














