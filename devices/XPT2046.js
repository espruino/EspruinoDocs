/* Copyright (c) 2019 allObjects - See the file LICENSE for copying permission. */
exports = // XPT2046 module
{ rate: 50 // default scan rate when touched
, calc: function(xRaw, yRaw, data, module) {  // default x / y
      return [xRaw, yRaw, data, module];      // ...calculation...
    }                                         // ... (pass thru)
, lstn: false // is listening to touch and untouch (calling back)
, listen:  function(lstn) {
    this.lstn = ((lstn === undefined) || lstn);
    return this;
  }
, connect: function(spi, cs, irq, callback, calc, rate) {
    // overwrite default 'calculation' (pass thru raw values)
    if (calc) { this.calc = calc; }
    // overwrite default scan 'rate' (50) in milliseconds
    if (rate) { this.rate = rate; }
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
      }.bind(this), this.rate);
    }.bind(this);
    setWatch(watchFunction, irq
        , { repeat : false, edge: "falling" });
    return this;
  }
};
