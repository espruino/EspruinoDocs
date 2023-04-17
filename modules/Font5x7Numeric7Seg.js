/* Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 7 segment 5x7 font - only '-.0123456789ABCDEF' */
/*
require("sevenseg_font_tools").createFont({
  img : `
 aa
f  b
fx b
 gg
ex c
e  c
odd`,
  width : 6, // width +1 for empty column
  colonWidth : 2, // width of colon
  doubleWidth : 6, // width for double-size (eg 'W' and 'M')
  height : 9,
  export : "hex"
});
*/

exports.add = function(graphics) {
  graphics.prototype.setFont5x7Numeric7Seg = function() {
    return this.setFontCustom(atob("DEkkjAAAAAAgEAAAAAAgAbEEgjYAAAAAAADYAAADEkkjAAAAAEkkjYAAAYAgEDYAAAYEkkgYAAAbEkkgYAAAAEAgDYAAAbEkkjYAAAYEkkjYAAAABQbEgkDYAAAbAkEgYAAAbEEggAAAADAkEjYAAAbEkkgAAAAbEgkAAAAA"), 32, atob("BgAAAAAAAAAAAAAAAAYCAAYGBgYGBgYGBgYCAAAAAAAABgYGBgYG"), 9);
  }
}
