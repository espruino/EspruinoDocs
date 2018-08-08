/*<!-- Copyright (c) 2018 Gordon Williams. See the file LICENSE for copying permission. -->
Pixl.js Pong Game
======================

* KEYWORDS: Pong,Game,Bat
* USES: Pixl.js,Graphics

[[https://youtu.be/lLB_F-eCMbg]]

This is a very simple two player [Pong](https://en.wikipedia.org/wiki/Pong)
game made using [Pixl.js](/Pixl.js) and two potentiometers. See the video
above for full details on how it was made.

To use this, wire:

* One side of each potentiometer to the GND pin on [Pixl.js](/Pixl.js#pinout)
* The other side of each potentiometer to the 3.3v pin on [Pixl.js](/Pixl.js#pinout)
* The left potentiometer to pin `A0`
* The right potentiometer to pin `A1`

[Get connected to Espruino](http://www.espruino.com/Quick+Start) with the
Web IDE, copy and paste the following code into the right-hand side of the
IDE, and click the upload button!

For a two-player, two-Pixl.js based version of Pong, [see this page](/Pixl.js+Multiplayer+Pong)
*/

var BATSIZE = 8;
var scorel = 0;
var scorer = 0;

var ball;

function newGame() {
  ball = {
    x : g.getWidth()/2,
    y : g.getHeight()/2,
    vx : (Math.random()>0.5)?1:-1,
    vy : (Math.random()-0.5)*2
  };
}

function onFrame() {
  var batl = analogRead(A0) * g.getHeight();
  var batr = analogRead(A1) * g.getHeight();

  ball.x += ball.vx;
  ball.y += ball.vy;
  if (ball.y<=0) ball.vy = Math.abs(ball.vy);
  if (ball.y>=g.getHeight()-1) ball.vy = -Math.abs(ball.vy);
  if (ball.x<5 &&
      ball.y>batl-BATSIZE && ball.y<batl+BATSIZE) {
    ball.vx = Math.abs(ball.vx);
  }
  if (ball.x>g.getWidth()-6  &&
      ball.y>batr-BATSIZE && ball.y<batr+BATSIZE) {
    ball.vx = -Math.abs(ball.vx);
  }
  if (ball.x<0) {
    scorer++;
    newGame();
  }
  if (ball.x>g.getWidth()-1) {
    scorel++;
    newGame();
  }

  g.clear();
  g.fillRect(0,batl-BATSIZE, 3,batl+BATSIZE);
  g.fillRect(g.getWidth()-4,batr-BATSIZE, g.getWidth()-1,batr+BATSIZE);
  g.fillRect(ball.x-1,ball.y-1,ball.x+1,ball.y+1);
  g.setFontAlign(-1,-1);
  g.drawString(scorel, 10,0);
  g.setFontAlign(1,-1);
  g.drawString(scorer, g.getWidth()-10,0);
  g.flip();
}

newGame();
setInterval(onFrame, 50);
