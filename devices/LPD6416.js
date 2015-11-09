/* Copyright (c) 2014 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* LPD-6416 driver - super hacky to try and get the refresh speed as high as possible!

```
var g = require("LPD6416").connect({A:B15, B:B14, C:B13, D:B10,
                                    nG:B1, L:A6, S:A5, nEN:A8, nR:A7});
```

*/



exports.connect = function(pins) {
  var s = shiftOut.bind(null, [pins.nG,pins.nR], { clk : pins.S, repeat : 4 });
  var d = digitalWrite.bind(null, [pins.nEN,pins.L,pins.L,pins.D,pins.C,pins.B,pins.A,pins.nEN]);
  var en = pins.nEN;
  var g = Graphics.createArrayBuffer(64,16,2);
  var u = g.buffer;
  g.scan = function() {
    en.reset();
    for (var y=0;y<16;y++) {s(new Uint8Array(u,y*16,16));d(33|y<<1);}
    en.set();
  };
  g.setBgColor(3);
  g.setColor(0);
  g.clear();
  return g;
}
