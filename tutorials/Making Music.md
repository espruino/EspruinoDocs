<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Making Sounds and Music
====================

* KEYWORDS: Music,Sound,Audio,Speaker,Buzzer
* USES: Speaker,PWM

[[http://youtu.be/Jk5lTqQzoKA]]

Introduction
-----------

Espruino isn't fast enough to play MP3 or WAV music files, but it can output beeps of different frequencies using its pulse width moduled outputs. In this tutorial we'll show you how to make sound using a speaker from an old PC.

You'll Need
----------

* An Espruino Board
* A [[Speaker]]

Wiring Up
--------

Connect the two wires of the speaker to the Espruino board - one wire to ground, and the other wire to a Signal Pin that is capable of PWM (you can get a list of pins that are capable by typing ```analogWrite()```).

**Note:** This is probably really bad for your Espruino board. Ideally you'd add a transistor to amplify the signal - or at the very least you'd put a resistor in series to limit the current. Given the boards don't cost that much, we decided that it was worth taking a chance though.

Software
-------

First off, let's define the pin that our buzzer is on. On the F3 board I've used pin A9:

```var BUZZER=A9;```

Now, we can try using the PWM output to see what happens:

```analogWrite(BUZZER, 0.5);```

This should create a beep, but to control the frequency you need to supply an extra argument:

```analogWrite(BUZZER, 0.5, { freq: 1000 } );```

This will create a 1kHz beep. You can stop the beeping by setting the output to 0:

```digitalWrite(BUZZER,0);``` 

Next, we'll create a function that plays whatever frequency we give it. If we give it 0, it will stop the buzzing.

```
function freq(freq) { 
  if (freq==0) digitalWrite(BUZZER,0);
  else analogWrite(BUZZER, 0.5, { freq: freq } );
}
```
 
We can test it:

``` 
freq(1000);
freq(1500);
freq(0);
```
 
But now, we want to play some music! We'll need the following 2 websites:
 
* [Frequencies of Musical Notes](http://www.phy.mtu.edu/~suits/notefreqs.html)
* [Childrens Songs written as characters](http://saregamapiano.blogspot.co.uk/2011/07/children-songs.html)
 
The second website uses the letters a-g for lower pitch notes, and A-G for higher-pitch notes. We'll make a function which goes through a string of characters, one at a time, and plays the corresponding pitch note:
 
```
function step() {
  var ch = tune[pos];
  if (ch!=undefined) pos++;
  if (ch==' ' || ch==undefined) freq(0); // off
  else if (ch=='a') freq(220.00);
  else if (ch=='b') freq(246.94);
  else if (ch=='c') freq(261.63);
  else if (ch=='d') freq(293.66);
  else if (ch=='e') freq(329.63);
  else if (ch=='f') freq(349.23);
  else if (ch=='g') freq(392.00);
  else if (ch=='A') freq(440.00);
  else if (ch=='B') freq(493.88);
  else if (ch=='C') freq(523.25);
  else if (ch=='D') freq(587.33);
  else if (ch=='E') freq(659.26);
  else if (ch=='F') freq(698.46);
  else if (ch=='G') freq(783.99);
}
```
 
Now we just have to define the tune, and pos - which is the position in the tune:

``` 
var tune = "c    c    c   d    e   e  d   e    f   g   C  C C   g  g g   e  e e   c  c c  g    f  e   d c";
var pos = 0;
```
 
And we can start playing the music:

```setInterval(step, 100);```

To restart the song, just type:

```pos=0;```

You can load another song:

```
var tune = "g  e    g    g   e    g   A  A  g f  e  d   e   f";
pos=0;
```

And if you want to restart the song when the button is pressed, just type:

```setWatch("pos=0", BTN, true);```

