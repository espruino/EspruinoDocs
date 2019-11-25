/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. and 2016 muet.com See the file LICENSE for copying permission. */
/*

----- XPT2046 ------------------------- 77 vars, 85 with calibrated calculation.

Module for connecting to the XPT2046 resistive touchscreen controller (pin and funcgtion compatible to ADS7843).

The callback function has four arguments (X, Y, readData and module). When you move your finger on the touchscreen the X and Y coordinates are reported back, and when you lift your finger, the callback function is called once with X and Y and readData set to undefined.

Connect expects a calculation function that converts raw x and raw y to x and y. Calculation formula is rawValue / rawValuePerPixel + offset for x and y. Calculation arguments are rawX, rawY, readData and module. Calculation returns x, y, readData and module.


Usage

Landscape format:

```
SPI2.setup({sck:B13, miso:B14, mosi:B15, baud: 2000000});
var touch = require("XPT2046").connect(
  SPI2, B10, B1, function(x, y){
      if (x !== undefined) {
        console.log( x + " @ " + y);
      }
    }, function(yR, xR, d, m) { // portrait 240 x 320
        return [ //rawVal / valPerPx * offset
            Math.round(xR / -121.44  + 259.707) 
          , Math.round(yR /   88.904 + -19.781)
          , d, m
          ];
    }).listen();
```

Creates this output when swiping diagonally from top/left to
bottom/right on a 240 x 320 portrait display w/ touch screen:

```
24 @ 30
45 @ 64
66 @ 108
100 @ 153
139 @ 203
171 @ 262
208 @ 308
```

Landscape format:

```
      ...  
      }, function(xR, yR, d, m) { // landscape 320 x 240
          return [ //rawVal / valPerPx + offset
              Math.round(xR /  -88.904 +  339.781)
            , Math.round(yR / -121.44  +  259.707) 
      ...
```

 */

exports = // XPT2046 module - 
{ poll: 50 // default poll interval when touched in milliseconds
, calc: function(xRaw, yRaw, data, module) {  // default x / y
      return [xRaw, yRaw, data, module];      // ...calculation...
    }                                         // ... (pass thru)
, lstn: false // is listening to touch and untouch (calling back)
, listen:  function(lstn) {
    this.lstn = ((lstn === undefined) || lstn);
    return this;
  }
, connect: function(spi, cs, irq, callback, calc, poll) {
    // overwrite default 'calculation' (pass thru raw values)
    if (calc) { this.calc = calc; }
    // overwrite default poll interval (50) in milliseconds
    if (poll) { this.poll = poll; }
    // wake the controller up
    spi.send([0x90,0],cs);
    // look for a press
    var watchFunction = function() {
      var interval = setInterval(function () {
        if (!digitalRead(irq)) { // touch down
          var data = spi.send([0x90,0,0xD0,0,0], cs);
          if (this.lstn) {
            callback.apply(
                undefined
              , this.calc(
                    data[1]*256+data[2], data[3]*256+data[4]
                  , data
                  , this
                  )
              );
          }
        } else { // 'untouch'
          clearInterval(interval);
          interval = undefined;
          if (this.lstn) {
            callback(undefined, undefined, undefined, this);
          }
          setWatch(watchFunction, irq
              , { repeat : false, edge: "falling" });
        }
      }.bind(this), this.poll); // poll interval on touch
    }.bind(this);
    setWatch(watchFunction, irq
        , { repeat : false, edge: "falling" });
    return this;
  }
};
