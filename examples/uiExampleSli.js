/*<!-- Copyright (c) 2019 allObjects. See the file LICENSE for copying permission. -->
UI Example - Slider
=========================

* KEYWORDS: UI,Example,Slider
* USES: ui,uiSli

*/
// ----- setup lon and log() (considering emulating _eConsole)
var lon = true // logging is on / off
  , log = function() { if (lon) { var lgr;(lgr=(typeof _eConsole
       =="object")?_eConsole:console).log.apply(lgr,arguments);}};

// ----- pull in ui base and ui element(s)
var ui = require("ui")
    .adx(require("uiExt")) // for extra / complimentary drawings and for uiEBC
    .adx(require("uiEBC")) // only when used with push button usage
    .adx(require("uiSli"))
    ;

// ----- define callback(s): log ui element id and value (only)
var cb = function(id, v, _, e, t) { log( "id:",id,"val:",v
        ,(t)?((t.t)?"":"un")+"touch focused":t); }
  , ca = ( (typeof ca === "undefined")
         ? function(id, v, _, e, t) { var s=(t.f|65536).toString(2); // log flags
             log("id:",id,"v:",v,"f:",[s.substr(5,4),s.substr(9,4),s.substr(13,4)].join(" "),t.f); }
         : ca )
  , u; // for space / memory / var saving value of * undefined *

// ----- define UI (in level 0 - built to be saved)


//---------- Slider examples ----------
////
////....0  1     2       3   4   5   6   7   8  9       10  11                         12
////.flgs  clazz id      x   y   w   h  bc fcs  value   cb, ls (arr of labels [[...],..])
////.......sli                ->x2->y2                    [0] fs tc    x  y  txt fmt
//ui.c( 3,"sli","s1"  , 10, 30,220, 26,  6,[ 4, 1],0,   cb, [[ u, u,   u,  u, u,   u
////                                                          min max si
//                                                           ,-10, 10,[3]]]);
//
//....0  1     2       3   4   5   6   7   8  9       10  11                         12
//.flgs  clazz id      x   y   w   h  bc fcs  value   cb, ls (arr of labels [[...],..])
//.......sli                ->x2->y2                    [0] fs tc    x  y  txt fmt
ui.c( 3,"sli","s1"  , 10, 30,220, 26,  6,[ 4, 1],0,   cb, [[ u, u,   u,  u, u,   u
//                                                          min max si  o a flgs
                                                           ,-10, 10,[3],0,0,   0
//                                                          left top right bot margins
                                                           ,   5,  5,    5]]);

var s2 = // hold on to "s2" slider ui element for direct access app later on.
//....0  1     2       3   4   5   6   7   8  9       10  11                         12
//.flgs  clazz id      x   y   w   h  bc fcs  value   cb, ls (arr of labels ([[...],..]))
//       sli                ->x2->y2                    [0] fs tc    x  y  txt fmt
ui.c( 3,"sli","s2"  , 30, 60,180, 26, -4,[-4,0],25,   ca, [[12, 6,  70, 6, u
                                                           ,function(v,_,l){ // v,ui,labl
       var s="", f=_.te.f; return (!(f===0 || f&184)) ? s : ((v<1)?"0":"") // 128+32+16+8
                   +(s=_.mr(v*10)+"%").substr(0,s.length-2)+"."+s.substr(-2); } // #.##%
//                     _.mr=Math.round                      min max si  o a flgs
                                                           ,  0,100,[3],0,0, 168]
//                                                     [>0] fs tc    x  y  txt fmt
                                                          ,[12, 7, -25, 6, "%:0"] // frnt
                                                          ,[12, 7, 182, 6, "100"] // back
                                                          ]);

// Pixl or 2 colors only adjusting 'on-top' label placing (colors for TFT, flip'm for LCD):
// AND creating extra left and right margins for large min and max touch areas
//....0  1     2       3   4   5   6   7   8  9       10  11                         12
//.flgs  clazz id      x   y   w   h  bc fcs  value   cb, ls (arr of labels ([[...],..]))
//       sli                ->x2->y2                    [0] fs tc    x  y  txt fmt
ui.c( 3,"sli","s3"  , 30, 90,180, 26,  7,[7,0] ,33,  ca,  [[12, u,  70, 6,   u // formatter
                                                           ,function(v,_,l){ // val,ui,labl
         var s="", f=_.te.f; return (!(f===0 || f&184)) ? s : ((v<1)?"0":"") // 128+32+16+8
                 +(s=_.mr(v*10)+"%").substr(0,s.length-2)+"."+s.substr(-2); } // val label
//                   _.mr=Math.round                        min max si  o a flgs
                                                           ,  0,100,[3],0,1, 168
//                                                          left top right bot margin
                                                           ,   9,  0,    8,  0]
//                                                     [>0] fs tc    x  y  txt fmt
                                                          ,[12, 7, -25, 6,"%:0"] // frnt
                                                          ,[12, 7, 182, 6,"100"] // back
                                                          ]);

