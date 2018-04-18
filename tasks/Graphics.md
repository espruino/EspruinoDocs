<!--- Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Graphics Library
================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Graphics. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Graphics,LCD,Draw,Line,Fill,Color,Circle,Built-In

Espruino has a built-in graphics library, exposed via the [Graphics](/Reference#Graphics) class.

On most boards (without built in displays) you can create your own instance(s) of the Graphics class using a module that is designed to interface to a display (see 'Graphics Drivers' below), or you can manually create you own using one of the `Graphics.createXYZ` functions.

On the few boards that do contain LCDs, there is a predefined variable called 'LCD' (which is an instance of the Graphics Object).

**Note:** All coordinates in the Graphics library treat 0,0 as the top left corner of the display. However you can rotate or mirror what you draw using the [Graphics.setRotation](/Reference#l_Graphics_setRotation) method.

### Graphics Drivers

Below are a list of currently available modules that will interface to hardware and create a Graphics object for you:

* APPEND_KEYWORD: Graphics Driver

**Note:** several of the graphics drivers use offscreen buffers. This means that
draw operations won't immediately effect the display, and a method needs calling
to copy the buffer's data onto the screen. By convention this method is usually
called `.flip()`.

### Internal Use

**If you don't already have a graphics object set up** then
you can create a Graphics class which renders to an ArrayBuffer:

```
Graphics.prototype.print = function() {
  for (var y=0;y<this.getHeight();y++)
    console.log(new Uint8Array(this.buffer,this.getWidth()*y,this.getWidth()).toString());
};
var g = Graphics.createArrayBuffer(8,8,8);
g.setColor(1);
g.drawString("Hi",0,0);
g.print();
// 1,0,1,0,0,1,0,0
// 1,0,1,0,0,0,0,0
// 1,1,1,0,1,1,0,0
// 1,0,1,0,0,1,0,0
// 1,0,1,0,1,1,1,0
// 0,0,0,0,0,0,0,0
// 0,0,0,0,0,0,0,0
// 0,0,0,0,0,0,0,0
```

See the [`Graphics.createArrayBuffer`](/Reference#l_Graphics_createArrayBuffer)
reference for more information on possible arguments that can be used.

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

Text / Fonts
-------------

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

**Note:** Some non-official Espruino boards don't have
vector font support built-in.

You can then switch back to the bitmap font using:

```
LCD.setFontBitmap();
```

**You can also use custom Bitmap Fonts**. For more information, see [[Fonts]]


Circles
-------

In Espruino versions since 1.87, support for drawing circles has been added.

You can draw filled or outlined circles using the two circle functions. For each, the current foreground colour will be used.
The three required arguments are `x,y,rad`. The `x` and `y` coordinates for the centre position of the circle and `rad` the radius of the circle.

```JavaScript
// Draw a circle
g.drawCircle(100,100,50); // A circle with a radius of 50, centred at 100x100

// Draw a filled circle
g.fillCircle(100,100,50); // A filled circle with a radius of 50, centred at 100x100
```

However if you want to add your own support in earlier versions then you
can always do something like this:

```JavaScript
g.fillCircle = function(x,y,rad) {
  var pts = parseInt(rad)/2;
  var a = [];
  for (var i=0;i<pts;i++) {
    var t = 2*i*Math.PI/pts;
    a.push(x+Math.sin(t)*rad);
    a.push(y+Math.cos(t)*rad);
  }
  g.fillPoly(a);
}


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

The easiest solution is to use [our online Image Converter](/Image+Converter).

Or you can use command-line tools locally. It's best to install [ImageMagick](http://www.imagemagick.org/). Then you can type commands like:

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


### Tutorials using Graphics

* APPEND_USES: Graphics
