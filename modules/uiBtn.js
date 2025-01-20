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
, vs2: function(x,y,x2,y2,p) { // vertices for for chk like shapes ('beveled') corners
    // 4 'beveled corners' = 8 corners def'd by 0 and p insetting combinations for x, y
    return [x,y+p, x+p,y, x2-p,y, x2,y+p, x2,y2-p, x2-p,y2, x+p,y2, x,y2-p]; }
, vs3: function(x,y,x2,y2,p,q) { // return vertices for btn like shapes ('round' corners)
    // 12 'round corners' (4x3) defined by 0, p and q insetting combinations for x and y 
    return [ x,y+p,   x+q,y+q,   x+p,y, x2-p,y, x2-q,y+q, x2,y+p,
            x2,y2-p, x2-q,y2-q, x2-p,y2, x+p,y2, x+q,y2-q, x,y2-p]; }
, btnD: function(f,c,i,x,y,x2,y2,bc,fc,v,cb,l,cd) { if (f&1) { // D(isplay) btn w/ label
    var _=_||this,a=_.mi(x2-x,y2-y)+1,c=(a<16)?"vs2":"vs3"
       ,z=_.ma(0.1,(a-11)/13),p=z*7,q=z*2.8,m=2;
    if (bc!==_.bc) { _.dv(1,bc,x,y,x2,y2,m,c,p,q); }
    if (fc!==bc  ) { m=3+z*1.4; p*=0.75; q*=0.6,_.dv(1,fc,x,y,x2,y2,m,c,p,q); }
    if (l) _.dl(l,x,y); } }
, btn: function(_,e,p) { // is in focus untouch (flip) - else any elt and touch event
    if (p&&(p=(p=e[10])?p:e[12])&&p(e[2],e[9],_,e)) _.d(e); }
};
