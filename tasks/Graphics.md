<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Graphics Library
================

* KEYWORDS: Graphics,LCD,Draw,Line,Fill,Color,Circle,Built-In

Espruino has a built-in graphics library (however on less powerful devices this may have been removed to save on Flash memory).

This Library is handled with the Graphics class. On some boards that have an LCD built in, there will be a predefined variable called 'LCD' (an instance of the Graphics Object) - and this is what is used in the examples below.

If you have a board without an in-build LCD, you can create your own instance(s) of the Graphics class for LCDs, or your own use.

### LCD Drivers

Below are a list of currently available LCD drivers:

* APPEND_KEYWORD: Graphics Driver

### Internal Use

You can create a Graphics class which renders to an ArrayBuffer:

```
Graphics.prototype.print = function() { 
  for (var y=0;y<this.getHeight();y++)
    console.log(new Uint8Array(this.buffer,this.getWidth()*y,this.getWidth()));
}
var g = Graphics.createArrayBuffer(8,8,8);
g.setColor(1)
g.drawString("X",0,0) 
g.print()
//0,0,0,0,0,0,0,0
//0,1,1,0,0,0,1,1
//0,1,1,0,0,0,1,1
//0,0,1,1,0,1,1,0
//0,0,0,1,1,1,0,0
//0,0,1,1,0,1,1,0
//0,1,1,0,0,0,1,1
//0,1,1,0,0,0,1,1
```

Or you can create a Graphics instance which calls your function whenever a pixel needs to be drawn:

```
var g = Graphics.createCallback(8,8,1,function(x,y,c) {
 print(x+","+y);
});
g.drawLine(0,0,2,2)
//0,0
//1,1
//2,2
```

Hello World
-----------

Simple Hello World text using a bitmap font:

```JavaScript
g.clear();
g.drawString("Hello World",0,0);
```

The final two arguments are colours (background and foreground)

Or use vector fonts, which are scaleable!

```JavaScript
g.clear();
g.setFontVector(40);
g.setColor(1,0,0);
g.drawString("Hello",0,0); // 40px high in red
g.setFontVector(60);
g.setColor(0,1,0);
g.drawString("World",40,40); // 60px high in green
```
 
You can then switch back to the bitmap font using:

```
LCD.setFontBitmap();
```

For more information, see [[Fonts]]

Circles
-------

There isn't currently a circle function implemented - but you can just add one!

```JavaScript
g.fillCircle = function(x,y,rad,col) {
  var pts = parseInt(rad)/2;
  var a = [];
  for (var i=0;i<pts;i++) {
    var t = 2*i*Math.PI/pts;
    a.push(x+Math.sin(t)*rad);
    a.push(y+Math.cos(t)*rad);
  }
  g.fillPoly(a);
}

g.clear();
g.fillCircle(100,100,50);
```

 
Random Lines
------------

Randomly draw lines on the screen!

```JavaScript
g.clear();
while (true) {
  g.setColor(Math.random(),Math.random(),Math.random());
  g.drawLine(
    Math.random()*LCD.getWidth(), Math.random()*LCD.getHeight(),
    Math.random()*LCD.getWidth(),Math.random()*LCD.getHeight()) 
}
```


Images / Bitmaps
----------------

With Espruino, you can define an image as a special kind of object. For instance this is a 8x8 pixel, 1 bit smiley face:

```
var img = {
  width : 8, height : 8, bpp : 1,
  transparent : 0,
  buffer : new Uint8Array([
    0b00000000,
    0b01000100,
    0b00000000,
    0b00010000,
    0b00000000,
    0b10000001,
    0b01111110,
    0b00000000,
  ]).buffer
};
```

See the reference for [`Graphics.drawImage`](/Reference#l_Graphics_drawImage) for more information...

You can then simply draw it to the screen wherever you want:

```
g.drawImage(img, 10, 10);
```

If you use a single-bit image, the foreground and background colours will be used instead of the image's colours. Otherwise the colour data will be copied directly so it's an idea to use a bitmap of the same bit depth as your display.

**Beware:** Microcontrollers don't have much memory - even a small 128x128 pixel image will be too big to fit in Espruino's memory!

### Loading images from SD card

There are a few ways to load images from SD card, but the easiest is to use the [[BMPLoader]] module:

```
var img = require("BMPLoader").load(require('fs').readFileSync("foo.bmp"));
g.drawImage(img, 10, 10);
```

### Loading images as code

If you don't want to load images off an SD card, the easiest way is to convert them to raw pixel data on your PC, and to then convert that to base64 encoding.

#### Creating a raw image

It's best to install the [ImageMagick](http://www.imagemagick.org/) tools. Then you can type commands like:

```Bash
# Create a 24 bit RGB image called output.raw
convert myimage.png rgb:output.raw

# Create a 24 bit, 16x16 pixel RGB image called output.raw
convert myimage.png -resize 16x16\! -depth 8 rgb:output.raw

# Create an 8 bit, 16x16 pixel Greyscale image called output.raw
convert myimage.png -resize 16x16\! -depth 8  gray:output.raw

# Create a 1 bit, 16x16 pixel black and white image called output.raw
convert myimage.png -resize 16x16\! -depth 1  gray:output.raw
```

#### Base64 Encoding

On Linux, simply type `base64 --wrap=0 myfilename.raw` - or on other platforms you can use the [[File Converter]] webpage. 

#### Loading into Espruino

Once you've got the base64 encoded image, simply decode it with `atob` and create an ArrayBuffer from it. For instance this is the Espruino logo:

```
var img = {
  width : 32, height : 32, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("AAAAAAAAeAAAf/4AH/+bAH/ABQBoAAeAaAADwHQAAf5aAfCfS/8/sUXP//1G//AdQ/wAHUAAAB1AAAAdQAAAHWAAABNgAAAeYAAAEOAAABDgAAAQ8AAAGPgAABz4AAAcfAAAnD4AP/A+B//AHz//wA///4AAP+AAABgAAAAAAAA="))
};
```


