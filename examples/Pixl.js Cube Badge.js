/*<!-- Copyright (c) 2018 Gordon Williams. See the file LICENSE for copying permission. -->
Pixl.js Conference Badge - Rotating Cube
========================================

* KEYWORDS: Badge,Name Badge,Cube,3D,Conference,Display
* USES: Pixl.js,Graphics

![Pixl.js Cube Badge](Pixl.js Cube Badge.jpg)

This example turns [Pixl.js](/Pixl.js) into a name badge that
displays `Your Name` and `Espruino`, with a rotating cube to
the right of them.

Just change the text to whatever you want, upload to
Pixl.js and you'll have an animated name badge. You could
also modify the coordinates used in order to draw some
other 3D shape.

With this animation running you should still be able to get
over a day's worth of battery life with a CR2032.

*/

// The background image (which we pre-render)
var background;
// rotation
var rx = 0, ry = 0;

// pre-render the background image
function createBackground() {
  require("Font8x16").add(Graphics);
  g.clear();
  g.setFont8x16();
  g.drawString("Your",0,5);
  g.drawString("Name",0,22);
  g.drawString("-- Espruino --",0,48);
  g.setFontBitmap();
  background = new Uint8Array(g.buffer.length);
  background.set(new Uint8Array(g.buffer));
}

// Draw the cube at rotation rx and ry
function draw() {
  // precalculate sin&cos for rotations
  var rcx=Math.cos(rx), rsx=Math.sin(rx);
  var rcy=Math.cos(ry), rsy=Math.sin(ry);
  // Project 3D into 2D
  function p(x,y,z) {
    var t;
    t = x*rcy + z*rsy;
    z = z*rcy - x*rsy;
    x=t;
    t = y*rcx + z*rsx;
    z = z*rcx - y*rsx;
    y=t;
    z += 4;
    return [100 + 40*x/z, 32 + 32*y/z];
  }

  var a,b;
  // -z
  a = p(-1,-1,-1);
  b = p(1,-1,-1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  a = p(1,1,-1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  b = p(-1,1,-1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  a = p(-1,-1,-1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  // z
  a = p(-1,-1,1);
  b = p(1,-1,1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  a = p(1,1,1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  b = p(-1,1,1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  a = p(-1,-1,1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  // edges
  a = p(-1,-1,-1);
  b = p(-1,-1,1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  a = p(1,-1,-1);
  b = p(1,-1,1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  a = p(1,1,-1);
  b = p(1,1,1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  a = p(-1,1,-1);
  b = p(-1,1,1);
  g.drawLine(a[0],a[1],b[0],b[1]);
}

function step() {
  // reset the contents of the graphics to
  // our pre-rendered name
  new Uint8Array(g.buffer).set(background);
  // change rotation
  rx += 0.1;
  ry += 0.1;
  draw();
  // update the whole display
  g.flip(true);
}

// pre-render the background image
createBackground();
// Start animation at 5fps (for reasonable battery life!)
setInterval(step,200);
