/* 
Temperature Graph on a PCD8544 display, with DS18B20 tempetarure sensor
=======================================================================

* KEYWORDS: PCD8544,DS18B20,LCD,Temperature,Graphics,Graph

   Using the Nokia 5110 display and the DS18B20 temperature
   sensor to make a simple temperature graph 

| LCD pin | Pin on Espruino Board         |
|---------|-------------------------------|
|  GND    | GND                           |
|  LIGHT  | GND (backlight on)            |
|  VCC    | 3.3                           |
|  CLK    | B3                            |
|  DIN    | B5                            |
|  DC     | B6                            |
|  CE     | B7                            |
|  RST    | B8                            |

| DS18B20 pin | Pin on Espruino Board     |
|-------------|---------------------------|
|  Green      | GND                       |
|  Red        | 3.3                       |
|  Yellow     | B13                       |

*/

SPI1.setup({ baud: 1000000, sck:B3, mosi:B5 });
var g = require("PCD8544").connect(SPI1,B6,B7,B8);
var temp = require("DS18B20").connect(B13);

// create history points, one for each pixel on the LCD
var history = new Int8Array(g.getWidth());

setInterval(function() {
  // Get the temperature
  var t = temp.getTemp();
  // Move our history back and add our new temperature at the end
  for (var i=1;i<history.length;i++)
    history[i-1] = history[i];
  history[history.length-1] = t;
  // function to convert the temperature to a position on the screen
  var tempToY = function(t) { return 30-t; };
  // draw the graph!
  g.clear();
  g.moveTo(0,tempToY(history[0]));
  for (i=1;i<history.length;i++)
    g.lineTo(i,tempToY(history[i]));
  // display on the screen
  g.flip();
}, 500);
