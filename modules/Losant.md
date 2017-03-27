<!--- Copyright (c) 2016 Patrick Van Oosterwijck. See the file LICENSE for copying permission. -->
Losant
======

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Losant. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Losant,Module,IoT,cloud,API

The [Losant module](/modules/Losant.js) provides an easy to use
interface to send device updates to and get device commands from
the [Losant](https://www.losant.com/) cloud IoT platform.
It was developed on the ESP8266 and does not use TLS,
don't send private information with this module!

API
---

#### Constructor

The module exports a setup function to create a Losant device object:

```
exports.setup = function (deviceId, auth)
```

`deviceId` is the Losant assigned Id for your device, for example:
```
var losantDeviceId = '5793f96ebf2f6e0102349c09';
```

`auth` is an object that contains a key/secret pair that allows
access to the device, for example:
```
var losantDeviceAuth = {
  key: '88c8a5b7-3ce5-4e52-906e-e6f58b8647e7',
  secret: 'e39deb235e9c627a69b050566a6ace34ca93a12d31446e11eec68da0be66aabe'
};
```

The Losant device object exports the following methods:

#### updateDeviceData

```
updateDeviceData = function (data, callback)
```

`data` is an object containing key/value pairs
```
{
  key1: value1,
  key2: value2
}
```
The keys and value types need to match the attributes set up for a specific
device in the Losant device setup.
  
`callback` is an optional callback function of the following format:
```
function (err, resp) {}
```
`err` is a possible error object, `resp` is the parsed response from
Losant.

#### getDeviceCommand

```
getDeviceCommand = function (since, callback)
```

`since` is an optional time stamp that indicates since when the commands
should be returned.  This can be used to filter out old commands already
processed.
  
`callback` is an optional callback function of the following format:
```
function (err, resp) {}
```
`err` is a possible error object, `resp` is the parsed response from
Losant.

Example
-------

Below is an example of how to use this in practice:

```
var losantDeviceId = '5793f96ebf2f6e0102349c09';
var losantDeviceAuth = {
  key: '88c8a5b7-3ce5-4e52-906e-e6f58b8647e7',
  secret: 'e39deb235e9c627a69b050566a6ace34ca93a12d31446e11eec68da0be66aabe'
};

var losant = require('Losant').setup(losantDeviceId, losantDeviceAuth);
losant.updateDeviceData({
  temperature: 23.4,
  humidity: 45.2
});
```

Reference
---------

* APPEND_JSDOC: Losant.js
