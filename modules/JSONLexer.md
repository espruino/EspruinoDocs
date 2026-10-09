<!--- Copyright (c) 2026 Gordon Williams. See the file LICENSE for copying permission. -->
JSON Lexer
==========

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/JSONLexer. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,JSON,Lexer,JS,Parser

This is a simple lexer for JSON syntax. You send JSON data into it a block at a time using `lex.write("....")` and it calls the callback with each JSON token it finds.

The callback is called with the string representing the token. To avoid confusing `:` with `":"`, strings are not decoded, so to get their value you should use `JSON.parse`.

This is designed to work with `.pipe`/`E.pipe`, specifically so that HTTP requests and large files can be read without requiring the whole file to be loaded into RAM.

**Note:** This is not a JSON Parser, it just breaks the JSON into individual tokens.

Usage
-----

```JS
var JSONLexer = require("JSONLexer");
var lex = new JSONLexer(function(token) {
  console.log("TOKEN", token);
});
lex.write('[{"entity_id":"sensor.pv","state":"unknown","attributes":{},"last_changed":"2026-10-07T');
// TOKEN [
// TOKEN {
// TOKEN "entity_id"
// TOKEN :
// TOKEN "sensor.pv"
// TOKEN ,
// TOKEN "state"
// TOKEN :
// TOKEN "unknown"
// TOKEN ,
// TOKEN "attributes"
// TOKEN :
// TOKEN {
// TOKEN }
// TOKEN ,
// TOKEN "last_changed"
// TOKEN :
lex.write('11:02:40.186633+00:00"},{"entity_id":"sensor.pv","state":498,"attribu');
// TOKEN "2026-10-07T11:02:40.186633+00:00"
// TOKEN }
// TOKEN ,
// TOKEN {
// TOKEN "entity_id"
// TOKEN :
// TOKEN "sensor.pv"
// TOKEN ,
// TOKEN "state"
// TOKEN :
// TOKEN 498
// TOKEN ,
lex.write('tes":{},"last_changed":"2026-10-07T11:05:02.781294+00:00"}');
// TOKEN "attributes"
// TOKEN :
// TOKEN {
// TOKEN }
// TOKEN ,
// TOKEN "last_changed"
// TOKEN :
// TOKEN "2026-10-07T11:05:02.781294+00:00"
// TOKEN }
```

Or more usefully in this case we can look for the pattern `"state":something`:

```JS
var JSONLexer = require("JSONLexer");
var s = 0;
var lex = new JSONLexer(function(token) {
  if (token=='"state"') s=1;
  else if (s==1 && token==':') s=2;
  else if (s==2) {
    console.log("STATE="+token);
    s=0;
  } else s=0;
});
lex.write('[{"entity_id":"sensor.pv","state":"unknown","attributes":{},"last_changed":"2026-10-07T');
lex.write('11:02:40.186633+00:00"},{"entity_id":"sensor.pv","state":498,"attribu');
lex.write('tes":{},"last_changed":"2026-10-07T11:05:02.781294+00:00"}');
//STATE="unknown"
//STATE=498
```



Using
-----

* APPEND_USES: JSONLexer
