/*NeopixelQuickStart.js
  Sun 2018.10.28
  Author Robin Cox 


  Quick Start for NeopixelCore library using an Espruino Pico and CJMCU-2812-8 Neopixel strip

  
  Requires at a minimum 1v99 - System module require("neopixel") - hdwr SPI MOSI pin(s)
  
  
  For a visual color swatch list for comparison 
    see 4.3. Extended color keywords  https://www.w3.org/TR/css-color-3/
 
 
  8 Neopixel Strip CJMCU-2812-8
  CJMCU 8 Bit WS2812 5050 RGB LED Driver Development Board
  https://www.parallax.com/sites/default/files/downloads/28085-WS2812B-RGB-LED-Datasheet.pdf

 
 
  Init
  
    Set the initialization options in test()

    The data pin wired to the Neopixel strip  
      'pinAryNeopixel':[B5,B15,A7],'pinAryNeoIdx':1
      
    The total number of Neopixels in the connected strip
      'numPixels':8
    
    The type of Neopixel chip typically WS2812
      'rgbSeq':C.RGB_SEQ_WS2812

  
  
  Run each wrapper function by entering in WebIDE left hand console
  
  
  test setup for 8 neo strip
   t()

  step init
   si()

  step fwd
   sf()        repeat

  step rev
   sr()        repeat



  rainbow
    trb()
      mRB()
      sRB()


    

  fade test
    setcolor()
    allon( color )

  fade out
    fo()
  fade in
    fi()


    
  all off
    ao() 
    n.alloff();
    
*/




// Create a local copy of our color names list
const RGB = require("Colors");

// Create locally the Color class definition - module 'Colors' must preceed
var Color = require("Color");

// Create a local NeopixelCore class definition
var NeopixelCore = require("NeopixelCore");

// Create a local shorthand for our global constants
var C = NeopixelCore.C;




// Shorthand for an instance of a NeopixelCore class
var n ={};

// Create a color object to contain color data to use as our step marker
var color = {};




function t() { test(); }
function test() {
  var options = { 'pinLed':[A5]
    ,'pinAryLed':[A3,A4,A5],'pinAryLedIdx':2
    ,'pinAryNeopixel':[B5,B15,A7],'pinAryNeoIdx':1
    ,'numPixels':8
    ,'useGamma':false,'nBrightness':65
    ,'rgbSeq':C.RGB_SEQ_WS2812
  };

  n = new NeopixelCore( options );

  n.alloff();
  //n.help();
  
  color = new Color("DarkCyan");
}




//Test Rainbow
function trb() {  
  mRB();
  sRB();
}






//Array to hold our formatted data string
var a = {};

//Make Rainbow
function mRB() {
  a = n.buildRainbow();
}

//Show Rainbow
function sRB() {
  n.load(a);
  n.update();
}











// Turn on all Neopixels with the specified color
function aon() {
  var col = new Color("BlueViolet");

  n.setall( col );
  n.update();
}


function setcolor() {
//  color = new Color("SeaGreen");
//  color = new Color("Orange");
  color = new Color("MediumBlue");
}


function allon( color ) {
  try {
    for( var i=0; i<n.NUM_PIXELS; i++ ) { 
      n.mapone( i, color );
    }
    n.update();
  } catch(e) {
    console.log( "Check Color argument " + color );
  }
}









//Fade Out

function fo() {
  n.fadeall(40,2,"out");
}
function fi() {
  n.fadeall(50,2,"in");
}

  
  
  
  
var colorOn = {};
var colorOff = {};


//Step init  
function si() {  
//  colorOn = new Color("seagreen");
  colorOn = new Color("crimson");

  colorOff = new Color("Black");

  nElemLast = (-1);
  nElemCur = 0;
}


  
var nElemLast = (-1);
var nElemCur = (-1);





//Step forward - Step reverse
function sf() {  step("fwd"); }
function sr() {  step("rev"); }


var dirlast = "undefined";

function step( fwdrev ) {
  //console.log("L[176]     free: " + process.memory().free );

  if( nElemLast != (-1) )
    n.mapone( nElemLast, colorOff );

  nElemLast = ( nElemLast != (-1) ) ? nElemCur : 0;
  // console.log( "L[182]  nElemLast[" + (nElemLast).toString() + "] " + nElemCur );
  // console.log( "L[183]  dirlast " + dirlast + "  fwdrev " + fwdrev );

  if( fwdrev != dirlast ) {
    if( ( dirlast != "undefined" ) && ( fwdrev != dirlast ) ) {
      nElemLast = nElemCur;
      n.mapone( nElemLast, colorOff );

      nElemCur = ( fwdrev.toLowerCase() == "rev" ) ? nElemCur-1 : nElemCur+1;
      nElemCur = ( fwdrev.toLowerCase() == "rev" ) ? nElemCur-1 : nElemCur+1;
      nElemLast = nElemCur;
    }
    dirlast = fwdrev;
  }

  n.mapone( nElemCur, colorOn );
  n.update();
  
  nElemCur = ( fwdrev.toLowerCase() == "rev" ) ? nElemCur-1 : nElemCur+1;

  if( nElemCur >= n.NUM_PIXELS ) { nElemCur = 0; }
  if( nElemCur < 0 ) { nElemCur = (n.NUM_PIXELS-1); }
}








function pm() {
  print( process.memory() );
}


function alloff() { ao };
function ao() { n.alloff(); }
function k() { ao(); }


//Reference only
E.on('init',function() {
  setWatch(kill, BTN, { repeat: true, edge:'falling' });
});





//[eof] 