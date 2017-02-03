/* Copyright (c) 2017, Uri Shaked. See the file LICENSE for copying permission. */
/* usage: require("ble_ibeacon").advertise(uuid, major, minor, measuredPower, options?);

  Notes:
  * UUID should be either a JS array with numbers or a Uint8Array. Is must contain exactly 16 elements.
*/
exports.advertise = function(uuid, major, minor, measuredPower, options) {
  if (!uuid.length || uuid.length != 16) {
    throw "Invalid UUID: must be exactly 16 bytes"
  }
  var d = [0x1a,  // Length of manufacturer data
    0xff,  // Param: Manufacturer data
    0x4c, 0x00,  // Apple company id
    0x02,  // type: iBeacon
    0x15,  // length of remaining data
  ];
  d.push.apply(d, uuid);
  d.push([
    major >> 8,
    major & 0xff,
    minor >> 8,
    minor & 0xff,
    measuredPower
  ]);
  if (!options) {
    options = {}
  }
  if (!options.interval) {
    options.interval = 100;
  }
  NRF.setAdvertising(d, options);
};
