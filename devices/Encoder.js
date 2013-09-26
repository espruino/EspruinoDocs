/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Module for connecting to Rotary encoder. 

```
var step = 0;
require("Encoder").connect(hardware,A1,A2,function (direction) {
  step += direction;
  print(step);
});
```

*/

function Encoder(pina, pinb, callback) {
  this.timeout = undefined;
  this.last = 0;
  this.PINA = pina;
  this.PINB = pinb;
  this.callback = callback;

  this.rotaryTimeout = function() {
    var a = digitalRead(this.PINA); 
    var b = digitalRead(this.PINB);
    var s = 0;
    switch (this.last) {
     case 0b00 : if (a) s++; if (b) s--; break;
     case 0b01 : if (!a) s--; if (b) s++; break;
     case 0b10 : if (a) s--; if (!b) s++; break;
     case 0b11 : if (!a) s++; if (!b) s--; break;
    }
   this.last = a | (b<<1);
   this.timeout = undefined;
   if (s!=0) callback(s);
 }
 pinMode(this.PINA, "input_pulldown");
 pinMode(this.PINB, "input_pulldown");
 setWatch(this.rotaryTimeout, this.PINA, { repeat: true });
 setWatch(this.rotaryTimeout, this.PINB, { repeat: true });
}

exports.connect = function(hardware,pina, pinb, callback) {
  return new Encoder(pina, pinb, callback);
}

