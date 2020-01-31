/* Copyright (c) allObjects - See the file https://muet.mit-license.org LICENSE for copying permission. */
/*

----- uiSli ------------------------- 20191016


*** ui slider module


ui slider module extends ui base with slider ui element.

NOTE: *STILL* a HORIZONTAL slider... but it includes analysis about making it both... ;-)

--- sli - slider ui element properties - variables and methods - mixed into ui base:

 */
exports = // sli (slider) ui element ('clazz' name).
{ mn: "uiSli" // module 'clazz' name - globally unique (used to remove code from cache)
, sliC:     function(f, c, i, x, y, w,     h,     bc,fcs,  v,  cb, ls) {
// ----------> sli e[0  1  2  3  4  5(x2)  6(y2)   7   8   9   10  11] - same as arguments
    return this.rdc([f, c, i, x, y, x+w-1, y+h-1, bc,fcs,  v,  cb, ls]); }
, sliG: function(e) { return e[9]; } // get slider value

, sliU: function(_,e,t,v,p) { // update slider value w/ or w/o p(ropagation) (call back)
    var s="sliDu",u; e[9]=v; if (p) {
      if (e[10]&&e[10](e[2],v,_,e,t)) { if (!e[0]&1) return; s="sliD"; }
      _[s](_,u,e[2],e[3],e[4],e[5],e[6],e[7],e[8],e[9],u,e[11]); } }

, sliD: function(_,q,i,x,y,x2,y2,bc,fcs,v,_q,ls) { // display slider
    var _=_||this,j=ls.length,u; _.sliDu(_,u,i,x,y,x2,y2,bc,fcs,v,u,ls,1);
    while (--j>0) _.ld(ls[j],x,y); } // extra labels

, sliDu: function(_,q,i,x,y,x2,y2,bc,fcs,v,_q,ls,d) { // sli displ / upd
    var m                                                                // <<<<<========= 'math' passed if already done
         ,l=ls[0],mn=l[4],mx=l[5],ml=l[9]||0,mt=l[10]||0,mr=l[11]||0,mb=l[12]||0 // may already be in m and passed for orientation transparency
         ,w=x2-x-5-ml-mr                                                 // <------------- calc pixRange from norm-named oriented vars
                        ,vi=(mx-mn)/w                                    // calc valPerPix = val per pixel = valRange / pixRange
                                     ,w1=_.mr(1/vi*(v-mn))               // calc val / valPerPix ===> (new old) fill pix
//                                   ,w1=_.mr(w/(mx-mn)*(v-mn))          // calc pixRange / valRange * val ===> (new old) fill pix (orig)
                                                               ,a,b,c,u;
    if (d) _.clr(bc).dsp.drawRect(x+2+ml,y+2+mt,x2-2-mr,y2-2-mb);        // display border
    b=x+3+ml;                                                            // displ coord calc size optimization
    if (w1) _.clr(fcs[0]).dsp.fillRect(b       ,y+3+mt,b      +w1-1,y2-3-mb);  // draw 'left/filled'... // <-------------
    if (w-w1) _.clr(fcs[1]).dsp.fillRect(b+w1  ,y+3+mt,x2-3-mr     ,y2-3-mb);  // '...right/empty'part... // <-------------

    if (l[0]!==u) { v=(c=l[13])?c(v,_,l):v; c=l[1]; // /. ...x and color for val adjusted val lab
      if (a=l[8]) { c=fcs[d=_.mr(w1/w)];
                                        x+=ml-w/2*a*(d-0.5);             // <-------------
                                                             } _.ld([l[0],c,l[2],l[3],v],x,y); } }

, sli: function(_,e,t,c) { // console.log(".sli",c,e[2],(_.ef)?_.ef[2]:"..",(_.lf)?_.lf[2]:"..",t);
    if (e===_.lf) { var v=e[9]
                              ,l=e[11][0]                                // in m()/sliDu() (?)
                                         ,mn=l[4],mx=l[5]                // in m()/sliDu() (?)
     ,x=e[3],x2=e[5],ml=l[9]||0,mr=l[11]||0                              // <------------- get/'rename' oriented vars to norm-named oriented vars
//                                                      e[ 3 4 5  6  7  8    10.0
                                           ,m //=_.sliMu(_,x,y,x2,y2,bc,fcs,v,l,anyOthers,0,t)   // <<<<<=========
                                             ,w3=t.x-x-1-ml              // <------------- get new fill pix
                                             ,w=x2-x-5-ml-mr             // <------------- calc pixRange from norm-named oriented vars
                                             ,vi=(mx-mn)/w               // calc valPerPix = val per pixel = valRange / pixRange
                                             ,w1=_.mc(vi/1*(v-mn))       // valPerPix * val ===> calc old old fill pix
//                                           ,w=m[0],w3=m[3]             // size optimization after m() //sliDu() call
                                                            ,p=c||t.f&l[7],s=l[6],v2;
      if (p||(_.mu(w3-w1)>s)||(w3<=0)||(w3>w)) { w3=(w3<=0)?0:(w3>=w)?w:w3;
        if (p=((v2=mn+vi*w3)!=v)||p) { _.sliU(_,e,t,(e===_.ef)?v2:v,p,m); } } } }
};
