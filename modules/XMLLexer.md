<!--- Copyright (c) 2026 Gordon Williams. See the file LICENSE for copying permission. -->
XML/HTML Lexer
==========

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/XMLLexer. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

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

You can feed XML in bit by bit:

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

But the main use is parsing information retrieved from the internet. For instance the following will read the XKCD RSS feed:

```JS
var http = require("http");
http.get("https://xkcd.com/rss.xml", function(res) {
  //console.log("Open",res);
  var lastTag, item;
  var lex = new XMLLexer(function(token) {
    //console.log("XML", token);
    if (token.t == "<>") {
      if (token.name=="item") item={};
      else lastTag = token.name;
    }
    if (token.t == "/" && token.name=="item") {
      console.log("Item", item);
      item == undefined;
    }
    if (token.t == "c" && lastTag && item) {
      item[lastTag] = token.txt;
      lastTag = undefined;
    }
  });
  res.pipe(lex, { chunkSize:2048, complete : function() {
    console.log("Finished");
  }});
});
```

So:

```XML
<rss version="2.0">
...
<item>
<title>Rejected Space Mission Profiles</title>
<link>https://xkcd.com/3310/</link>
<description><img src="https://imgs.xkcd.com/comics/rejected_space_mission_profiles.png" title="Although NASA agreed that Voyager 2 'seemed lonely' they decided against launching a companion orbiter mission after further measurements indicated that the spacecraft actually preferred the peace and quiet." alt="Although NASA agreed that Voyager 2 'seemed lonely' they decided against launching a companion orbiter mission after further measurements indicated that the spacecraft actually preferred the peace and quiet." /></description>
<pubDate>Mon, 12 Oct 2026 04:00:00 -0000</pubDate>
<guid>https://xkcd.com/3310/</guid>
</item>
...
```

is turned into:

```
Item {
  "title": "Rejected Space Mission Profiles",
  "link": "https://xkcd.com/3310/",
  "description": "&lt;img src=\"https://imgs.xkcd.com/comics/rejected_space_mission_profiles.png\" title=\"Although NASA agreed that Voyager 2 'seemed lonely' they decided against launching a companion orbiter mission after further measurements indicated that the spacecraft actually preferred the peace and quiet.\" alt=\"Although NASA agreed that Voyager 2 'seemed lonely' they decided against launching a companion orbiter mission after further measurements indicated that the spacecraft actually preferred the peace and quiet.\" /&gt;",
  "pubDate": "Mon, 12 Oct 2026 04:00:00 -0000",
  "guid": "https://xkcd.com/3310/"
 }
...
```


Using
-----

* APPEND_USES: XMLLexer
