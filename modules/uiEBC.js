/* Copyright (c) allObjects - See the file https://muet.mit-license.org LICENSE for copying permission. */
/*

----- uiEBC ------------------------- 20191030


*** ui EBC - extension for button control vs touch screen control


The ui Extension for Button Controlled ui vs touch screen controlled ui.


--- EBC - ui extension for push button controlled ui - properties - variables
    and methods - mixed into ui base:
 */
exports = // ui ctrl w/ btns vs touch ext, used by ui3|4|5|6BC modules
{ mn: "uiEBC" // module 'clazz' name - globally unique (used to rem frm cache)
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
};
