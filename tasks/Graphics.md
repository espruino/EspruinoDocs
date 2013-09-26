<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Graphics Library
================

* KEYWORDS: Graphics,LCD,Draw,Line,Fill,Color,Circle

Espruino has a built-in graphics library (however on less powerful devices this may have been removed to save on Flash memory).

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
LCD.drawVectorString("Hello",0,0); // 40px high in red
LCD.setFontVector(60);
LCD.setColor(0,1,0);
LCD.drawVectorString("World",40,40); // 60px high in green
```
 
Circles
-------

There isn't currently a circle function implemented - but you can just add one!

```JavaScript
LCD.fillCircle = function(x,y,rad,col) {
  var pts = Integer.parseInt(rad)/2;
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
