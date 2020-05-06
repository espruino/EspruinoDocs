/* Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 7 segment 5x7 font - only '.0123456789ABCDEF' */
/*
// Magic 7 segment font maker
var W = 5; // width +1 for empty column
var WC = 3; // width of colon
var H = 7;
var base = `
aa
f  b
f. b
gg
e. c
e  c
dd`;
var digits = [
 0x3F,0x06,0x5B,0x4F, // 0123
 0x66,0x6D,0x7D,0x07, // 4567
 0x7F,0x6F,           // 89
 0x80,                 // :
 0x77,0x7C,           // Ab
 0x39,0x5E,0x79,0x71  // cdef
];
var widths = [2,0,W,W,W,W,W,
           W,W,W,W,W,WC,
           0,0,0,0,0,0,
           W,W,W,W,W,W];
function drawCh(g,n,x,y) {
 var b = base;
 var d = digits[n];
 b = b.replace(/a/g,(d&1)?"#":" ");
 b = b.replace(/b/g,(d&2)?"#":" ");
 b = b.replace(/c/g,(d&4)?"#":" ");
 b = b.replace(/d/g,(d&8)?"#":" ");
 b = b.replace(/e/g,(d&16)?"#":" ");
 b = b.replace(/f/g,(d&32)?"#":" ");
 b = b.replace(/g/g,(d&64)?"#":" ");
 b = b.replace(/\./g,(d&128)?"#":" ");
 g.drawImage(Graphics.createImage(b),x,y);
}
var gr = Graphics.createArrayBuffer(H,digits.length*W+2,1,{msb:true});
gr.setRotation(3,1);
gr.setPixel(0,gr.getHeight()-1); // fullstop
var y = widths[0];
for (var i=0;i<digits.length;i++) {
 drawCh(gr,i,y,0);
 y += (digits[i]==0x80) ? WC : W;
}
gr.setRotation(0);
var font = gr.asImage().buffer;
var widths = E.toString(widths);
g.setFontCustom(font, 46, widths, H);
g.drawString("0123456789:ABCDEF",20,20);
g.flip();
print('this.setFontCustom(atob('+JSON.stringify(btoa(font))+
     '), 46, atob('+JSON.stringify(btoa(widths))+
     '), '+H+');');
*/

exports.add = function(graphics) {
  graphics.prototype.setFont5x7Numeric7Seg = function() {
    this.setFontCustom(atob("AgADaDBbAAAAA2ABpMlgAASZLYAwECGwBhJkhgDaTJDAAECA2ANpMlsAYSZLYAAKAG0iQ2ANhIkMAbQYIAAGEiWwBtJkgADaRIAAAAA="), 46, atob("AgAFBQUFBQUFBQUFAwAAAAAAAAUFBQUFBQ=="), 7);
  }
}
