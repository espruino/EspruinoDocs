<!--- Copyright (c) 2014 Spence Konde See the file LICENSE for copying permission. -->
Digole LCD driver (monochrome)
=======================

* KEYWORDS: Module,I2C,Digole,Graphics,Graphics Driver,LCD,Monochrome

Digole manufactures a number of LCD screens with a very MCU-friendly interface. These are available with screen sizes up to around 5". Most of their displays are monochrome in 128x64 or 240x64 sizes, however, they also have color screens, often based on OLED technology. All of their Serial displays use the same interface (however, some commands are different for color vs monochrome). While more expensive than some of the much more capable ILI-based LCDs, they offer larger screen sizes and a much easier interface. Two modules are provided - one using a double buffer and the Espruino's graphics library, and one using the Digole hardware graphics functions. 

Hardware
------------------

The Digole displays support communication via UART, I2C, and SPI, controlled by connecting a set of three solder points. I have found that commands including 0x00 do not seem to work correctly over UART, and have been entirely unable to make SPI work. Investigations are ongoing, a future version of this module may support UART. In order to use I2C mode, you must connect the 10k pullup resistors (two resistors must be installed, one between 3.3 and SCL, and the other between 3.3 and SDA). 


Using in Double Buffer mode
---------------------------

Double Buffer mode is supplied in the [[DigoleBuf.js]] module, using the [[Graphics]] library. In this mode, it can be used just like the PCD8544 or any other display that uses the [[Graphics]] library. This may be a little slower, and you do need to store the whole buffer in memory, but you can use all the functions of the Espruino graphics library. Additionally, the code is also really small. Call flip() to send the buffer to the screen.  

```
I2C2.setup({ sck:B3, mosi:B5 });
var g = require("DigoleBuf").connect(I2C2,128,64)
g.clear();
g.drawString("Hello",0,0);
g.drawLine(0,20,127,20);
g.flip();
```



```
g.flip()
g.setContrast(c)
g.setBacklight(s)
g.writeByte(b)
```

`flip()` sends the buffer to the display.

`setContrast(c)` takes an argument from 0 to 255. On most monochrome LCDs, there is a very narrow window in which it is actually viewable.

`setBacklight(s)` takes an argument 0 or 1. If the display has a backlight, this will turn it on (1) or off (0). Untested. 

`writeByte(b)` writes the byte passed to the 8 output pins on the controller board. These can source/sink 25ma, and can be used for any purpose. This may be useful if you are setting up your own 


Using in Hardware Graphics mode
---------------------------
Double Buffer mode is supplied in the [[DigoleHW.js]] module, using the hardware graphics functions. In this mode, most of the graphics functions work the same way as they would in the [[Graphics]] library; each of these functions is simply wrapping a command to the hardware. 


```
I2C2.setup({ sck:B3, mosi:B5 });
var g = require("DigoleHW").connect(I2C2,128,64)
g.clear();
g.drawString("Hello",0,0);
g.drawLine(0,20,127,20);
```

All methods that draw something to the screen now take an extra, optional, final argument dm. If this is included, the "display mode" will be set for this operation, and each pixel will perform a logical test with the existing pixels. Options are "!" or "~" for 'not', "|" for or (normal behavior), "&" for 'and', and "^" for 'xor'. 


Methods that work like normal functions in [[Graphics]] library:

```
drawString(string,x,y,dm)
drawLine(x1,y1,x2,y2,dm)
drawRect(x1,y1,x2,y2,dm)
fillRect(x1,y1,x2,y2,dm)
setColor(col)
getWidth()
getHeight()
setPixel(x1,y1,col,dm)
clear()
```

Other methods:

```
setRotation(rotation) //second option (reflect) not available. 
drawCircle(x,y,r,f,dm) //r is radius, f is 1 or 0 (filled or non). 
drawImage(image,x,y) //On monochrome displays, image width must be multiple of 8. 
moveArea(x,y,w,h,xoff,yoff)
setLinePattern(p)
setFont(f) 
setContrast(c) 
setBacklight(s) 
writeByte(b)
```

`moveArea(x,y,w,h,xoff,yoff)` moves a rectangular area of the image on the screen (top left corner at x,y, width w, height h) by (xoff,yoff) pixels.

`setLinePattern(p)` takes a 1 byte argument, this is used as a pattern for the line, to draw dotted or dashed lines.

`setFont(f)` takes an argument of 0, 6, 10, 18, 51, 120, or 123 for the builtin fonts. 

`setContrast(c)` takes an argument from 0 to 255. On most monochrome LCDs, there is a very narrow window in which it is actually viewable.

`setBacklight(s)` takes an argument 0 or 1. If the display has a backlight, this will turn it on (1) or off (0). Untested. 

`writeByte(b)` writes the byte passed to the 8 output pins on the controller board. These can source/sink 25ma, and can be used for any purpose. This may be useful if you are setting up your own 

Other limitations:
* getColor() is not supported.
* getBgColor() is not supported.
* setFontVector() is not supported.
* setFontBitmap() is not supported.
* setFontCustom() is not supported. There is a way to upload user fonts to the controller, but doing so is not yet supported by this module.
* drawPoly() is not supported by this module. 
* fillPoly() is not supported.
* stringWidth() is not supported.
* lineTo() is not supported by this module.
* moveTo() is not supported by this module.

Using 
-----

* APPEND_USES: Digole

Buying
-----

* [Digole eBay store](http://stores.ebay.com/Digole-Digital-Solution/Serial-LCD-OLED-/_i.html)
