//codeNeopixelEx3StoryBoard.js
//Sat 2018.10.20

/* Quick Start


test setup for 8 neo strip
t()
step init
si()
step fwd
sf()        repeat

step rev
sr()        repeat




sparkle
init colors
sc()

run 
r()






fade test
alton( color )

fade out
fo()
fade in
fi()




repeat above using 30 pix and 60 pix
t30()

t60()




*/





//const RGB = require("https://github.com/sleuthware/EspruinoDocs/blob/master/modules/Colors.js");
//var Color = require("https://github.com/sleuthware/EspruinoDocs/blob/master/modules/Color.js");
//var NeopixelCore = require("https://github.com/sleuthware/EspruinoDocs/blob/master/modules/NeopixelCore.js");


// or from local /modules folder


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
color = new Color("DarkCyan");
 


function test() { t(); }
function t() {
  var options = { 'pinLedTest':[A5]
    ,'pinAryLed':[A3,A4,A5],'pinAryLedIdx':2
    ,'pinAryNeopixel':[B5,B15,A7],'pinAryNeoIdx':1
//pixl    ,'pinAryNeopixel':[A5,A7],'pinAryNeoIdx':0
    ,'numPixels':8
//    ,'numPixels':30
//    ,'numPixels':60
//    ,'useGamma':false,'nBrightness':70
    ,'useGamma':true,'nBrightness':50
//    ,'useGamma':true,'nBrightness':30
    ,'rgbSeq':C.RGB_SEQ_WS2812
  };

  n = new NeopixelCore( options );

  n.alloff();
  
//  mRB();
//  showRB();
}


//Test Rainbow
function trb() {  
  mRB();
  showRB();
}







function t30() {
  var options = { 'pinLedTest':[A5]
    ,'pinAryLed':[A3,A4,A5],'pinAryLedIdx':2
    ,'pinAryNeopixel':[B5,B15,A7],'pinAryNeoIdx':1
    ,'numPixels':30
//    ,'useGamma':false,'nBrightness':70
    ,'useGamma':true,'nBrightness':50
//    ,'useGamma':true,'nBrightness':30
  };

  n = new NeopixelCore( options );
}


function t60() {
  var options = { 'pinLedTest':[A5]
    ,'pinAryLed':[A3,A4,A5],'pinAryLedIdx':2
    ,'pinAryNeopixel':[B5,B15,A7],'pinAryNeoIdx':1
    ,'numPixels':60
//    ,'useGamma':false,'nBrightness':70
    ,'useGamma':true,'nBrightness':50
//    ,'useGamma':true,'nBrightness':30
  };

  n = new NeopixelCore( options );
}














//Array to hold our formatted data string
var a = {};

//Make Rainbow
function mRB() {
  a = n.buildRainbow();
}

function showRB() {
  n.load(a);
  n.update();
}


// Turn on all Neopixels with the specified color
function aon() {
//  var col = new Color("DarkCyan");
  var col = new Color("BlueViolet");

  n.setall( col );
  n.allon();
//  n.update();
}

function alton( color ) {
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
  n.fadeall(20,2,"out");
}
function fi() {
  n.fadeall(20,4,"in");
}

  
  
  
  
var colorOn = {};
var colorOff = {};


//Step init  
function si() {  
  colorOn = new Color("seagreen");
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
  console.log("L[240]     free: " + process.memory().free );

  if( nElemLast != (-1) )
    n.mapone( nElemLast, colorOff );

  nElemLast = ( nElemLast != (-1) ) ? nElemCur : 0;
  // console.log( "L[233]  nElemLast[" + (nElemLast).toString() + "] " + nElemCur );
  // console.log( "L[269] dirlast " + dirlast + "  fwdrev " + fwdrev );

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
//n.alloff();
  n.update();
  nElemCur = ( fwdrev.toLowerCase() == "rev" ) ? nElemCur-1 : nElemCur+1;

  if( nElemCur >= n.NUM_PIXELS ) { nElemCur = 0; }
  if( nElemCur < 0 ) { nElemCur = (n.NUM_PIXELS-1); }
}














// Sparkle
  
var col0 = {};

var col1 = {};
var col2 = {};
var col3 = {};
var col4 = {};

var col5 = {};
var col6 = {};
var col7 = {};
var col8 = {};



//Set Color
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
  
  
  
  
  
  

//Random number arrays  
var nA = new Array(100);
var nA2 = new Array(0,0,0,0, 0,0,0,0, 0,0);
var randomPixel = 0;


//opt flag to mix colors
const FIXED_COLOR = true;
//const FIXED_COLOR = false;


//Sparkle
function sp() {

//debugger;

  var numPixels = n.NUM_PIXELS;
  var numColors = 8;

  // Array to hold sampling to prove randomness
  nA2 = new Array(
  col0, col1, col2, col3,
  col4, col5, col6, col7 );

  do {
    //Both included
    ran = Math.floor( Math.random() * numPixels );
    // console.log( "L[818] ran[" + (ran).toString() + "] " );
  } while( randomPixel == ran );       // but not the same as last 

  randomPixel = ran;
//S     console.log( "L[822]             nA[" + nA.toString() + "] " );
  nA[ran] = nA[ran] + 1;


  if( !FIXED_COLOR )
  {
    var ranCol = Math.floor( Math.random() * numColors );
    color = nA2[ranCol];
  }

  nElemCur = ran;
  
  if( nElemLast != 'undefined' )
    n.mapone( nElemLast, colorOff );

  nElemLast = ( nElemLast != 'undefined' ) ? nElemCur : 0;
//S  console.log( "L[1033]  nColLast[" + (nColLast).toString() + "] " + nCol);

  n.mapone( nElemCur, color );
//n.alloff();
  n.update();
}
  
  

  
  
