<!--- Copyright (c) 2020 Gordon Williams. See the file LICENSE for copying permission. -->
Time-based One-time Password
============================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/TOTP. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Crypto,TOTP,Time-based Password,OTP,One time password

This [[TOTP.js]] module implements a Time-based One-time Password for Espruino.


How to use the module:

```
const TOTP = require('totp');
const totp = TOTP.create('JBSWY3DPEHPK3PXP');
// 6 digits, period of 30 seconds
console.log(totp.generate(getTime(), 6, 30));
```

Reference
--------------

* APPEND_JSDOC: TOTP.js
