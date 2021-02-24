<!--- Copyright (c) 2021 Gordon Williams, MaBecker. See the file LICENSE for copying permission. -->
String Decoders
===============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/StringDecoders. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,StringDecoders

This [[StringDecoder.js]] module implements helper for string decoding tasks.

How to use the module:

```js
//fitWords(text,rows,width)
var line = 'Mary had a little lamb. His fleece was black as coal, yeah. Everywhere the child went.';
    lineSize = 30,
    rows = line.length / 30 + 1;
var wrappedLine = require('StringDecoders').fitWords(longString,rowCount,lineSize);

// fitWords is now a string with '\n' 
```


