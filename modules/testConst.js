
const MY_CONST_TEST = "test";

var C = {
  MY : 0x001,          // description
  PRIVATE : 0x001,     // description
  CONSTANTS : 0x00423  // description
};

//exports MY_CONST_TEST;
//exports C;

function neopixelInitLED(pin) {
  this.p = pin[0];
}
exports = neopixelInitLED;

neopixelInitLED.prototype.MY_CONST = MY_CONST_TEST;
neopixelInitLED.prototype.C = C;


exports.create = function() {
  return new neopixelInitLED([A5]);
};
