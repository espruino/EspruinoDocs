/* Copyright (c) allObjects - See the file https://muet.mit-license.org LICENSE for copying permission. */
/*

----- uiEBT ------------------------- 20191030


*** ui EBT - extension for Tap button control.


The ui Extension for Tap Button controlled vs touch screen controlled ui.


--- EBT - ui extension for Tap push button controlled ui - properties - variables
    and methods - mixed into ui base:
 */
exports = // ui ctrl w/ btns vs touch ext, used by ui3|4|5|6BC modules
{ mn: "uiEBT" // module 'clazz' name - globally unique (used to rem frm cache)
, sd: 100     // ms default select delay in tap selected .st()
, ud: 100     // default tap duration defined as u-ntouch d-elay / timeout
, tp: function(iie,ud) { // tap ui elt by idx, id or elt in center, duration
    var _=_||this,e=_.e(iie); if (e) { _.evt((e[3]+e[5])/2,(e[4]+e[6])/2);
    setTimeout(function(){_.evt();},ud||_.ud); }
    return e; }
, st: function(sd,ud) { // tap selected / enter by phys push button
    var _=_||this,a=_.es,i=_.sx,e; if (i>=0) { e=a[i]; _.tp(i,ud);
    setTimeout(function(){ _._seu(_,e,a,i,-1); },sd||_.sd); } return e; }
};
