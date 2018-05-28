<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Dial Tones
=========

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Dial+Tones. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: DTMF,Dial tone,Beep,Buzz
* USES: KeyPad,Espruino Board,Speaker,Only Espruino Board,PWM

Introduction
-----------

Telephones (not mobiles) now use [DTMF to dial numbers](http://en.wikipedia.org/wiki/Telephone_keypad#Key_frequency). This involves outputting two different frequencies of beep at once (a different combination for each key). The wikipedia page linked above has a better description, but the frequencies are as follows:

| |1209 Hz|1336 Hz|1477 Hz|1633 Hz|
|-|-|-|-|
| 697 Hz|1|2|3|A|
| 770 Hz|4|5|6|B|
| 852 Hz|7|8|9|C|
| 941 Hz|*|0|#|D|

We're going to emulate this with Espruino. It won't sound just like your normal phone's DTMF (because Espruino outputs a square wave rather than a sine wave), but it does work.

### How do we mix the two tones?

Espruino can't output two tones at once, but it can output one tone on each pin. By connecting the speaker to two signal pins and putting a different tone on each pin, we can use the Speaker itself to mix the two different tones together!

You'll Need
----------

* An [Espruino Board](/Original) 
* A [[KeyPad]] (not required - see the last part of the tutorial)
* A [[Speaker]]

Wiring Up
--------

* Wire up the two wires of the [[Speaker]] to pins C6 and C9
* Wire up the [[KeyPad]] as described [here](/KeyPad)

Software
-------

Just copy and paste this into the right-hand window, then click the ```Send to Espruino``` button.

```
var SPEAKERA = C6;
var SPEAKERB = C9;
var silenceTimeout;

function onKeyPad(key) {
  // tones for the row and column
  var tone_col = [1209, 1336, 1477, 1633];
  var tone_row = [697, 770, 852, 941];
  // our key is a number between 0 and 15
  // work out row and column
  var col = key&3;
  var row = key>>2;
  // now output two tones, one on each pin
  analogWrite(SPEAKERA,0.5,{freq:tone_col[col]});
  analogWrite(SPEAKERB,0.5,{freq:tone_row[row]});
  // finally make sure we get rid of the beeping after a second
  if (silenceTimeout!==undefined) clearTimeout(silenceTimeout);
  silenceTimeout = setTimeout(function() {
    silenceTimeout = undefined;
    // make sure we turn out beeping off
    digitalRead(SPEAKERA);
    digitalRead(SPEAKERB);
  }, 100);
}

require("KeyPad").connect([B2,B3,B4,B5],[B6,B7,B8,B9], onKeyPad);
```

Now, just press the number keys on the Key Pad and the corresponding tone will be output. If you pick up your landline and press the microphone against the speaker you wired up, you'll actually be able to dial numbers with it!

Automatic dialling
----------------

In fact there's no need for the keypad - you could just dial automatically. For instance:

```
function fastDial(num) {
  var dial = function() {
    // dial the first digit of the number
    onKeyPad("123A456B789C*0#D".indexOf(num[0]));
    // cut the first digit off and go again 0.5 sec later
    num = num.substr(1);
    if (num.length>0) setTimeout(dial, 500);
  };
  dial();
}
fastDial("01234123123");
```

**Note:** If you don't have a keypad and want to leave out that code, just delete the line beginning `require("KeyPad")` from the original code.

And if you want to dial the number when you press the button on Espruino, just do the following:

```
setWatch(function() {
  fastDial("01234123123");
}, BTN, {edge:"rising", repeat: true});
```




