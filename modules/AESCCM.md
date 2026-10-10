<!--- Copyright (c) 2026 Jean-Philippe Rey. See the file LICENSE for copying permission. -->
AES-CCM
=======

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/AESCCM. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Modules,AES,CCM,AES-CCM,Encryption,Crypto,Authenticated,BTHome,Bluetooth

AES-CCM: authenticated encryption, as used by Bluetooth, Zigbee, and
[BTHome](https://bthome.io/)'s encrypted advertising. It encrypts a message and
produces a short tag (a *MIC*) that proves the message has not been altered and
came from someone holding the key.

**It uses whichever your firmware has.** Espruino boards come in two kinds and
neither one is a superset of the other:

| Board | Builds | This module |
|---|---|---|
| [Bangle.js 2](/Bangle.js2) | `AES_CCM` | calls `AES.ccmEncrypt` / `AES.ccmDecrypt` directly |
| [Puck.js](/Puck.js) | `AES` | builds CCM out of `AES.encrypt` in JS |

`require("AESCCM").usingNative()` tells you which path your board took. There
is nothing to configure.

Usage
-----

```JS
var ccm = require("AESCCM");

var key   = new Uint8Array(16);                  // 16 bytes
var nonce = new Uint8Array(13);                  // 7 to 13 bytes, never reused
var message = E.toUint8Array("hello");

var sealed = ccm.encrypt(message, key, nonce, 4);
// -> { data: Uint8Array, mic: Uint8Array(4) }

var back = ccm.decrypt(sealed.data, key, nonce, sealed.mic);
// -> Uint8Array, or null if the MIC does not match
```

| | |
|---|---|
| `encrypt(plaintext, key, nonce, micLength)` | returns `{data, mic}`. `micLength` is even, 4 to 16, and defaults to 4 |
| `decrypt(ciphertext, key, nonce, mic)` | returns the plaintext, or **`null`** if it does not authenticate |
| `usingNative()` | `true` if the firmware's own CCM is being used |

`decrypt` returns `null` rather than throwing, because a bad MIC is an expected
event — a wrong key, or someone trying it on — and not a mistake by the caller.
**Check for it.** A plaintext you did not authenticate is not a plaintext.

There is no associated data (AAD): CCM allows it, this does not implement it.

Notes
-----

**Never reuse a nonce with the same key.** Two messages sealed under one nonce
leak the keystream, which is the one mistake that turns this from protection
into decoration. Typically the nonce carries a counter that only ever goes up,
and the counter is saved across restarts.

**On the JS path, each AES call costs about 75 ms** on a Puck.js. The module
works in 32-byte pieces, because `AES.encrypt` allocates its result as one
contiguous block and fails — returning `undefined` — when the heap has no run
that long, which happens well before memory runs out. On the native path none
of that applies and it is far quicker.

**Counter mode is not used**, although it would be the obvious way to make the
keystream: this firmware ignores CTR's `iv` and always starts from a zero
counter block, so it would be silently, catastrophically wrong. ECB encrypts
each block independently, which is all a keystream needs.

Testing
-------

The module is held to a
[published set of test vectors](https://github.com/yerpj/bthome-writable/blob/main/test-vectors/test-vectors.json),
which both paths and two independent implementations agree on: OpenSSL's
AES-CCM in the test suite, and a Bangle.js-class board running the firmware's
own — 15 vectors, no disagreement.

References
----------

* [BTHomeWritable](/BTHomeWritable) — the module this was written for
* [bthome-writable](https://github.com/yerpj/bthome-writable) — source,
  vectors, and the reasoning behind the construction
* [RFC 3610](https://www.rfc-editor.org/rfc/rfc3610) — CCM itself
