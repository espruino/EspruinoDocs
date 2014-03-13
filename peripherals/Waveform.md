<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Waveforms
========

* KEYWORDS: Analog,ADC,DAC,A2D,D2A

Espruino contains both [[Analog]] Inputs ([[ADC]]) and [[Analog Outputs]] ([[DAC]]). Functions such as `analogRead` and `analogWrite` can be used for IO up to around 0.5kHz but Espruino isn't fast enough for Audio.

Instead, you can use the [Waveform Class](/Reference#Waveform) to play back or record waveforms.

**Note:** Espruino wasn't designed to handle Audio, and when dealing with Audio's large arrays you will notice significant delays.


Input
-----

Record 128 samples from A0 and then print the result:

```
var w = new Waveform(128);
w.on("finish", function(buf) { 
  for (var i in buf) 
    console.log(buf[i]);
});
w.startInput(A0,2000,{repeat:true});
```

Record Audio continuously (with a double buffer) and output a bar graph to the console depending on the variance of the audio signal:

```
var w = new Waveform(128,{doubleBuffer:true});
w.on("buffer", function(buf) { 
  var l = buf.length;
  var v = E.variance(buf,E.sum(buf)/l)/l;
  console.log("------------------------------------------------------------".substr(0,v));
});
w.startInput(A0,2000,{repeat:true});
```

Type `w.stop()` to stop recording (or playback).

Output
-----

To output a sine wave to the DAC on A4:

```
var w = new Waveform(256);
for (var i=0;i<1024;i++) w.buffer[i] = 128+Math.sin(i*Math.PI/128)*127;
analogWrite(A4, 0.5); 
w.startOutput(A4, 4000);
```

Or to output via PWM, and repeat for 4 seconds:

```
var w = new Waveform(128);
for (var i=0;i<1024;i++) w.buffer[i] = 128+Math.sin(i*Math.PI/64)*127;
analogWrite(A0, 0.5, {freq:80000});  // PWM freq above human hearing
w.startOutput(A0, 4000, {repeat:true});
setTimeout(function() { w.stop() }, 4000);
```

You can even output synchronized waveforms on two outputs:

```
var w = new Waveform(128);
var w2 = new Waveform(128);
for (var i=0;i<1024;i++) w.buffer[i] = 128+Math.sin(i*Math.PI/64)*127;
w2.buffer.set(w.buffer); // copy w's signal to w2

analogWrite(A4, 0.5);
analogWrite(A5, 0.5);
var t = getTime()+0.01; // start in 10ms
w.startOutput(A4, 4000, {repeat:true, time:t});
w2.startOutput(A5, 4000, {repeat:true, time:t});
```

Or to output a 4kHz 8 bit unsigned sound file loaded from the SD card:

```
var wave = require("fs").readFile("sound.raw");
var w = new Waveform(wave.length);
w.buffer.set(wave);

analogWrite(A4, 0.5); 
w.startOutput(A4,4000);
```

**Note:** It's not advisable to load files more than 8kB long in one go, as you will quickly start to fill up all of Espruino's available RAM.

Creating Audio Files for Espruino
---------------------------------

* Install [Audacity](http://audacity.sourceforge.net/)
* Open it and open a sound file
* Down the bottom-left, change `Project Rate (Hz)` to 4000
* Click `Tracks` -> `Stereo Track to Mono` if the track is stereo
* Highlight the bit of sound you want to export
* Click `File` -> `Export Selection`
* Choose `Other Uncompressed files`
* Choose `Options` then `RAW (header-less)` and `Unsigned 8 bit PCM`
* And save to the SD card...

Using Waveforms
--------------

* APPEND_USES: Waveform

