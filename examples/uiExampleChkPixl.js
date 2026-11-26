/*<!-- Copyright (c) 2019 allObjects. See the file LICENSE for copying permission. -->
UI Example - Checkbox on Pixl.js
=========================

* KEYWORDS: UI,Example,Checkbox
* USES: ui,uiChk,Pixl.js

Example with checkboxes

Check boxes in all kinds of sizes; used dev margins, bevels
and X-mark for pixl, because TTF version was not suitable for
B&W and resolutions / very small checkboxes. This pixl version
is also working for TTF 240x320 ('backwards' compatible).

*/

// ----- setup lon and log() (considering emulating _eConsole)
var lon = true // logging is on / off
  , log = function() { if (lon) { var lgr;(lgr=(typeof _eConsole
       =="object")?_eConsole:console).log.apply(lgr,arguments);}};

// ----- pull in ui base and ui element(s) - (..._U = uncommented)
var ui = require("ui")                 // basic module _U(ncommented)
    .adx(require("uiExt"),-1,"uiExt") // basic extension
    .adx(require("uiEBC"),-1,"uiEBC") // button controlled ui extension
    .adx(require("uiChk"),-1,"uiChk") // ui checkbox element
    ;

// define Pixl Button 'clazz'
var uiPBt = function(btn,downCb,upCb,debounce) {
  var t=0;
  setWatch( function(e){ if (! t) { t=Math.round(e.time*1000); if (downCb) downCb(t); }}
          , btn, {edge:"rising" ,repeat:true, debounce:debounce} );
  setWatch( function(e){ if (  t) { upCb(Math.round(e.time*1000)-t); t=0; }}
          , btn, {edge:"falling",repeat:true,debounce:debounce} );
};


// ------- uiPBt -----------------------------------

// ----- define callback(s): preferred (untouch) / generic (all) touch event(s)
var cb = function(id, v, _, e, t) { log( "id:",id,"val:",v
        ,(t)?((t.t)?"":"un")+"touch focused":t); }
  , ca = ( (typeof ca === "undefined")
         ? function(id, v, _, e, t) { var s=(t.f|65536).toString(2); // log flags
             log("c:",e[1],"c:",e[1],"id:",id,"v:",v,"f:",[s.substr(5,4),s.substr(9,4),s.substr(13,4)].join(" "),t.f); }
         : ca )
  , backlite = function(id, v, e, t) { // turn backlight on / off w/ label change
         // intentionally commented in this example... active in uiExampleAllPixl.
         // digitalWrite(LED,v); // e[11][4]=(v)?"off":"on"; // set LED and label
         return false; } // return true/y in callback redraws ui elt & label(s)
  , u; // for space / memory / var saving value of * undefined *

// ----- define UI (in level 0 - built to be saved)

// ---------- Checkbox examples ----------
//    0  1      2      3   4   5   6   7   8  9       10  11
// flgs  clazz id      x   y   w   s  bc  fc  valObj  cb,  l (label array obj)
//       btn                ->x2->y2~------->[s,vOjb]       fs tc    x  y  label txt ca
var s = 0;
ui.c( 3,"chk","cA"  ,  0,  2,  9,  s,  0,  7,true,backlite,[ 0, 0,   1, 2,  "5|9" ]);
ui.c( 3,"chk","cB"  ,  0, 16, 11,  s,  0,  7,true,backlite,[ 0, 0,  -5,11,  7     ]);
ui.c( 3,"chk","cC"  , 10, 14, 13,  s,  0,  7,true,backlite,[ 0, 0,  -6,13,  9     ]);
ui.c( 3,"chk","cD"  , 22, 11, 16,  s,  0,  7,true,backlite,[ 0, 0, -10,16, 12     ]);
ui.c( 3,"chk","cE"  , 37,  8, 19,  s,  0,  7,true,backlite,[ 0, 0, -12,19, 15     ]);
ui.c( 3,"chk","cF"  , 55,  5, 22,  s,  0,  7,true,backlite,[ 0, 0, -13,22, 18     ]);
ui.c( 3,"chk","cG"  , 76,  3, 24,  s,  0,  7,true,backlite,[ 0, 0, -14,24, 20     ]);
ui.c( 3,"chk","cH"  , 99,  0, 27,  s,  0,  7,true,backlite,[ 0, 0, -22,27, "23|27"]);
ui.c( 3,"chk","ca"  ,  0, 53,  9,  s,  0,  0,true,backlite,[ 0, 0,   1, 2, "5|9"  ]);
ui.c( 3,"chk","cb"  ,  0, 33, 11,  s,  0,  0,true,backlite,[ 0, 0,  -8,11, 11     ]);
ui.c( 3,"chk","cc"  , 10, 33, 13,  s,  0,  0,true,backlite,[ 0, 0,  -9,13, 13     ]);
ui.c( 3,"chk","cd"  , 22, 33, 16,  s,  0,  0,true,backlite,[ 0, 0, -11,16, 16     ]);
ui.c( 3,"chk","ce"  , 37, 33, 19,  s,  0,  0,true,backlite,[ 0, 0, -12,19, 19     ]);
ui.c( 3,"chk","cf"  , 55, 33, 22,  s,  0,  0,true,backlite,[ 0, 0, -13,22, 22     ]);
ui.c( 3,"chk","cg"  , 76, 33, 24,  s,  0,  0,true,backlite,[ 0, 0, -14,24, 24     ]);
ui.c( 3,"chk","ch"  , 99, 33, 27,  s,  0,  0,true,backlite);


//----- Pixl sepcifics
var dsp = g, dspW=128, dspH=64 // ...to keep var names as usual
  ;
ui.bc=7; // set ui background color to white
ui.tc=0; // set ui touch color to black
ui.clrs= // set white to pixl color
    [function(c,i){ var v=(i)?c^7:c; return [(v&&4)?0:1]; }.bind(ui)
    ];
var flp;

// ----- run UI
function onInit() {
  dsp.clear(); LED.set(); // display clear and turn back light on
  setTimeout(function(){
    // connect ui to dsp and display it
    ui.connect(dsp)
      .w(0,0,dspW-1,dspH-1) // wipe screen (rect) w/ default / bg color
      .d()                  // display all elements
      .di = true            // set display changes to immediate
      ;
    flp = function(){ dsp.flip(); };
    flp();
    new uiPBt(BTN1,0,function(t){ui.sp();flp();}); // sel prev on BTN1
    new uiPBt(BTN4,0,function(t){ui.sn();flp();}); // sel next on BTN4
    new uiPBt(BTN3,0,function(t){ui.st(t+70,t);setTimeout(flp,t+140);}); // tap on BTN3
  },1000);
}

setTimeout(onInit,999); // for dev only, remove before upload for save()
