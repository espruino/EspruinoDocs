/* Copyright (c) 2022 Joe Teglasi. License: MIT */

/*
 * A Simple Implementation of the Fetch API for Espruino 
 * Built on-top of the native 'http' espruino module.
 * 
 * For information about using the fetch spec, see: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 * 
 * Currently, FetchResponse only implements .text() and .json() (not .arrayBuffer()/.blob()/.formData());
 * 
 * Fetch params accepts 'signal' field for use with AbortController.js

Usage: 

fetch('https://google.com').then(function (fetchResponse){
    console.log(fetchResponse);
    return fetchResponse.text();
}).then(console.log);

 */

//fetch(...) resolves to FetchResponse, so we can do fetch(...).then(function(fetchResponse){/* do stuff with fetchResponse */})
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



const http = require('http');

function fetch(address, params) {
    const _params = params || {};

    const content = _params.body || _params.data;
    if (content) _params.headers["Content-Length"] = content.length;

    delete _params.body
    delete _params.data

    const signal = _params.signal; //if using an AbortController
    if (signal) delete _params.signal;

    if (_params.method) _params.method = _params.method.toUpperCase();

    const options = Object.assign(url.parse(address), _params);

    let aborted = false;

    return new Promise(function (r, j) {

        if (signal) {  //if using an AbortController
            function abortFetch() {
                aborted = true;
                j('Fetch Error: REQUEST ABORTED.')
            }
            signal.on('abort', abortFetch);
        }

        const req = http.request(options, function (res) {
            try {
                if (signal) signal.removeAllListeners('abort');
                if (aborted) throw new Error('Request Aborted.');

                r(new FetchResponse(res))
            } catch (e) {
                j("Could Not Create FetchResponse Object: " + e)
            }
        });
        req.on('error', function (e) {
            j('HTTP Error: ' + e);
        });
        req.end(content);
    });
}

exports = fetch;
