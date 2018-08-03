/* Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Simple graph library - http://www.espruino.com/graph */
exports.drawAxes = function(g, data, options) {
  var px = options.padx||0;
  var py = options.pady||0;
  var minx = -px;
  var maxx = data.length+px-1;
  var miny = ((options.miny!==undefined) ? options.miny :
    options.miny=data.reduce((a,b)=>Math.min(a,b), data[0]))-py;
  var maxy = ((options.maxy!==undefined) ? options.maxy :
    options.maxy=data.reduce((a,b)=>Math.max(a,b), data[0]))+py;
  if (options.gridy) {
    var gy = options.gridy;
    miny = gy*Math.floor(miny/gy);
    maxy = gy*Math.ceil(maxy/gy);
  }
  var ox = options.x||0;
  var oy = options.y||0;
  var ow = options.width||(g.getWidth()-(ox+1));
  var oh = options.height||(g.getHeight()-(oy+1));
  // work out spacing
  var o = 6; // size of axes
  if (options.axes) {
    if (options.ylabel!==null) {
      ox += o; ow -= o;
    }
    if (options.xlabel!==null) oh -= o;
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
  var dx = maxx-minx;
  var dy = maxy-miny;
  if (!dy) dy=1;
  function getx(x) { return ox+ow*(x-minx)/dx; }
  function gety(y) { return oy+oh-oh*(y-miny)/dy; }
  // Draw grid pips and labels
  if (options.gridx) {
    g.setFontAlign(0,-1,0); // top align, centered
    var gx = options.gridx;
    for (var i=Math.ceil((minx+px)/gx)*gx;i<=maxx-px;i+=gx) {
      var x = getx(i);
      var t = options.xlabel?options.xlabel(i):i;
      g.setPixel(x, oy+oh-1);
      var w = g.stringWidth(t)/2;
      if (options.xlabel!==null && x>w && g.getWidth()>x+w)
        g.drawString(t, x, oy+oh+2);
    }
  }
  if (options.gridy) {
    g.setFontAlign(0,0,1); // rotate 90
    for (var i=miny;i<=maxy;i+=options.gridy) {
      var y = gety(i);
      var t = options.ylabel?options.ylabel(i):i;
      g.setPixel(ox+1, y);
      var w = g.stringWidth(t)/2;
      if (options.ylabel!==null && y>w && g.getHeight()>y+w) // does it fit?
        g.drawString(t, ox-5, y+1);
    }
  }
  // back to defaults
  g.setFontAlign(-1,-1,0);
  // return info that can be used for plotting extra info
  return {
    x:ox,y:oy,w:ow,h:oh,getx:getx,gety:gety
  };
};

exports.drawLine = function(g, data, options) {
  options = options||{};
  var o = exports.drawAxes(g,data,options);
  // Draw actual data
  var first = true;
  for (var i in data) {
    if (first) g.moveTo(o.getx(i), o.gety(data[i]));
    else g.lineTo(o.getx(i), o.gety(data[i]));
    first = false;
  }
  // return info that can be used for plotting extra things on the chart
  return o;
};

exports.drawBar = function(g, data, options) {
  options = options||{};
  options.padx = 1; // for 0.5-wide bars
  var o = exports.drawAxes(g,data,options);
  // Draw actual data
  for (var i in data) {
    g.fillRect(
      o.getx(i-0.5)+1, o.gety(data[i]),
      o.getx(i+0.5)-1, o.gety(0));
  }
  // return info that can be used for plotting extra things on the chart
  return o;
};
