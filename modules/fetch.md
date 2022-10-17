<!--- Copyright (c) 2022 Joe Teglasi. See the file LICENSE for copying permission. -->
Simple Fetch-like API for Espruino
====================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/fetch. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: http,internet,fetch

The [fetch](/modules/fetch.js) module provides a wrapper around `http` to provide
a simple promise-based page getter.

This module loads the entire webpage into RAM, so while in most cases it'll
work fine, for very big queries you may still need to fall back to `http`
to handle the data in a streaming manner.

Initialisation
---------------

```JS
const http = require('http');
const fetch = require('fetch.js')(http);
```

OR

```JS
const fetch = require('fetch.js')() //defaults to using 'http' module
```

(eventually, using 'tls' module instead of 'http' will be supported, hopefully)


Usage
-------

```JS
fetch(url, params).then(response => response.text()).then(text=>{
//do stuff with text
// e.g. console.log(text)
});
```

url should look like: 'http://google.com/whatever/you/want?foo=bar'
params are optional, but should look like:

const params = {
method: 'GET'(default) or 'PUT' or 'POST' or 'DELETE',
body: String //(for PUT/POST)
...any other params that you'd supply to http.request()
}


Working examples:

```JS
fetch('http://google.com').then(r=>r.text()).then(console.log);
fetch('http://example.com', {
  method: 'POST', 
  body:JSON.stringify({answer:42}), 
  headers:{'Content-Type':'application/json'}
}).then(r=>r.text()).then(console.log);
```

