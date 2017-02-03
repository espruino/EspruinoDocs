/* Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* usage: require("ble_eddystone").advertise("goo.gl/B3J0Oc");

  Note:
  * URLs must be accessible with https (Android ignores http URLs)
  * URLs must be as short as possible - there is very little room in advertising packets
  * You can put an anchor after goo.gl links and it'll be transferred. eg. goo.gl/B3J0Oc#foo
*/

exports.get = function(url) {
  var d = [0x03,  // Length of Service List
    0x03,  // Param: Service List
    0xAA, 0xFE,  // Eddystone ID
    0x13,  // Length of Service Data
    0x16,  // Service Data
    0xAA, 0xFE, // Eddystone ID
    0x10,  // Frame type: URL
    0xF8, // Power
    0x03, // https://
  ];
  d.push.apply(d,url.toString().split(""));
  d[4] = d.length-5;
  return d;
}

exports.advertise = function(url) {
  NRF.setAdvertising(exports.get(url), {interval:100});
};
