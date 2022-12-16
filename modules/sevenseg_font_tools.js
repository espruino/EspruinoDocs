/* Copyright (c) 2022 Gordon Williams. See the file LICENSE for copying permission.

7 segment font maker

Usage:

require("sevenseg_font_tools").createFont({
  img : `
 aaaa jjjj
f    b    i
fxx  b    i
fxx  b    i
f    b    i
 gggg
e    c    i
exx  c    i
exx  c    i
e    c    i
odddd hhhh`,

  width : 7, // width +1 for empty column
  colonWidth : 5, // width of colon
  doubleWidth : 12, // width for double-size (eg 'W' and 'M')
  height : 11,
  export : "alphanum"
});

createFont({
  img : `
 aaa jjj
f   b   i
fx  b   i
fx  b   i
 ggg
ex  c   i
ex  c   i
e   c   i
oddd hhh`,
  width : 6, // width +1 for empty column
  colonWidth : 4, // width of colon
  doubleWidth : 10, // width for double-size (eg 'W' and 'M')
  height : 9,
  export : "alphanum"
});

*/
exports = {};

var allchars = "abcdefghijxo";
var digits = [
// "",                 // space
 "g", // dash
 "o",// dot
 "abcdef","bc","abdeg","abcdg", // 0123
 "bcfg","acdfg","acdefg","abc", // 4567
 "abcdefg","abcdfg",           // 89
 "x",                 // :
 "abcefg","cdefg",           // Ab
 "adef","bcdeg","adefg","aefg",  // cdef
 "acdef", "bcefg","ef","bcd", // ghij
 "bcefg", "def","abefij","abcef", // klmn
 "abcdef","abefg","abcfg","aef", // opqr
 "acdfg","abc","bcdef","bcdef", // stuv
 "cdefhi","bcefg","bcfg","abdeg" // wxyz
];

exports.createFont = function(options) {
  var W = options.width;
  var widths = [W,0,0,0,0,0,0,0,0,0,0,0,0,W, // space ... -
                2,0,W,W,W,W,W, // ./0123...
                W,W,W,W,W,options.colonWidth,
                0,0,0,0,0,0,
                W,W,W,W,W,W, // abcdef
                W,W,W,W,W,W, // ghijkl
                options.doubleWidth, // m
                W,W,W,W,W,W, // nopqrs
                W,W,W, // tuv
                options.doubleWidth, // w
                W,W,W // xyz
               ];

  function drawCh(g,n,x,y) {
    var b = options.img;
    var d = digits[n];
    allchars.split("").forEach(ch=> {
      var r = new RegExp(ch,"g");
      b = b.replace(r,(d.includes(ch))?"#":" ");
    });
    print(b);
    g.drawImage(Graphics.createImage(b),x,y);
  }

  switch (options.export) {
    case "num":
      widths = widths.slice(0,27);
      break;
    case "hex":
      widths = widths.slice(0,39);
      break;
    case "alphanum":
      break;
    default: throw new Error("Unknown export type")
  }

  var gr = Graphics.createArrayBuffer(options.height,E.sum(widths),1,{msb:true});
  gr.setRotation(3,1);
  var y = widths[0]; // space & full stop
  var widthIdx = 0
  for (var i=0;i<digits.length;i++) {
    widthIdx++; while (widths[widthIdx]===0)widthIdx++;
    drawCh(gr,i,y,0);
    print(widths[widthIdx]);
    y += widths[widthIdx];
  }
  gr.setRotation(0);
  gr.dump();
  var font = E.toString(gr.asImage().buffer);
  widths = E.toString(widths);
  g.clear(1).setFontCustom(font, 32, widths, 256|options.height);
  g.drawString("0 12345.6789-:ABCDEF",20,20);
  g.drawString("HELLO WORLD",20,40);
  g.flip();
  print('this.setFontCustom(atob('+JSON.stringify(btoa(font))+
       '), 32, atob('+JSON.stringify(btoa(widths))+
       '), '+options.height+');');
};

setTimeout(function() {
