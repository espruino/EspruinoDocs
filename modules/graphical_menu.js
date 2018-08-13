/* Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Simple graphics menu library - http://www.espruino.com/graphical_menu */
exports.list = function(g, items) {
  var options = items[""];
  var menuItems = Object.keys(items);
  if (options) menuItems.splice(menuItems.indexOf(""),1);
  if (!(options instanceof Object)) options = {};
  if (options.selected === undefined)
    options.selected = 0;
  if (!options.fontHeight)
    options.fontHeight = 6;
  var x = 0|options.x;
  var x2 = options.x2||(g.getWidth()-1);
  var y = 0|options.y;
  var y2 = options.y2||(g.getHeight()-1);
  if (options.title)
    y += options.fontHeight+2;


  var l = {
    draw : function() {
      g.clear();
      g.setColor(-1);
      if (options.predraw) options.predraw(g);
      if (options.title) {
        g.drawString(options.title,x+(x2-x-g.stringWidth(options.title))/2,y-options.fontHeight-2);
        g.drawLine(x,y-2,x2,y-2);
      }

      var rows = 0|Math.min((y2-y) / options.fontHeight,menuItems.length);
      var idx = E.clip(options.selected-(rows>>1),0,menuItems.length-rows);
      var iy = y;

      while (rows--) {
        if (idx==options.selected) {
          g.fillRect(x,iy,x2,iy+options.fontHeight-1);
          g.setColor(0);
        }
        g.drawString(menuItems[idx++],x,iy);
        g.setColor(-1);
        iy += options.fontHeight;
      }
      if (options.preflip) options.preflip(g);
      if (g.flip) g.flip();
    },
    select : function() {
      var item = items[menuItems[options.selected]];
      if ("function" == typeof item)
        item();
    },
    move : function(dir) {
      options.selected = 0|Math.clip(options.selected+dir,0,menuItems.length-1);
      l.draw();
    }
  };
  l.draw();
  return l;
};
