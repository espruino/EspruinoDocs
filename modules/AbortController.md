<!--- Copyright (c) 2022 Joe Teglasi. License: MIT -->
A Basic AbortController for Espruino
-----------------------------

* KEYWORDS: Module, AbortController, fetch, abort, request, http, https, internet

This module implements a basic AbortController. It is compatible with fetch.js.

#### Usage with Fetch:
```
const fetch = require('fetch.js');
const AbortController = require('AbortController.js');
const abortController = new AbortController();

setTimeout(abortController.abort,200); //timeout until request aborts, in ms
fetch('https://google.com',{
  signal: abortController.signal
}).then(r=>r.text()).then(console.log).catch(e=>console.log('Error:',e));
```

#### Make your own use-case:

```
const AbortController = require('AbortController.js');
const abortController = new AbortController();

function abortableFunction(abortSignal) {
    return new Promise(function (r, j) {
        let aborted = false;

        abortSignal.on('abort', function () {
            aborted = true;
            j('abortableFunction ABORTED');
        });

        function checkForAbort(result) {
            if (aborted) {
                return;
            } else {
                abortSignal.removeAllListeners('abort');
                r(result);
            }
        }

        //do the stuff with a function that takes an Callback (insert your own 'someFunction')
        someFunction(checkForAbort)

        //OR

        //do the stuff with a function that returns a Promise (insert your own 'someAsyncFunction')
        someAsyncFunction().then(checkForAbort)
    });
}

const timeout = 5e3 //5 seconds before function is aborted.

setTimeout(abortController.abort, timeout);

abortableFunction(abortController.signal).then(function(result){
  /* do stuff with result */
  
}).catch(function(e){
  /* handle abort */

});
```
