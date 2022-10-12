<!--- Copyright (c) 2022 Joe Teglasi. License: MIT -->
# Simple Fetch-like API for Espruino
--------------------------------------------

* KEYWORDS: Module, fetch, http, https, internet

#### Initiation:
```
const fetch = require('fetch.js')
```


#### Usage:
```
fetch(url, fetchParams).then(fetchResponse => fetchResponse.text()).then(text=>{
//do stuff with text
// e.g. console.log(text)
});
```

url should look like: 'http://google.com/whatever/you/want?foo=bar'
fetchParams are optional, but should look like:

const fetchParams = {
method: 'GET'(default) or 'PUT' or 'POST' or 'DELETE',
body: String //(for PUT/POST)
...any other params that you'd supply to http.request()
}


Working examples:

1. `fetch('https://google.com').then(r=>r.text()).then(console.log);`

2. `fetch('https://example.com', {
  method: 'POST', 
  body:JSON.stringify({answer:42}), 
  headers:{'Content-Type':'application/json'}
}).then(r=>r.text()).then(console.log);`

#### Advanced: use with Certs
Under the hood, fetch uses a call to `http.request(reqParams)`. The `reqParams` object inherits properties from `fetchParams`, so cert fields can be provided in fetchParams, and they will be used for the request.


#### Advanced: AbortControllers (experimental)
If you want to abort a fetch request, you can use an AbortController.
Example:
```
const fetch = require('fetch.js');
const AbortController = require('AbortController.js');

const abortController = new AbortController();

setTimeout(abortController.abort, 2000); //a 2-second timeout, where the request will abort if not completed before the timeout.

fetch('https://brokenlink1234567890.com', {
  signal: abortController.signal
}).then(r=>r.text()).then(console.log).catch((e)=>console.log('Error:',e))

```

Reference
  ---------

  * APPEND_JSDOC: fetch.js
  * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

Using
  -----

  * APPEND_USES: MOD123
