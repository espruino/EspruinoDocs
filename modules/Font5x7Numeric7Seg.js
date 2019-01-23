/* Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 7 segment 5x7 font - only '.0123456789ABCDEF' */
/*
// Magic 7 segment font maker
var base = `
 aa
f  b
f  b
 gg
e  c
e  c
 dd`;

function drawCh(g,n,x,y) {
  var b = base;
  var d = [
    0x3F,0x06,0x5B,0x4F, // 0123
    0x66,0x6D,0x7D,0x07, // 4567
    0x7F,0x6F,0x77,0x7C, // 89Ab
    0x39,0x5E,0x79,0x71  // cdef
    ][n];
  b = b.replace(/a/g,(d&1)?"#":" ");
  b = b.replace(/b/g,(d&2)?"#":" ");
  b = b.replace(/c/g,(d&4)?"#":" ");
  b = b.replace(/d/g,(d&8)?"#":" ");
  b = b.replace(/e/g,(d&16)?"#":" ");
  b = b.replace(/f/g,(d&32)?"#":" ");
  b = b.replace(/g/g,(d&64)?"#":" ");
  g.drawImage(Graphics.createImage(b),x,y);
}

var gr = Graphics.createArrayBuffer(7,16*5,1,{msb:true});
gr.setRotation(3,1);
gr.setPixel(0,gr.getHeight()-1); // full stop
for (var i=0;i<16;i++) drawCh(gr,i,2+i*5,0);
gr.setRotation(0);
var font = gr.asImage().buffer;
var widths = E.toString([2,0,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,5,5,5,5,5,5]);
g.setFontCustom(font, 46, widths, 7);
print(btoa(font))
print(btoa(widths))
*/

exports.add = function(graphics) {
  graphics.prototype.setFont5x7Numeric7Seg = function() {
    this.setFontCustom(atob("AgG0GC2AAAABsADSZLAAAkyWwBgIENgDCTJDAG0mSGAAIEBsAbSZLYAwkyWwBtIkNgDYSJDAG0GCAABhIlsAbSZIAA2kSA=="), 46, atob("AgAFBQUFBQUFBQUFAAAAAAAAAAUFBQUFBQ=="), 5);
  }
}
