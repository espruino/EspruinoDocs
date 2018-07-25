/* Copyright (c) 2018 Gordon Williams See the file LICENSE for copying permission. */
/* Interface for the Bluefruit LE app */

exports.connect = function() {
  var fruit = {
    listener : function(d) {
      if (d=="\x03") {
        // probably a Ctrl-C sent by the IDE - move the console back
        Bluetooth.setConsole();
        return;
      }

      if (d[0]=="!") {
        var v = new DataView(E.toArrayBuffer(d));
        switch (d[1]) {
        case "B": fruit.emit("button",{button:0|d[2],state:0|d[3]}); break;
        case "C": fruit.emit("color",{r:d.charCodeAt(2),g:d.charCodeAt(3),b:d.charCodeAt(4)}); break;
        case "Q": fruit.emit("quaternion",{x:v.getFloat32(2,1),y:v.getFloat32(6,1),z:v.getFloat32(10,1),w:v.getFloat32(14,1)}); break;
        case "A": fruit.emit("acc",{x:v.getFloat32(2,1),y:v.getFloat32(6,1),z:v.getFloat32(10,1)}); break;
        case "G": fruit.emit("gyro",{x:v.getFloat32(2,1),y:v.getFloat32(6,1),z:v.getFloat32(10,1)}); break;
        case "M": fruit.emit("mag",{x:v.getFloat32(2,1),y:v.getFloat32(6,1),z:v.getFloat32(10,1)}); break;
        case "L": fruit.emit("location",{lat:v.getFloat32(2,1),long:v.getFloat32(6,1),alt:v.getFloat32(10,1)}); break;
        }
      }
    }
  };
  // when a device first connects, move the REPL out the way
  NRF.on('connect', function(addr) {
    LoopbackA.setConsole();
  });
  // Handle data from Bluetooth
  Bluetooth.on('data', fruit.listener);
  return fruit;
}
