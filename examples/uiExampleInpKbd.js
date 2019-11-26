/*<!-- Copyright (c) 2019 allObjects. See the file LICENSE for copying permission. -->
UI Example - Keyboard
=========================

* KEYWORDS: UI,Example,Fonts
* USES: ui,uiInp

Example with uiInp input field ui elements and soft keyboard

*/
// ----- setup lon and log() (considering emulating _eConsole)
var lon = true // logging is on / off
  , log = function() { if (lon) { var lgr;(lgr=(typeof _eConsole
       =="object")?_eConsole:console).log.apply(lgr,arguments);}};

// ----- pull in ui base and ui element(s)
var ui = require("ui")
      .adx(require("uiBtn"))
      .adx(require("uiExt")) // prereq for uiRad and keyboard callback example
      .adx(require("uiInp"))
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
         ? function(id, v, _, e, t) { var s=(t.f|65536).toString(2); // log flags
             log("c:",e[1],"c:",e[1],"id:",id,"v:",v,"f:",[s.substr(5,4),s.substr(9,4),s.substr(13,4)].join(" "),t.f); }
         : ca )
  , u; // for space / memory / var saving value of * undefined *


// ----- define UI (in level 0 - built to be saved)

//---------- Input field example ----------
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

//---------- Keyboard / Keypad example ----------
//
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
      .d()                  // display all elements
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
