<!--- Copyright (c) 2026 Gordon Williams. See the file LICENSE for copying permission. -->
XML/HTML Lexer
==========

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/JSONLexer. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,XML,HTML,Lexer,JS,Parser

This is a simple lexer for XML/HTML. You send XML data into it a block at a time using `lex.write("....")` and it calls the callback with each XML tag it finds.

The callback is called with either:

* `{t:"c", txt:"..."}` - the contents of an XML node - this is the text that sits between XML tags
* `{t:"<>", name:"tagName", attrs:{key:value,key:value}}` - an XML tag
* `{t:"/", name:"tagName"}` - the end of an XML tag

This is designed to work with `.pipe`/`E.pipe`, specifically so that HTTP requests and large files can be read without requiring the whole file to be loaded into RAM.

**Note:** This is not an XML Parser, it does not infer any structure in XML, it just breaks the XML into individual tags.

Usage
-----

```JS
var XMLLexer = require("XMLLexer");
var lex = new XMLLexer(function(token) {
  console.log("XML", token);
});
lex.write(`<svg xmlns="http://www.w3.org/2000/svg" width="160" hei`);
lex.write(`ght="20">\n  <title>Firmware build - passing</title>\n  <def`);
/* XML {
  "t": "<>",
  "name": "svg",
  "attrs": {
    "xmlns": "http://www.w3.org/2000/svg",
    "width": "160",
    "height": "20"
   }
} */
/* XML {
  "t": "c",
  "txt": "\n  "
} */
/* XML {
  "t": "<>",
  "name": "title",
  "attrs": {  }
} */
/* XML {
  "t": "c",
  "txt": "Firmware build - passing"
} */
/* XML {
  "t": "/",
  "name": "title",
} */
/* XML {
  "t": "c",
  "txt": "\n  "
} */
lex.write(`s>\n   <linearGradient id="workflow-fill" x1="50%" y1="0%" x2="50%" y2="100%">\n   <`);
/* XML {
  "t": "<>",
  "name": "defs",
  "attrs": {  }
} */
/* XML {
  "t": "c",
  "txt": "\n   "
} */
/* XML {
  "t": "<>",
  "name": "linearGradient",
  "attrs": {
    "id": "workflow-fill",
    "x1": "50%",
    "y1": "0%",
    "x2": "50%",
    "y2": "100%"
   }
} */
/* XML {
  "t": "c",
  "txt": "\n   "
} */
lex.write(`stop stop-color="#444D56" offset="0%"></stop>\n    </linearGradient>`);
/* XML {
  "t": "<>",
  "name": "stop",
  "attrs": {
    "stop-color": "#444D56",
    "offset": "0%"
   }
} */
/* XML {
  "t": "/",
  "name": "stop",
  } */
/* XML {
  "t": "c",
  "txt": "\n    "
} */
/* XML {
  "t": "/",
  "name": "linearGradient",
} */
```


Using
-----

* APPEND_USES: XMLLexer
