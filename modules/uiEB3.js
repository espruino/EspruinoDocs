/* Copyright (c) allObjects - See the file https://muet.mit-license.org LICENSE for copying permission. */
/*

----- uiEB3 ------------------------- 20191117


*** ui EB3 - extension for bangle with 3 button controlled vs touch screen control


The ui Extension for bangle with 3 Button controlled ui vs touch screen controlled ui.


--- EB3 - ui extension for bangle with 3 push button controlled ui - properties -
    variables and methods - mixed into ui base:
 */
exports = // ui ctrl w/ 3 btns vs touch ext
{ mn: "uiEB3" // module 'clazz' name - globally unique (used to rem frm cache)
, connect: function(dsp,ent,nex,prev,deb) { // enter, nex, prev btn, debounce
    var _=_||this,bs=_.btns,B=_.Btn,i,e,a,u,db=(deb===u)?_.deb:deb;
    if (_.ini) _.ini(); // (custom) initialize
    bs.push(new B(ent
       , function(c){ if ((i=_.sx)>-1) { e=_.es[i];_.evt((e[3]+e[5])/2,(e[4]+e[6])/2); }}
       , function(c){setTimeout(function(){_.evt(); if ((i=_.sx)>-1) _._seu(_,(a=_.es)[i],a,i,-1); c[1]=0; });}
       ,db));
    bs.push(new B(nex ,u,function(){_.sn();},db)); // next ui elt button
    bs.push(new B(prev,u,function(){_.sp();},db)); // previous ui elt button
    _.dsp=dsp;
    return _; }
};
