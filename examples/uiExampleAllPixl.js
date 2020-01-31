/*<!-- Copyright (c) 2019 allObjects. See the file LICENSE for copying permission. -->
UI Example - all ui elements on Pixl.js
=========================

* KEYWORDS: UI,Example,Buttons
* USES: ui,uiBtn,uiChk,uiExt,uiRad,uiSli,uiInp,uiEBC,Pixl.js

Example w/ all ui elements on Pixl.js

*/
// ----- setup lon and log() (considering emulating _eConsole)
var lon = true // logging is on / off
  , log = function() { if (lon) { var lgr;(lgr=(typeof _eConsole
       =="object")?_eConsole:console).log.apply(lgr,arguments);}};

// ----- pull in ui base and ui element(s) - (..._U = uncommented)
var ui = require("ui")     // basic module (ncommented)
    .adx(require("uiExt")) // basic extension
    .adx(require("uiEBC")) // button controlled ui extension
    .adx(require("uiBtn")) // ui plain button element
    .adx(require("uiChk")) // ui check box element
    .adx(require("uiRad")) // ui radio button element
    .adx(require("uiSli")) // ui radio button element
    .adx(require("Font6x8"),-2,"Font6x8") // pixl suitable small bitmap font
    ;

// ----- define Pixl Button 'clazz' for ui control
var uiPBt = function(btn,downCb,upCb,debounce) {
  var t=0;
  setWatch( function(e){ if (! t) { t=Math.round(e.time*1000); if (downCb) downCb(t); }}
          , btn, {edge:"rising" ,repeat:true, debounce:debounce} );
  setWatch( function(e){ if (  t) { upCb(Math.round(e.time*1000)-t); t=0; }}
          , btn, {edge:"falling",repeat:true,debounce:debounce} );
};


// ------- uiPBt - push button vs touch screen---------------------------

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
//....0  1     2       3   4   5   6   7   8  9       10  11                         12
//.flgs  clazz id      x   y   w   h  bc  fc  valObj  cb,  l (label array obj)
//       btn                ->x2->y2                        fs tc    x  y label txt  ca
ui.c( 3,"btn","b1"  ,  0,  0, 30, 21,  0,  0, "B_1",  cb,  [-1, 7,   7, 6, "Reg" ]);
ui.c( 3,"btn","b2"  , 29,  0, 41, 21,  0,  7, {v:2},  ca , [-1, 0,   7, 6, "BoYbg"],ca);
ui.c( 3,"btn","b3"  , 70,  0, 34, 14,  0,  7, 3    ,  cb , [ 0, 0,   5, 4, "Magnum"]);
ui.c( 3,"btn","b4"  ,103,  0, 26, 12,  0,  0, 4    ,  cb , [ 0, 7,   5, 3, "Tiny"]);

// ---------- Checkbox examples ----------
//....0  1      2      3   4   5   6   7   8  9       10  11                         12
//.flgs  clazz id      x   y   w   s  bc  fc  valObj  cb,  l (label array obj)
//       chk                ->x2+>y2~------->[s,vOjb]       fs tc    x  y label txt
ui.c( 3,"chk","c2"  , 70, 16, 13,  0,  0,  0, "X",    u ,  [-1, 0,   1, 3, "Up"   ], ca);
ui.c( 3,"chk","c1"  , 95, 16, 13,  1,  0,  7,true,backlite,[ 0, 0,   1, 8, "light"]);

// ---------- Radio button examples ----------
//....0  1     2       3   4   5   6   7   8  9       10  11                         12
//.flgs  clazz id.grp  x   y   w   s  bc  fc   valObj cb,  l (label array obj)
//       rad                ->x2+>y2~------->[s,vOjb][g,cb,]fs tc    x  y  label txt ca
ui.c( 3,"rad","r1.a",  0, 23, 23,  0,  0,  0, "L",    cb,  [ 0, 0,   2, 9, "Large"]);
ui.c( 3,"rad","r1.b", 45, 26, 17,  1,  0,  0, "M",    0 ,  [ 0, 0,   2, 7, "Med"  ]);
ui.c( 3,"rad","r1.c", 77, 31, 11,  1,  0,  0, "S",    0 ,  [ 0, 0,   2, 3, "Small"]);

// ---------- Slider examples ----------
var s2 = // hold on to "s2" slider ui element for direct access app later on.
//....0  1     2       3   4   5   6   7   8  9       10  11                         12
//.flgs  clazz id      x   y   w   h  bc fcs  value   cb, ls (arr of labels ([[...],..]))
//       sli                ->x2->y2                    [0] fs tc    x  y  txt // formatter
ui.c( 3,"sli","s2"  , 12, 46,102, 16,  0,[0,7],  33,  ca, [[ 0, u,  40, 7,   u
                                                           ,function(v,_,l){ // val,ui,labl
         var s="", f=_.te.f; return (!(f===0 || f&184)) ? s : ((v<1)?"0":"") // 128+32+16+8
                      +(s=_.mr(v*10)+"%").substr(0,s.length-2)+"."+s.substr(-2); } // value
//                        _.mr()=Math.round                 min max si  o a flgs
                                                           ,  0,100,[3],0,1, 168
//                                                          left top right bot margins
                                                           ,   0,  3]
//                                                     [>0] fs tc    x  y  txt   fmt
                                                          ,[ 0, 0, -12, 7, "%:0"] // frnt
                                                          ,[ 0, 0, 104, 7, "100"] // back
                                                          ]);

//---------- extra drawings examples ----------
var xDs = function(ui) { // e (2nd arg of no use on draw all)
  ui.ld([0,0,108, 16, "back"]);
  var d = ui.dsp   // display - Espruino Graphics object
    , e = s2       // =ui.e("s2") // get slider ui element w/ id "s2"
    , x = e[3]     // get e's left - x
    , m = e[11][0] // to access margins 12,13,14/left,top,right
    , b = x+2+m[12]        // start of slider bar (border, value 0)
    , l = e[4]+2+m[13]     // get e's top-1=y-1=lower y of tick (1 pixel above  bar)
    , w = e[5]-b-2-1-m[14] // get e's slider bar width (right border (-1?), val 100)
    , v = w/100  // pixels per 1% (100% = w pixels)
    , u = l-2    // upper y of tick, use all 4 margin pixels betw. bar & sel/focus line
    , t // tick pos
    ;
  ui.clr(e[7]); // same as slider bar's border color
  for (var i=0;i<=100;i+=10) {
    t = ui.mc(b + i * v) + 0.5; // weird +0.5, only in emulation / canvas
    d.drawLine(t,l,t,u-((i % 50)?0:2)); // short (2px) and long (4px) ticks
  }
};

// ----- Pixl sepcifics
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
      .d(u,xDs)             // display all elts incl. extra drawings
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
