/* Copyright (c) allObjects - See the file https://muet.mit-license.org LICENSE for copying permission. */
/*

----- uiSli ------------------------- 20191022


*** ui slider module


ui slider module extends ui base with slider ui element.

Minimal horizontal "s1" slider (for fully loaded ones see examples in documentation):

//    0  1     2       3   4   5   6   7   8  9       10  11
// flgs  clazz id      x   y   w   h  bc fcs  value   cb, ls (arr labels [[...],..])
//       sli                ->x2->y2                    [0][fs tc    x  y  txt fmt
//                                                          min max si
ui.c( 3,"sli","s1"  , 10,145,220, 26,  6,[ 4, 1],0,   cb, [[ u, u,   u, u, u,    0
                                                          , -10,100,[0]]]);

--- sli - slider ui element properties - variables and methods - mixed into ui base:

 */
exports = // sli (slider) ui element ('clazz' name).
{ mn: "uiSli" // module 'clazz' name - globally unique (used to remove code from cache)
, sliC:     function(f, c, i, x, y, w,     h,     bc,fcs,  v,  cb, ls) { // constr / rtime
// ----------> sli e[0  1  2  3  4  5(x2)  6(y2)   7   8   9   10  11] - same as arguments
//                                  ->x2   ->y2                    [0][fs tc x  y  txt fmt
//                                                                     min max si o a flgs
//                                                                     ml mt mr mb
//                                                                [>0][fs tc x  y  txt fmt
  var l=ls[0],j; for(j=9;j<16;j++) l[j]=l[j]||0; // make coding leaner
  return this.rdc([f, c, i, x, y, x+w-1, y+h-1, bc,fcs,  v,  cb, ls]); }
, sliG: function(e) { return e[9]; } // get slider value
, sliU: function(_,e,v,p,m) { e[9]=v; if (p) { //set val w/ propag/cb
    p=(e[10]&&e[10](e[2],v,_,e)); if (!e[0]&1) return; // complete / no dsp
    _.sliD(0,0,0,e[3],e[4],e[5],e[6],e[7],e[8],e[9],0,e[11],m,!p); } }
, sliD: function(q0,q1,q2,x,y,x2,y2,bc,fcs,v,q3,ls,m,r) { // displ (r-reduced)
    var _=_||this,l=ls[0],o=l[9],m=_.sliM(m,[x,y,x2,y2],v,l,o),w=m[6+o],w1=m[8+o],j=1,a,c,s,p,u;
    if (!r) { _.sliDr(0,bc,x,y,x2,y2,2,l); j=ls.length; } // border+extra labls
    if (w1) _.sliDr(1,fcs[0],x,y+m[7]-m[9],x2-m[6]+m[8],y2,3,l); // v/left fill
    if (w-w1) _.sliDr(1,fcs[1],x+m[8],y,x2,y2-m[9],3,l); // empty/right fill
    if (l[0]!==u) { v=(c=l[5])?c(v,_,l):[v+l[6]];p=[x,y];c=l[1]; // auto val...
      if (a=l[10]) { c=fcs[s=_.mr(w1/w)];p[o]+=m[2+o]-w/2*a*(s-0.5); // adj cxy
      } else if (r=v[1]) _.dr(1,r[0],a=l[2]+p[0]+r[1],s=l[3]+p[1]+r[2],a+r[3]-1,s+r[4]-1);
      _.dl([l[0],c,l[2],l[3],v[0]],p[0],p[1]); } // .../clear of/for value label
    while (--j>0) _.dl(ls[j],x,y); } // extra labels aft full displ ls[>0]}
, sliM: function(m,c,v,l,o,t) { // console.log("I",m,c,v,l,o,t); // slfRet,c[xy],v,l,o,touch[xy]
    if (m) m[8+o]=this.mr((v-m[4])/m[5]); else {  // 2nd time aft .sli() touch evt
      var h=o^1,mn=l[6],mm=l[12+o],w=c[o+2]-c[o]-5-mm-l[14+o],vi=(l[7]-mn)/w,w1=0,w2,w3;
      if (t) { w2=this.mc(vi*(v-mn)); w3=(h)?t[0]-c[0]-2-mm:c[1]+3+mm+w-t[1];
      } else w1=this.mr((v-mn)/vi); // 1st time not aft .sli() touch evt
      m=[c[0],c[1],h*mm,o*mm,mn,vi,h*w,o*w,h*w1,o*w1,w2,w3]; }
    return m; } // [0=cxy 2=o:margn 4=mn 5=vi m6=o:w  8=o:w1 10=w2 11=w3]
, sliDr: function(f,c,x,y,x2,y2,m,l) { this.clr(c).dsp[ // draw/fill rect
  (f)?"fillRect":"drawRect"](x+m+l[12],y+m+l[13],x2-m-l[14],y2-m-l[15]); }
, sli: function(_,e,c) { if (e===_.lf) {
    var v=e[9],l=e[11][0],o=l[9],p=c||_.f&l[11],v2
       ,m=_.sliM(0,[e[3],e[4],e[5],e[6]],v,l,o,[_.x,_.y]),w=m[6+o],w2=m[10],w3=m[11];
    if (p||(_.mu(w3-w2)>l[8][0])||(w3<=0)||(w3>=w)) { w3=(w3<=0)?0:(w3>=w)?w:w3;
      if (p=((v2=m[4]+m[5]*w3)!=v)||p) { _.sliU(_,e,(e===_.ef)?v2:v,p,m); } } } }
};
