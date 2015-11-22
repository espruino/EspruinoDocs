/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Module for connecting to Rotary encoder. 

```
var step = 0;
require("Encoder").connect(A1,A2,function (direction) {
  step += direction;
  print(step);
});
```

*/

function Encoder(/*=PIN*/pina, /*=PIN*/pinb, callback) {
  this.PINA = pina;
  this.PINB = pinb;
  this.callback = callback;
  var encoder = this;
  var onChange = function() {
    var a = digitalRead(encoder.PINA);
    var b = digitalRead(encoder.PINB);
    var s = 0;
    switch (this.last) {
      case 0b00 : if (a) s++; if (b) s--; break;
      case 0b01 : if (!a) s--; if (b) s++; break;
      case 0b10 : if (a) s--; if (!b) s++; break;
      case 0b11 : if (!a) s++; if (!b) s--; break;
    }
    this.last = a | (b<<1);
    if (s!==0) callback(s);
  };
  pinMode(this.PINA, "input_pulldown");
  pinMode(this.PINB, "input_pulldown");
  onChange(); // initialize the state of a, b and state: no callback will occur
  setWatch(onChange, this.PINA, { repeat: true });
  setWatch(onChange, this.PINB, { repeat: true });
}

exports.connect = function(pina, pinb, callback) {
  return new Encoder(pina, pinb, callback);
};
