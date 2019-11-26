/* Copyright (c) allObjects - See the file https://muet.mit-license.org LICENSE for copying permission. */
/*

----- uiRad ------------------------- 20191006


*** ui radio button module


The ui radio button module extends ui base with radio button ui element.


--- rad (radio button) ui element class properties - variables and methods - mixed into ui base:

 */
exports = // rad (radio button) ui element ('clazz' name).
{ mn: "uiRad" // module 'clazz' name - globally unique (used to remove code from cache)
, radC:    function (f, c, i, x, y, d,     s,     bc, fc, v, cb,  l, ca) { // constructor
// ----------> rad e[0  1  2  3  4  5(x2)  6(y2)   7   8  9  10  11  12] - same as args
    var gi=i.split(".")[0]+".", e=this.ff(this.es,function(e){ // find group peer by grp
      return ((e[1]==="rad")&&(e[10][0]===gi)); }), g=(e)?e[10]:[gi,cb,ca,null]; // ..id
// ----------> rad e[0  1  2  3  4  5(x2)  6(y2)   7   8  9  10  11  12] - same as args
    g.push(       e=[f, c, i, x, y, x+d-1, y+d-1, bc, fc,[s,v],g, l, ca]); // - runtime obj
    g[1]=g[1]||cb; g[2]=g[2]||ca; if (e[9][0]=s&&!g[3]) { g[3]=e; } return this.rdc(e); }
, radG: function(e) {
    var w=e[10]; return ((w=w[2])&&w[9][0]) ? w[1] : undefined; }
, radU: function(_,e,t,v,p) { var g=e[10], // grp, new, old
    n=(v===undefined)?e:_.ff(g,function(o){ return (o[9][1]===v); },4), o;
    if (p && n && (n===_.ef)) { if (n===(o=g[3])) { if (g[1]) return; } else {
      if (o) { _.radu(_,o,o[9][0]=0); } _.radu(_,g[3]=n,n[9][0]=1); } }
    if (p=(p&&(p=g[1]))?p:g[2]) { if (p(n[2],n[9][1],_,n,t)) { _.d(e); } } } 
, radu: function(_,e,s) {
//    _.radDs(_,e[3],e[4],_.mr((e[5]-e[3]-1)/2),e[8],s); }
    _.radDs(_,e[3],e[4],e[5]-e[3]+1,e[8],s); }
, radD: function(f,c,i,x,y,x2,y2,bc,fc,vi,g,l) {
//    if (f&1) { var _=_||this, w2=_.mr((x2-x-1)/2),s=vi[0];
//    _.clr(bc).dsp.fillPoly(_.cvs(x+w2,y+w2,w2-2));
    if (f&1) { var _=_||this,w=x2-x+1,s=vi[0];_.clr(bc).dsp.fillPoly(_.cvs(x+2,y+2,w-4));
    if ((fc!==bc) || !s) { _.radDs(_,x,y,w,fc,s); } if (l) { _.ld(l,x2,y); } } }
, radDs: function(_,x,y,w,fc,s) {
    // _.clr((s)?fc:_.bc).dsp.fillPoly(_.cvs(x+w2,y+w2,w2-5)); }
    var m=3+_.mf(w/14); _.clr((s)?fc:_.bc).dsp.fillPoly(_.cvs(x+m,y+m,w-m*2)); }
, rad: function(_,e,t,c) { // console.log(".rad",c,e[2],(_.ef)?_.ef[2]:"..",(_.lf)?_.lf[2]:"..",t);
    _.radU(_,e,t,undefined,c); } // is in focus untouch (set) - else any elt and touch event
};
