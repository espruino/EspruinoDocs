/* Copyright (c) allObjects - See the file https://muet.mit-license.org LICENSE for copying permission. */
/*

----- ui ------------------------- 20191016


*** modular and extensible (graphical) ui framework - commented vs Uncommented version.


--- ui - base code into which elements and custom code are mixed in:

 */

 /* Copyright (c) allObjects - See the file https://muet.mit-license.org LICENSE for copying permission. */
 /*

 ----- ui ------------------------- 20191016


 *** modular and extensible (graphical) ui framework - commented vs Uncommented version.


 --- ui - base code into which elements and custom code are mixed in:

  */

exports = // ui base / 'DOM'/ui e(lement) data & code holder, singleton, for mixins)
{ dsp: null // display (Espruino Graphics object)
, mn: "ui"  // reserved, used temporary
, bc: 0     // dsp background color >=0: r*g*b* bit coded; <0: looked up [...,[R,G,B],...]
, tc: 7     // touch / focus color; >=0: r*g*b* bit coded; <0: looked up [...,[R,G,B],...]
, di: false // display instantly on create/change (not defer until after save())
, es: []    // ui elements
, ef: null  // (primary ui) element (in visual) focus (by touch down / hovering)
, lf: null  // (primary ui element) last (in visual) focus (by touch down / not hovering)
, af: null  // alternate (ui element in non-visual) focus (by drag over / hovering)
, it: false // (display) is touched
, td: false // is touch down (event)
, tt: 0     // touch down time
, lx: 0     // last x (touched)
, ly: 0     // last y (touched)
, dx: -1    // (last) x (touch) down
, dy: -1    // (last) y (touch) down
, te: {f:0} // (last) touch event
, clrs:     // default - bit coded color of 3-bit color-depth - 2^1^3(rgb) = 8 colors
   [function(c,i){ var v=(i)?c^7:c; return [v>>2&1,v>>1&1,v&1]; }.bind(exports)
   ]
, fnts: (function(){ var a=[]; a.push(0); return a; })() // [>0]: setFontMethodNames...
   // ...added w/ .adx(require("fontModuleName")[,-2,"fmn"]), accessed w/ fs<0)
, evt: function(x,y) { // common handling of touch / untouch / tap event
   var _=_||this, a=_.es, i=-1, m=a.length, e=_.ef, o, t={t:undefined!==x,f:0}; _.te=t;
   if (_.td=!_.it && t.t) { _.dx=x; _.dy=y; _.tt=getTime(); t.f|=4; } // touch down
   if (_.it=t.t) { _.lx=t.x=x; _.ly=t.y=y; t.f|=2; // --- touching ---
     if (e) { if (_.iib(e,x,y)) { t.f|=64; return _[e[1]](_,e,t); } // xy in focus elt
       _.blr(e); t.f|=32; _[e[1]](_,e,t); // moved out of (primary) focused element
     } else { if (_.af) { if (_.iib(o=_.af,x,y)) { t.f|=1024; return _[o[1]](_,o,t); }
         _.af=null; t.f|=512; _[o[1]](_,o,t); } } // moved out of (alternate) focused e
     while (++i<m) { if (((e=a[i])[0]&2) && _.iib(e,x,y)) { // loop thru active elts...
       if (!(e[0]&4) && (_.td || (t.t && (e===_.lf)))) { _.foc(e); t.f|=128; } // adj p
       if (!(e[0]&4)) { if (e!==_.af) { _.af=e; t.f|=2048; } else { t.f|=1024 } } // al
       _[e[1]](_,e,t); return; } } if (_.td) { _.lf=_.af=null; } // ...handle hit|miss
   } else { t.f|=1; t.x=_.lx; t.y=_.ly; if (e) { t.f|=16; // --- untouch ---
     if (!_[e[1]](_,e,t,1)) _.blr(e); } [_.lf,o=_.af].forEach( function(e){ if (e) {
       t.f|=((e===o)?256:8); _[e[1]](_,e,t); } } ); _.lf=_.af=null; _.dx=_.dy=-1; } }
, iib: function(e,x,y) { // returns true if x/y is in bounding box of elt, else false
   return ((x>=e[3])&&(y>=e[4])&&(x<=e[5])&&(y<=e[6])); }
, foc: function(e,_) { // focus elt (unfocus elt in focus); visual: draw rectangle in...
   _=_||this; if (e!==_.ef) { if (_.ef) { _.blr(_.ef); } // ...touch color 'around' elt
   _.clr(_.tc).dsp.drawRect(e[3],e[4],e[5],e[6]); e[0]|=4; _.ef=_.lf=e; }
   return _; }
, blr: function(e,_) { // blur elt (all if e falsy); visual: draw rectangle in display...
   _=_||this; _.clr(_.bc); (e?[e]:_.es).forEach(function(e){ // ...bg color around
       if (e[0]&4) { _.dsp.drawRect(e[3],e[4],e[5],e[6]); e[0]&=11; } }); _.ef=null;
   return _; }
, rdc: function(e) { // register ui element, draw/display it conditionally, and return it
   this.es.push(e); if (((e[0]&=7)&1) && this.di) { this.d(e); }
   return e; }
, w: function(x,y,x2,y2,c) { // wipe rectangle (fill w/ c(olor) or display backgnd color)
   var _=_||this,u; this.clr((c===u)?_.bc:c); _.dsp.fillRect(x,y,x2,y2);
   return _; }
, c: function() { // c(reate) ui element like DOM.createElement(), where arguments[1]...
   // ...defines ui element clazz and points to ui element specific constructor method
   var a=arguments, c=this[a[1]+"C"]; if (c) {
   return c.apply(this,a); } }  // undefined ui classes returns undefined as ui element
, d: function(e,f) { // display / redraw ui element e, redraw all if e falsy, if f,...
   var _=_||this,es=e||_.es; // ...call f w/ ui,e for extra drawings/labels/ticks/etc.
   es.forEach(function(e){ if (e[0]&1) _[e[1]+"D"].apply(_,e); },_); if (f) f(_,e);
   return _; }
, clr: function(c,i) { // set color according this.clrs[0](c,i) (customizable) function...
   this.dsp.setColor.apply(this.dsp,this.clrs[0](c,i)); // ...w/ color and i-nverse flag
   return this; }
, fnt: function(s) { // set dsp's font; s<0: vector  font size; s<0: .adx loaded in ...
   var _=_||this,d=_.dsp; if (s) { if (s>0) d.setFontVector(s); else d[_.fnts[-s]]();
   } else d.setFontBitmap(); // ... .fnts[]; if s=0|falsey: built-in 4x6 setFontBitmap()
   return this; }
, ld: function(l,x,y) { // draw label [fs, tc, x, y, txt, optFmt] at optX and optY
   var _=_||this, f, o = (f=l[5]) ? f(l[4],_,l) : l[4];
   _.fnt(l[0]).clr(l[1]).dsp.drawString(o,(x||0)+l[2],(y||0)+l[3]);
   return _; }
, adx: function(mon,t,n) { // add code|font module to ui by mod; type t(default...
   // =-1),-|1=mod,-|2=font; t<0 del from cache; n req for: font, mod only when m.mn!=n
  var _=_||this, m=("string"===typeof mon)?require(mon):mon,k=t||-1,f=_.mu(k),p;
  if      (f===1) { for (p in m) if (p!=="mn") _[p]=m[p]; } // mixin props !"mn"
  else if (f===2) { m.add(Graphics); _.fnts.push("set"+n); } // add to fonts
  else k=0; if (k<0) { Modules.removeCached(n||m.mn); } // delete from cache
  return _; } // from cache if t<0 by: n-ame if (for font must) present, else m.mn
, connect: function(dsp) { // connects w/ initialized Espruino Grapics obj (after save())
   this.dsp=dsp;
   return this; }
, mr:Math.round, mu:Math.abs, mf:Math.floor, mc:Math.ceil, ma:Math.max, mi:Math.min
};
