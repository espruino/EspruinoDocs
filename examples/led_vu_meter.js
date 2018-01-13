/* 
LED Volume (VU) Meter
==================

* KEYWORDS: VU Meter,Volume Meter,Light Show,Audio
* USES: WS2811,Waveform,Espruino Board

This creates a simple sound-reactive LED meter on a string of WS2811 Lights. Varying numbers of LEDs light up white in response to the volume of sound detected.

[[WS2811]] Wiring:

| WS2811  | Pin on Espruino Board         |
|---------|-------------------------------|
|  GND    | GND                           |
|  DIN    | B15                           |
|  VCC    | Bat                           |

Audio Wiring:

| Audio       | Pin on Espruino Board     |
|-------------|---------------------------|
|  GND        | GND (via 4.7k resistor)   |
|  GND        | 3.3v (via 4.7k resistor)  |
|  Sound      | A0                        |

The resistors are required because Audio Signals are typically between -1v and +1v, and Espruino will only take in voltages between 0 and 3.3v.

**DO NOT** connect this to the Audio output of your laptop while Espruino is plugged in (as USB ground is typically the same as audio ground). Instead, use a portable MP3 player or phone that is not plugged into a charger.

*/


// Set up SPI
SPI2.setup({baud:3200000, mosi:B15});
// The data for the LEDs
var rgb = new Uint8Array(75);
// Set up the waveform we'll use to record the sound
var w = new Waveform(64,{doubleBuffer:true});

w.on("buffer", function(buf) { 
  var l = buf.length;
  // work out the 'volume'
  var v = E.variance(buf,E.sum(buf)/l)/l;
  // for each of the 25 LEDs, set it to be white if its index is less than the volume detected
  for (var i=0;i<75;) {
    var c = i<v ? 255 : 0;
    rgb[i++] = c;
    rgb[i++] = c;
    rgb[i++] = c;
  }
  // send the data to the LEDs
  SPI2.send4bit(rgb, 0b0001, 0b0011);
});

function onInit() {
  // Start sampling at 2kHz
  w.startInput(A0,2000,{repeat:true});
}

// Initialise
onInit();