// Using left and right labels for large min and max touch areas; could also use buttons,
// but they add separate ui elts to cycled tru when using no-touch / push btns nav only
//....0  1     2       3   4   5   6   7   8  9       10  11                         12
//.flgs  clazz id      x   y   w   h  bc fcs  value   cb, ls (arr of labels ([[...],..]))
//       sli                ->x2->y2                    [0] fs tc    x  y  txt fmt s flgs a
ui.c( 3,"sli","s4"  ,  3,117,237, 29,  7,[7,0] ,66,  ca,  [[12, u,  70,10,   u // formatter
                                                           ,function(v,_,l){ // val,ui,labl
         var s="", f=_.te.f; return (!(f===0 || f&184)) ? s : ((v<1)?"0":"") // 128+32+16+8
                   +(s=_.mr(v*10)+"%").substr(0,s.length-2)+"."+s.substr(-2); } // #.##%
//                     _.mr=Math.round                      min max si  o,a, flgs
                                                           ,  0,100,[3],0,1,  168
//                                                          left top right bot margins
                                                           ,  28,  5,   26]
//                                                     [>0] fs tc    2  y  label text
                                                          ,[12, 7,   2,10, "%:0"] // frnt
                                                          ,[12, 7, 209,10, "100"] // back
                                                          ]);

//....0  1     2       3   4   5   6   7   8  9       10  11                         12
//.flgs  clazz id      x   y   w   h  bc fcs  value   cb, ls (arr of labels [[...],..])
//.......sli                ->x2->y2                    [0] fs tc    x  y  txt fmt
ui.c( 3,"sli","s5"  , 10,150, 55,170,  2,[ 4, 1], 4,  cb, [[14, 6,   6, u, "v" // y val dep
                                                           ,function(v,_,l){ // val,ui,labl
                                 var s="",y, f=_.te.f; if (f===0 || f&184) { // 128+32+16+8
      s=((_.mu(s=_.mr(v))<10)?" ":"")+((s<0)?s:"+"+s)+l[4]; // ./ position value dependent:
      l[3]=(((y=_.mr(170/2-v*(170-2-2-5-5)/(10-(-10)))-18)>=2+5+3)?y:y+23); } return s; }
//                                                          min max si  o a flgs
                                                           ,-10, 10,[3],1,0, 168
//                                                          left top right bot margins
                                                           ,   0,  5,    5,  5]
//                                                     [>0] fs tc   x   y  txt fmt
                                                          ,[10, 4, 80 , 1, "max"]
                                                          ,[10, 1, 83,156, "min"]
                                                          ]);

//---------- extra drawings ----------
//
// function for extra / complementary drawings on initial and re-drawings
// of display,  such as:
var xDs = function(ui) { // e (2nd arg of no use on draw all)
  var d = ui.dsp, e; // display - Espruino Graphics object

  // - screen title
  ui.ld([18,7,26,0,"Sliders - all kinds of"]);

  // - ticks for slider ui elts (that have margins to put them)
  ticks_s1(ui,d,ui.e("s1")); // get slider w/ id s1 as ui element e
  ticks_s4(ui,d,ui.e("s4")); // get slider w/ id s4 as ui element e
  ticks_s5(ui,d,ui.e("s5")); // get slider w/ id s5 as ui element e
};

