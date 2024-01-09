<!--- Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Graphics Library
================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Graphics. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Graphics,LCD,Draw,Line,Fill,Color,Circle,Image,drawImage,Built-In

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
g.setFontBitmap();
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
```

Random Lines
------------

Randomly draw lines on the screen:

```JavaScript
g.clear();
while (true) {
  g.setColor(Math.random(),Math.random(),Math.random());
  g.drawLine(
    Math.random()*g.getWidth(), Math.random()*g.getHeight(),
    Math.random()*g.getWidth(),Math.random()*g.getHeight())
}
```

Images / Bitmaps
----------------

Espruino has a function called [`Graphics.drawImage`](/Reference#l_Graphics_drawImage)
which can be used to draw images.

Images are either a special kind of object or a String.

### Objects

Objects are of the form:

```
{
  width : int,
  height : int,
  bpp : int (bits per pixel, optional - default 1),
  transparent : int (transparent colour index, optional),
  palette : Uint16Array/string (colour palette),
  buffer : string/arraybuffer (image data)
}
```

For instance this is a `8x8` pixel, 1 bit smiley face
where any pixel that is `0` is treated as transparent:

```JS
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

### Strings

You can also specify the image as a string or arraybuffer, in the following form:

* For nontransparent: `[width, height, bpp, pixel data...]`
* For nontransparent with 16 bit palette: `[width, height, bpp|64, col0_lo, col0_hi, col1_lo, col1_hi, ..., pixel data...]`
* For transparent: `[width, height, bpp|128, transparent col, pixel data...]`
* For transparent with 16 bit palette: `[width, height, bpp|64|128, transparent col, col0_lo, col0_hi, col1_lo, col1_hi, ..., pixel data...]`

### Multiple frames

An image can contain multiple frames of the same size (eg for an animation). To do this just ensure that the image bitmap contains all the frames one after the other, then specify
the frame when drawing with [`Graphics.drawImage`](/Reference#l_Graphics_drawImage): `g.drawImage(img, x, y, { frame : n });`.

To generate an image like this, the easiest way is to use the [Image Converter](https://www.espruino.com/Image+Converter) with the images tiled vertically one after the other, and then change the width. As an example, if you want to store 10, 64x64px images:

* Arrange all images vertically into one bitmap, 64x640px
* Load this into the image converter, choose `Image Object` as the output, and convert
* Change the `height` field in the output from `640` to `64`

It is also possible to create an image with frames in an image string, but you would have to modify the height in the image string (second byte):

```JS
var tmp = atob("......"); // decode the image
E.toArrayBuffer(tmp)[1]=64; // or whatever you image height is
print(btoa(tmp)); // re-encode as base64
```

**Note:** For this to work, each frame of the image must contain a multiple of 8 bits - eg. `(width * height * bpp) & 7 == 0`.

### Creating images

You can:

* Specify images manually (as above)
* Use [`Graphics.createImage`](http://www.espruino.com/Reference#l_Graphics_createImage)
 to specify a 1 bit image in a more compact, readable way:

```
var img = Graphics.createImage(`

 X   X

   X

X      X
 XXXXXX
`);
```

* Use [`Graphics.asImage`](http://www.espruino.com/Reference#l_Graphics_asImage) to
create these images from an existing Graphics instance.

* Upload images to your board's storage (and convert at the same time) with the
Web IDE's `Storage` button.

* Use [our online Image Converter](/Image+Converter) to convert an image
into Base64-encoded JavaScript that can be pasted into your code.

* Load bitmaps directly (eg. from an SD card) with the [[BMPLoader]] module:

```
var img = require("BMPLoader").load(require('fs').readFileSync("foo.bmp"));
g.drawImage(img, 10, 10);
```

**Beware:** Microcontrollers don't have much memory - even a small 128x128 pixel 8 bit image may be too big to fit in Espruino's memory!

### Rendering

You can then simply draw images to the screen wherever you want:

```
g.drawImage(img, 10, 10);
// or draw an image directly from Storage
g.drawImage(require("Storage").read("myimage.img"), 10, 10);
// draw an image twice the size
g.drawImage(img, 10, 10, {scale:2});
// draw a large, rotated image
g.drawImage(img, 10, 10, {scale:1.5, rotate:Math.PI/4});
```

If you use a single-bit image, the foreground and background colors will be used instead of the image's colours. Otherwise the color data will be copied directly so it's an idea to use a bitmap of the same bit depth as your display.

See the reference for [`Graphics.drawImage`](/Reference#l_Graphics_drawImage) for more information...

#### Creating an image via command-line

The easiest solution is to use [our online Image Converter](/Image+Converter).

Or you can use command-line tools locally to create a raw image that can be uploaded separately. It's best to install [ImageMagick](http://www.imagemagick.org/). Then you can type commands like:

```Bash
# Create a 24 bit RGB image called output.raw
convert myimage.png rgb:output.raw

# Create a 24 bit, 16x16 pixel RGB image called output.raw
convert myimage.png -resize 16x16\! -depth 8 rgb:output.raw

# Create an 8 bit, 16x16 pixel Greyscale image called output.raw
convert myimage.png -resize 16x16\! -depth 8  gray:output.raw

# Create a 1 bit, 16x16 pixel black and white image called output.raw
# Note this one only works if your image is a multiple of 8 pixels wide
convert myimage.png -resize 16x16\! -depth 1  gray:output.raw
```

On Linux, you can type `base64 --wrap=0 myfilename.raw` to convert the raw file to base64 - or on other platforms you can use the [[File Converter]] webpage.

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
