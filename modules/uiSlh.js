/* Copyright (c) allObjects - See the file https://muet.mit-license.org LICENSE for copying permission. */
/*

----- uiSli ------------------------- 20191014


*** ui slider module


ui slider module extends ui base with slider ui element.


--- sli - slider ui element properties - variables and methods - mixed into ui base:

 */
exports = // sli (slider) ui element ('clazz' name).
{ mn: "uiSli" // module 'clazz' name - globally unique (used to remove code from cache)
, sliC:     function(f, c, i, x, y, w,    h,    bc, fcs, v, cb, ls) {
// ----------> sli e[0  1  2  3  4  5(x2) 6(y2)  7    8  9  10  11] - same as arguments
//                                                              [[fs tc x y txt fmt mn mx flgs a
//                                                                left top right bot]
//                                                              ,[fs tx x y txt fmt],...]
    return this.rdc([f, c, i, x, y, x+w-1, y+h-1, bc,fcs,  v,  cb, ls]); }
, sliG: function(e) { return e[9]; } // get slider value object 
, sliU: function(_,e,t,v,p) { // update slider value w/ or w/o p(ropagation) (call back)
    var l=e[11][0]; e[9]=v; if (p) { if (e[10]&&e[10](e[2],v,_,e,t)) { _.d(e); return; }
    _.sliDu(_,e[3],e[4],e[5],e[6],e[7],e[8],v,l,l[4],l[5],l[9]||0,l[10]||0,l[11]||0,l[12]||0); } }
, sliD: function(f,c,i,x,y,x2,y2,bc,fcs,v,cb,ls) { // display slider
    var _=_||this,l=ls[0],ml=l[9]||0,mr=l[10]||0,mt=l[11]||0,mb=l[12]||0, lx=ls.length;
    _.clr(bc).dsp.fillRect(x+2+ml,y+2+mt,x2-2-mr,y2-2-mb);
    _.sliDu(_,x,y,x2,y2,bc,fcs,v,l,l[4],l[5],ml,mr,mt,mb); while (--lx>0) _.ld(x,y,ls[lx]); }
, sliDu: function(_,x,y,x2,y2,bc,fcs,v,l,mn,mx,ml,mr,mt,mb) { // update slider dsp (w/ l=l[0])
    var w=x2-x-5-ml-mr,w1=_.mr(w/(mx-mn)*(v-mn)),b=x+3+ml,a,d,c,u;
    if (w1) _.clr(fcs[0]).dsp.fillRect(b,y+3+mt,b+w1-1,y2-3-mb); // draw 'left'...
    if (w-w1) _.clr(fcs[1]).dsp.fillRect(b+w1,y+3+mt,x2-3-mr,y2-3-mb); // '...right'part...
    if (l[0]!==u) { v=(c=l[13])?c(v,_,l):v; c=l[1]; // /. ...x and color for val adjusted val lab
      if (a=l[8]) { c=fcs[d=_.mr(w1/w)];x+=ml-w/2*a*(d-0.5); } _.ld(x,y,[l[0],c,l[2],l[3],v]); } }
, sli: function(_,e,t,c) { // console.log(".sli",c,e[2],(_.ef)?_.ef[2]:"..",(_.lf)?_.lf[2]:"..",t);
    if (e===_.lf) { var x=e[3],v=e[9],l=e[11][0],mn=l[4],mx=l[5],s=l[6]
      ,ml=l[9]||0,p=c||t.f&l[7],w=e[5]-x-5-ml-(l[10]||0),vw=mx-mn,wi=vw/w
      ,w1=_.mc(wi*(v-mn)),w3=t.x-x-1-ml,v2;
      if (p||(_.mu(w3-w1)>s)||(w3<=0)||(w3>w)) { w3=(w3<=0)?0:(w3>=w)?w:w3;
        if (p=((v2=mn+wi*w3)!=v)||p) { _.sliU(_,e,t,(e===_.ef)?v2:v,p); } } } }
};
