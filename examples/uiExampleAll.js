/*<!-- Copyright (c) 2019 allObjects. See the file LICENSE for copying permission. -->
UI Example - ui control w/ physical push buttons
=========================

* KEYWORDS: UI,Example,Buttons
* USES: ui,uiBtn,uiChk,uiExt,uiRad,uiSli,uiInp,uiEBC

Example includes ui control w/ physical push buttons vs touch screen.

*/
// ----- setup lon and log() (considering emulating _eConsole)
var lon = true // logging is on / off
  , log = function() { if (lon) { var lgr;(lgr=(typeof _eConsole
       =="object")?_eConsole:console).log.apply(lgr,arguments);}};

// ----- pull in ui base and ui element(s)
var ui = require("ui")
      .adx(require("uiBtn"))
      .adx(require("uiChk"))
      .adx(require("uiExt")) // prereq for uiRad and keyboard callback example
      .adx(require("uiRad"))
      .adx(require("uiSli"))
      .adx(require("uiInp"))
      .adx(require("uiEBC")) // prereq for ui control w/ buttons vs touch screen
      ;
ui.clrs = // imply color depth and table w/ converter and define user colors / palette
  [function(c,i) { // color info to [r,g,b] converter at index 0 (ui.clrs[0](...))
      var v, s=isNaN(c); if (s || c<0) { // c<0 (looked up [R,G,B]) or c=[R,G,B]
        return (((s) ? c : this.clrs[-c]).map(function(v){ return ((i)?v^255:v)/256; }));
      } else { // c>=0 bit coded rgb color (default 1 bit color depth 2^1^3=8 colors)
        v = (i) ? c^7 : c; return [v>>2&1,v>>1&1,v&1]; } }.bind(ui)
  ,[216,216,216] // user color -1: light grey // keyboard bottom right special keys
  ,[192,192,192] // user color -2: medium light grey
  ,[128,128,128] // user color -3: medium gray
  ,[192,128,192] // user color -4: light purple
  ,[0  ,160, 64] // user color -5: kind of a 'darker' green
  ];

// ----- define callback(s): preferred (untouch) / generic (all) touch event(s)
var cb = function(id, v, _, e, t) { log( "id:",id,"val:",v
         ,(t)?((t.t)?"":"un")+"touch focused":t); }
  , ca = ( (typeof ca === "undefined")
         ? function(id, v, _, e, t) { var s=((t)?(t.f|65536):0).toString(2); // log flags
             log("c:",e[1],"c:",e[1],"id:",id,"v:",v,"f:",[s.substr(5,4),s.substr(9,4),s.substr(13,4)].join(" "),t.f); }
         : ca )
  , u; // for space / memory / var saving value of * undefined *


// ----- define UI (in level 0 - built to be saved)

// ---------- Input field example ----------
//
//    0  1     2       3   4   5   6   7   8  9       10  11
// flgs  clazz id      x   y   w   h  bc  fc  valObj  cb   ls (arr of label ([[..],..]))
//       btn                ->x2->y2                  callback clears on tap > 550ms
ui.c( 3,"inp","i1"  , 45,  7,195, 28,  3,  7,"modular UI"
       ,function(i,v,_,e){ if (getTime()-_.tt>0.55   // [0] fs tc    x  y  mxLen typ fmt
                           && v.length) _.u(e,""); } // [1] fs tc    x  y  label text
                                                         ,[[13, 0,   5, 6, 16,   0,  0]
                                                          ,[13, 7,-233, 6, "Field"    ]
                                                          ]);

// ---------- Button examples ----------
//
//    0  1     2       3   4   5   6   7   8  9       10  11                         12
// flgs  clazz id      x   y   w   h  bc  fc  valObj  cb,  l (label array obj)
//       btn                ->x2->y2                        fs tc    x  y  label txt ca
ui.c( 3,"btn","b1"  ,  5, 40, 60, 35,  4,  4, "B_1",  cb,  [15, 7,  10, 8, "RED"  ]);
ui.c( 3,"btn","b2"  , 65, 40, 75, 35,  5,  6, {v:1},  u ,  [15, 0,  10, 8, "BoYbg"], ca);

// ---------- Check box examples ----------
//
//    0  1     2       3   4   5   6   7   8  9       10  11                         12
// flgs  clazz id      x   y   w   s  bc  fc  valObj  cb,  l (label array obj)
//       chk                ->x2+>y2~------->[s,vObj]       fs tc    x  y  label txt
ui.c( 3,"chk","c1"  ,140, 45, 25,  0, -5,  7, "H",    cb,  [12, 7,   3, 6, "On"   ]);
ui.c( 3,"chk","c2"  ,192, 45, 25,  1,  1,  1, "X",    u ,  [12, 7,   3, 6, "Up"   ], ca);

