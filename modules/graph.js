/* Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Simple graph library - http://www.espruino.com/graph */
exports.drawLine = function(g, data, options) {
  options = options||{};
  var miny = (options.miny!==undefined) ? options.miny :
    options.miny=data.reduce((a,b)=>Math.min(a,b), data[0]);
  var maxy = (options.maxy!==undefined) ? options.maxy :
    options.maxy=data.reduce((a,b)=>Math.max(a,b), data[0]);
  if (options.gridy) {
    var gy = options.gridy;
    miny = gy*Math.floor(miny/gy);
    maxy = gy*Math.ceil(maxy/gy);
  }
  var ox = options.x||0;
  var oy = options.y||0;
  var ow = options.width||g.getWidth();
  var oh = options.height||g.getHeight();
  // work out spacing
  var o = 6; // size of axes
  if (options.axes) {
    ox += o;
    ow -= o;
    oh -= o;
  }
  if (options.title) {
    oy+=o; // leave room for title
    oh-=o;
  }
  // draw axes and title
  if (options.axes) {
    g.drawLine(ox,oy,ox,oy+oh/*+o*/);
    g.drawLine(ox/*-o*/,oy+oh,ox+ow,oy+oh);
  }
  if (options.title) {
    g.setFontAlign(0,-1);
    g.drawString(options.title, ox+ow/2, oy-o);
  }
  var dx = (data.length>1)?(data.length-1):1;
  var dy = maxy-miny;
  function getx(x) { return ox+ow*x/dx; }
  function gety(y) { return oy+oh*(maxy-y)/dy; }
  // Draw grid pips and labels
  if (options.gridy) {
    g.setFontAlign(0,0,1); // rotate 90
    for (var i=miny;i<=maxy;i+=options.gridy) {
      var y = gety(i);
      var t = options.ylabel?options.ylabel(i):i;
      g.drawLine(ox-1, y, ox+1, y);
      if (y>g.stringWidth(t)/2) // does it fit?
        g.drawString(t, ox-5, y+2);
    }
  }
  // Draw actual data
  var first = true;
  for (var i in data) {
    if (first) g.moveTo(getx(0), gety(data[0]));
    else g.lineTo(getx(i), gety(data[i]));
    first = false;
  }
  // back to defaults
  g.setFontAlign(0,0,0);
  // return info that can be used for plotting extra info
  return {
    x:ox,y:oy,w:ow,h:oh,getx:getx,gety:gety
  };
}
