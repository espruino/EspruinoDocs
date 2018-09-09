// testLED.js - module
function testLED(pin) {
  this.p = pin[0];
};
exports = testLED;
testLED.prototype.testUR = function() {
  var nInt = 42;
    console.log( "inside testUR() " + nInt );
};
exports.create = function() {
  return new testLED([A5]);
};