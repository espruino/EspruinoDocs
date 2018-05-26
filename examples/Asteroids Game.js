/*<!-- Copyright (c) 2018 Gordon Williams. See the file LICENSE for copying permission. -->
Asteroids Game
==============

* KEYWORDS: Game,Asteroids
* USES: Pixl.js,Graphics

![Asteroids](Asteroids Game.jpg)

This code creates an Asteroids game on [Pixl.js](/Pixl.js):

* The bottom two buttons rotate left and right
* Top left button moves forward
* Top right button fires and/or restarts the game

This can easily be ported to other devices by:

* Making sure `g` is an instance of [[Graphics]]
* Ensuring `BTNL/R/U/A` are set correctly

*/

var W = g.getWidth();
var H = g.getHeight();
var BTNL = BTN4;
var BTNR = BTN3;
var BTNU = BTN1;
var BTNA = BTN2;

g.drawPoly = function(p) {
  g.moveTo(p[p.length-2],p[p.length-1]);
  for (var i=0;i<p.length;i+=2)
    g.lineTo(p[i],p[i+1]);
};

function newAst(x,y) {
  var a = {
    x:x,y:y,
    vx:Math.random()-0.5,
    vy:Math.random()-0.5,
    rad:3+Math.random()*5
  };
  return a;
}

function onInit() {
  clearInterval();
  gameStart();
  setInterval(onFrame, 50);
}

var running = true;
var ship = {};
var ammo = [];
var ast = [];
var score = 0;
var level = 4;
var framesSinceFired = 0;

function gameStop() {
  console.log("Game over");
  running = false;
  g.clear();
  g.drawString("Game Over!",(W-g.stringWidth("Game Over!"))/2,(H-6)/2);
  g.flip();
}

function addAsteroids() {
  for (var i=0;i<level;i++) {
    do {
      var x = Math.random()*W, y = Math.random()*H;
      var dx = x-ship.x, dy = y-ship.y;
      var d = Math.sqrt(dx*dx+dy*dy);
    } while (d<10);
    ast.push(newAst(x,y));
  }
}

function gameStart() {
  ammo = [];
  ast = [];
  score = 0;
  level = 4;
  ship = { x:W/2,y:H/2,r:0,v:0 };
  framesSinceFired = 0;
  addAsteroids();
  running = true;
}


function onFrame() {
  if (!running) {
    if (BTNA.read()) gameStart();
    return;
  }

  if (BTNL.read()) ship.r-=0.1;
  if (BTNR.read()) ship.r+=0.1;
  ship.v *= 0.9;
  if (BTNU.read()) ship.v+=0.2;
  ship.x += Math.cos(ship.r)*ship.v;
  ship.y += Math.sin(ship.r)*ship.v;
  if (ship.x<0) ship.x+=W;
  if (ship.y<0) ship.y+=H;
  if (ship.x>=W) ship.x-=W;
  if (ship.y>=H) ship.y-=H;
  framesSinceFired++;
  if (BTNA.read() && framesSinceFired>4) { // fire!
    framesSinceFired = 0;
    ammo.push({
      x:ship.x+Math.cos(ship.r)*4,
      y:ship.y+Math.sin(ship.r)*4,
      vx:Math.cos(ship.r)*3,
      vy:Math.sin(ship.r)*3,
    });
  }

  g.clear();
  g.drawString(score,0,0);
  var rs = Math.PI*0.8;
  g.drawPoly([
    ship.x+Math.cos(ship.r)*4, ship.y+Math.sin(ship.r)*4,
    ship.x+Math.cos(ship.r+rs)*3, ship.y+Math.sin(ship.r+rs)*3,
    ship.x+Math.cos(ship.r-rs)*3, ship.y+Math.sin(ship.r-rs)*3,
  ]);
  var na = [];
  ammo.forEach(function(a) {
    a.x += a.vx;
    a.y += a.vy;
    g.fillRect(a.x-1, a.y, a.x+1, a.y);
    g.fillRect(a.x, a.y-1, a.x, a.y+1);
    var hit = false;
    ast.forEach(function(b) {
      var dx = a.x-b.x;
      var dy = a.y-b.y;
      var d = Math.sqrt(dx*dx+dy*dy);
      if (d<b.rad) {
        hit=true;
        b.hit=true;
        score++;
      }
    });
    if (!hit && a.x>=0 && a.y>=0 && a.x<W && a.y<H)
      na.push(a);
  });
  ammo=na;
  na = [];
  var crashed = false;
  ast.forEach(function(a) {
    a.x += a.vx;
    a.y += a.vy;
    g.drawCircle(a.x, a.y, a.rad);
    if (a.x<0) a.x+=W;
    if (a.y<0) a.y+=H;
    if (a.x>=W) a.x-=W;
    if (a.y>=H) a.y-=H;
    if (!a.hit) {
      na.push(a);
    } else if (a.rad>4) {
      a.hit = false;
      var vx = 1*(Math.random()-0.5);
      var vy = 1*(Math.random()-0.5);
      a.rad/=2;
      na.push({
        x:a.x,
        y:a.y,
        vx:a.vx-vx,
        vy:a.vy-vy,
        rad:a.rad,
      });
      a.vx += vx;
      a.vy += vy;
      na.push(a);
    }

    var dx = a.x-ship.x;
    var dy = a.y-ship.y;
    var d = Math.sqrt(dx*dx+dy*dy);
    if (d < a.rad) crashed = true;
  });
  ast=na;
  if (!ast.length) {
    level++;
    addAsteroids();
  }
  g.flip();
  if (crashed) gameStop();
}

onInit();
