<!--- Copyright (c) 2016 Patrick Van Oosterwijck. See the file LICENSE for copying permission. -->
InitialState
============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/InitialState. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Initial State,Module,InitialState, IoT, cloud, API

The [InitialState module](/modules/InitialState.js) provides an easy to use
interface to send events to the [InitialState](https://www.initialstate.com/)
cloud IoT platform. It was developed on the ESP8266 and does not use TLS,
don't send private information with this module!

API
---

The module exports one function: `sendEventsInsecure`.  This function sends
the provided events to the specified InitialState bucket.  It has the
following format:

```
sendEventsInsecure(bucket, events, [more events], [callback])
```

`bucket` is an object with the following properties:
```
var bucket = {
  bucketId: 'Your bucket ID from InitialState',
  accessId: 'Your access ID for the bucket from InitialState'
};
```

`events` is one or more parameter in one of two possible formats.
One possible format is the array format that is 
[specified by InitialState](http://docs.initialstateeventsapi.apiary.io/#reference/event-data/events-json):
```
[
  { key: key1, value: value1 },
  { key: key2, value: value2 }
]
```
When the function receives an `events` parameter that is an array,
it assumes it is in InitialState's format and sends it unaltered.

The other possible format is a simple object with key/value pairs:
```
{
  key1: value1,
  key2: value2
}
```
This format will automatically be converted to the array format
expected by InitialState.
  
`callback` is an optional callback function of the following format:
```
function (err, resp) {}
```
`err` is a possible error object, `resp` is the parsed response from
InitialState.

Example
-------

Below is an example of how to use this in practice:

```
var initialState = require('InitialState');

var bucket = {  // Get this from InitialState
    bucketId: 'WDYXBZEPUNFM',
    accessId: 'wGxdawLZTBODa3EGShA3vZaxMvjofEZc'
};

initialState.sendEventsInsecure(bucket, {
  temperature: 23.4,
  humidity: 45.2
});
```

Reference
---------

* APPEND_JSDOC: InitialState.js
