<!--- Copyright (c) 2024 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Jolt.js Talking Clock
=======================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Jolt.js+Talking+Clock. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Sound,Voice,Clock,Talking Clock
* USES: Jolt.js,Battery,Speaker,Vibration

You can use  [Jolt.js](/Jolt.js)'s high power outputs for driving speakers. In this example we'll make a clock that will speak the time whenever it is moved. Multiple sound samples are stored (one for each number) and are then played in order.

![Talking Clock](Jolt.js Talking Clock.webm)

**Note:** the video above shows a capacitor on the speaker, but you don't need that using the wiring below.

To do the audio playback we're using the [Waveform class](/Waveform).


You'll Need
------------

* A [Jolt.js](/Jolt.js) with 2v24.80 or later firmware
* A Qwiic cable (supplied with Jolt.js)
* A [Speaker](/Speaker) (I used a 2 inch, 8 Ohm speaker)
* [Vibration Sensor](/Vibration) (optional)

**Note:** This will work on other Espruino devices as well, you just need a method of providing enough power for a speaker (which [Jolt.js](/Jolt.js) has built in).

Sounds
------

First we need to make the sounds we'll use. We're going to make `1` to `19`, and then `20`/`30`/etc, so we can say `twelve o'clock` or `nine fourty five`.

If you want to skip this, [the pre-generated files are available here](/files/Jolt.js Talking Clock.zip) - skip to the end for upload instructions.

You'll need `ffmpeg` and `python` (with `pip` installed). We'll install a Text To Speech tool for which we'll use [Piper](https://github.com/rhasspy/piper) - type this in a terminal:

```Bash
pip install piper-tts
```

Now we'll output our sounds (do this in a new directory):

```Bash
echo "One" | piper --model en_GB-alan-medium --output_file 1.wav
echo "Two" | piper --model en_GB-alan-medium --output_file 2.wav
echo "Three" | piper --model en_GB-alan-medium --output_file 3.wav
echo "Four" | piper --model en_GB-alan-medium --output_file 4.wav
echo "Five" | piper --model en_GB-alan-medium --output_file 5.wav
echo "Six" | piper --model en_GB-alan-medium --output_file 6.wav
echo "Seven" | piper --model en_GB-alan-medium --output_file 7.wav
echo "Eight" | piper --model en_GB-alan-medium --output_file 8.wav
echo "Nine" | piper --model en_GB-alan-medium --output_file 9.wav
echo "Ten" | piper --model en_GB-alan-medium --output_file 10.wav
echo "Eleven" | piper --model en_GB-alan-medium --output_file 11.wav
echo "Twelve" | piper --model en_GB-alan-medium --output_file 12.wav
echo "Thirteen" | piper --model en_GB-alan-medium --output_file 13.wav
echo "Fourteen" | piper --model en_GB-alan-medium --output_file 14.wav
echo "Fifteen" | piper --model en_GB-alan-medium --output_file 15.wav
echo "Sixteen" | piper --model en_GB-alan-medium --output_file 16.wav
echo "Seventeen" | piper --model en_GB-alan-medium --output_file 17.wav
echo "Eighteen" | piper --model en_GB-alan-medium --output_file 18.wav
echo "Nineteen" | piper --model en_GB-alan-medium --output_file 19.wav
echo "Twenty" | piper --model en_GB-alan-medium --output_file 20.wav
echo "Thirty" | piper --model en_GB-alan-medium --output_file 30.wav
echo "Fourty" | piper --model en_GB-alan-medium --output_file 40.wav
echo "Fifty" | piper --model en_GB-alan-medium --output_file 50.wav
echo "Oh Clock" | piper --model en_GB-alan-medium --output_file oclock.wav
```

You can change the voice my changing the model to one of those listed on https://github.com/rhasspy/piper/blob/master/VOICES.md

And now we convert these to 4kHz 8 bit to play on Espruino:

```Bash
ffmpeg -y -i 1.mp3 -acodec pcm_u8 -f u8 -ac 1 -ar 8000 1.pcm
# and so on...

# Or in Linux/WSL/Mac to covert them all:
for f in *.wav; do ffmpeg -y -i "$f" -acodec pcm_u8 -f u8 -ac 1 -ar 8000 "${f%.*}.pcm"; done
```

Now you need to upload the files. Go to the Web IDE and click the `Storage` icon (looks like a Hamburger). Now click `Upload Files`
and select all of the `.pcm` files in the directory. You'll be prompted with a menu for each one asking what to name it - just click `Ok`,
and after a few minutes you should have uploaded all your files.


Wiring Up
--------

* Attach the one side of the speaker to Jolt.js's `H0` terminal
* Attach the other side of the speaker to Jolt.js's `H1` terminal

To connect the vibration sensor and allow the sounds to play when vibration is detected,
connect one side to the Qwiic connector `SCL` (yellow wire) and the other to `VCC` (red wire),
then push the Qwiic connector into Q0.

**Note:** you can use pretty much any pins for the vibration sensor including the pads
on the rear of the Jolt.js, however you can't directly use the Terminal block as these
are only analog inputs.

Software
---------

You can now upload the following software - this will convert the time
into a series of sounds, for instance `[1, "oclock"]` or `[11, 40, 5]`,
and will then instruct `playSounds` to play them in order.

It'll do this once at startup, and once whenever the button is pressed or motion is detected with the vibration sensor.

```JS
var speaking = false; /// Are we currently speaking?

// Turn the speaker output on
function spkOn() {
  speaking = true;
  analogWrite(H0, 0.5, {freq:80000});
  analogWrite(H1, 0.5, {freq:80000});
  return new Promise(resolve => setTimeout(resolve, 100));
}
// Turn the speaker output off
function spkOff() {
  H0.read(); //  make output turn into input -> turn drivers off
  H1.read(); //  make output turn into input -> turn drivers off
  speaking = false;
}
// Play an array of sounds
function playSounds(arr) {
  console.log("Playing", arr);
  var promise = spkOn();
  arr.forEach(sound => {
    promise = promise.then(() => new Promise(resolve => {
      // Play one sound
      var f = require("Storage").read(sound+".pcm");
      var w = new Waveform(E.toArrayBuffer(f));
      w.startOutput(H0,8000,{pin_neg:H1});
      w.on("finish", () => {
        w.removeAllListeners("finish");
        resolve();
      });
    }));
  });
  return promise.then(() => spkOff());
}


function sayTime() {
  function getNumberSounds(num) {
    if (num<20) return [num];
    var units = num%10;
    var tens = num - units;
    return [tens,units];
  }
  var d = new Date();
  var sounds = getNumberSounds(d.getHours());
  var minutes = d.getMinutes();
  if (minutes)
    sounds = sounds.concat(getNumberSounds(minutes));
  else
    sounds.push("oclock");
  playSounds(sounds);
}

// Play whenever the button is pressed
setWatch(function() {
  if (!speaking)
    sayTime();
}, BTN, {repeat:true});

// Play whenever Q0 scl (movement sensor) is pulled high
pinMode(Q0.scl, "input_pulldown");
setWatch(function() {
  if (!speaking)
    sayTime();
}, Q0.scl, {repeat:true, edge:"rising"});

// Play once at startup
sayTime();
```
