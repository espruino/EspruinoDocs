/* Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
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
  var cBg = options.cB||0; // background col
  var cFg = options.cF; // foreground col
  if (cFg===undefined) cFg=-1;
  var cHighlightBg = options.cHB;
  if (cHighlightBg===undefined) cHighlightBg=-1;
  var cHighlightFg = options.cHF||0;


  var l = {
    draw : function() {
      g.setColor(cFg);
      if (options.predraw) options.predraw(g);
      g.setFontAlign(0,-1);
      if (options.title) {
        g.drawString(options.title,(x+x2)/2,y-options.fontHeight-2);
        g.drawLine(x,y-2,x2,y-2);
      }

      var rows = 0|Math.min((y2-y) / options.fontHeight,menuItems.length);
      var idx = E.clip(options.selected-(rows>>1),0,menuItems.length-rows);
      var iy = y;
      var less = idx>0;
      while (rows--) {
        var name = menuItems[idx];
        var item = items[name];
        var hl = (idx==options.selected && !l.selectEdit);
        g.setColor(hl ? cHighlightBg : cBg);
        g.fillRect(x,iy,x2,iy+options.fontHeight-1);
        g.setColor(hl ? cHighlightFg : cFg);
        g.setFontAlign(-1,-1);
        g.drawString(name,x,iy);
        if ("object" == typeof item) {
          var xo = x2;
          var v = item.value;
          if (item.format) v=item.format(v);
          if (l.selectEdit && idx==options.selected) {
            var s = (options.fontHeight>10)?2:1;
            xo -= 12*s + 1;
            g.setColor(cHighlightBg);
            g.fillRect(xo-(g.stringWidth(v)+4),iy,x2,iy+options.fontHeight-1);
            g.setColor(cHighlightFg);
            g.drawImage({width:12,height:5,buffer:" \x07\x00\xF9\xF0\x0E\x00@",transparent:0},xo,iy+(options.fontHeight-5*s)/2,{scale:s});
          }
          g.setFontAlign(1,-1);
          g.drawString(v,xo-2,iy);
        }
        g.setColor(cFg);
        iy += options.fontHeight;
        idx++;
      }
      g.setFontAlign(-1,-1);
      if (options.preflip) options.preflip(g,less,idx<menuItems.length);
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
        item.value -= (dir||1)*(item.step||1);
        if (item.min!==undefined && item.value<item.min) item.value = item.min;
        if (item.max!==undefined && item.value>item.max) item.value = item.max;
        if (item.onchange) item.onchange(item.value);
      } else {
        options.selected = (dir+options.selected)%menuItems.length;
        if (options.selected<0) options.selected += menuItems.length;
      }
      l.draw();
    }
  };
  l.draw();
  return l;
};
