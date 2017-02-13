/* Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* usage:
require("ble_ibeacon").advertise({
  uuid : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // ibeacon uuid
  major : 0x0102, // optional
  minor : 0x0304, // optional
  rssi : -59, // optional RSSI at 1 meter distance in dBm
});
*/

exports.get = function(options) {
  if (!options.uuid || options.uuid.length != 16)
    throw "Invalid UUID: must be exactly 16 bytes"
  var d = [0x1a,  // Length of manufacturer data
    0xff,  // Param: Manufacturer data
    0x4c, 0x00,  // Apple company id
    0x02,  // type: iBeacon
    0x15,  // length of remaining data
  ];
  d.push.apply(d, options.uuid);
  d.push([
    options.major >> 8,
    options.major & 0xff,
    options.minor >> 8,
    options.minor & 0xff,
    options.rssi
  ]);
  return [].slice.call(d);
};

exports.advertise = function(options) {
  NRF.setAdvertising(exports.get(options), {interval:100});
};
