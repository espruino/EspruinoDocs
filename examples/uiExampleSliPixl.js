/*<!-- Copyright (c) 2019 allObjects. See the file LICENSE for copying permission. -->
UI Example - Slider for Pixl.js
=========================

* KEYWORDS: UI,Example,Slider
* USES: ui,uiSli,Pixl.js

*/
// ----- setup lon and log() (considering emulating _eConsole)
var lon = true // logging is on / off
  , log = function() { if (lon) { var lgr;(lgr=(typeof _eConsole
       =="object")?_eConsole:console).log.apply(lgr,arguments);}};

// ----- pull in ui base and ui element(s) - (..._U = uncommented)
var ui = require("ui")     // basic module _U(ncommented)
    .adx(require("uiExt")) // basic extension
    .adx(require("uiEBC")) // button controlled ui extension
    .adx(require("uiSli")) // ui radio button element
    .adx(require("Font6x8"),-2,"Font6x8") // pixl suitable small bitmap font
    ;

//------- uiPBt - push button vs touch screen---------------------------

// define Pixl Button 'clazz'
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

//---------- Slider examples ----------
//
//....0  1     2       3   4   5   6   7   8  9       10  11                         12
//.flgs  clazz id      x   y   w   h  bc fcs  value   cb, ls (arr of label ([[...],..]))
//       sli                ->x2->y2                    [0] fs tc    x  y  txt fmt
ui.c( 3,"sli","s1"  , 26, 23,103,  9,  0,[0,7],   0,  cb, [[ u, u,   u, u, u,  u,
//                                                          min max si
                                                            -10, 10,[0]]]);
//
var s2 = // hold on to "s2" slider ui element for direct access app later on.
//....0  1     2       3   4   5   6   7   8  9       10  11                         12
//.flgs  clazz id      x   y   w   h  bc fcs  value   cb, ls (arr of label ([[...],..]))
//       sli                ->x2->y2                    [0] fs tc    x  y  txt fmt
ui.c( 3,"sli","s2"  , 26, 32,103, 13,  0,[0,7],  33,  ca, [[ 0, u,  40, 4, u // formater
                                                           ,function(v,_,l){ // val,ui,labl
    var s="", f=_.te.f; return (!(f===0 || f&184)) ? s : ((v<1)?"0":"") // 128+32+16+8
                 +(s=_.mr(v*10)+"%").substr(0,s.length-2)+"."+s.substr(-2); } // val label
//                   _.mr()=Math.round                      min max si  o a flgs
                                                           ,  0,100,[3],0,1, 168]
                                                           ]);

//....0  1     2       3   4   5   6   7   8  9       10  11                         12
//.flgs  clazz id      x   y   w   h  bc fcs  value   cb, ls (arr of label ([[...],..]))
//       sli                ->x2->y2                    [0] fs tc    x  y  txt fmt
ui.c( 3,"sli","s3"  , 26, 48,103, 16,  0,[0,7],  66,  ca, [[ 0, u,  28, 7, u // formatter
                                                           ,function(v,_,l){ // val,ui,labl
      var s="", f=_.te.f; return (!(f===0 || f&184)) ? s : ((v<1)?"0":"") // 128+32+16+8
                   +(s=_.mr(v*10)+"%").substr(0,s.length-2)+"."+s.substr(-2); } // val label
//                     _.mr()=Math.round                      min max s   o a flgs
                                                           ,    0,100,[3],0,1, 168
//                                                          left top right bot margins
                                                           ,  13,  3,   13,  0]
//                                                     [>0] fs tc    x  y  txt
                                                          ,[ 0, 0,   2, 7, "%:0"] // frnt
                                                          ,[ 0, 0,  89, 7, "100"] // back
                                                          ]);

