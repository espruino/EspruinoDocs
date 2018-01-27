/* Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* usage: require("ble_eddystone").advertise("goo.gl/B3J0Oc");

  Note:
  * URLs must be accessible with https (Android ignores http URLs)
  * URLs must be as short as possible - there is very little room in advertising packets
  * You can put an anchor after goo.gl links and it'll be transferred. eg. goo.gl/B3J0Oc#foo
*/

exports.get = function(url) {
  // URL encodings https://github.com/google/eddystone/tree/master/eddystone-url
  var proto = 3; // https://
  if (url.substr(0,12)=="https://www.") { proto = 1; url = url.substr(12); }
  else if (url.substr(0,4)=="www.") { proto = 1; url = url.substr(4); }
  else if (url.substr(0,8)=="https://") { url = url.substr(8); }
  else if (url.substr(0,7)=="http://") throw new Error("Eddystone URLs need to be HTTPS");
  var repl = ["com","org","edu","net","info","biz","gov"];
  repl.forEach(function(r,i) {
    url = url.replace("."+r+"/",String.fromCharCode(i));
    url = url.replace("."+r+"",String.fromCharCode(i+7));
  });
  if (url.length>17) throw new Error("Max URL length is 17");
  // Setup the frame format
  var d = [0x03,  // Length of Service List
    0x03,  // Param: Service List
    0xAA, 0xFE,  // Eddystone ID
    0x13,  // Length of Service Data
    0x16,  // Service Data
    0xAA, 0xFE, // Eddystone ID
    0x10,  // Frame type: URL
    0xF8, // Power
    proto, // https://
  ];   
  d.push.apply(d,url.toString().split(""));
  d[4] = d.length-5;
  return d;
}

exports.advertise = function(url) {
  NRF.setAdvertising([exports.get(url)], {interval:100});
};
