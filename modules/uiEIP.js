/* Copyright (c) allObjects - See the file https://muet.mit-license.org LICENSE for copying permission. */
/*

----- uiEIP ------------------------- 20191108


*** ui EIP - Extension Initializations for Pixl


Setup and initialize flip() and colors for Pixl. A specific customization for
the display in use. It creates an .ini(_) function on ui called by .connect().
If connect is not doing it, application can / has to call it. 


--- EIP - ui extension for initializing pixl - properties - variables
    and methods - mixed into ui base:
 */
exports = // ui ext ini pixl
{ mn: "uiEIP" // module 'clazz' name - globally unique (used to rem frm cache)
, ini() { // initialize (ui / _ has to be passed
  var _=_||this;
  _.fl=(function(){ _.dsp.flip(); return _; }); // flip
  _.bc=7; // set ui background color to white
  _.tc=0; // set ui touch color to black
  _.clrs= // set white to pixl color (light theme); dark: return [(v&&4)?1:0]
  [function(c,i){ var v=(i)?c^7:c; return [(v&&4)?0:1]; }
  ]; }
};
