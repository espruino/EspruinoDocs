/*<!-- Copyright (c) 2019 allObjects. See the file LICENSE for copying permission. -->
UI Example - Buttons on Pixl.js
=========================

* KEYWORDS: UI,Example,Buttons
* USES: ui,uiBtn,Pixl.js

Example w/ buttons on Pixl.js

*/
// ----- setup lon and log() (considering emulating _eConsole)
var lon = true // logging is on / off
  , log = function() { if (lon) { var lgr;(lgr=(typeof _eConsole
       =="object")?_eConsole:console).log.apply(lgr,arguments);}};

// ----- pull in ui base and ui element(s)
var ui = require("ui")
    .adx(require("uiExt"),-1,"uiExt") // basic extension
    .adx(require("uiEBC"),-1,"uiEBC") // button controlled ui extension
    .adx(require("uiBtn"),-1,"uiBtn") // ui plain button element
    .adx(require("Font6x8"),-2,"Font6x8") // fs: -1 - custom bitmap font
    ;

//------- uiPBt - push button vs touch screen---------------------------

//define Pixl Button 'clazz'
var uiPBt = function(btn,downCb,upCb,debounce) {
var t=0;
setWatch( function(e){ if (! t) { t=Math.round(e.time*1000); if (downCb) downCb(t); }}
        , btn, {edge:"rising" ,repeat:true, debounce:debounce} );
setWatch( function(e){ if (  t) { upCb(Math.round(e.time*1000)-t); t=0; }}
        , btn, {edge:"falling",repeat:true,debounce:debounce} );
};


// ----- define callback(s): preferred (untouch) / generic (all) touch event(s)
var cb = function(id, v, _, e, t) { log( "id:",id,"val:",v
        ,(t)?((t.t)?"":"un")+"touch focused":t); }
  , ca = ( (typeof ca === "undefined")
         ? function(id, v, _, e, t) { var s=(t.f|65536).toString(2); // log flags
             log("c:",e[1],"c:",e[1],"id:",id,"v:",v,"f:",[s.substr(5,4),s.substr(9,4),s.substr(13,4)].join(" "),t.f); }
         : ca )
  , backlite = function(id, v, e, t) { // turn backlight on / off w/ label change
         digitalWrite(LED,v); // e[11][4]=(v)?"off":"on"; // set LED and label
         return false; } // return true/y in callback redraws ui elt & label(s)
  , u; // for space / memory / var saving value of * undefined *


// ----- define UI (in level 0 - built to be saved)

//---------- Button examples ----------
//
//....0  1     2       3   4   5   6   7   8  9       10  11                         12
//.flgs  clazz id      x   y   w   h  bc  fc  valObj  cb,  l (label array obj)
//       btn                ->x2->y2                        fs tc    x  y label txt  ca
  ui.c( 3,"btn","b1"  ,  0,  0, 28, 19,  0,  0, "B_1",  cb,  [-1, 7,   6, 6, "RED" ]);
  ui.c( 3,"btn","b2"  , 27,  0, 43, 19,  0,  7, {v:1},  ca , [-1, 0,   6, 6, "BonYbg"], ca);


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
