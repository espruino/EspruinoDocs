/* Copyright (c) allObjects - See the file https://muet.mit-license.org LICENSE for copying permission. */
/*

----- uiEx2 ------------------------- 20191030


*** ui base extension


The ui extension 2 extend ui base with service and convenience functions for
ui frame work as well application


--- ext - ui extension properties - variables and methods - mixed into ui base:

 */
exports = // ui (generic) ext(ension/utils: vertices(circle,...) find elt/idx in arr,...)
{ mn: "uiEx2" // module 'clazz' name - globally unique (used to remove code from cache)
, cb: function(iie,cb,ca) { // get/set prim(precedence)/alt callback of ui elt by idx,
    var _=_||this,e=_.e(iie),u; if (e) { // id or elt; get is w/ cb && ca undef|absent
    if (cb===u && ca===u) { return (e[1]==="rad") ? e[10][1]||e[10][2] : e[10]||e[12]; }
    if (e[1]==="rad") { e[10][1]=cb; e[10][2]=ca; } else { e[10]=cb; e[12]=ca; } }
    return _; }
};