// Create a Scene to render a sequence of Sparkles  
  
var intervalID = {};

function ci() { clearInterval( intervalID ); }
  
//Run Scene Sparkle
function r() { runSceneSP( 77, 20 ); }
  
function runSceneSP( nTimes, delay ) {

  //Profiling
  var t = getTime();
  var elaspsed = 0;
  print("start ",(getTime()-t) + " " + t); 

  var x = 0;
  intervalID = setInterval( function() {

    sp();
    if( ++x == nTimes ) {
      clearInterval(intervalID);
      elapsed = (getTime()-t);
    }
//S print("394 elapsed ",(getTime()-t) + " " + x + " " + (getTime()-t)/nTimes); 

  }, delay );
  
  print("396 elapsed ",(getTime()-t)); 
}
  
  
  
  
function runSceneStep( nTimes, delay, fwdrev ) {

  // console.log( "L[447] runSceneStep() " + nTimes + " delay " + delay + " fwdrev " + fwdrev );

  var x = 0;
  intervalID = setInterval( function() {
    if( fwdrev.toLowerCase() == "fwd" ) { step("fwd"); }
    if( ++x == nTimes ) {
      clearInterval(intervalID);
    }
  }, delay );
}
   
  
  
  
  
  
  
  
  
  


  
  
// StoryBoard

  
function i() {
  t();
  sc();
  si();
}

function setColorSparkle() {
  color = new Color("cyan");
}  
 
 
 

function off() {
  n.cleardata();
  n.update();
} 

function wait() {
  console.log("L[447] wait() #############" );
}



//var obj    = [ n.alloff, setColorSparkle, runScene(30), wait3, n.alloff, runSceneD(51) ];
//var dDelay = [ 10,       10,              3000,         1000,        10,  4000 ];
  
//var obj    = [ n.alloff, setColorSparkle, runScene(30) ];
//S var obj    = [ n.alloff, setColorSparkle, function(){runScene(30);} ];
//var dDelay = [ 10,       10,              3000 ];
  /*SAVE */
  /*
var obj    = [ off, setColorSparkle, function(){runSceneStep(30,100,'fwd');}, off,
                   setColorSparkle, function(){runSceneSP(50);}, off,
              
//              showRB, wait3, off, function(){runSceneD(51);}, off,
              showRB, wait, function(){n.fadeall(20,10, "out");}              
             ];
var dDelay = [ 2000,       10,              50,                2000,
               10,              50,                2000,
//              1700,   3000,  2,    60,                         5000,
              1000, 1000, 4000
             ];
    */
    
    /*
var obj    = [ off, setColorSparkle, function(){runScene(30);}, off
             ];
var dDelay = [ 2000,       10,              50,                2000
             ];
    */
    /*
var obj    = [ wait, setColorSparkle, function(){runSceneStep(30,1000,'fwd');}, wait
             ];
var dDelay = [ 2000,       10,                        50,                       2000
             ];
    */

    

function fin() {
  n.setall(color);
  n.update();
}


  
function storyBoard( nTimes ) {
 
var obj    = [ 
               wait, 
               setColorSparkle,
//               function(){runSceneStep(10,1000,'fwd');}, 
//                function(){runSceneStep(15,500,'fwd');}, function(){runSceneStep(33,100,'fwd');}, off,
//nope                function(){runSceneStep(8,100,'rev');}, function(){runSceneStep(8,100,'fwd');}, function(){runSceneStep(8,100,'rev');},
                
                fin,
                function(){n.fadeall(30,3,"out");},
                
                off
             ];
var dDelay = [ 
               2000,       
               10,
//               50,
//                                10100,                                         8000,             3500,
//nope                             1000,                                       2000,                              2000,
                20,
                1000,
                8000,
                100                
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
  
  
  
  
  
   
  
  
  
  


function callSB( nTimes ) {
  var time = 1000;
  intervalVar = n.interval( storyBoard, time, nTimes );
  time = 13000;
  intervalVar = n.interval( storyBoardRB, time, nTimes );
}


function runSB( nTimes ) {
  if( typeof nTimes == "undefined" ) nTimes = 1;
  n.alloff();
  setTimeout( function() {
    var time = 10;
    intervalVar = n.interval( storyBoard, time, nTimes );
  }, 2000 );
}

//setTimeout(function () {
//  console.log("Hello World");
//}, 1000);





var ciLoop;

function ci() { clearInterval( ciLoop ); }

function loop() {
  var delay = 15000;
  ciLoop = intervalID = setInterval( function() {
    runSB(1);
  }, delay );
}

  
  
  
  
  
  
  
  
  
  
  
  
  




function pm() {
  print( process.memory() );
}



function alloff() { ao };
function ao() { n.alloff(); }




function k() { alloff(); }



function kill() {
  ci();
  k();
}


E.on('init',function() {
  kill();

  setWatch(kill, BTN1, { repeat: true, edge:'falling' });
//?
//  setWatch(kill, BTN1, {repeat:true, edge:"both", irq:true});
  
//Why doesn't BTN work??  
//  setWatch(kill, BTN, { repeat: true, edge:'falling' });

  //http://www.espruino.com/InlineC
  //setWatch(c.press, BTN1, {repeat:true, edge:"both", irq:true});
});





//[eof]