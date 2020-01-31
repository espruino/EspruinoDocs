/* Copyright (c) allObjects - See the file https://muet.mit-license.org LICENSE for copying permission. */
/*

----- uiInp ------------------------- 20191006


*** ui input field module


ui input module extends ui base module with input field ui element.


--- inp (input field) ui element class properties - variables and methods - mixed into ui base:

 */
exports = // inp (input field) ui element
{ mn: "uiInp" // module 'clazz' name - globally unique (used to remove code from cache)
, inpC:     function(f, c, i, x, y, w,     h,     bc, fc,  v,  cb, ls) {
// ----------> btn e[0  1  2  3  4  5(x2)  6(y2)   7   8   9   10  11] - same as arguments
    return this.rdc([f, c, i, x, y, x+w-1, y+h-1, bc, fc,  v,  cb, ls]); }
, inpG: function(e) { return e[9]; } // G(et value from) inp(ut ui element)
, inpU: function(_,e,t,v,p) { var vi=e[11][0], v2=("string" === typeof v) // update
    ? v : ""+v, l; v2=v2.substr(0,Math.min(v2.length, (l=vi[4]) ? l : v2.length));
    if (v2!==e[9]) { e[9]=v2; _.inpDu(_,e[0],e[3],e[4],e[5],e[6],e[8],v2,e[11][0],1); }
    if (p && e[10] && e[10](e[2], v2, _, e, t)) { _.d(e); } }
, inpD: function(f,c,i,x,y,x2,y2,bc,fc,v,cb,ls) { // D(isplay of) inp(ut ui element)
    // displays whole ui element incl. label; uses inpDu to display the updateable part
    var _=this, m=2; _.clr(bc).dsp.fillPoly(_.vs3(x+m,y+m,x2-m,y2-m,1,3));
    _.inpDu(_,f,x,y,x2,y2,fc,v,ls[0],bc!==fc);
    if (m=ls[1]) { _.ld(m,x2,y); } }
, inpDu: function(_,f,x,y,x2,y2,fc,v,vi,b) { // Display (redraws) the updateable part of inp
    var m=5; if (b) { _.clr(fc).dsp.fillRect(x+m,y+m,x2-m,y2-m); } if (f&2) {
      _.clr(fc,1).dsp.drawLine(x2-11,y+11,x2-4,y+4);_.dsp.drawLine(x2-11,y+4,x2-4,y+11); }
    _.ld([vi[0],vi[1],vi[2],vi[3],(m=vi[7])?m(v):v],x,y); }
, inp: function(_,e,t) { if ((e===_.ef) && !t.t) { // touch event on inp ui element
      _.inpU(_, e, t, ((Math.abs(_.lx-_.dx)<4) && (Math.abs(_.ly-_.dy)<4)
        && (Math.abs(e[5]-7-t.x)<4) && (Math.abs(e[4]+7-t.y)<4)) ? "" : e[9], 1); } }
};
