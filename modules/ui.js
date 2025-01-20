/* Copyright (c) allObjects - See the file https://muet.mit-license.org LICENSE for copying permission. */
/*

----- ui ------------------------- 20191108


*** modular and extensible (graphical) ui framework - commented vs Uncommented version.


--- ui - base code into which elements and custom code are mixed in:

 */
exports = // ui base / 'DOM'/ui e(lement) data & code holder, singleton, for mixins)
{ dsp: null // display (Espruino Graphics object)
, mn: "ui"  // reserved, used temporary
, x:  0     // touch/untouch / cursor pos x of current touch event
, y:  0     // touch/untouch / cursor pos y of current touch event
, t:  0     // touch/untouch of current touch event
, f:  0     // flags of current touch event
, b:  0     // begin (first) element in current screen in es 
, n:  0     // next screens begin (first) element in es
, es: []    // ui elements
, bc: 0     // dsp background color >=0: r*g*b* bit coded; <0: looked up [...,[R,G,B],...]
, tc: 7     // touch / focus color; >=0: r*g*b* bit coded; <0: looked up [...,[R,G,B],...]
, di: 0     // display instantly on create/change (not defer until after save())
, ef: 0     // (primary ui) element (in visual) focus (by touch down / hovering)
, lf: 0     // (primary ui element) last (in visual) focus (by touch down / not hovering)
, af: 0     // alternate (ui element in non-visual) focus (by drag over / hovering)
, it: 0     // (display) is touched
, td: 0     // is touch down (event)
, tt: 0     // touch down time
, lx: -1    // last x (touched)
, ly: -1    // last y (touched)
, dx: -1    // x of last touch down
, dy: -1    // y of last touch down
, clrs:     // default - bit coded color of 3-bit color-depth - 2^1^3(rgb) = 8 colors
    [function(c,i){ var v=(i)?c^7:c; return [v>>2&1,v>>1&1,v&1]; }
    ]
, fnts: [1] // [undef]; [>0]: setFontMethodNames... such as "setFont6x8"
    // ...added w/ .adx(require("fontModuleName")[,-2,"fmn"]), set w/ .fnt(fs<0)
, evt: function(x,y) { // common handling of touch / untouch / tap / drag / swipe event
    var _=_||this, a=_.es, i=_.b-1, m=_.n, e=_.ef, o; _.t=x!==o; _.f=0;
    if (_.td=!_.it && _.t) { _.dx=x; _.dy=y; _.tt=getTime(); _.f|=4; } // touch down
    if (_.it=_.t) { _.lx=_.x=x; _.ly=_.y=y; _.f|=2; // --- touching ---
      if (e) { if (_.iib(e,x,y)) { _.f|=64; return _[e[1]](_,e); } // xy in focus elt
        _.blr(e); _.f|=32; _[e[1]](_,e); // moved out of (primary) focused element 
      } else { if (_.af) { if (_.iib(o=_.af,x,y)) { _.f|=1024; return _[o[1]](_,o); }
          _.af=0; _.f|=512; _[o[1]](_,o); } } // moved out of (alternate) focused e
      while (++i<m) { if (((e=a[i])[0]&2) && _.iib(e,x,y)) { // loop thru active elts...
        if (!(e[0]&4) && (_.td || (_.t && (e===_.lf)))) { _.foc(e); _.f|=128; } // adj p
        if (!(e[0]&4)) { if (e!==_.af) { _.af=e; _.f|=2048; } else { _.f|=1024 } } // al
        _[e[1]](_,e); return; } } if (_.td) { _.lf=_.af=0; } // ...handle hit|miss
    } else { _.f|=1; _.x=_.lx; _.y=_.ly; if (e) { _.f|=16; // --- untouch ---
      if (!_[e[1]](_,e,1)) _.blr(e); } [_.lf,o=_.af].forEach( function(e){ if (e) {
        _.f|=((e===o)?256:8); _[e[1]](_,e); } } ); _.lf=_.af=0; _.dx=_.dy=-1; } }
, iib: function(e,x,y) { // returns true if x/y is in bounding box of elt, else false
    return ((x>=e[3])&&(y>=e[4])&&(x<=e[5])&&(y<=e[6])); }
, foc: function(e,_) { // focus elt (unfocus elt in focus); visual: draw rectangle in...
    _=_||this; if (e!==_.ef) { if (_.ef) _.blr(_.ef,_);  // ...touch color 'around' elt
    _.clr(_.tc).dsp.drawRect(e[3],e[4],e[5],e[6]); e[0]|=4; _.ef=_.lf=e; }
    return _; }
, blr: function(e,_) { // blur elt e, all if falsy: draw rect in display bg clr around
    var _=_||this;_.clr(_.bc);((e)?[e]:_.es.slice(_.b,_.n)).forEach(function(e){
      if (e[0]&5===5) { _.dsp.drawRect(e[3],e[4],e[5],e[6]); e[0]&=11; } }); _.ef=null;
    return _; }
, rdc: function(e) { // register ui element, draw/display it conditionally, and return it
    this.es[this.n++]=e; if (((e[0]&=7)&1) && this.di) this.d(e);
    return e; }
, c: function() { // c(reate) ui element like DOM.createElement(), where arguments[1]...
    // ...defines ui element clazz and points to ui element specific constructor method
    var a=a||arguments; return this[a[1]+"C"].apply(this,a); }  // returns ui element
, d: function(e,f) { // display / redraw ui element e, redraw all if e falsy, if f,...
    var _=_||this,es=(e)?[e]:_.es.slice(_.b,_.n); // ...call f w/ ui,e f/ extra drawings
    es.forEach(function(e){ if (e[0]&1) _[e[1]+"D"].apply(_,e); }); if (f) f(_,e);
    return _; }
, clr: function(c,i) { // set color according this.clrs[0](c,i) (customizable) function...
    this.dsp.setColor.apply(this.dsp,this.clrs[0](c,i)); // ...w/ color and i-nverse flag
    return this; }
, fnt: function(s) { // set dsp's font; s<0: vector  font size; s<0: .adx loaded in ...
    var _=_||this,d=_.dsp; if (s) { if (s>0) d.setFontVector(s); else d[_.fnts[-s]]();
    } else d.setFontBitmap(); // ... .fnts[]; if s=0|falsey: built-in 4x6 setFontBitmap()
    return _; }
, dl: function(l,x,y) { // draw label [fs, tc, x, y, txt, optFmt] at optX and optY
    var _=_||this, f, o = (f=l[5]) ? f(l[4],_,l) : l[4];
    _.fnt(l[0]).clr(l[1]).dsp.drawString(o,(x||0)+l[2],(y||0)+l[3]);
    return _; }
, dr: function(f,c,x,y,x2,y2,m) { // draw/fill rect, opt margin, bg clr when undef,
    var _=_||this,u; m=m||0; x=x||0; y=y||0; // x/y=0,x2/y2=width/height when
    x2=(x2)?x2:_.dsp.getWidth()-1; y2=(y2)?y2:_.dsp.getHeight()-1; // undef
    _.clr((c===u)?_.bc:c).dsp[(f)?"fillRect":"drawRect"](x+m,y+m,x2-m,y2-m); return _; }
, dv: function(f,c,x,y,x2,y2,m,v,p,q) { var _=_||this; m=_.mr(m); // fill / draw vertices
    _.clr(c).dsp[(f)?"fillPoly":"drawPoly"](_[v](x+m,y+m,x2-m,y2-m,_.mr(p),_.mr(q||0)),1);
    return _; }
, adx: function(mon,t,n) { // add code|font module to ui by mod; type t(default...
    // =-1),-|1=mod,-|2=font; t<0 del from cache; n req for: font, mod only when m.mn!=n
   var _=_||this, m=("string"===typeof mon)?require(mon):mon,k=t||-1,f=_.mu(k),p;
   if      (f===1) { for (p in m) if (p!=="mn") _[p]=m[p]; } // mixin props !"mn"
   else if (f===2) { m.add(Graphics); _.fnts.push("set"+n); } // add to fonts
   else k=0;  if (k<0) { Modules.removeCached(n||m.mn); } // delete from cache
   return _; } // from cache if t<0 by: n-ame if (for font must) present, else m.mn
, mr:Math.round, mu:Math.abs, mf:Math.floor, mc:Math.ceil, ma:Math.max, mi:Math.min
, ini: function() {} // (custom) init
, connect: function(dsp) { // connects w/ initialized Espruino Grapics obj (after save()) 
    this.dsp=dsp;
    this.ini();
    return this; }
};
