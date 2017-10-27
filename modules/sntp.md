<!--- Copyright (c) 2012-2016, Eran Hammer, Standa Opichal and Project contributors. See the file LICENSE for copying permission. -->
SNTP Module
===========

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/sntp. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,SNTP,NTP,Date,Time

This [[sntp.js]] module implements a SNTP for Espruino. It is a stripped down version of https://github.com/hueniverse/sntp.


# sntp

An SNTP v4 client (RFC4330) for node. Simpy connects to the NTP or SNTP server requested and returns the server time
along with the roundtrip duration and clock offset. To adjust the local time to the NTP time, add the returned `t` offset
to the local time.

# Usage

```javascript
var Sntp = require('sntp');

// All options are optional

var options = {
    host: 'nist1-sj.ustiming.org',  // Defaults to pool.ntp.org
    port: 123,                      // Defaults to 123 (NTP)
    timeout: 1000                   // Defaults to zero (no timeout)
};

// Request server time

Sntp.time(options, function (err, time) {

    if (err) {
        console.log('Failed: ' + err.message);
        process.exit(1);
    }

    console.log('Local clock is off by: ' + time.t + ' milliseconds');
    process.exit(0);
});
```

If an application needs to maintain continuous time synchronization, the module provides a stateful method for
querying the current offset only when the last one is too old (defaults to daily).

```javascript
// Request offset once

Sntp.offset(function (err, offset) {

    console.log(offset);                    // New (served fresh)

    // Request offset again

    Sntp.offset(function (err, offset) {

        console.log(offset);                // Identical (served from cache)
    });
});
```

To set a background offset refresh, start the interval and use the provided now() method. If for any reason the
client fails to obtain an up-to-date offset, the current system clock is used.

```javascript
var before = Sntp.now();                    // System time without offset

Sntp.start(function () {

    var now = Sntp.now();                   // With offset
    Sntp.stop();
});
```
