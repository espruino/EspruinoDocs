<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Graphics Library
================

* KEYWORDS: Graphics,LCD,Draw,Line,Fill,Color,Circle

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
LCD.clear();
LCD.drawString("Hello World",0,0);
```

The final two arguments are colours (background and foreground)

Or use vector fonts, which are scaleable!

```JavaScript
LCD.clear();
LCD.setFontVector(40);
LCD.setColor(1,0,0);
LCD.drawString("Hello",0,0); // 40px high in red
LCD.setFontVector(60);
LCD.setColor(0,1,0);
LCD.drawString("World",40,40); // 60px high in green
```
 
Circles
-------

There isn't currently a circle function implemented - but you can just add one!

```JavaScript
LCD.fillCircle = function(x,y,rad,col) {
  var pts = parseInt(rad)/2;
  var a = [];
  for (var i=0;i<pts;i++) {
    var t = 2*i*Math.PI/pts;
    a.push(x+Math.sin(t)*rad);
    a.push(y+Math.cos(t)*rad);
  }
  LCD.fillPoly(a);
}

LCD.clear();
LCD.fillCircle(100,100,50);
```
 
Random Lines
------------

Randomly draw lines on the screen!

```JavaScript
LCD.clear();
while (true) {
  LCD.setColor(Math.random(),Math.random(),Math.random());
  LCD.drawLine(
    Math.random()*LCD.getWidth(), Math.random()*LCD.getHeight(),
    Math.random()*LCD.getWidth(),Math.random()*LCD.getHeight()) 
}
```
