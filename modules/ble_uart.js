/* Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
NRF.requestDevice({ filters: [{ namePrefix: 'Puck.js' }] }).then(function(device) {
  return exports.connect(device);
}).then(function(uart) {
  uart.on('data', function(d) { print("Got:"+JSON.stringify(d)); });
  uart.eval('E.getTemperature()').then(function(data) {
    print("Got temperature "+data);
    uart.write("digitalPulse(LED,1,10);\n"); // .then(...)
  }); 
  setTimeout(function() { 
    uart.disconnect(); 
    console.log("Disconnected"); 
  }, 2000);
});
*/
exports.connect = function(device) {
  var gatt, service, rx, tx, rxListener;
  var uart = {
    write : function(text) {
      return new Promise(function sender(resolve, reject) {
        if (text.length) {
          tx.writeValue(text.substr(0,20)).then(function() {
            sender(resolve, reject);
          }).catch(reject);
          text = text.substr(20);
        } else resolve();
      });
    },
    disconnect : function() {
      return gatt.disconnect();
    },
    eval : function(expr) {
      return new Promise(function(resolve,reject) {
        var result = "";
        var timeout;
        function done() {
          var i = result.indexOf("\n");
          if (i>=0) {
            clearTimeout(timeout);
            timeout = undefined;
            rxListener = undefined;
            var r = result.substr(0,i);
            try { resolve(JSON.parse(r)); }
            catch (e) { reject(r); }
            if (result.length>i+1) uart.emit("data",result.substr(i+1));
          }
        }
        timeout = setTimeout(done,5000); // wait 5 seconds
        rxListener = function onData(d) { 
          result+=d;
          if (result.indexOf("\n")>=0) done();
        };
        uart.write("\x03\x10Bluetooth.write(JSON.stringify("+expr+")+'\\n')\n").then(function() {          
        });
      });
    }
  };
  return device.gatt.connect().then(function(g) {
    gatt = g;
    return gatt.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
  }).then(function(s) {
    service = s;
    return service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
  }).then(function(c) {
    tx = c;
    return service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");
  }).then(function(c) {
    rx = c;
    rx.on('characteristicvaluechanged', function(event) {
      var d = E.toString(event.target.value.buffer);
      if (rxListener) rxListener(d);
      else uart.emit("data",d);
    });
    return rx.startNotifications();
  }).then(function() {
    return uart;
  });
};
