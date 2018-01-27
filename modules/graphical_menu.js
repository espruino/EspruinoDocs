/* Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Simple graphics menu library - http://www.espruino.com/graphical_menu */
exports.list = function(g, items) {
  var options = items[""];
  if (!(options instanceof Object)) options = {};
  if (options.selected === undefined)
    options.selected = 0;
  if (!options.fontHeight)
    options.fontHeight = 6;
  var y = 0|options.y;
  if (options.title)
    y += options.fontHeight+2;

  var menuItems = Object.keys(items).slice(1); // remove first item
 
  var l = {
    draw : function() {
      g.clear();
      g.setColor(-1);
      if (options.title) {
        g.drawString(options.title,(g.getWidth()-g.stringWidth(options.title))/2,y-options.fontHeight-2);
        g.drawLine(0,y-2,g.getWidth(),y-2);
      }

      var rows = 0|Math.min((g.getHeight()-y) / options.fontHeight,menuItems.length);
      var idx = E.clip(options.selected-(rows>>1),0,menuItems.length-rows);
      var iy = y;

      while (rows--) {
        if (idx==options.selected) {
          g.fillRect(0,iy,g.getWidth()-1,iy+options.fontHeight-1);
          g.setColor(0);
        }
        g.drawString(menuItems[idx++],0,iy);
        g.setColor(-1);
        iy += options.fontHeight;
      }
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
