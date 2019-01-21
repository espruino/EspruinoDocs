/* Copyright (c) 2018 allObject / Pur3 Ltd. See the file LICENSE for copying permission. */
/*
TouchRD.js - Touch screen, Resistive, Direct - controller class.

Module returning 'class' (contructor) for connecting Espruino
directly to resistive touch screen's four (4) Y-, X-, Y+, Y+
drive and sense lines. No touch controller IC, such as ADS7843
or XPT2046 involved. Espruino *IS* the controller. TouchRD is
callback backward compatible w/ touchscreen.js module. Portrait
and Landscape configurations and calibration described in module
documentation. NOTE: leave drive/sense pins unset (auto).

Usage (w/ PICO pin connection example):

```
var touchRD = new (require("TouchRD"))
    ( yn // A5 - Y- - analog read able pin
    , xn // A6 - X- - analog read able pin                         
    , yp // A7 - Y+ - any pin
    , xp // B1 - X+ - any pin
    , cb // optional callback function( // accepting:
         // , x // x coordinate on touch, else undefined
         // , y // y coordinate on touch, else undefined
         // , t // t touchRD (touch direct controller)
         // ) { ...
    , cc // optional custom configuration object like default
         // C(config) for any screens.
    );
    
 var touchRD = new (require("TouchRD"))(A5,A5,A7,B1,function(x,y,t){
   if (t.t) console.log(x,y); else console.log(t.x,t.y,t.moved()); });
 ```
*/

/**
  Default config for 240x320 (TFT display w/) touch screen.
  Can be partially overwritten with custom values on construction.
  Each of these constants will also be a property of the controller.
  */
var C =         // default C(onfig) for 240x320 TFT w/ touch screen
  { X: 240      // x horizontal pixels / resolution (0 = left edge)
  , Y: 320      // y vertical   pixels / resolution (0 = top  edge)
  , xm: 3       // x moved threshold - abs(1st-last)>=xm means moved
  , ym: 3       // y moved threshold - abs(1st-last)>=ym means moved
  , xt: 0.0015  // x threshold analog value for touch detection
  , yt: 0.0012  // y threshold analog value for touch detection
  , xc: 0.4960  // x center analog value on touch
  , yc: 0.4795  // y center analog value on touch
  , xd: 0.00318 // x delta per pixel analog value 
  , yd: 0.00251 // y delta per pixel analog value
  , ti: 100     // track interval in [ms] while touching
  , db: 5       // debounce on touch begin
  , en: true    // enabled (truthy) touch detection 
  }

/** constructor (class) - _ internal arg for auto var declaration */
, TouchRD = function(yn, xn, yp, xp, cb, cc, _) { _ = _ || this;
  _.yn = yn; _.xn = xn; _.yp = yp; _.xp = xp; _.cb = cb;
  // accepting custom config and property creation (see default C) 
  for (var v in C) _[v] = (v in (cc || {})) ? cc[v] : C[v];
  _.X2 = _.X/2+0.5; // internal use
  _.Y2 = _.Y/2+0.5; // internal use
  // touch down time w/ first x, y, last raw and pixel x and y
  _.td = _.xf = _.yf = _.xr = _.yr = _.x = _.y = 0;
  _.t  = false;     // true on touch
  _.w  = null;      // watch id for touch down
  _.enable(_.en);   // enable/disable as config after constructed
}, _p = TouchRD.prototype;
/** read xy returning this - callback, watch event of touch dowh */
_p.xy = function(cb, e, _) { _ = _ || this;
  pinMode(_.yn,"input_pulldown"); // prep reading raw y
  pinMode(_.yp); _.yp.read();
  pinMode(_.xn); pinMode(_.xp);
  digitalWrite([_.xn,_.xp],1);
  _.xr = (analogRead(_.yp)+analogRead(_.yp))/2;
  pinMode(_.xn,"input_pulldown"); // prep reading raw x
  _.xp.read();
  pinMode(_.yn);
  digitalWrite([_.yn,_.yp],1);
  _.yr = (analogRead(_.xp)+analogRead(_.xp))/2;
  _.yn.read(); _.yn.read();
  if ((_.t = (_.xr>_.xt && _.yr>_.yt))) { // calc/limit xy on touch
    _.x = ((_.x = Math.floor(_.X2+(_.xr-_.xc)/_.xd)) 
      <0) ? 0 : (_.x<_.X) ? _.x : _.X-1;
    _.y = ((_.y = Math.floor(_.Y2+(_.yr-_.yc)/_.yd)) 
      <0) ? 0 : (_.y<_.Y) ? _.y : _.Y-1;
   if (e) { _.td = e.time; _.xf = _.x; _.yf = _.y; } // catch down
   if (cb) { cb(_.x, _.y, _); } // callback on touch and on...                        
  } else if (!e && cb) { cb(undefined, undefined, _); } // ...untouch
  return _;
};
/** - 'private' - track between touch down annd un-touch */
_p._trk = function(e, _) { _ = _ || this; _.w = null;
  if (_.xy(_.cb, e, _).t && _.en) {    // while touch keep tracking:
    setTimeout(_._trk, _.ti, null, _); // - set time for next xy read 
  } else { // on untouch: ...
    _.enable(_.en, _); } // ...return to watch touch down (if enabled)
};
/** moved() returns true when last-first x or y reach move threshold */
_p.moved = function(_) { _ = _ || this;
  return (Math.abs(_.x-_.xf)>=_.xm || Math.abs(_.y-_.yf)>=_.ym);
};
/** enable/disable - .enable() is same as .enable(truthy)  */
_p.enable = function(b, _) { _ = _ || this;
  if ((_.en = !!((b === undefined) || b)) && !_.w) { // enable...
    pinMode(_.xn,"input_pulldown"); // ...setup wath for touch down
    pinMode(_.xp); _.xp.read();
    pinMode(_.yn); pinMode(_.yp);
    digitalWrite([_.yn,_.yp],3);
    _.w = setWatch(_._trk.bind(_), _.xp
        , {edge:"rising", repeat:false, debounce:_.db});
  } else { // disable (clear eventual watch
    _.w = _.w && clearWatch(_.w);
    _.yn.read(); _.yn.read(); }
  return _;
};
exports = TouchRD; // return 'class' (constructor)