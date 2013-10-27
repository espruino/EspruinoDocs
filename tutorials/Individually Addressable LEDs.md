<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Individually Addressable LEDs
===============================

* KEYWORDS: Individually Addressable LEDs,Light,Lights,LED,LEDs,WS2811,WS2812,WS2812B,Multicolour,Fairy

![LED String](string.jpg)

Introduction
-----------

In the last few years, individually addressable RGB lights have been getting cheaper and cheaper. These lights contain a small controller chip alongside the RGB LED which makes it show a certain colour. The controller chips have a serial data input and output, and can be daisy-chained together. In this way you can control many different lights using just a few control wires (rather than needing wires going to each individual light).

![LED String](use_england.jpg) ![LED String](use_celebrate.jpg)

It seems that the most popular type of controller at the moment is the [WS2801](/datasheets/WS2801.pdf). This has 4 wires - ground, power, clock and data. It can be controlled using SPI, which is available on most microcontrollers. There are some small disadvantages though:

* You need 4 wires between each LED
* The smallest package the controller fits in is a 14 pin one, which is quite large.

There is also a newer controller called the [WS2811](/datasheets/WS2811.pdf). This uses a one-wire style serial protocol, which only requires (as the name suggests) one wire for data. This means:

* Only 3 wires between each LED
* The controller chip fits in a smaller 8 pin package, which fits on a smaller PCB
* WS2812 RGB LEDs [are now available](http://www.ebay.com/sch/i.html?_nkw=WS2812) that put the WS2811 controller inside the LED package itself

All this adds up to make RGB LED lighting that is significantly cheaper than the WS2801 controller. You can pick up 50 [WS2811 lights on eBay](http://www.ebay.com/sch/i.html?_nkw=50pcs+WS2811) for $29.99 including delivery!

In this tutorial we'll show you how to drive WS2811 LEDs from Espruino. The LEDs require a series of pulses at 800 kHz, where a 0 bit is a short pulse, and a 1 bit is a long pulse. To do this, we'll use the SPI port - but instead of sending individual bits, we'll send bits in chunks of 4 - 0b0001 for a 0, and 0b0011 for a 1.

You'll Need
----------

* A chain of WS2811 lights - see [WS2811 lights on eBay](http://www.ebay.com/sch/i.html?_nkw=50pcs+WS2811). I'll be using the individually wired ones (rather than the ones on a flexible PCB).
* An Espruino board 

Wiring Up
--------

Your WS2811 LED light chain should have two ends, with 3 wires at each end (some may be duplicated). The colours for these are Red, White and Green. Red is 5v power, White is Ground, and Green is Signal. If you have instructions with your LED light chain, please use those instead.

At one end, the signal is an input, and at the other it is an output - so that you can chain more than 50 lights together. On the lights I have here, the female plug is the input - however if you can see markings on the LEDs, or you have other documentation, use that instead.

So to wire up, all you need to do is:

Connect White (0v) and Red (5v) wires to a 5v power source. You probably shouldn't use USB, as when all on, 50 LEDs draw around 1A - which is too much!

Connect White to ground on the Espruino board, and Green to a SPI MOSI pin on your Espruino board. On discovery boards this is usually A7, and on Maple/Olimexino it is D11. However if in doubt, please check the board's datasheet.

Software
-------

So now it's connected up, we need to send some data. First off, we'll set up SPI:

```SPI1.setup({baud:1600000, mosi:D11});```

Note that we're setting the MOSI pin here - if you are using a different pin to D11 (see the wiring up section) then you'll have to change this.

We choose 1600000 baud, because we want to transmit 4 bits of information for each real bit, and we want to transmit at 800000 baud. While 800000 * 4 = 3200000, the STM32 chips can't get exactly the SPI baud rate you request - they'll get it right to within +/- 50%. 

**This may mean that if the next command doesn't work, you have to repeat the command above with a baud rate of 3200000**

And now, we'll send data to the first light. The data is transmitted as sets of bytes for red, green, and blue:

```SPI1.send4bit([255,0,0], 0b0001, 0b0011);```

This will make the first LED red. Note the use of 0b0001 and 0b0011, which are the two sets of bit patterns to use for the 0 and 1 bits.

We can do other colours too:

```
SPI1.send4bit([0,255,0], 0b0001, 0b0011); // green

SPI1.send4bit([0,0,255], 0b0001, 0b0011); // blue

SPI1.send4bit([255,255,255], 0b0001, 0b0011); // white
```

And we can then control a second or third LED by just sending more data:

```SPI1.send4bit([255,0,0, 0,255,0, 0,0,255], 0b0001, 0b0011);```

So now, we could make a function with a for loop that would create colours for every LED. This one just makes all 50 LEDs progressively brighter white (the first LED will be off) :

```
function getPattern() {
  var cols = [];
  for (var i=0;i<50;i++) {
     cols.push(i*5); 
     cols.push(i*5);
     cols.push(i*5);
  }
  return cols;
}
 
And then we can make a function which will send this information to the lights - and can call it:
function doLights() {
  SPI1.send4bit(getPattern(), 0b0001, 0b0011);
}

doLights();
```
 
Please remember what was said in the 'You'll Need' section. Currently having a USB connection to Espruino causes it to occasionally leave gaps between bytes sent with SPI. Usually this is not a problem, but for WS2811s, timing is critical. This may mean that you need to call doLights() a few times in order to get the correct data sent to the lights. Either that, or you can just connect to your Espruino device using a serial cable.
 
So now, you should have a nice greyscale. But we can animate the lights too:

```
var pos = 0;
function getPattern() {
  pos++;
  var cols = [];
  for (var i=0;i<50;i++) {
     var col = Math.round((Math.sin(i+pos)+1) * 127);
     cols.push(col); 
     cols.push(col);
     cols.push(col);
  }
  return cols;
}
doLights();
``` 

This uses a sine wave to have the lights move between on and off. pos is used to store the position in the animation. Now, every time you call doLights, the lights will change!
You can animate this using setInterval!

```setInterval(doLights,50);```

You might notice that the LEDs aren't changing 20 times a second, which you would expect from the command we just typed. This is because Espruino is slowing down.

We can write our code more efficiently, so that the lights move more smoothly. Espruino stores every item in an array using a 64 bit number - this is using much more memory than we need, and it actually slows Espruino down.

Instead, we can store all the data we need in a String - which is much more efficient, and much faster:

```
function getPattern() {
  pos++;
  var cols = "";
  for (var i=0;i<50;i++) {
     var c = String.fromCharCode( (Math.sin(i+pos)+1) * 127 );
     cols += c + c + c;
  }
  return cols;
}
```
 
As soon as you type this in, you should notice the lights moving faster.
 
Now, we can try some other things. For instance, we could use sine waves at different frequencies to display animating rainbow colours:

```
function getPattern() {
  pos++;
  var cols = "";
  for (var i=0;i<50;i++) {
     cols += String.fromCharCode((1 + Math.sin((i+pos)*0.1324)) * 127) + 
             String.fromCharCode((1 + Math.sin((i+pos)*0.1654)) * 127) + 
             String.fromCharCode((1 + Math.sin((i+pos)*0.1)) * 127);
  }
  return cols;
}
```
 
Or we could just use random numbers for a Twinking effect:

``` 
function getPattern() {    
  pos++;
  var cols = "";
  for (var i=0;i<50;i++) {
     cols += String.fromCharCode(0) + 
             String.fromCharCode(0) + 
             String.fromCharCode( Math.random()*255 );
  }
  return cols;
}
```

Now, we could store all our different getPattern functions in an array, and switch between them when a button is pressed:

```
var patterns = [];
patterns.push(function() {    
  pos++;
  var cols = "";
  for (var i=0;i<50;i++) {
     var c = String.fromCharCode( (Math.sin(i+pos)+1) * 127 );
     cols += c + c + c;
  }
  return cols;
});
patterns.push(function() {    
  pos++;
  var cols = "";
  for (var i=0;i<50;i++) {
     cols += String.fromCharCode((1 + Math.sin((i+pos)*0.1324)) * 127) + 
             String.fromCharCode((1 + Math.sin((i+pos)*0.1654)) * 127) + 
             String.fromCharCode((1 + Math.sin((i+pos)*0.1)) * 127);
  }
  return cols;
});
patterns.push(function() {    
  pos++;
  var cols = "";
  for (var i=0;i<50;i++) {
     cols += String.fromCharCode(0) + 
             String.fromCharCode(0) + 
             String.fromCharCode( Math.random()*255 );
  }
  return cols;
});

var patternNumber = 0;
function changePattern() {
  patternNumber = (patternNumber+1) % patterns.length;
  getPattern = patterns[patternNumber];
}
setWatch(changePattern, BTN, { repeat: true, edge:'falling' });
```

So now, if you press the button (not the reset one!) on your Espruino board, the pattern will change. You can also go back and edit getPattern to create the pattern you want:

```edit(getPattern);```

Now change it, go to the end of the function with the arrow keys (or Page Down) and hit enter. The pattern on the LEDs will change. You can now type the following and your new pattern will be saved into the list of patterns (so you can change to it by pressing the button again):

```patterns.push(getPattern)```

That's it! If you come up with any good patterns, please [[Contact Us]] and let us know!


