/* 
Remote Control Helicopter with Wii Nunchuck
==================

* KEYWORDS: Helicopter,Flying,Aircraft,Remote Control,Infrared
* USES: Infrared,Wii,IRReceiver,Espruino Board

This is a simple remote control for infrared remote control helicopters.

After using the [[IRReceiver]] to look at the Infrared signals from the Helicopter's transmitter with the following code:

```
require("IRReceiver").connect(A0, function(code) {
  print(code);
}, {usePulseLength:true});
```

I worked out that the signals (after a start pulse) are as follows:

```
111011100000000000 // on
111000000000000000 // off
111011100000011110 // left
111011100000101000 // right
```

So a 6 bit signed signal for left and right (bits 0-5) and a 3 bit unsigned signal for rotor power (bits 11-13), as well as 3 bits set at the top.

Then it's simply a matter of recreating them with the code below.

Wiring:
-------

IR transmitter (scavenged from an old remote control)

|  IR  | Pin on Espruino Board         |
|---------|-------------------------------|
|  Anode      | C1                           |
|  Cathode    | A1                           |

One pin (A0) outputs a 38kHz square wave, and the other pin (C1) outputs the signal that we want to output. This way we're using the diode itself to modulate the square wave with the data. 

Wire the Wii Nunchuck up as described for the [[Wii]] library (to B6/B7).


*/

function sendIR() {
  var w = wii.read();
  var power = E.clip(w.joy.y*8,0,7)|0;
  var leftRight = E.clip(w.joy.x*32,-32,31)|0;
  var data = 0b111000000000000000 | (power<<11) | (leftRight&0b111111);
  //print(data.toString(2));
  
  analogWrite(A1, 0.5, { freq:38000 });
  digitalPulse(C1, 1,1.75);
  for (var i=19;i>=0;i--) {
    digitalPulse(C1, 0,0.6);
    digitalPulse(C1, 1,(data&(1<<i))?1.2:0.6); // on
  }
  // wait for the pulses to complete
  digitalPulse(C1, 0, 0);
  // turn off output
  digitalRead(A1);
}

setInterval(sendIR, 100);
I2C1.setup({scl:B6,sda:B7});

var wii;

function onInit() {
  wii = require("wii_nunchuck").connect(I2C1);
}
