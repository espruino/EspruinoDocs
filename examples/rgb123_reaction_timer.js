/*
Reaction Timer using RGB123
=================================

* KEYWORDS: Reaction,Timer,Timing
* USES: RGB123,Button,Graphics


This uses an [[RGB123]] 16x8 display (on B15), and scrolls the text "Test your reaction time!". When a button is pressed, it goes to a short timer `3..2..1..` and then after a random time period it lights up bright red and you have to press the button... It then tells you your reaction time and goes back to the start.

Wiring Up
---------

| Espruino | Connection |
|----------|------------|
| A0       | Light in button |
| A1       | Button (connected to ground) |
| B15      | [[RGB123]] DIN |

*/

var BUTTON = A1;
var LIGHT = A0;
pinMode(BUTTON,"input_pullup");
SPI2.setup({baud:3200000, mosi:B15});
var g = Graphics.createArrayBuffer(16,8,24,{zigzag:true});
g.flip = function() { SPI2.send4bit(this.buffer, 0b0001, 0b0011); };
require("Font6x8").add(Graphics);
var textPos = -16;
var textCol = 1;
var countdownCount = 0;
var testStartTime = 0;
var testValue = 0;

function clear() {
  g.clear();
  g.flip();
}

function scrollHandler() {
  textPos++;
  g.clear();
  g.setColor((textCol&1)?0.1:0,(textCol&2)?0.1:0,(textCol&4)?0.1:0);
  g.setFont6x8();
  var text = "Test your reaction time!";
  g.drawString(text,-textPos,1);
  if (textPos > g.stringWidth(text)) {
    textPos = -16;
    textCol = 1+Math.floor(Math.random()*6);
  }
  g.flip();
}

function countdownHandler() {
  g.clear();
  g.setFont6x8();
  var text;

  if (countdownCount==0) {
    g.setColor(0,0.2,0);
    text = "3";
  } else if (countdownCount==1) {
    g.setColor(0,0.2,0.2);
    text = "2";
  } else {
    g.setColor(0,0.0,0.2);
    text = "1";
  }
  g.drawString(text,(g.getWidth()-g.stringWidth(text))/2,1);
  g.flip();

  countdownCount++;
  if (countdownCount>2) {
    setTimeout('changeState("doTest")', 500);
  }

}


function tooEarlyHandler() {
  g.clear();
  g.setFont6x8();
  var text;

  if (countdownCount==0) {
    g.setColor(0,0.2,0);
    text = ":-(";
  } else if (countdownCount==1) {
    g.setColor(0,0.2,0.1);
    text = "Too";
  } else {
    g.setColor(0,0.2,0.2);
    g.setFontBitmap();
    text = "Soon";
  }
  g.drawString(text,(g.getWidth()-g.stringWidth(text))/2,1);
  g.flip();

  countdownCount++;
  if (countdownCount>3) {
    setTimeout('changeState("scrolling")', 500);
  }
}

function testFinishedHandler() {
  g.clear();
  g.setFont6x8();
  var text="",y=0;

  if (countdownCount==0) {
    g.setColor(0,0.2,0);
    text = "You";
  } else if (countdownCount==1) {
    g.setColor(0,0.2,0.1);
    text = "got";
  } else {
    g.setColor(0,0.2,0.2);
    g.setFontBitmap(); y=2;
    text = Math.round(testValue*1000);
  }
  g.drawString(text,(g.getWidth()-g.stringWidth(text))/2,y);
  g.flip();

  countdownCount++;
  if (countdownCount>6) {
    setTimeout('changeState("scrolling")', 500);
  }
}


function testHandler() {
  g.setColor(0,0.5,0);
  g.fillRect(0,0,g.getWidth(), g.getHeight());
  g.flip();
  digitalWrite(LIGHT,1);
  state = "inTest";
  testStartTime = getTime();
}

var state = "scrolling";
function changeState(newState, time) {
  state = newState;
  clearInterval();
  clear();
  if (state == "scrolling") {
    setInterval(scrollHandler, 100);
    setInterval("analogWrite(LIGHT, (Math.sin(getTime())+1)*0.5)", 50);
    textPos = -16;
  }
  if (state == "countdown") {
    setInterval(countdownHandler, 1000);
    digitalWrite(LIGHT, 0);
    countdownCount = 0;
  }
  if (state == "doTest") {
    var timeout = 500+Math.random()*2000;
    setTimeout(testHandler, timeout);
    setTimeout('changeState("scrolling")', 10000);
  }
  if (state == "earlyPress") {
    setInterval(tooEarlyHandler, 1000);
    digitalWrite(LIGHT, 0);
    countdownCount = 0;
  }
  if (state == "buttonHit") {
    testValue = time - testStartTime;
    console.log("Got time "+testValue);
    digitalWrite(LIGHT, 0);
    setInterval(testFinishedHandler, 1000);
    countdownCount = 0;
  }
}




function buttonPress(e) {
  if (state=="scrolling")
    changeState("countdown");
  else if (state == "countdown" || state=="doTest")
    changeState("earlyPress");
  else if (state=="inTest")
    changeState("buttonHit", e.time);
  else
    changeState("scrolling");
}

setWatch(buttonPress, BUTTON, { edge : "falling", repeat: true, debounce : 1 });


function onInit() {
  changeState("scrolling");
}
onInit();