// ---------- Radio button examples ----------
//
//    0  1     2       3   4   5   6   7   8  9       10  11                         12
// flgs  clazz id.grp  x   y   w   s  bc  fc   valObj cb,  l (label array obj)
//       rad                ->x2+>y2~------->[s,vOjb][g,cb,]fs tc    x  y  label txt ca
ui.c( 3,"rad","r1.a",  5, 80, 37,  0,  6,  2, "L",    cb,  [12, 7,   5,10, "Large"]);
ui.c( 3,"rad","r1.b", 95, 85, 27,  1,  3,  1, "M",    0 ,  [12, 7,   5, 7, "Med"  ]);
ui.c( 3,"rad","r1.c",170, 90, 17,  1,  5,  2, "S",    0 ,  [12, 7,   5, 2, "Small"]);
ui.c( 3,"rad","r2.a",  5,120, 23,  0,  1,  2, "L",    u ,  [12, 7,   5, 4, "Land" ], ca);
ui.c( 3,"rad","r2.b", 95,120, 23,  0, -3, -3, "W",    0 ,  [12, 7,   5, 4, "Water"]);
ui.c( 3,"rad","r2.c",170,120, 23,  1,  1,  1, "A",    0 ,  [12, 7,   5, 4, "Air"  ]);


// ---------- Slider examples ----------
//
//....0  1     2       3   4   5   6   7   8  9       10  11                         12
//.flgs  clazz id      x   y   w   h  bc fcs  value   cb, ls (arr of labels ([[...],..]))
//       sli                ->x2->y2                    [0] fs tc    x  y  txt fmt   ca
ui.c( 3,"sli","s1"  , 10,145,220, 20, -3,[4,-5], 0,  cb,  [[ u, u,   u, u, u,  u
//                                                          min max si  o a flgs
                                                           ,-10, 10,[3],0,0,  24]]);
//
var s2 = // hold on to "s2" slider ui element for direct access app later on.
// non-pixl:
//....0  1     2       3   4   5   6   7   8  9       10  11                         12
//.flgs  clazz id      x   y   w   h  bc fcs  value   cb, ls (arr of labels ([[...],..]))
//       sli                ->x2->y2                    [0] fs tc    x  y  txt fmt
ui.c( 3,"sli","s2"  ,  3,170,234, 32, -4,[-4,0],25,   ca, [[12, 6,  90,12, u
                                                           ,function(v,_,l){ // v,ui,labl
       var s="", f=_.te.f; return (!(f===0 || f&184)) ? s : ((v<1)?"0":"") // 128+32+16+8
                   +(s=_.mr(v*10)+"%").substr(0,s.length-2)+"."+s.substr(-2); } // #.##%
//                     _.mr=Math.round                      min max si  o a flgs
                                                           ,  0,100,[3],0,0, 168
//                                                          left top right bot margins
                                                           ,  27,  6,   27]
//                                                     [>0] fs tc    x  y  txt fmt
                                                          ,[12, 7,   2,12, "%:0"] // frnt
                                                          ,[12, 7, 207,12, "100"] // back
                                                          ]);

//// pixl or 2 colors only adjusting 'on-top' label placement (colors for TFT, flip'm for LCD):
//
//// Pixl or 2 colors only adjusting 'on-top' label placing (colors for TFT, flip'm for LCD):
//// AND creating extra left and right margins for large min and max touch areas
////....0  1     2       3   4   5   6   7   8  9       10  11                         12
////.flgs  clazz id      x   y   w   h  bc fcs  value   cb, ls (arr of labels ([[...],..]))
////       sli                ->x2->y2                    [0] fs tc    x  y  txt fmt
//ui.c( 3,"sli","s3"  , 30, 90,180, 26,  7,[7,0] ,33,  ca,  [[12, u,  70, 6,   u // formatter
//                                                           ,function(v,_,l){ // val,ui,labl
//         var s="", f=_.te.f; return (!(f===0 || f&184)) ? s : ((v<1)?"0":"") // 128+32+16+8
//                 +(s=_.mr(v*10)+"%").substr(0,s.length-2)+"."+s.substr(-2); } // val label
////                   _.mr=Math.round                        min max s o a flgs
//                                                           ,  0,100,3,0,1, 168
////                                                          left top right bot margin
//                                                           ,   9,  0,    8,  0]
////                                                     [>0] fs tc    x  y  txt fmt
//                                                          ,[12, 7, -25, 6,"%:0"] // frnt
//                                                          ,[12, 7, 182, 6,"100"] // back
//                                                          ]);

////....0  1     2       3   4   5   6   7   8  9       10  11                         12
////.flgs  clazz id      x   y   w   h  bc fcs  value   cb, ls (arr of labels ([[...],..]))
////       sli                ->x2->y2                    [0] fs tc    x  y  min max s flgs a
//ui.c( 3,"sli","s2"  , 30,175,180, 26,  7,[7,0] ,33,  ca,  [[12, u,  70, 6,   0,100,3, 168,1
////                                                      [0][13] format (function)
//                                                           ,function(v,_,l){ // val,ui,lab
//       var s="", f=_.te.f; return (!(f===0 || f&184)) ? s : ((v<1)?"0":"") // 128+32+16+8
//                   +(s=_.mr(v*10)+"%").substr(0,s.length-2)+"."+s.substr(-2); } ] // val
////                      _.mr=Math.round                [>0] fs tc    x  y  label text
//                                                          ,[12, 7, -25, 6, "%:0"] // frnt
//                                                          ,[12, 7, 182, 6, "100"] // back
//                                                          ]);


