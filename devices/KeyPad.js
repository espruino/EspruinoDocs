/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Module for connecting to a simple matrix keypad. Supply two arrays, one of wires connected to columns,
one of wires connected to rows.

If a third argument (a callback function) is supplied, watches will be set up, and the callback
will be called automatically as soon as a button is pressed. If it isn't, it's up to the user to
use ```keypad.read()``` to find out what key is pressed. -1 will be returned if no key is pressed.

```
require("KeyPad").connect([B2,B3,B4,B5],[B6,B7,B8,B9], function(e) {
  print("123A456B789C*0#D"[e]);
});
```

or

```
var keypad = require("KeyPad").connect([B2,B3,B4,B5],[B6,B7,B8,B9]);
print("123A456B789C*0#D"[keypad.read()]);
```

*/

exports.connect = function (columns, rows, callback) {
  var watches = [];
  var lastState = 0;
  var readState = function() {
    var press = -1;
    for (var i in rows) {
      digitalWrite(rows, 1 << i);
      var v = digitalRead(columns);
      for (var j in columns)
        if (v & (1<<j))
          press = j+i*columns.length;
    }
    // reset state
    digitalWrite(rows, 0xFFFFFFFF);
    return press;
  };
  var setup = function() {
    for (var i in columns) pinMode(columns[i], "input_pulldown");
    digitalWrite(rows, 0xFFFFFFFF);
  };
  var onWatch = function() {
    var s = digitalRead(columns);
    if (s!=lastState) {
      lastState = s;
      removeWatches();
      var c = readState();
      addWatches();
      if (c>=0) callback(c);
    }
  };
  var addWatches = function() {
    for (var i in columns)
      watches[i] = setWatch(onWatch, columns[i], { repeat:true, edge:"both" });
  };
  var removeWatches = function() {
    for (var i in watches)
      clearWatch(watches[i]);
  };
  setup();
  if (callback!==undefined) addWatches();
  return {
    read: readState
  };
};
