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
  var d = new Uint8Array([
    0x02, // Number of bytes after first AD structure
    0x01, // BLE_GAP_AD_TYPE_FLAGS
    0x04, // BLE_GAP_ADV_FLAG_BR_EDR_NOT_SUPPORTED
    0x1A, // Length
    0xFF, // BLE_GAP_AD_TYPE_MANUFACTURER_SPECIFIC_DA­TA
    0x4C, 0x00, // 0x004C == Apple
    0x02, 0x15, // iBeacon type + length
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,// iBeacon proximity uuid
    0, 0, // major
    0, 0, // minor
    0xc5]); // 2'c complement RSSI at 1 meter distance in dBm

  d.set(options.uuid,9);
  if (options.major!==undefined) d.set([options.major>>8,options.major],2­5);
  if (options.minor!==undefined) d.set([options.minor>>8,options.minor],2­7);
  if (options.rssi!==undefined) d.set([(options.rssi<0)?(options.rssi+25­6):options.rssi],29);

  return [].slice.call(d);
};

exports.advertise = function(options) {
  RF.setAdvertising(exports.get(options), {interval:100});
};
