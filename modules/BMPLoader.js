/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 

Bitmap loader - loads flat '.bmp' files into an 'image'. Usage:

```
var img = require("BMPLoader").load(require('fs').readFileSync("foo.bmp"));
g.drawImage(img, 10, 10);
```

*/

/** Load a bitmap (supplied as a string), and return an image object that
 can be used by the Graphics library

 see http://en.wikipedia.org/wiki/BMP_file_format
*/
exports.load = function(bmpString) {
  var bmp = E.toArrayBuffer(bmpString);
  if (bmp[0]!=66 && bmp[1]!=77) { console.log("Not a bitmap file"); return; }
  if (bmp[30]!==0) { console.log("Image is not uncompressed"); return; }
  var addr = bmp[10]|(bmp[11]<<8); // work out start address - assume < 65kb!
  var img = {
    width : bmp[18]|(bmp[19]<<8),
    height : bmp[22]|(bmp[23]<<8),
    bpp : bmp[28]
  };
  if (img.bpp==1) img.width = (img.width+7)&~7; // scale up to nearest 8px
  var ostride = img.width*img.bpp>>3;
  img.buffer = new Uint8Array(ostride*img.height);
  var istride = (ostride+3) & ~3; // bmp aligns to 32 bits
  // re-pack, and invert
  for (var y=0;y<img.height;y++)
    img.buffer.set(new Uint8Array(bmp, addr+istride*(img.height-(y+1)), ostride), ostride*y);
  return img;
}




