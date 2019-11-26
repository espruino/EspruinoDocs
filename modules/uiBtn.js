/* Copyright (c) allObjects - See the file https://muet.mit-license.org LICENSE for copying permission. */
/*

----- uiBtn ------------------------- 20191020


*** ui button module


The ui button module extends ui base with button ui element.


--- btn - (plain) button - ui element class properties - variables and methods - mixed into ui base:

 */
exports = // "btn" (plain button) ui element ('clazz' name).
{ mn: "uiBtn" // module 'clazz' name - globally unique (used to remove code from cache)
, btnC:    function (f, c, i, x, y, w,     h,     bc, fc, v, cb,  l, ca) { // constructor
// ----------> btn e[0  1  2  3  4  5(x2)  6(y2)   7   8  9  10  11  12] - same as args
    return this.rdc([f, c, i, x, y, x+w-1, y+h-1, bc, fc, v, cb,  l, ca]); } // runtime obj
, vs3: function(x,y,x2,y2,p,q) { // return vertices for btn like shapes ('round' corners)
    // 12 'round corners' (4x3) defined by 0, p and q insetting combinations for x and y 
    return [ x,y+q,   x+p,y+p,   x+q,y, x2-q,y, x2-p,y+p, x2,y+q,
            x2,y2-q, x2-p,y2-p, x2-q,y2, x+q,y2, x+p,y2-p, x,y2-q]; }
, btnD: function(f,c,i,x,y,x2,y2,bc,fc,v,cb,l,cd) { if (f&1) { // D(isplay) btn w/ label
    var _=_||this,p=_.ma(0.4,((x2-x,y2-y)-11)/8),m=2; if (bc!==_.bc) {
      _.clr(bc).dsp.fillPoly(_.vs3(x+m,y+m,x2-m,y2-m,p,p*3)); } if (fc!==bc) {
      m=2+p*1.3; p*=0.5; _.clr(fc).dsp.fillPoly(_.vs3(x+m,y+m,x2-m,y2-m,p,p*3)); }
    if (l) { _.ld(l,x,y); } } }
, btn: function(_,e,t,c) { // console.log(".btn",c,e[2],(_.ef)?_.ef[2]:"..",(_.lf)?_.lf[2]:"..",t);
    if ((c=(c&&(c=e[10]))?c:e[12])) { // is in focus untouch - else any...
      if (c(e[2], e[9], _, e, t)) { _.d(e); } } } // ...elt and any touch event
};
