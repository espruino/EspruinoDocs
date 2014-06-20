/* Copyright (c) 2014 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Charlieplexed LED module. Simply connect up an array of Charlieplexed LEDs, and use:

```
var g = exports.connect([pin1,pin2,pin3,...]);
// g is a 'Graphics' object, so you can use normal Graphics functions
g.drawLine(0,0,g.getWidth()-1,g.getHeight()-1);
g.flip();
```
*/

exports.connect = function(pins) {
  var g = Graphics.createArrayBuffer(pins.length,pins.length-1, 1);
  var n = 0;
  g.interval = undefined;
  g.flip = function() {
    // precalculate a list of read/write commands which we'll then execute
    var cmds = "";
    for (var x in pins) {
      var r=[],w=[];
      for (var y=0;y<pins.length-1;y++) {
        var i = y + (y>=x?1:0);
        var n = x+y*pins.length;
        if (g.buffer[n>>3]>>(n&7) & 1)
          w.push(pins[i]);
        else {
          r.push(pins[i]);
        }
      }
      if (w.length>0) {
        w.push(pins[x]);
        if (r.length>0) cmds+="digitalRead(["+r+"]);";
        cmds+="digitalWrite(["+w+"],1)";
      }
    }
    // turn everything off after
    cmds+="digitalRead(["+pins+"])";
    // eval now, to try and reduce flicker
    eval(cmds); 

    // Set an interval to execute the read/write commands as fast as possible
    if (g.interval) clearInterval(g.interval);
    g.interval = setInterval(function() {eval(cmds);}, 1); 
  };
  return g;
};
