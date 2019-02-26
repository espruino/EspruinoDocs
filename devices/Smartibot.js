/* Copyright (c) 2019 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Smartibot */
exports.M1=[D4,D6];
exports.M2=[D10,D11];
exports.I2C_AD1 = D0;
exports.I2C_INT1 = D1;
exports.I2C_AD2 = D30;
exports.I2C_INT2 = D26;
exports.I2C = new I2C();
exports.I2C.setup({sda:D27,scl:D28});

exports.setLEDs = function(l,r) {
  var a = new Uint8Array(16);
  a[4]=255;a[8]=255;a.fill(255,12);
  a.set(l,5);a.set(r,9);
  var s = new SPI();
  s.setup({mosi:D8,sck:D7});
  s.write(a);
};

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

exports.pwm = require("PCA9685").connect(exports.I2C,{addr:0b1011000});
