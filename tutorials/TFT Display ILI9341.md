<!--- Copyright (c) 2014 Juergen Marsch, Pur3 Ltd. See the file LICENSE for copying permission. -->
Small TFT Display
===============================

* KEYWORDS: Display,TFT,ILI9341
* USES: ILI9341

![TFT Display](DSC_0555.jpg)

Introduction
-----------

This is a small and cheap TFT Display. It is connected via SPI to trhe Espruino

You'll Need
----------

* [Espruino Boards](/EspruinoBoard)
* A [ILI9341](DSC0556)

Wiring Up
--------

### Espruino Board

* Follow the wiring instructions for wiring up the [ILI9341](/ILI9341) TFT Display
* Connect up the [[ILI9341]] TFT Display (SPI2 used in this example) as follows:

| Display Pin | Espruino                    |
| ----------- | ------ | ------------------ |
| GND         |  GND   |                    |
| VCC         |  3.3v  |                    |
| LED         |  3.3v  | with Resistor (1k) |
| SCK         |  B13   |                    |
| SDO(MISO)   |  B14   |                    |
| SDI(Mosi)   |  B15   |                    |
| D/C         |  C6    |                    |
| CS          |  C7    |                    |
| RST         |  C8    |                    |


Software
-------

Connect to the transmitting Espruino, copy and paste this into the right-hand window, then click the ```Send to Espruino``` button.

```
ar d,g;
function ILIDemo(graphics){         //Init returns Graphics object, other option is to use d.graphics
  g = graphics;
  g.setColor(0,1,0);
  g.fillRect(0,0,50,50);            //calls for setPixel and fillRect are redirected to functions in ILI9341
  g.setColor(1,0,0);
  g.fillRect(70,70,120,120);
  g.setFontVector(12);
  g.drawString("Espruino",10,10);   // up to here everything is same code that can be used for PCD8544 for example
  d.setColor(0x07E0,0xF800);        // new setColor on level of ILI9341, there is no easy way to read foreground and baclground color
  d.loadFont("Font12.txt");         // loads a font from SD card and holds it internally in ILI9341
  d.drawString("Espruino",0,40);    // new function drawString using loaded font
  d.drawString("Espruino",0,80,2);  // new drawString with magnifier, easy to read on small display with a lot of pixels
  d.setColor(0x7FF,0xC798);
  d.drawString("Espruino",0,120,3);
  d.drawCircle(100,200,30);         // new function to draw circle
  d.drawCircle(100,200,20,true);    // drawCircle with fill parameter, true = fill
  for(var i = 0; i < 4; i++){
    g = d.setOrientation(i);        // new function to set orientation of display, parameter from 0 to 3, returns Graphics object
    g.setFontVector(12);            // need to be set again, since we have a new Graphics object
    g.drawString("Mode " + i,0,0);  // works fine with standard call to Graphics object
    d.drawString("XYZ",100,0,2);    // and with call to function in ILI9341
  }
}
d = require("ILI9341").connect();   // creates an ILI99341 object, default is SPI2, sck=B13, miso = B14, mosi = B15, dc = C6, ce = C7, rst = C8
d.init(ILIDemo);

```

```

Attention, I had some problems using the module because of interface problems.
I had to change Timeout in writeSerial (espruino_serial.js) from 60 to 100 to get it working.

And that's it! A cheap TFT Display is ready to be used.