function ticks_s1(ui,d,e) { if (e) { // horizontal slider
  var x = e[3]       // get e's left - x
    , m = e[11][0]   // to access margins 12,13,14/left,top,right
    , b = x+2+m[12]        // start of slider bar (border, value 0)
    , l = e[4]+2+m[13]     // get e's top-1=y-1=lower y of tick (1 pixel above  bar)
    , w = e[5]-b-2-1-m[14] // get e's slider bar width (right border (-1?), val 100)
    , v = w/20   // pixels per w pixels)
    , u = l-3    // upper y of tick, use all 4 margin pixels betw. bar & sel/focus line
    , t // tick pos
    ;
    ui.clr(e[7]); // same as slider bar's border color
    for (var i=-0;i<=30;i+=5) {
      t = ui.mc(b + i * v) + 0.5; // weird +0.5, only in emulation / canvas
      d.drawLine(t,l-((i % 10)?1:0),t,u-((i % 10)?0:2)); // short (2px) and long (4px) ticks
}  } }


function ticks_s4(ui,d,e) { if (e) {
  var x = e[3]       // get e's left - x
    , m = e[11][0]   // to access margins 12,13,14/left,top,right
    , b = x+2+m[12]        // start of slider bar (border, value 0)
    , l = e[4]+2+m[13]     // get e's top-1=y-1=lower y of tick (1 pixel above  bar)
    , w = e[5]-b-2-1-m[14] // get e's slider bar width (right border (-1?), val 100)
    , v = w/2    // pixels per 1% (100% = w pixels)
    , u = l-3    // upper y of tick, use all 4 margin pixels betw. bar & sel/focus line
    , t // tick pos
    ;
    ui.clr(e[7]); // same as slider bar's border color
    for (var i=0;i<=100;i+=10) {
      t = ui.mc(b + i * v) + 0.5; // weird +0.5, only in emulation / canvas
      d.drawLine(t,l-((i % 50)?1:0),t,u-((i % 50)?0:2)); // short (2px) and long (4px) ticks
}  } }


function ticks_s5(ui,d,e) { if (e) { // vertical slider
  console.log("ticks for "+e[1]+"...");
  var y  = e[4]       // get e's top - y
    , m  = e[11][0]   // to access margins 13,14,15/top,right,bottom and min and max
    , b  = e[6]-2-m[15]   // start of slider bar (bottom border value -10)
    , l  = e[5]-1-m[14]+1 // get e's right-1=y-1=left x of tick (1 pixel right to the bar)
    , w  = b-y-2-m[13]    // get e's slider bar height (top border (-1?), val +10)
    , v  = w/20  // pixels per unit - v pixels)
    , r  = l+5   // right x of tick, use all 4 margin pixels betw. bar & bounding box rect
    , mn = m[6] // minimum value
    , mx = m[7] // maximum value
    , t // tick pos
    ;
    ui.clr(e[7]); // same as slider bar's border color, number labels w/ value related colors
    for (var i=mn;i<=mx;i+=5) {
      t = ui.mc(b - (i - mn) * v) + 0.5; // weird +0.5, only in emulation / canvas
      ui.clr(e[7]); d.drawLine(l-((i % 10)?0:1),t,r-((i % 10)?2:1),t); // ticks
      ui.ld([10,(i>0)?4:(i<0)?1:7,r+9,t-6,i]); // numbers <0 blue, 0 white, >0 red
} } }


//----- pull in display w/ width / height and touch screen
var dsp,   dspMod   = require("ILI9341"), dspW=240, dspH=320
  , touch, touchMod = require("XPT2046")
  ;
// ----- run UI
function onInit() {
  SPI2.setup({sck:B13, miso:B14, mosi:B15, baud: 1000000});
                     // spi,  dc, cs, rst, callback
  dsp = dspMod.connect(SPI2, B10, B1,  A4, function() {
    dsp.clear(); A1.set(); // display clear and turn back light on
    // connect ui to dsp and display it
    ui.connect(dsp)
      .w(0,0,dspW-1,dspH-1) // wipe screen (rect) w/ background color
      .d(u,xDs)             // display all elements and extra drawings
      .di = true;           // set display changes to immediate
    // setup touch screen and connect it to ui
    SPI1.setup({sck:A5, miso:A6, mosi:A7, baud: 2000000});
                           // spi, cs, irq, callback, calc (calibrated)
    touch = touchMod.connect(SPI1, A3,  A2, function(x,y){ ui.evt(x,y);}
        , function(yr, xr, d) {
            return [ Math.round(xr / -121.44          + 259.70685111989)
                   , Math.round(yr /   88.90357142857 + -19.78130398103)
                   ];
    }).listen();
  });
}
setTimeout(onInit,999); // for dev only, remove before upload for save()
