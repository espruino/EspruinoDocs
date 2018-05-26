/*<!-- Copyright (c) 2018 Gordon Williams. See the file LICENSE for copying permission. -->
Pixl.js Spectrum Analyser
=========================

* KEYWORDS: Frequency,Spectrum,FFT
* USES: Pixl.js,Graphics,Waveform,Microphone

![Pixl.js Spectrum Analyser](Pixl.js Spectrum Analyser.jpg)

This example outputs a spectrum analyser on [Pixl.js](/Pixl.js)'s LCD
display.

Simply attach [an amplified Microphone](http://www.ebay.com/sch/i.html?_nkw=arduino+microphone)
or some other varying input to pin `A0` on a [Pixl.js](/Pixl.js) board,
connect, and upload the code.

The FFT calculation is performed in double arithmetic and is slow,
so this won't be a real-time FFT. For faster updates consider slowing
down the sample rate and lowering the buffer size.

**Note:** Some microphone boards have a potentiometer to adjust DC
offset. If so, try running [the Oscilloscope Example](/Pixl.js+Oscilloscope)
and adjust the potentiometer until the waveform is in the middle of the screen.

*/


var w = new Waveform(128,{doubleBuffer:true});
var freq = new Uint8Array(128);
var SAMPLERATE = 1000; /* Hz */

w.on("buffer", function(buf) {
  // copy to another buffer
  freq.set(buf);
  // perform FFT
  E.FFT(freq);
  // plot the FFT (only the 'real' part)
  g.clear();
  for (var x=0;x<63;x++)
    g.fillRect(x*2,63-freq[x+1]*2,x*2+1,63);
  g.flip();
});

w.startInput(A0,SAMPLERATE,{repeat:true});
