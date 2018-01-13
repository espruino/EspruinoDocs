/*
LED Clock (using WS8111)
========================

* KEYWORDS: Clock,Watch,Time
* USES: WS2811,Clock,Espruino Board

This creates a simple clock using strings of WS2811 LEDs.

The idea is to have a string of 24 LEDs, arranged in two rings of 12.

Then, one LED is lit up for hours, minutes, seconds, and there's even a fast-moving one for sub-seconds.

[[WS2811]] Wiring:

| WS2811  | Pin on Espruino Board         |
|---------|-------------------------------|
|  GND    | GND                           |
|  DIN    | B15                           |
|  VCC    | Bat                           |

Note that Espruino doesn't normally keep great time (It could drift off by as much as a second a minute).
To keep better time, check out the [page on how to add a Watch Crystal](http://www.espruino.com/Clocks).

To change the time, plug into a PC and issue the commands:

```
time.hours = 12;
time.mins = 54;
time.secs = 0;
```


*/

// setup SPI comms for the LED strip
SPI2.setup({baud:3200000, mosi:B15});
// store current time...
var time = { 
  hours : 10,
  mins : 36,
  secs : 0
};


/** Add red,green and blue light for light number 'n' 
 and the light next to it. 
 
 lights : array of light data
 offset : where in the lights array do we start from? 
       0 = first string, 12*3 = second string
 r,g,b  : red green and blue between 0 and 255       
 n      : light number. Rolls over after 11 and can be fractional,
          so:
 
 so for instance:
  n = 1     - set just light 1
  n = 1.1   - set light 1 to 90% and 2 to 10%
  n = 1.5   - set light 1 to 50% and 2 to 50%
  n = 1.9   - set light 1 to 10% and 2 to 90%
  n = 15.5   - set light 3 to 50% and 4 to 50%
*/
function setLED(lights, offset, n, r,g,b) {
  // Work out which light to start with (make n a whole number)
  var led = Math.floor(n);
  // work out the percentage of light on the second light (see above)
  var amt = n - led;
  var namt = 1-amt; // percentage of light on the first light
  // work out which light
  var n1 = offset+(led%12)*3;
  var n2 = offset+((led+1)%12)*3;
  
  lights[n1] += r*namt;
  lights[n1+1] += g*namt;
  lights[n1+2] += b*namt;
  lights[n2] += r*amt;
  lights[n2+1] += g*amt;
  lights[n2+2] += b*amt;
}

var lastTime = getTime();

function onTimer() {
  // Move the time onwards...
  var timeNow = getTime();
  time.secs += timeNow - lastTime;
  lastTime = timeNow;
  if (time.secs>=60) {
    time.secs = 0;
    time.mins++;
    if (time.mins>=60) {
      time.mins = 0;
      time.hours++;
      if (time.hours>=24) {
        time.hours = 0;
      }
    }
  }
  
  // Create an array to hold the data for our lights
  var lights = new Uint8Array((12+12)*3);
  
  // fancy sub-seconds that spins around (on second strip)
  setLED(lights, 12*3, time.secs*12, 63,0,0);
  // Seconds - Math.floor rounds it down (on second strip)
  setLED(lights, 12*3, Math.floor(time.secs)*12/60, 192,192,0);
  // Minutes (on first strip)
  setLED(lights, 0, time.mins*12/60, 0,0,255);
  // Hours - %12 means roll over after 12 hours (on first strip)
  setLED(lights, 0, time.hours%12, 0,255,0);
  
  // send the data to the lights
  SPI2.send4bit(lights, 0b0001, 0b0011); 
}


setInterval(onTimer, 100); // 100ms = 10 times a second
