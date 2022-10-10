# Simple Fetch-like API for Espruino
created by Joe Teglasi, Copyright 2022, License: MIT


#### Initiation:
```
const http = require('http');
const fetch = require('fetch.js')(http);
```
OR
```
const fetch = require('fetch.js')() //defaults to using 'http' module
```
(eventually, using 'tls' module instead of 'http' will be supported, hopefully)


#### Usage:
```
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
```
fetch('http://google.com').then(r=>r.text()).then(console.log);
fetch('http://example.com', {
  method: 'POST', 
  body:JSON.stringify({answer:42}), 
  headers:{'Content-Type':'application/json'}
}).then(r=>r.text()).then(console.log);
```



Here is the original, unminified code:

```
//module for fetch api, 
//currently only accepts espruino 'http' module
//later will accept TLS module with cert params for security

class FetchResponse {
    constructor(res) {
        this.res = res;
    }
    text() {
        const _this = this;
        return new Promise(function (r, j) {
            let timeout;
            let data = "";
            function handleClose() {
                clearTimeout(timeout);
                r(data);
            };
            _this.res.on('data', function (chunk) {
                data += chunk;
            });

            _this.res.on('close', handleClose);

            timeout = setTimeout(function () {
                _this.res.removeListener('close', handleClose);
                j('FetchRequest Timed-Out!');
            }, 5e3);
        });
    }
    json() {
        return this.text().then(JSON.parse);
    }
}


function useFetch(_module){
    if(!_module) _module = require('http');

    return function fetch(address, params) {
        const _params = params || {};
    
        const content = _params.body || _params.data;
        if (content) _params.headers["Content-Length"] = content.length;
    
        delete _params.body
        delete _params.data
    
        const signal = _params.signal;
        if (signal) delete _params.signal;
        const options = Object.assign(url.parse(address), _params);
        return new Promise(function (r, j) {
    
            if (signal) {
                function abortFetch() { j('Fetch Error: REQUEST TIMEOUT.') }
                signal.on('abort', abortFetch);
            }
    
            const req = _module.request(options, function (res) {
                try {
                    if (signal) signal.removeAllListeners('abort');
                    r(new FetchResponse(res))
                } catch (e) {
                    j("Could Not Create FetchResponse Object: " + e)
                }
            });
            req.on('error', function (e) {
                //console.log('HTTP Error:', e);
                j('HTTP Error: ' + e);
            });
            req.end(content);
        });
    }

}

exports = useFetch;
```
