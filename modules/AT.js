/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* AT command interface library. This provides a callback-based way to send
 * AT commands with timeouts, and also to listen for their responses. It
 * greatly simplifies the task of writing drivers for ESP8266 or GSM */
exports.connect = function (ser) {
  var dbg = false;
  var line = "";
  var lineCallback;
  var dataCount = 0;
  var dataCallback;
  var handlers = {};
  var lineHandlers = {};
  var waiting = [];

  ser.on("data", function cb(d) {
    // if we need to, send bytes off to callback right away
    if (dataCount) {
      if (line) {
        d=line+d;
        line="";
      }
      if (d.length<=dataCount) {
        dataCount -= d.length;
        dataCallback(d);
        if (dataCount==0) dataCallback=undefined;
        return;
      } else { // we're done
        dataCallback(d.substr(0,dataCount));
        d = d.substr(dataCount);
        dataCount = 0;
        dataCallback=undefined;
      }
    }
    // otherwise process line by line...
    line += d;
    if (dbg) console.log("] "+JSON.stringify(d));
    if (handlers) {
      for (var h in handlers) {
        while (line.substr(0,h.length)==h) {
          var pre = line;
          line = handlers[h](line);
          if (pre==line) return; // handler needs more data
          //if (dbg) console.log("HANDLER] "+JSON.stringify(pre)+"=>"+JSON.stringify(line)+" ("+h+")");
        }
      }
    }
    var i = line.indexOf("\r\n");
    while (i>=0) {
      var l = line.substr(0,i);
      //if (dbg) console.log("]>"+JSON.stringify(l));
      var handled = false;
      if (l.length>0) {
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
      line = line.substr(i+2);
      if (handled&&dataCount) return cb("");
      if (line.length && handlers) {
        for (var h in handlers)
          if (line.substr(0,h.length)==h) {
            line = handlers[h](line);
            //console.log("HANDLER] "+JSON.stringify(line));
          }
      }
      i = line.indexOf("\r\n");
    }
  });

  var at = {
    "debug" : function(en) { // enable with undefined or true, disable with false
      dbg = (en!==false);
      return {
        line:line,
        lineCallback:lineCallback,
        handlers:handlers,
        lineHandlers:lineHandlers,
        waiting:waiting,
        dataCount:dataCount
      };
    },
    /* send command - if timeout is set, we wait for a response. The callback may return
     * a function if it wants more data. Eg 'return function(d) {};' */
    "cmd" : function(command, timeout, callback) {
      if (lineCallback) {
        if (dbg) console.log("Queued "+JSON.stringify(command));
        waiting.push([command, timeout, callback])
        return;
      }
      if (dbg) console.log("["+JSON.stringify(command));
      ser.write(command);
      if (timeout) {
        var tmr = setTimeout(function() {
          lineCallback = undefined;
          if (callback) callback();
          if (lineCallback===undefined && waiting.length>0)
            at.cmd.apply(at,waiting.shift());
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
          if (lineCallback===undefined && waiting.length>0)
            at.cmd.apply(at,waiting.shift());
        };
        lineCallback = cb;
      }
    },
    // Just write to the device - nothing else
    "write" : function(command) {
      //if (dbg) console.log("[W"+JSON.stringify(command),lineCallback?"[BUSY]":"");
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
    // register for a certain type of response (as a full line). If key matches the first few characters...
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
    "isBusy" : function() { return lineCallback!==undefined; },
    // forward the next charCount characters to the callback function
    "getData" : function(charCount, callback) {
      if (dataCount) throw new Error("Already grabbing data");
      dataCount = charCount;
      dataCallback = callback;
    },
  };
  return at;
}
