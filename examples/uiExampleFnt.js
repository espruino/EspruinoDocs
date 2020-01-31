/*<!-- Copyright (c) 2019 allObjects. See the file LICENSE for copying permission. -->
UI Example - Bitmap fonts
=========================

* KEYWORDS: UI,Example,Fonts
* USES: ui

*/
// ----- setup lon and log() (considering emulating _eConsole)
var lon = true // logging is on / off
  , log = function() { if (lon) { var lgr;(lgr=(typeof _eConsole
       =="object")?_eConsole:console).log.apply(lgr,arguments);}};

// ----- pull in ui base and ui element(s)
var ui = require("ui")
    .adx(require("uiExt")) // only when used with push button usage
    .adx(require("uiEBC")) // only when used with push button usage
    .adx(require("uiBtn"))
    .adx(require("Font6x8"),-2,"Font6x8") // remove from cache
    .adx(require("Font8x16"),-2,"Font8x16") // remove from cache
    ;

// ----- define callback(s): preferred (untouch) / generic (all) touch event(s)
var cb = function(id, v, _, e, t) { log( "id:",id,"val:",v
        ,(t)?((t.t)?"":"un")+"touch focused":t); }
  , ca = ( (typeof ca === "undefined")
         ? function(id, v, _, e, t) { var s=(t.f|65536).toString(2); // log flags
             log("c:",e[1],"c:",e[1],"id:",id,"v:",v,"f:",[s.substr(5,4),s.substr(9,4),s.substr(13,4)].join(" "),t.f); }
         : ca )
  , u; // for space / memory / var saving value of * undefined *

// ----- define UI (in level 0 - built to be saved)

//---------- Font examples on Button ----------
//
//    0  1     2       3   4   5   6   7   8  9       10  11                         12
// flgs  clazz id      x   y   w   h  bc  fc  valObj  cb,  l (label array obj)
//       btn                ->x2->y2                        fs tc    x  y label txt  ca

//ui.c( 1,"btn","bS"  ,  5,  3,230, 15,  0,  0, "B_S",  cb,  [-1, 7,   5, 5
//    , ' !"']);
//ui.c( 1,"btn","bT"  ,  5, 19,230, 15,  0,  0, "B_S",  cb,  [-2, 7,   5, 5
//    , ' !"']);

ui.c( 3,"btn","bS"  ,  0,  3,240, 11,  0,  0, "B_S",  cb,  [-1, 5,   5, 1
    , ' !"'+"#$%&'()*+,-./0123456789:;<=>?"]);
ui.c( 3,"btn","bA"  ,  0, 13,340, 11,  0,  0, "B_A",  cb,  [-1, 3,   5, 1
    , "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_"]);
ui.c( 3,"btn","ba"  ,  0, 23,240, 11,  0,  0, "B_a",  cb,  [-1, 6,   5, 1
    , "`abcdefghijklmnopqrstuvwxyz{/}~"]);

ui.c( 3,"btn","bS11",  0, 33,240, 18,  0,  0, "B_S11",cb,  [-2, 6,   2, 1
    , ' !"'+"#$%&'()*+,-./0123456789:;<=>?"]);
ui.c( 3,"btn","bS12",  0, 50,240, 18,  0,  0, "B_S12",cb,  [-2, 3,   2, 1
    , "`abcdefghijklmnopqrstuvwxyz{/}"]);
ui.c( 3,"btn","bS14",  0, 67,240, 18,  0,  0, "B_S14",cb,  [-2, 5,   2, 1
    , "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_"]);

ui.c( 3,"btn","bS01",  0, 84,135,  9,  0,  0, "B_S01",cb,  [ 0, 7,   2, 1
    , ' !"'+"#$%&'()*+,-./0123456789:;<=>?"]);
ui.c( 3,"btn","bA01",  0, 92,135,  9,  0,  0, "B_S02",cb,  [ 0, 7,   2, 1
    , "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_"]);
ui.c( 3,"btn","bS01",140, 84, 70,  9,  0,  0, "B_s01",cb,  [ 0, 7,   2, 1
    , "`abcdefghijklmno"]);
ui.c( 3,"btn","bS02",140, 92, 70,  9,  0,  0, "B_s02",cb,  [ 0, 7,   2, 1
    , "pqrstuvwxyz{/}~"]);


ui.c( 3,"btn","bV01",  0,100,240, 19,  0,  0, "B_V01",cb,  [12, 3,   2, 1
    , ' !"'+"#$%&'()*+,-./0123456789:;<=>?"]);
ui.c( 3,"btn","bV02",  0,118,240, 19,  0,  0, "B_V02",cb,  [12, 5,   2, 1
    , "@ABCDEFGHIJKLMNOPQRSTUVW"]);
ui.c( 3,"btn","bA03",  0,136, 55, 19,  0,  0, "B_V0#",cb,  [12, 7,   2, 1
    , "XYZ[\]^_"]);
ui.c( 3,"btn","bA03",  0,154, 55, 19,  0,  0, "B_V0#",cb,  [12, 7,   2, 1
    , "xyz{/}~"]);
ui.c( 3,"btn","bS01", 60,136,180, 19,  0,  0, "B_s01",cb,  [12, 6,   2, 1
    , "`abcdefghijklmnopqrstuvw"]);

//ui.c( 3,"btn","b1"  ,  5, 40, 65, 35,  4,  4, "B_1",  cb,  [15, 7,  11, 9, "RED"  ]);
//ui.c( 3,"btn","b2"  , 70, 40, 65, 35,  5,  6, {v:1},  u ,  [-1, 0,  10,10, "BonYbg"],ca);
//
//ui.c( 1,"btn","bS"  ,  5, 71,230, 15,  0,  0, "B_S",  cb,  [ 0, 7,   5, 5
//    , ' !"'+"#$%&'()*+,-./0123456789:;<=>?"]);
//ui.c( 1,"btn","bA"  ,  5, 80,230, 15,  0,  0, "B_A",  cb,  [ 0, 7,   5, 5
//    , "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_"]);
//ui.c( 1,"btn","ba"  ,  5, 89,230, 15,  0,  0, "B_a",  cb,  [ 0, 7,   5, 5
//    , "`abcdefghijklmnopqrstuvwxyz{/}~"]);

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
      .w(0,0,dspW-1,dspH-1) // wipe screen (rect) w/ default / bg color
      .d()                  // display all elements
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
