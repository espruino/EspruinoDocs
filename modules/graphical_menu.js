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
      g.setFontAlign(0,-1);
      if (options.predraw) options.predraw(g);
      if (options.title) {
        g.drawString(options.title,(x+x2)/2,y-options.fontHeight-2);
        g.drawLine(x,y-2,x2,y-2);
      }

      var rows = 0|Math.min((y2-y) / options.fontHeight,menuItems.length);
      var idx = E.clip(options.selected-(rows>>1),0,menuItems.length-rows);
      var iy = y;

      while (rows--) {
        var xo = x;
        if (idx==options.selected) {
          g.fillRect(x,iy,x2,iy+options.fontHeight-1);
          g.setColor(0);
          // if we're editing, inset the line we're editing and display up/down arrows
          if (l.selectEdit) {
            g.drawImage({width:12,height:5,buffer:" \x07\x00\xF9\xF0\x0E\x00@",transparent:0},x,iy);
            xo += 15;
          }
        }
        g.setFontAlign(-1,-1);
        var name = menuItems[idx++];
        g.drawString(name,xo,iy);
        var item = items[name];
        if ("object" == typeof item) {
          g.setFontAlign(1,-1);
          var v = item.value;
          g.drawString(item.format ? item.format(v) : v,x2,iy);
        }
        g.setColor(-1);
        iy += options.fontHeight;
      }
      g.setFontAlign(-1,-1);
      if (options.preflip) options.preflip(g);
      if (g.flip) g.flip();
    },
    select : function(dir) {
      var item = items[menuItems[options.selected]];
      if ("function" == typeof item) item(l);
      else if ("object" == typeof item) {
        // if a number, go into 'edit mode'
        if ("number" == typeof item.value)
          l.selectEdit = l.selectEdit?undefined:item;
        else { // else just toggle bools
          if ("boolean" == typeof item.value) item.value=!item.value;
          if (item.onchange) item.onchange(item.value);
        }
        l.draw();
      }
    },
    move : function(dir) {
      if (l.selectEdit) {
        var item = l.selectEdit;
        item.value += (dir||1)*(item.step||1);
        if (item.min!==undefined && item.value<item.min) item.value = item.min;
        if (item.max!==undefined && item.value>item.max) item.value = item.max;
        if (item.onchange) item.onchange(item.value);
      } else
        options.selected = 0|E.clip(options.selected+dir,0,menuItems.length-1);
      l.draw();
    }
  };
  l.draw();
  return l;
};
