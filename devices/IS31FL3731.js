/* Copyright (C) 2019 Gordon Williams. See the file LICENSE for copying permission. */
var R = {
CONFIG : 0x00,
SHUTDOWN : 0x0A,
PICTUREFRAME : 0x01,
AUDIOSYNC : 0x06,
};
var BANK_FUNCTION = 0x0B;
var BANK_COMMAND = 0xFD;
var C = {
  PICTUREMODE : 0x00,
};

exports.connect = function(i2c) {
  var addr = 0x74;
  function w(r,d) {i2c.writeTo(addr,r,d);}
  w(BANK_COMMAND, BANK_FUNCTION);
  w(R.SHUTDOWN, 0); // shutdown
  // wait 10ms
  w(R.SHUTDOWN, 1); // un-shutdown
  w(R.CONFIG, C.PICTUREMODE);
  w(R.PICTUREFRAME, 0); // display frame 0
  w(R.AUDIOSYNC, 0); // no audio sync
  // define graphics
  var g = Graphics.createArrayBuffer(16,9,8);
  g.flip = function() {
    w(BANK_COMMAND, 0); // select frame 0
    for (var i=0; i<6; i++) {
      w(0x24+i*24, new Uint8Array(g.buffer, 24*i, 24));
    }
  };
  // flip -> turn all LEDs off
  g.flip();
  // Turn all LEDs on
  for (var f=0; f<8; f++) {
    w(BANK_COMMAND, f);
    for (var i=0;i<18;i++) w(i, 255);
  }

  return g;
}
