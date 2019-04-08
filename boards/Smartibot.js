/* Copyright (c) 2019 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/// Motor 1 pins
exports.M1=[D4,D6];
/// Motor 2 pins
exports.M2=[D10,D11];

var i2c = new I2C();
i2c.setup({sda:D27,scl:D28});

/// E1 port, contains { i2c, ad, int };
exports.E1 = { i2c : i2c, ad : D0, int : D1 };
/// E2 port, contains { i2c, ad, int };
exports.E2 = { i2c : i2c, ad : D30, int : D26 };

/// Set LEDs - expects two 3-element arrays with each elemnt between 0 and 255 : [R,G,B], [R,G,B]
exports.setLEDs = function(l,r) {
  if (!l)l=[0,0,0]; // if no left, turn off
  if (!r)r=l; // if no right eye, re-use left
  var a = new Uint8Array(16);
  a[4]=255;a[8]=255;a.fill(255,12);
  a.set([l[2],l[1],l[0]],5);a.set([r[2],r[1],r[0]],9);
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

const PCA_ADDR = (0xB0>>1);
const PCA_MODE1 = 0x0;
const PCA_PRESCALE = 0xFE;
const PCA_LED0_ON_L = 0x6;

// set PWM frequency to 60Hz
function setPWMFreq() {
  i2c.writeTo(PCA_ADDR, [PCA_MODE1, 0x00]);
  //var freq = 60*0.9;
  var prescaleval = 112;//((25000000.0 / 4096.0) / freq) - 1;
  i2c.writeTo(PCA_ADDR, [PCA_MODE1, (0x00 & 0x7F) | 0x10]);
  i2c.writeTo(PCA_ADDR, [PCA_PRESCALE, Math.round(prescaleval)]);
  i2c.writeTo(PCA_ADDR, [PCA_MODE1, 0x00]);
  i2c.writeTo(PCA_ADDR, [PCA_MODE1, 0x00 | 0xA1]);
}
// Do it now
setPWMFreq();
// Ensure we do it at startup as well
E.on('init',setPWMFreq);

/// Set servos 1..10 with a value 0..100
exports.setServo = function(num, val) {
  if (num<1||num>10) throw "num Out of range";
  val = 130+val*4;
  if (val<1||val>4095) throw "val Out of range";
  i2c.writeTo(PCA_ADDR,[PCA_LED0_ON_L+4*(num-1),0,0,val,val>>8]);
};
