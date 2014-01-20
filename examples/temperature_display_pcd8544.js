/* 
* KEYWORDS: PCD8544,DS18B20,LCD,Temperature,Graphics,Font,Text
* USES: PCD8544,DS18B20

   Using the Nokia 5110 display and the DS18B20 temperature
   sensor to make a simple temperature display 

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
var ow = new OneWire(B13);
var temp = require("DS18B20").connect(ow);

setInterval(function() {
  // Get the temperature
  var t = temp.getTemp();
  // Round it to the nearest 0.1
  t = Math.round(t*10)/10;
  // Now draw!
  g.clear();
  g.setFontBitmap(); // simple 8x8 font
  g.drawString("Temp",0,0);
  g.drawLine(0,10,84,10);
  g.setFontVector(25); // large font
  g.drawString(t, 0, 15);
  g.flip(); // copy this to the screen
}, 200);
