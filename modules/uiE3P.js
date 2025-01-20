/* Copyright (c) allObjects - See the file https://muet.mit-license.org LICENSE for copying permission. */
/*

----- uiE3P ------------------------- 20191117


*** ui E3P - Extension Initializations for 3-Button ui controlled Pixl


Setup and initialize flip() and colors for Pixl. A specific customization for
the display in use. It creates an .ini(_) function on ui called by .connect().
If connect is not doing it, application can / has to call it. 


--- EIP - ui extension for initializing 3-btn controlled  pixl - properties -
    variables and methods - mixed into ui base:
 */
exports = // ui ext ini pixl
{ mn: "uiE3P" // module 'clazz' name - globally unique (used to rem frm cache)
// from uiExt.js:
, cvn: [[92,38,38,92,-38,92,-92,38,-92,-38,-38,-92,38,-92,92,-38]
       ,[98,20,83,56,56,83,20,98,-20,98,-56,83,-83,56,-98,20,-98,-20,-83,-56,-56,-83,-20,-98,20,-98,56,-83,83,-56,98,-20]]
, cvs: function(x,y,w) { // circle from vertices by bounding box w/ left, top and width
    var r=w/2,c=[x+r,y+r],z=r/100; return this.cvn[(w<12)?0:1].map((v,i) => c[i&1]+v*z); }
, vs2: function(x,y,x2,y2,p) { // vertices for for chk like shapes ('beveled') corners
    // 4 'beveled corners' = 8 corners defined by 0 and p insetting combinations for x, y
    return [x,y+p, x+p,y, x2-p,y, x2,y+p, x2,y2-p, x2-p,y2, x+p,y2, x,y2-p]; }
, vs3: function(x,y,x2,y2,p,q) { // return vertices for btn like shapes ('round' corners)
    // 12 'round corners' (4x3) defined by 0, p and q insetting combinations for x and y 
    return [ x,y+p,   x+q,y+q,   x+p,y, x2-p,y, x2-q,y+q, x2,y+p,
            x2,y2-p, x2-q,y2-q, x2-p,y2, x+p,y2, x+q,y2-q, x,y2-p]; }
, ff: function(a,f,s,_){ // find 1st in a-rray w/ condition f-unction from s-tart w/...
    var x = this.fx(a,f,s,_), u; return (x>=0) ? a[x] : u; } // ... _=this context
, fx: function(a,f,s,_){ var xm = a.length, x = (s||0)-1; // find idx in arr w/ cond...
    while (++x<xm) { if (f(a[x],_)) { return x; } } return -1; } // ... fn, start, _=this
, e: function(iie,s) { var _=_||this,t=typeof iie,u; return (("number"===t) // find e by idx,
    ? ((iie<0)?u:_.es[iie]):("string"===t) ? _.ff(_.es.slice(_.b,_.n),((iie.substr(-1)===".")
    ? function(e){ return ((e[1]==="rad") && (e[10][0]===iie)); } // ...radio grp id., ...
    : function(e){ return (e[2]===iie); }), s) : iie); } // ... or ui element id
, g: function(iie) { // get value / value obj of ui element by idx, id or element
    var e=this.e(iie), u; return (e) ? this[e[1]+"G"](e) : u; }
, u: function(iie,v,p) { // update val obj of ui elt by idx, id or elt...
    var _=_||this, e=_.e(iie), u; if (e) _[e[1]+"U"](_,e,v,p===u||p);
    return _; } // ...w/ (default, if not specified) and w/o propagation
// from uiEBC.js:
, sx: -1   // idx elt selected w/ ui ctrl w/ phys push btns, no touch
, deb: 15  // button  debounce value
, btns: [] // push buttons
, sn: function(w,f,l) { // put sel-focus on next elt (w-rapped
    // all opt: w, f-irst (def 0), l-ast+1 (def .es[].len); f+l f kbd scope
    var _=_||this, i=j=_.sx, r=(w)?3:2, a=_.es, s=f||_.b,m=l||_.n
      , k=-1, e; while (--r) { while (++i<m) if (a[i][0]&3===3) {
    e=a[k=i]; m=r=1; } i=s-1; } _._seu(_,e,a,k,j); return e; }
, sp: function(w,f,l) { // put sel-focus on prev elt (w-rapped
    // all opt: w, f-irst (def 0), l-as+1 (def .es[].len); f+l f kbd scope
    var _=_||this, i=j=_.sx, r=(w||i<0)?3:2, a=_.es, s=f||_.b, m=l||_.n
      , k=-1, e; while (--r) { while (--i>=s) if (a[i][0]&3===3) {
    e=a[k=i]; s=m; r=1; } i=m; } _._seu(_,e,a,k,j); return e; }
, _seu: function(_,e,a,i,j) { // util: blur foc, clear sel, sel w/ e = ...
    var c=_.bc,u; if (_.ef) _.blr(_.ef); // ...new sel|-1, j=old se l| -1
    [(i===j,j<0)?u:a[j],(i<0)?u:a[i]].forEach(function(e){
       if (e) _.clr(c).dsp.drawPoly([e[5],e[4],e[3],e[4],e[3],e[6]]);
       c=_.tc; }); _.sx=i; }
, Btn: function(btn,downCb,upCb,deb) { // push Button 'clazz'
    var dn=(downCb)?downCb:function(){},up=(upCb)?upCb:function(c){c[1]=0;}
       ,c=[1,0]; // control: c[0]=0/1=disabled/enabled
    this.c=c;    //          c[1]=0 no tap active, >0: getTime() of down
    this.d=setWatch( function(e) { if (! c[1]) { c[1]=Math.round(e.time*100); if (c[0]) dn(c); } }
          , btn, {edge:"rising" ,repeat:true,debounce:deb} );
    this.u=setWatch( function(e) { if (  c[1]) { if (c[0]) up(c,Math.round(e.time*1000)-c[1]); } }
          , btn, {edge:"falling",repeat:true,debounce:deb} ); }
// from uiEIP.js:
, ini() { // (custom) initialize
    var _=_||this;
    _.fl=(function(){ _.dsp.flip(); return _; }); // flip
    _.bc=7; // set ui background color to white
    _.tc=0; // set ui touch color to black
    _.clrs= // set white to pixl color (light theme); dark: return [(v&&4)?1:0]
    [function(c,i){ var v=(i)?c^7:c; return [(v&&4)?0:1]; }
    ]; }
// from uiEP3.js:
, connect: function(dsp,ent,nex,prev,deb) { // enter, nex, prev btn, debounce
    var _=_||this,bs=_.btns,B=_.Btn,i,e,a,u,db=(deb===u)?_.deb:deb;
    if (_.ini) _.ini(); // (custom) initialize
    bs.push(new B(ent // enter / tap button 
       ,function(c){ if ((i=_.sx)>-1) { e=_.es[i];_.evt((e[3]+e[5])/2,(e[4]+e[6])/2); _.fl(); } }
       ,function(c,t){setTimeout(function(){_.evt(); if ((i=_.sx)>-1) _._seu(_,(a=_.es)[i],a,i,-1); _.fl(); c[1]=0; });}
       ,db));
    bs.push(new B(nex ,u,function(c,t){_.sn();_.fl();c[1]=0;},db)); // next ui elt button
    bs.push(new B(prev,u,function(c,t){_.sp();_.fl();c[1]=0;},db)); // previous ui elt button
    _.dsp=dsp;
    return _; }
};
