<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Touchscreen
==========

* KEYWORDS: HYSTM32,HYSTM32_24,HYSTM32_28,HYSTM32_32,Touchscreen,SPI,ADS7843

This code reads the value from the touchscreen, and calls the touchCallback function which draws a line on the screen. Different boards have different pinouts and touchscreen arrangements, so need slightly different code:

2.4 inch display
--------------

```
var onInit = function () {
  SPI1.send([0x90,0],B7); // just wake the controller up
};
var touchFunc = function () {
  if (!digitalRead(B6)) { // touch down
    var dx = SPI1.send([0x90,0,0],B7);
    var dy = SPI1.send([0xD0,0,0],B7);
    var pos = {x:(dx[1]*256+dx[2])*LCD.getWidth()/0x8000, 
               y:LCD.getHeight()-(dy[1]*256+dy[2])*LCD.getHeight()/0x8000};
    touchCallback(pos.x, pos.y);
    lastPos = pos;
  } else lastPos = null;
};
var touchCallback = function (x,y) {
  if (lastPos!=null) { 
    LCD.drawLine(x,y,lastPos.x,lastPos.y,0xFFFF);
  }
};
onInit();setInterval(touchFunc, 50);
```

2.8 inch display
--------------

```
var onInit = function () {
  SPI1.setup({sck:A5,miso:A6,mosi:A7})
  SPI1.send([0x90,0],A4); // just wake the controller up
};
var touchFunc = function () {
  if (!digitalRead(C13)) { // touch down
    var d = SPI1.send([0x90,0,0xD0,0,0],A4);
    var pos = {x:LCD.getWidth()-(d[1]*256+d[2])*LCD.WIDTH/0x8000, 
               y:(d[3]*256+d[4])*LCD.getHeight()/0x8000};
    touchCallback(pos.x, pos.y);
    lastPos = pos;
  } else lastPos = null;
};
var touchCallback = function (x,y) {
  if (lastPos!=null) { 
    LCD.drawLine(x,y,lastPos.x,lastPos.y,0xFFFF);
  }
};
onInit();setInterval(touchFunc, 50);
```

3.2 inch display
--------------

```
var onInit = function () {
  SPI1.setup({sck:A5,miso:A6,mosi:A7})
  SPI1.send([0x90,0],A4); // just wake the controller up
};
var touchFunc = function () {
  if (!digitalRead(B6)) { // touch down
    var d = SPI1.send([0x90,0,0xD0,0,0],A4);
    var pos = {x:(d[1]*256+d[2])*LCD.getWidth()/0x8000, 
               y:(d[3]*256+d[4])*LCD.getHeight()/0x8000};
    touchCallback(pos.x, pos.y);
    lastPos = pos;
  } else lastPos = null;
};
var touchCallback = function (x,y) {
  if (lastPos!=null) { 
    LCD.drawLine(x,y,lastPos.x,lastPos.y,0xFFFF);
  }
};
onInit();setInterval(touchFunc, 50);
```