//....0  1     2       3   4   5   6   7   8  9       10  11                         12
//.flgs  clazz id      x   y   w   h  bc fcs  value   cb, ls (arr of labels [[...],..])
//.......sli                ->x2->y2                    [0] fs tc    x  y  txt fmt
ui.c( 3,"sli","s4"  ,  0,  1, 21, 63,  0,[ 0, 7], 6,  cb, [[ 0, u,   3, u, ""  // y val dep
                                                           ,function(v,_,l){ // val,ui,labl
                                 var s="",y, f=_.te.f; if (f===0 || f&184) { // 128+32+16+8
  s=((_.mu(s=_.mr(v))<10)?" ":"")+((s<0)?s:"+"+s)+l[4]; l[1]=0; // ./ clr+pos val dependnt:
  if ((l[3]=_.mr(62/2-v*(62-2-2)/(10-(-10)))-6)<2+3) { l[1]=7; l[3]+=8; } } return s; }
//                                                          min max si  o a flgs
                                                           ,-10, 10,[3],1,0, 168
//                                                          left top right bot margins
                                                           ,   0,  0,    2,  0]
//                                                     [>0] fs tc   x   y  txt fmt
                                                          ,[ 0, 0, 29,  0, "v max $&*@"]
                                                          ,[ 0, 0, 21, 45, "m"]
                                                          ,[ 0, 0, 21, 51, "i"]
                                                          ,[ 0, 0, 21, 57, "n"]
                                                          ]);

//---------- extra drawings ----------
//
// function for extra / complementary drawings on initial and re-drawings
// of display,  such as:
var xDs = function(ui) { // e (2nd arg of no use on draw all)
  var d = ui.dsp, e; // display - Espruino Graphics object
  // - ticks for slider ui elts (that have margins to put them)
  ticks_s3(ui,d,ui.e("s3")); // get slider w/ id s3 as ui element e
  ticks_s4(ui,d,ui.e("s4")); // get slider w/ id s4 as ui element e
  // ui.ld([0,0,40,10,"*@"]); ui.ld([-1,0,64,8,"#$%&*@"]); // suggested 4x6 and 6x8 font changes...
  // ...more extra drawings...
  // ..
  // .
};
function ticks_s3(ui,d,e) { if (e) { // horizontal slider
  var x = e[3]       // get e's left - x
    , m = e[11][0]   // to access margins 12,13,14/left,top,right
    , b = x+2+m[12]        // start of slider bar (border, value 0)
    , l = e[4]+2+m[13]     // get e's top-1=y-1=lower y of tick (1 pixel above  bar)
    , w = e[5]-b-2-1-m[14] // get e's slider bar width (right border (-1?), val 100)
    , v = w/100  // pixels per 1% (100% = w pixels)
    , u = l-3    // upper y of tick, use all 4 margin pixels betw. bar & sel/focus line
    , t // tick pos
    ;
    ui.clr(e[7]); // same as slider bar's border color
    for (var i=0;i<=100;i+=10) {
      t = ui.mc(b + i * v) + 0.5; // weird +0.5, only in emulation / canvas
      d.drawLine(t,l-((i % 50)?1:0),t,u-((i % 50)?0:2)); // short (2px) and long (4px) ticks
} } }
function ticks_s4(ui,d,e) { if (e) { // vertical slider
  var y  = e[4]       // get e's top - y
    , m  = e[11][0]   // to access margins 13,14,15/top,right,bottom and min and max
    , b  = e[6]-2-m[15] // start of slider bar (bottom border value -10)
    , l  = e[5]-1-m[14] // get e's right-1=y-1=left x of tick (1 pixel right to the bar)
    , w  = b-y-2-m[13]  // get e's slider bar height (top border (-1?), val +10)
    , v  = w/20  // pixels per unit - v pixels)
    , r  = l+2   // right x of tick, use all 4 margin pixels betw. bar & bounding box rect
    , mn = m[6] // minimum value
    , mx = m[7] // maximum value
    , t // tick pos
    ;
    for (var i=mn;i<=mx;i+=5) {
      t = ui.mr(b - (i - mn) * v) + 0.5; // weird +0.5, only in emulation / canvas
      ui.clr(e[7]); d.drawLine(l,t,r-((i % 10)?1:0),t); // ticks
      if (i>=0) ui.ld([0,0,r+2,t-2,i]); // numbers where space is available
} } }


//----- Pixl sepcifics
var dsp = g, dspW=128, dspH=64 // ...to keep var names as usual
  ;
ui.bc=7; // set ui background color to white
ui.tc=0; // set ui touch color to black
ui.clrs= // set white to pixl color
    [function(c,i){ var v=(i)?c^7:c; return (v&&4)?[0,0,0]:[1,1,1]; }.bind(ui)
    ];
var flp;

// ----- run UI
function onInit() {
  dsp.clear(); LED.set(); // display clear and turn back light on
  setTimeout(function(){
    // connect ui to dsp and display it
    ui.connect(dsp)
      .w(0,0,dspW-1,dspH-1) // wipe screen (rect) w/ default / bg color
      .d(u,xDs)             // display all elements
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
