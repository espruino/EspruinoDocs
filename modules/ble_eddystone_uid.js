/** 
 * Copyright (c) 2019 Renaud Vincent See the file LICENSE for copying permission.
 * usage: require("ble_eddystone_uid").advertise([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], [0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
 */
exports.get = function(namespace, instance) {
  // UID encodings https://github.com/google/eddystone/tree/master/eddystone-uid
  // Setup the frame format
  var d = [
    0x03, // Service UUID length
    0x03, // Service UUID data type value
    0xaa, // 16-bit Eddystone UUID
    0xfe, // 16-bit Eddystone UUID
    0x24, // Service Data length
    0x16, // Service Data data type value
    0xaa, // 16-bit Eddystone UUID
    0xfe, // 16-bit Eddystone UUID
    0x00, // Eddystone-uid frame type
    0xf8, // txpower, use max but lower with NRF api
  ];

  d = d.concat(namespace);
  d = d.concat(instance);
  
  // Necessary to adjust lenght
  d[4] = d.length - 5;
  
  return d;
};

exports.advertise = function(namespace, instance, interval) {
  NRF.setAdvertising(
    exports.get(namespace, instance), 
    {
      interval: interval
    }
  );
};