//---------- Keyboard / Keypad example ----------

// example requires uiExt module to be loaded
// get the keyboard and connect it to entry field - part of the UI definition
// {"uiKbd3x10B"}.connect(              ui,x,  y, w, h,bc,fc,sc,mx,my,fs,tc,tx,ty,cb) {
var kbd = require("uiKbd3x10B").connect(ui,0,210,24,24, 7, 7,-2,-1,-1,10 ,0, 4, 6,function(c){
 // keyboard callback key c has been tapped (touch and un-touch on same 'spot')
 log("kbd:",c);
 var s = ui.g("i1"); // get value of ui elt w/ id "i1" - string of input field i1
 if (c.length === 1) { // regular key / char was tapped (length === 1) ...
   ui.u("i1",s + "" + c); // ...append char and update ui elt value w/ new string
 } else if (c === "bs") { // else - special key - back space - was tapped ...
   if (s.length > 0) { ui.u("i1",s.substr(0,s.length - 1)); } // ...do backspace
 }
});

//---------- more buttons ----------
//
//    0  1     2       3   4   5   6   7   8  9       10
// flgs  clazz id      x   y   w   h  bc  fc  valObj  cb
//       btn                ->x2->y2
ui.c( 3,"btn","b3"  ,  3,287, 30, 30,  4, 4,"100clr4",cb);
ui.c( 3,"btn","b4"  , 37,287, 30, 30,  2, 2,"010clr2",cb);
ui.c( 3,"btn","b5"  , 71,287, 30, 30,  1, 1,"001clr1",cb);
ui.c( 3,"btn","b6"  ,105,287, 30, 30,  7, 7,"111clr7",cb);
ui.c( 3,"btn","b7"  ,139,287, 30, 30,  6, 6,"110clr6",cb);
ui.c( 3,"btn","b8"  ,173,287, 30, 30,  5, 5,"101clr5",cb);
ui.c( 3,"btn","b9"  ,207,287, 30, 30,  3, 3,"011clr3",cb);

//---------- extra drawings ----------
//
// function for extra / complementary drawings on initial and re-drawings
// of display,  such as:
var xDs = function(ui) { // e (2nd arg of no use on draw all)
  var d = ui.dsp; // display - Espruino Graphics object

  // - ticks for slider ui elt with id "s2c" (that has top margin to put them)
  var e = ui.e("s2") // get slider w/ id s2c as ui element e
    , m = e[11][0]   // to access margins 12,13,14/left,top,right
    , b = e[3]+2+m[12]     // start of slider bar (border, value 0)
    , l = e[4]+2+m[13]     // get e's top-1=y-1=lower y of tick (1 pixel above  bar)
    , w = e[5]-b-2-1-m[14] // get e's slider bar width (right border (-1?), val 100)
    , v = w/100  // pixels per 1% (100% = w pixels)
    , u = l-6    // upper y of tick, use all 4 margin pixels betw. bar & sel/focus line
    , t // tick pos
    ;
  ui.clr(e[7]); // same as slider bar's border color
  for (var i=0;i<=100;i+=10) {
    t = ui.mc(b + i * v) + 0.5; // weird +0.5, only in emulation / canvas
    d.drawLine(t,l,t,u+((i % 50)?3:0)); // short (2px) and long (4px) ticks
  }
// ...more extra drawings...
// ..
// .
};


// ----- pull in display w/ width / height and touch screen
var dsp,   dspMod   = require("ILI9341"), dspW=240, dspH=320
  , touch, touchMod = require("XPT2046")
  ;
// ----- run UI
function onInit() { // on power on/save() setting up all from scratch
  // setup and connect display, then ui and input (touch | phys btns)
  SPI2.setup({sck:B13, miso:B14, mosi:B15, baud: 1000000}); // display
  dsp = dspMod.connect(SPI2, B10, B1,  A4, function() { // using...
                  // ...spi,  dc, cs, rst, callback
    dsp.clear(); A1.set();  // display clear and turn back light on
    ui.connect(dsp)         // connect ui to dsp and display it
      .w(0,0,dspW-1,dspH-1) // wipe screen (rect) w/ default / bg color
      .d(u,xDs)             // display all elements and extra drawings
      .di = true;           // set display changes to immediate
    SPI1.setup({sck:A5, miso:A6, mosi:A7, baud: 2000000}); // touch inp
    touch = touchMod.connect(SPI1, A3,  A2, function(x,y){ ui.evt(x,y);}
                        // ...spi, cs, irq, callback, /. calibrated...
        , function(yr, xr, d) { // ...function, maps touch to x/y of dsp
            return [ Math.round(xr / -121.44          + 259.70685111989)
                   , Math.round(yr /   88.90357142857 + -19.78130398103)
                   ];
    } ).listen(); // for XPT2046 module (ADS7843: not needed/supported)
  } );
} // /onInit()

setTimeout(onInit,999); // for dev only, remove before upload for save()
