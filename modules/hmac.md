<!--- Copyright (c) 2014 Mikael Ganehag Brorsson. See the file LICENSE for copying permission. -->
HMAC Module
===========

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/hmac. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,HMAC,Hashlib,Crypto

This [[hmac.js]] module implements a HMAC for Espruino.  It depends on the inclusion of hashlib to compute the checksums.

How to use the module:

```
  var hmac = require("hmac");
  var hashlib = require("hashlib");
  var foo = hmac.create("secret", "message", hashlib.sha256);
  var bar = hmac.create("secret", "another message", hashlib.sha256);

  foo.digest() // raw digest
  foo.hexdigest() // hex encoded digest

  foo.update('more message') // used to iterate parts of a message

  // This function uses an approach designed to prevent timing analysis,
  // making it appropriate for cryptography.
  hmac.compare_digest(foo.digest(), bar.digest())
```

Reference
--------------
 
* APPEND_JSDOC: hmac.js
