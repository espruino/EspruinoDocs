<!--- Copyright (c) 2018 Andreas Dröscher. See the file LICENSE for copying permission. -->
NFCTag
======

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/NFCTag. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: NFC, Tag, NDEF

The [NFC Tag module](/modules/NFCTag.js) emulates a basic NFC Forum *Type 2 Tag*
with up to 1k of storage. The storage may be read and written by a NFC Reader as
well as JS code.

Background
----------

Type 2 Tags support three commands, *read*, *write* and *sector select* (if the
data area is larger than 1k). During read and write operations data is addressed
in 4 byte blocks.

Most common Type 2 Tags have a *dynamic memory structure*. This structure defines
the purpose of the first 16 bytes. Those are static and define the Tags type and
configuration. In short: The first 10 bytes are a *Unique ID* and checksum.
Those are followed by 16 lock bits. The final 4 bytes are a capability container.

This *NFC Tag module* initializes the first 10 bytes from NRF52's ROM area. The
remaining 6 bytes followed by up to of 1008 bytes of data have to be initializes
prior passing `data` into the module.

Example
-------

This example creates an empty 768-byte Tag. The table below describes the six
initializer bytes used on the second line:

| Index | Value | Explanation                                               |
|-------|-------|-----------------------------------------------------------|
|     0 |  0x00 | Dynamic Lock Bits 0-7 (0x00 denotes no restriction)       |
|     1 |  0x00 | Dynamic Lock Bits 8-15 (0x00 denotes no restriction)      |
|     2 |  0xE1 | Magic number (Tag contains NFC Forum defined data)        |
|     3 |  0x11 | Version (Major and Minor of nfc spec supported, v1.1)     |
|     4 |  0x60 | Memory size (value multiplied by 8: 0x60 * 8 = 768 bytes) |
|     5 |  0x00 | Read and Write access (0x00 denotes no restriction)       |

It is writtable using almost any NFC Reader e.g. an Android phone (using [NFC TagWriter by NXP](https://play.google.com/store/apps/details?id=com.nxp.nfc.tagwriter)).

```
var data = new Uint8Array(16+768);
data.set("\x00\x00\xE1\x11\x60\x00", 0x0A);
var tag = require("NFCTag").create(data);
```

Reference
---------

* APPEND_JSDOC: NFCTag.js
