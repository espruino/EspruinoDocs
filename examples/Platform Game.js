/*<!-- Copyright (c) 2018 Gordon Williams. See the file LICENSE for copying permission. -->
Platform Game
==============

* KEYWORDS: Game,Platform,Platformer,Mario,Super Mario
* USES: Pixl.js,Graphics

![Platform](Platform Game.jpg)

This code creates a Mario-style platform game on [Pixl.js](/Pixl.js):

* The bottom two buttons move left and right
* Top left button jumps

Each image is stored in an array of binary numbers. `1` represents
a solid pixel, `0` represents background.

The level itself is stored in the `LEVEL` variable, and each character
represents a different 'tile':

```
"                                          ",
"                                          ",
"                                          ",
"                                          ",
"   -       ?   #?#?#       T              ",
"  ( )  -                 T |              ",
" (   )( )              T | |              ",
"^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^"
```

This can easily be ported to other devices by:

* Making sure `g` is an instance of [[Graphics]]
* Ensuring `BTNL/R/A` are set correctly

*/

var W = g.getWidth();
var H = g.getHeight();
var BTNL = BTN4;
var BTNR = BTN3;
var BTNA = BTN1;

var TILES = {
  "^":new Uint8Array([
0b11111111, // ^
0b10101010,
0b01000100,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000]).buffer,
  "-":new Uint8Array([
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00111100,
0b01000010,
0b10000001]).buffer,
  "(":new Uint8Array([
0b00000001,
0b00000010,
0b00000100,
0b00001000,
0b00010000,
0b00100000,
0b01000000,
0b10000000]).buffer,
  ")":new Uint8Array([
0b10000000,
0b01000000,
0b00100000,
0b00010000,
0b00001000,
0b00000100,
0b00000010,
0b00000001]).buffer,
  "#":new Uint8Array([
0b11111111,
0b11000011,
0b10100101,
0b10011001,
0b10011001,
0b10100101,
0b11000011,
0b11111111]).buffer,
  "?":new Uint8Array([
0b11111111,
0b10000001,
0b10111001,
0b10001001,
0b10000001,
0b10010001,
0b10000001,
0b11111111]).buffer,
  "T":new Uint8Array([
0b11111111,
0b10000001,
0b11111111,
0b01000010,
0b01010010,
0b01000010,
0b01010010,
0b01000010]).buffer,
  "|":new Uint8Array([
0b01010010,
0b01000010,
0b01010010,
0b01000010,
0b01010010,
0b01000010,
0b01010010,
0b01000010]).buffer,
  PR:new Uint8Array([ // player facing right
0b00111000,
0b01111110,
0b01001000,
0b01111000,
0b01111000,
0b01111000,
0b01001000,
0b01000100]).buffer,
  PL:new Uint8Array([ // player facing left
0b00111000,
0b01111110,
0b01001000,
0b01111000,
0b01111000,
0b01111000,
0b01001000,
0b01000100]).buffer,
  COIN:new Uint8Array([ // coin
0b00000000,
0b00011000,
0b00111100,
0b01111010,
0b01110010,
0b00111100,
0b00011000,
0b00000000]).buffer,
};

var LEVEL = [
"                                          ",
"                                          ",
"                                          ",
"                                          ",
"   -       ?   #?#?#       T              ",
"  ( )  -                 T |              ",
" (   )( )              T | |              ",
"^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^"
];
var LEVELWIDTH = LEVEL[0].length*8;
var GROUNDTILES = "^T?#";
var SOLIDTILES = "^|T?#";

// the background image used for fast refreshes
var BACKGROUND = new Uint8Array(g.buffer.length);

var player = {};
var particles = [];
var screenOffset;

function drawTile(t,x,y) {
  if (t in TILES)
    g.drawImage({width:8,height:8,bpp:1,buffer:TILES[t]}, x, y);
}

function drawVertical(slice, x) {
  // don't bother drawing top 2
  drawTile(LEVEL[2][slice], x, 16);
  drawTile(LEVEL[3][slice], x, 24);
  drawTile(LEVEL[4][slice], x, 32);
  drawTile(LEVEL[5][slice], x, 40);
  drawTile(LEVEL[6][slice], x, 48);
  drawTile(LEVEL[7][slice], x, 56);
}
function drawScreen(offset) {
  g.clear();
  for (var x=0;x<16;x++) {
    drawVertical(x+offset, x*8);
  }
  BACKGROUND.set(g.buffer);
}

function gameStart() {
  drawScreen(0);
  player = {
    score : 0,
    x : 0,
    y : 0,
    vy : 0,
    dir : 1,
  };
  particles = [];
  screenOffset = 0;
  setInterval(onFrame, 50);
}

function onFrame() {
  if (BTNL.read()) {
    player.dir=-1;
    player.x--;
  }
  if (BTNR.read()) {
    player.dir=1;
    player.x++;
  }
  if (BTNA.read() && player.vy>0) {
    player.vy = -2;
  }
  if (player.x<screenOffset+16) {
    if (screenOffset>0) {
      screenOffset-=8;
      drawScreen(screenOffset>>3);
    } else if (player.x<0) player.x = 0;
  }
  if (player.x>screenOffset+W-8) {
    if (screenOffset<LEVELWIDTH-W) {
      screenOffset+=8;
      drawScreen(screenOffset>>3);
    } else if (player.x>LEVELWIDTH-8) player.x = LEVELWIDTH-8;
  }
  player.vy+=0.1;
  if (player.vy>1) player.vy=1;
  player.y += player.vy;
  if (player.y<0) player.y=0;
  if (player.y>=H) player.y=H-1;
  var px = (player.x+4)>>3;
  // check for jumping up
  if (player.vy<0 && SOLIDTILES.indexOf(LEVEL[(player.y)>>3][px])>=0) {
    if (LEVEL[(player.y)>>3][px]=="?") {
      player.score++;
      particles.push({tile:"COIN",life:8,x:px*8,y:(player.y&~7)-8,vy:-1});
    }
    player.y = (player.y+8)&~7;
    player.vy = 0;
  } else {
    // check for left into solid block
    if (SOLIDTILES.indexOf(LEVEL[(player.y)>>3][player.x>>3])>=0) {
      player.x=(player.x+8)&~7;
    }
    // check for right into solid block
    if (SOLIDTILES.indexOf(LEVEL[(player.y)>>3][(player.x+8)>>3])>=0) {
      player.x=(player.x)&~7;
    }
  }
  // check for ground
  if (player.vy>0 && GROUNDTILES.indexOf(LEVEL[(player.y+7)>>3][px])>=0) {
    player.y = (player.y-1)&~7;
    player.vy = 0;
  }

  // refresh background
  new Uint8Array(g.buffer).set(BACKGROUND.buffer);
  // draw particles
  for (var i=0;i<particles.length;i++) {
    var p = particles[i];
    p.y+=p.vy;
    drawTile(p.tile,p.x-screenOffset,p.y);
    if (p.life-- <= 0) {
      particles.splice(i,1);
      i--;
    }
  }
  // draw player
  drawTile((player.dir>0)?"PR":"PL",player.x-screenOffset,player.y);
  g.drawString(player.score,0,0);
  g.flip();
}

gameStart();
