/* Copyright (c) 2019 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/// Motor 1 pins
exports.M1=[D4,D6];
/// Motor 2 pins
exports.M2=[D10,D11];

var i2c = new I2C();
i2c.setup({sda:D27,scl:D28});
var pwm = require("PCA9685").connect(i2c,{addr:0b1011000});

/// E1 port, contains { i2c, ad, int };
exports.E1 = { i2c : i2c, ad : D0, int : D1 };
/// E2 port, contains { i2c, ad, int };
exports.E2 = { i2c : i2c, ad : D30, int : D26 };

/// Set LEDs - expects two 3-element arrays with each elemnt between 0 and 255 : [R,G,B], [R,G,B]
exports.setLEDs = function(l,r) {
  var a = new Uint8Array(16);
  a[4]=255;a[8]=255;a.fill(255,12);
  a.set(l,5);a.set(r,9);
  var s = new SPI();
  s.setup({mosi:D8,sck:D7});
  s.write(a);
};

/// Set motors 1..4 with a value between -1 and 1
exports.setMotor = function(M, S) {
 var P1=[undefined,D4,D10,D2,D9][M];
 var P2=[undefined,D6,D11,D3,D12][M];
 if (S === 0) {
   digitalWrite(P1, 0);
   digitalWrite(P2, 0);
 } if (S > 0) {
   digitalWrite(P1, 0);
   analogWrite(P2, S);
 } else {
   digitalWrite(P2, 0);
   analogWrite(P1, -S);
 }
};

/// Set servos 1..10 with a value between -1 and 1
exports.setServo = function(num, value) {
  pwm.writeMs(num-1, 1.5+0.5*value);
};
