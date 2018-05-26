/*<!-- Copyright (c) 2018 Gordon Williams. See the file LICENSE for copying permission. -->
Dinosaur Game
==============

* KEYWORDS: Game,Dinosaur,T-Rex,Trex,Chrome Game,Offline Game
* USES: Pixl.js,Graphics

![Dinosaur](Dinosaur Game.jpg)

This code creates a Dinosaur game on [Pixl.js](/Pixl.js), similar to the
one available in the Chrome Web Browser when you're offline:

* The bottom two buttons move left and right
* Top left button jumps and/or restarts the game

This can easily be ported to other devices by:

* Making sure `g` is an instance of [[Graphics]]
* Ensuring `BTNL/R/U` are set correctly

*/

var BTNL = BTN4;
var BTNR = BTN3;
var BTNU = BTN1;

var IMG = {
  rex : [
    // running
     { width : 20, height : 22, bpp : 1, transparent:0, buffer : E.toArrayBuffer(atob("AB/gA/8AN/AD/wA/8AP/AD4AA/yAfAgfwMP/Dn/Q//wP/8B/+AP/gB/wAP4AB2AAYgAAIAADAP//")) },
     { width : 20, height : 22, bpp : 1, transparent:0, buffer : E.toArrayBuffer(atob("AB/gA/8AN/AD/wA/8AP/AD4AA/yAfAgfwMP/Dn/Q//wP/8B/+AP/gB/wAP4AB2AAYwAEAABgAP//")) },
     // dead
     { width : 20, height : 22, bpp : 1, transparent:0, buffer : E.toArrayBuffer(atob("AB/gAj8AK/ACPwA/8AP/AD4AA/yAfAgfwMP/Dn/Q//wP/8B/+AP/gB/wAP4AB2AAYgAEIABjAP//")) }
   ],
  cacti : [
    { width : 12, height : 24, bpp : 1, transparent:0, buffer : E.toArrayBuffer(atob("BgDwDwDwDwDyT373737373737373/+f8DwDwDwDwDwDwDwDw")) },
    { width : 8, height : 18, bpp : 1,  transparent:0, buffer : E.toArrayBuffer(atob("GBhY2dnZ2fl5Hx4YGBgYGBgY")) }
  ],
};
var cacti, rex, frame;

function gameStart() {
  rex = {
    alive : true,
    img : 0,
    x : 10, y : 0,
    vy : 0,
    score : 0
  };
  cacti = [ { x:128, img:1 } ];
  var random = new Uint8Array(128*3/8);
  for (var i=0;i<50;i++) {
    var a = 0|(Math.random()*random.length);
    var b = 0|(Math.random()*8);
    random[a]|=1<<b;
  }
  IMG.ground = { width: 128, height: 3, bpp : 1, buffer : random.buffer };
  frame = 0;
  setInterval(onFrame, 50);
}
function gameStop() {
  rex.alive = false;
  rex.img = 2; // dead
  clearInterval();
  setTimeout(function() {
    setWatch(gameStart, BTNU, {repeat:0,debounce:50,edge:"rising"});
  }, 1000);
  setTimeout(onFrame, 10);
}

function onFrame() {
  g.clear();
  if (rex.alive) {
    frame++;
    rex.score++;
    if (!(frame&3)) rex.img = rex.img?0:1;
    // move rex
    if (BTNL.read() && rex.x>0) rex.x--;
    if (BTNR.read() && rex.x<20) rex.x++;
    if (BTNU.read() && rex.y==0) rex.vy=4;
    rex.y += rex.vy;
    rex.vy -= 0.2;
    if (rex.y<=0) {rex.y=0; rex.vy=0; }
    // move cacti
    var lastCactix = cacti.length?cacti[cacti.length-1].x:127;
    if (lastCactix<128) {
      cacti.push({
        x : lastCactix + 24 + Math.random()*128,
        img : (Math.random()>0.5)?1:0
      });
    }
    cacti.forEach(c=>c.x--);
    while (cacti.length && cacti[0].x<0) cacti.shift();
  } else {
    g.drawString("Game Over!",(128-g.stringWidth("Game Over!"))/2,20);
  }
  g.drawLine(0,60,127,60);
  cacti.forEach(c=>g.drawImage(IMG.cacti[c.img],c.x,60-IMG.cacti[c.img].height));
  // check against actual pixels
  var rexx = rex.x;
  var rexy = 38-rex.y;
  if (rex.alive &&
     (g.getPixel(rexx+0, rexy+13) ||
      g.getPixel(rexx+2, rexy+15) ||
      g.getPixel(rexx+5, rexy+19) ||
      g.getPixel(rexx+10, rexy+19) ||
      g.getPixel(rexx+12, rexy+15) ||
      g.getPixel(rexx+13, rexy+13) ||
      g.getPixel(rexx+15, rexy+11) ||
      g.getPixel(rexx+17, rexy+7) ||
      g.getPixel(rexx+19, rexy+5) ||
      g.getPixel(rexx+19, rexy+1))) {
    return gameStop();
  }
  g.drawImage(IMG.rex[rex.img], rexx, rexy);
  var groundOffset = frame&127;
  g.drawImage(IMG.ground, -groundOffset, 61);
  g.drawImage(IMG.ground, 128-groundOffset, 61);
  g.drawString(rex.score,127-g.stringWidth(rex.score));
  g.flip();
}

gameStart();
