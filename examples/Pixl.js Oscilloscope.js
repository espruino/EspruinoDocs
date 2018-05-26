/*<!-- Copyright (c) 2018 Gordon Williams. See the file LICENSE for copying permission. -->
Pixl.js Oscilloscope
=========================

* KEYWORDS: Oscilloscope
* USES: Pixl.js,Graphics,Waveform,Microphone

![Pixl.js Oscilloscope](Pixl.js Oscilloscope.jpg)

This example displays a simple oscilloscope on [Pixl.js](/Pixl.js)'s LCD
display.

Simply attach [an amplified Microphone](http://www.ebay.com/sch/i.html?_nkw=arduino+microphone)
or some other varying input to pin `A0` on a [Pixl.js](/Pixl.js) board,
connect, and upload the code.

There is no triggering in this example, but it could be added relatively
easily.

Some microphone boards have a potentiometer to adjust DC
offset. If so, you can adjust the potentiometer with this software running
until the waveform is in the middle of the screen to ensure that you get
as large a range of microphone input as possible.

**Note:** Realistically 1kHz is about the highest you can read and plot data
in real-time with Puck.js. You can however sample at higher rates, just not
continuously.

*/

var w = new Waveform(128,{doubleBuffer:true});
var SAMPLERATE = 1000; /* Hz */
w.on("buffer", function(buf) {
  g.clear();
  g.moveTo(0,32);
  buf.forEach((y,x)=>g.lineTo(x,y/4));
  g.flip();
});

w.startInput(A0,SAMPLERATE,{repeat:true});
