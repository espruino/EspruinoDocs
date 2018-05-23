<!--- Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Flappy Bird Game
================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Pico+Flappy+Bird+Game. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Pico,LCD,Game,Flappy Bird,FlappyBird
* USES: Pico,PCD8544,PicoStarterKit,Pixl.js,Graphics

[[http://youtu.be/OvQdiNA2YhM]]

Introduction
-----------

This is a really quick version of the [Flappy Bird Game](https://en.wikipedia.org/wiki/Flappy_Bird). Press the button to 'flap' and go up in the air against gravity, and try and avoid the obstacles!

Check out the video above for more information!

You'll Need
----------

* An Espruino [[Pico]]
* A [Nokia 5110 LCD](/PCD8544)
* [[Breadboard]]

or:

* An Espruino [Pixl.js](/Pixl.js)

Software
-------

Everything's detailed in the video above, but if you just want the software then it's copied below.

### For Espruino Pico and PCD8544

```
// for Pico and LCD
A5.write(0); // GND
A7.write(1); // VCC
var BUTTON = B3;
pinMode(BUTTON,"input_pulldown");
var g;

var SPEED = 0.5;
var BIRDIMG = {
  width : 8, height : 8, bpp : 1,
  transparent : 0,
  buffer : new Uint8Array([
    0b00000000,
    0b01111000,
    0b10000100,
    0b10111010,
    0b10100100,
    0b10000100,
    0b01111000,
    0b00000000,
  ]).buffer
};



var birdy, birdvy;
var wasPressed = false;
var running = false;
var barriers;
var score;

function newBarrier(x) {
  barriers.push({
    x1 : x-5,
    x2 : x+5,
    y : 10+Math.random()*28,
    gap : 8
  });
}

function gameStart() {
  running = true;
  birdy = 48/2;
  birdvy = 0;
  barriers = [];
  for (var i=42;i<g.getWidth();i+=42)
    newBarrier(i);
  score = 0;
}

function gameStop() {
  running = false;
}

function draw() {
  var buttonState = BUTTON.read();

  g.clear();
  if (!running) {
    g.drawString("Game Over!",25,10);
    g.drawString("Score",10,20);
    g.drawString(score,10,26);
    g.flip();
    if (buttonState && !wasPressed)
      gameStart();
    wasPressed = buttonState;
    return;
  }

  if (buttonState && !wasPressed)
    birdvy -= 2;
  wasPressed = buttonState;

  score++;
  birdvy += 0.2;
  birdvy *= 0.8;
  birdy += birdvy;
  if (birdy > g.getHeight())
    gameStop();
  // draw bird
  //g.fillRect(0,birdy-3,6,birdy+3);
  g.drawImage(BIRDIMG, 0,birdy-4);
  // draw barriers
  barriers.forEach(function(b) {
    b.x1-=SPEED;
    b.x2-=SPEED;
    var btop = b.y-b.gap;
    var bbot = b.y+b.gap;
    g.drawRect(b.x1+1, -1, b.x2-2, btop-5);
    g.drawRect(b.x1, btop-5, b.x2, btop);
    g.drawRect(b.x1, bbot, b.x2, bbot+5);
    g.drawRect(b.x1+1, bbot+5, b.x2-1, g.getHeight());
    if (b.x1<6 && (birdy-3<btop || birdy+3>bbot))
      gameStop();
  });
  while (barriers.length && barriers[0].x2<=0) {
    barriers.shift();
    newBarrier(g.getWidth());
  }

  g.flip();
}

// For Pico and LCD
function onInit() {  
  // Setup SPI
  var spi = new SPI();
  spi.setup({ sck:B1, mosi:B10 });
  // Initialise the LCD
  g = require("PCD8544").connect(spi,B13,B14,B15, function() {
    //g.setContrast(0.43);
    gameStart();
    setInterval(draw, 50);
  });
}

// Finally, start everything going
onInit();
```

### For Pixl.js

```
var BUTTON = BTN1;

var SPEED = 0.5;
var BIRDIMG = {
  width : 8, height : 8, bpp : 1,
  transparent : 0,
  buffer : new Uint8Array([
    0b00000000,
    0b01111000,
    0b10000100,
    0b10111010,
    0b10100100,
    0b10000100,
    0b01111000,
    0b00000000,
  ]).buffer
};



var birdy, birdvy;
var wasPressed = false;
var running = false;
var barriers;
var score;

function newBarrier(x) {
  barriers.push({
    x1 : x-5,
    x2 : x+5,
    y : 10+Math.random()*28,
    gap : 8
  });
}

function gameStart() {
  running = true;
  birdy = 48/2;
  birdvy = 0;
  barriers = [];
  for (var i=42;i<g.getWidth();i+=42)
    newBarrier(i);
  score = 0;
}

function gameStop() {
  running = false;
}

function draw() {
  var buttonState = BUTTON.read();

  g.clear();
  if (!running) {
    g.drawString("Game Over!",25,10);
    g.drawString("Score",10,20);
    g.drawString(score,10,26);
    g.flip();
    if (buttonState && !wasPressed)
      gameStart();
    wasPressed = buttonState;
    return;
  }

  if (buttonState && !wasPressed)
    birdvy -= 2;
  wasPressed = buttonState;

  score++;
  birdvy += 0.2;
  birdvy *= 0.8;
  birdy += birdvy;
  if (birdy > g.getHeight())
    gameStop();
  // draw bird
  //g.fillRect(0,birdy-3,6,birdy+3);
  g.drawImage(BIRDIMG, 0,birdy-4);
  // draw barriers
  barriers.forEach(function(b) {
    b.x1-=SPEED;
    b.x2-=SPEED;
    var btop = b.y-b.gap;
    var bbot = b.y+b.gap;
    g.drawRect(b.x1+1, -1, b.x2-2, btop-5);
    g.drawRect(b.x1, btop-5, b.x2, btop);
    g.drawRect(b.x1, bbot, b.x2, bbot+5);
    g.drawRect(b.x1+1, bbot+5, b.x2-1, g.getHeight());
    if (b.x1<6 && (birdy-3<btop || birdy+3>bbot))
      gameStop();
  });
  while (barriers.length && barriers[0].x2<=0) {
    barriers.shift();
    newBarrier(g.getWidth());
  }

  g.flip();
}

function onInit() {  
  gameStart();
  setInterval(draw, 50);
}

// Finally, start everything going
onInit();
```
