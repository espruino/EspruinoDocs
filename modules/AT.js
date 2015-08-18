/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* AT command interface library. This provides a callback-based way to send
 * AT commands with timeouts, and also to listen for their responses. It 
 * greatly simplifies the task of writing drivers for ESP8266 or GSM */

/* TODO: something odd about Espruino on linux seems to mean that
 * extra '\n' get inserted */
exports.connect = function (ser) {
  var dbg = false;
  var line = "";  
  var lineCallback;
  var delim = "\r";
  var handlers = {};
  var lineHandlers = {};
  var waiting = [];  

  ser.on("data", function(d) {    
    line += d;
    if (dbg) console.log("] "+JSON.stringify(line)+" <--- "+JSON.stringify(d));
    if (line[0]=="\n") line=line.substr(1);
    if (handlers) {
      // hack - when bug #540 gets fixed we won't need this:
      if (handlers[">"] && line[0]==">")
        line = handlers[">"](line);
      for (var h in handlers) {
        if (line.substr(0,h.length)==h) {
          line = handlers[h](line);
          //console.log("HANDLER] "+JSON.stringify(line));
        }
      }
    }    
    var i = line.indexOf(delim);
    while (i>=0) {
      var l = line.substr(0,i);
      //console.log("]>"+JSON.stringify(l));
      if (l.length>0) {
        var handled = false;
        for (var h in lineHandlers)
          if (l.substr(0,h.length)==h) {
            lineHandlers[h](l);
            handled = true;
          }
        if (!handled) {
          if (lineCallback) { 
            lineCallback(l); 
          }// else console.log(":"+JSON.stringify(l));
        }
      }
      line = line.substr(i+delim.length);
      if (line[0]=="\n") line=line.substr(1);
      if (line.length && handlers) {
        // hack - when bug #540 gets fixed we won't need this:
        if (handlers[">"] && line[0]==">")
          line = handlers[">"](line);
        for (var h in handlers)
          if (line.substr(0,h.length)==h) {
            line = handlers[h](line);
            //console.log("HANDLER] "+JSON.stringify(line));
          }
      }
      i = line.indexOf(delim);
    }
  });
  
  var at = {
    "debug" : function() {
      dbg = true;
      return {
        line:line,
        lineCallback:lineCallback,
        handlers:handlers,
        lineHandlers:lineHandlers,
        waiting:waiting
      };
    },
    /* send command - if timeout is set, we wait for a response. The callback may return 
     * a function if it wants more data. Eg 'return function(d) {};' */
    "cmd" : function(command, timeout, callback) {
      if (lineCallback) {
        waiting.push([command, timeout, callback])
        return;
      }
      if (dbg) console.log("["+JSON.stringify(command));
      ser.write(command);
      if (timeout) {
        var tmr = setTimeout(function() {
          lineCallback = undefined;
          if (callback) callback();
        }, timeout);
        var cb = function(d) {          
          lineCallback = undefined;     
          var n;
          if (callback && (n=callback(d))) {
            // if callback returned a function, keep listening
            // and call it from lineCallback
            lineCallback = cb;
            callback = n;
          } else clearTimeout(tmr);
          if (lineCallback===undefined && waiting.length>0) {
            var w = waiting.shift();
            at.cmd(w[0], w[1], w[2]);
          }
        };
        lineCallback = cb;
      }
    },
    // Just write to the device - nothing else
    "write" : function(command) {
      ser.write(command);
    },
    // send a command, but also register for a certain type of response lines (key)
    "cmdReg" : function(command, timeout, key, keyCallback, finalCallback) {
      at.registerLine(key, keyCallback);
      at.cmd(command, timeout, function(d) {
        at.unregisterLine(key);
        finalCallback(d);
      });
    },
    // register for a certain type of response (as a full line)
    "registerLine" : function(key, callback) {
      if (lineHandlers[key]) throw new Error(key+" already registered");
      lineHandlers[key] = callback;
    },
    // unregister for a certain type of response (as a full line)
    "unregisterLine" : function(key) {
      delete lineHandlers[key];
    },
    // register for a certain type of response (starting with)
    "register" : function(key, callback) {
      if (handlers[key]) throw new Error(key+" already registered");
      handlers[key] = callback;
    },
    // unregister for a certain type of response (starting with)
    "unregister" : function(key) {
      delete handlers[key];
    },    
    "isBusy" : function() { return lineCallback!==undefined; }
  };
  return at;
}
