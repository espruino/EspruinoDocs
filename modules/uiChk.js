/* Copyright (c) allObjects - See the file https://muet.mit-license.org LICENSE for copying permission. */
/*

----- uiChk ------------------------- 20191006


*** ui checkbox module


The ui checkbox module extends ui base with checkbox ui element.


--- chk (check box) ui element class properties - variables and methods - mixed into ui base:

 */
exports = // "chk" (check box) ui element ('clazz' name).
{ mn: "uiChk" // module 'clazz' name - globally unique (used to remove code from cache)
, chkC:    function (f, c, i, x, y, w,     s,     bc, fc, v, cb,  l, ca) { // constructor
// ----------> chk e[0  1  2  3  4  5(x2)  6(s)    7   8  9  10  11  12] - same as args
    return this.rdc([f, c, i, x, y, x+w-1, y+w-1, bc,fc,[!!s,v],cb,l,ca]); } // rtime obj
, vs2: function(x,y,x2,y2,p) { // vertices for for chk like shapes ('beveled') corners
    // 4 'beveled corners' = 8 corners def'd by 0 and p insetting combinations for x, y
    return [x,y+p, x+p,y, x2-p,y, x2,y+p, x2,y2-p, x2-p,y2, x+p,y2, x,y2-p]; }
, chkG: function(e) { return (e[9][0]) ? e[9][1] : undefined; } // get chk VALUE (!state)
, chkU: function(_,e,t,s,p) { var v=!!s; if (e[9][0]!==v) {
      e[9][0]=v; if ((e[0]&1) && _.di) {_.chkDu(_,e[3],e[4],e[5],e[6],e[7],e[8],v,1);} }
      if (p=(p&&(p=e[10]))?p:e[12]) { if (p(e[2],_.chkG(e),_,e,t)) { _.d(e); } } }
, chkD: function(f,c,i,x,y,x2,y2,bc,fc,vi,cb,l) { // draw completely incl. label
    var _=_||this,z=_.ma(0,(x2-x-6)/10),p=_.mf(z*2),m=2; // scaler, outer bevel + margin
    _.clr(bc).dsp.fillPoly(_.vs2(x+m,y+m,x2-m,y2-m,p)); // 'border' + fill w/ same color
    _.chkDu(_,x,y,x2,y2,bc,fc,vi[0],fc!==bc,z); if (l) {_.ld(l,x2,y);} } // 'inner'+label
, chkDu: function(_,x,y,x2,y2,bc,fc,s,b,c) { // draw 'inner': fill(border if diff color)
    var z=c||_.ma(0,(x2-x-6)/10),m=3+_.mf(z*1.2),p=_.mf((m-3)*1.4),f; // inner margn,bevl
    if (b) {_.clr(fc).dsp.fillPoly(_.vs2(x+m,y+m,x2-m,y2-m,p)); } // makes border + fill
    if (s) { f=(fc===bc)?_.clr(fc,1):_.clr(bc); f=_.mf(m+z*1.7); c=_.mf(f-(z-1)*0.5);
      _.dsp.fillPoly([x+f,y+c , x2-c,y2-f, x2-f,y2-c, x+c,y+f ]) // draw X as 2 x-ing...
           .fillPoly([x+f,y2-c, x2-c,y+f , x2-f,y+c , x+c,y2-f]); } } // ...filled polys
, chk: function(_,e,t,c) { // console.log(".chk",c,e[2],(_.ef)?_.ef[2]:"..",(_.lf)?_.lf[2]:"..",t);
    _.chkU(_,e,t,(c)?!e[9][0]:e[9][0],c); } // is in focus untouch (flip) - else any elt and touch event
};
