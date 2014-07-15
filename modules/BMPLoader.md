<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
BMP Loader Module
===============

* KEYWORDS: BMP,Bitmap,Image Loader

This is a really simple bitmap loader that loads a [Windows Bitmap File](http://en.wikipedia.org/wiki/BMP_file_format) into an image that can be used with the [[Graphics]] library. 

This is currently only tested with 1 bit per pixel bitmap files, however it should work with 8 and 24 bit files.

```
var img = require("BMPLoader").load(require('fs').readFileSync("foo.bmp"));
g.drawImage(img, 10, 10);
```

Reference
--------------
 
* APPEND_JSDOC: BMPLoader.js


Using 
-----

* APPEND_USES: BMPLoader
