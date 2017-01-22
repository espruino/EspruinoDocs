/* Copyright (c) 2015 Gordon Williams, Tobias Schwalm. See the file LICENSE for copying permission. */
/*
Library for interfacing to the SIM900A. 
Uses the 'NetworkJS' library to provide a JS endpoint for HTTP.

```
Serial1.setup(115200, { rx: B7, tx : B6 });

console.log("Connecting to SIM900 module");
var gprs = require('SIM900').connect(Serial1, B4, function(err) {
  if (err) throw err;
  gprs.connect('APN', 'USERNAME', 'PASSWORD', function(err) {
    if (err) throw err;
    gprs.getIP(function(err, ip) {
      if (err) throw err;
      console.log('IP:' + ip);
      require("http").get("http://www.pur3.co.uk/hello.txt", function(res) {
        console.log("Response: ",res);
        res.on('data', function(d) {
          console.log("--->"+d);
        });
      });
    });
  });
});
```
*/
var at;
var socks = [];
var sockData = ["","","","",""];
var MAXSOCKETS = 5;
var rst;
var busy = false;

function unregisterSocketCallbacks(sckt) {
    at.unregister('>');
    at.unregisterLine(sckt + ', SEND OK');
    at.unregisterLine(sckt + ', SEND FAIL');
}

var netCallbacks = {
  create: function(host, port) {
    /* Create a socket and return its index, host is a string, port is an integer.
    If host isn't defined, create a server socket */  
    if (host===undefined) {
      sckt = MAXSOCKETS;
      socks[sckt] = "Wait";
      sockData[sckt] = "";
      at.cmd("AT+CIPSERVER=1,"+port+"\r\n", 10000, function(d) {
        if (d=="OK") {
          socks[sckt] = true;
        } else {
          socks[sckt] = undefined;
          throw new Error("CIPSERVER failed");
        }
      });
      return MAXSOCKETS;
    } else {
      var sckt = 0;
      while (socks[sckt]!==undefined) sckt++; // find free socket
      if (sckt>=MAXSOCKETS) throw new Error('No free sockets.');
      socks[sckt] = "Wait";
      sockData[sckt] = "";
      at.cmd('AT+CIPSTART='+sckt+',"TCP",'+JSON.stringify(host)+','+port+'\r\n',10000, function(d) {
        if (d=="OK") {
          at.registerLine(sckt + ', CONNECT OK', function() {
            at.unregisterLine(sckt + ', CONNECT OK');
            at.unregisterLine(sckt + ', CONNECT FAIL');  
            socks[sckt] = true;
            return "";
          });
          at.registerLine(sckt + ', CONNECT FAIL', function() {
            at.unregisterLine(sckt + ', CONNECT FAIL');
            at.unregisterLine(sckt + ', CONNECT OK');
            at.unregisterLine(sckt + ', CLOSED');  
            socks[sckt] = undefined;
            return "";
          });
          at.registerLine(sckt + ', CLOSED', function() {
            at.unregisterLine(sckt + ', CLOSED');
            unregisterSocketCallbacks(sckt);
            socks[sckt] = undefined;
            busy = false;
            return "";
          });
        } else {
          socks[sckt] = undefined;
          return "";    
        }
      });
    }
    return sckt; // jshint ignore:line
  },
  /* Close the socket. returns nothing */
  close: function(sckt) {
    if(socks[sckt]) {
      // ,1 = 'fast' close
      at.cmd('AT+CIPCLOSE='+sckt+",1\r\n",1000, function(/*d*/) {   
        socks[sckt] = undefined;
      });
      
    }
  },
  /* Accept the connection on the server socket. Returns socket number or -1 if no connection */
  accept: function(sckt) {
    // console.log("Accept",sckt);
    for (var i=0;i<MAXSOCKETS;i++)
      if (sockData[i] && socks[i]===undefined) {
        //console.log("Socket accept "+i,JSON.stringify(sockData[i]),socks[i]);
        socks[i] = true;
        return i;
      }
    return -1;
  },
  /* Receive data. Returns a string (even if empty).
  If non-string returned, socket is then closed */
  recv: function(sckt, maxLen) {
    if (at.isBusy() || socks[sckt]=="Wait") return "";
    if (sockData[sckt]) {
      var r;
      if (sockData[sckt].length > maxLen) {
        r = sockData[sckt].substr(0,maxLen);
        sockData[sckt] = sockData[sckt].substr(maxLen);
      } else {
        r = sockData[sckt];
        sockData[sckt] = "";
      }
      return r;
    }
    if (!socks[sckt]) return -1; // close it
    return "";
  },
  /* Send data. Returns the number of bytes sent - 0 is ok.
  Less than 0  */
  /* Send data. Returns the number of bytes sent - 0 is ok.
  Less than 0  */
  send: function(sckt, data) {
    if (busy || at.isBusy() || socks[sckt]=="Wait") return 0;
    if (!socks[sckt]) return -1; // error - close it
    busy = true;
    at.register('>', function() {
      at.unregister('>');
      at.write(data);
      return "";
    });
    at.registerLine(sckt + ', SEND OK', function() {
      at.unregisterLine(sckt + ', SEND OK');
      at.unregisterLine(sckt + ', SEND FAIL');
      busy = false;
      return "";
    });
    at.registerLine(sckt + ', SEND FAIL', function() {
      at.unregisterLine(sckt + ', SEND OK');
      at.unregisterLine(sckt + ', SEND FAIL');
      busy = false;
      return -1;
    });  
    at.write('AT+CIPSEND='+sckt+','+data.length+'\r\n');
    return data.length;
  }
};
//Handle +RECEIVE input data from SIM900A
function receiveHandler(line) {
  var colon = line.indexOf(":\r\n");
  if (colon<0) return line; // not enough data here at the moment
  var parms = line.substring(9,colon).split(",");
  parms[1] = 0|parms[1];
  var len = line.length-(colon+3);
  if (len>=parms[1]) {
   // we have everything
   sockData[parms[0]] += line.substr(colon+3,parms[1]);
   return line.substr(colon+parms[1]+3); // return anything else
  } else { 
   // still some to get
   sockData[parms[0]] += line.substr(colon+3,len);
   return "+D,"+parms[0]+","+(parms[1]-len)+":"; // return +D so receiveHandler2 gets called next time    
  }
}
function receiveHandler2(line) {
  var colon = line.indexOf(":");
  if (colon<0) return line; // not enough data here at the moment
  var parms = line.substring(3,colon).split(",");
  parms[1] = 0|parms[1];
  var len = line.length-(colon+1);
  if (len>=parms[1]) {
   // we have everything
   sockData[parms[0]] += line.substr(colon+1,parms[1]);
   return line.substr(colon+parms[1]+1); // return anything else
  } else { 
   // still some to get
   sockData[parms[0]] += line.substr(colon+1,len);
   return "+D,"+parms[0]+","+(parms[1]-len)+":"; // return +D so receiveHandler2 gets called next time    
  }
}
var gprsFuncs = {
  receiveHandler: receiveHandler,
  "debug" : function() {
    return {
      socks:socks,
      sockData:sockData
    };
  },
  // initialise the SIM900A
  "init": function(callback) {
    var s = 0;
    var cb = function(r) {
      switch(s) {
        case 0:
          if(r === 'IIIIATE0' || 
            r === 'IIII' + String.fromCharCode(255) + 'ATE0' || 
            r === 'ATE0') {
            return cb;
          } else if(r === 'OK') {
            s = 1;
            at.cmd('AT+CPIN?\r\n', 1000, cb);
          } else if(r) {
            callback('Error in ATE0: ' + r);
          }
          break;
        case 1:
          if(r === '+CPIN: READY') {
            return cb;
          } else if (r === 'OK') {
            s = 2;
            // check if we're on network
            at.cmd('AT+CGATT=1\r\n', 1000, cb);
          } else if(r) {
            callback('Error in CPIN: ' + r);
          }
          break;
        case 2:
          if(r === 'OK') {
            s = 3;
            at.cmd('AT+CIPSHUT\r\n', 1000, cb);
          } else if(r) {
            callback('Error in CGATT: ' + r);
          }
          break;
        case 3:
          if(r === 'SHUT OK') {
            s = 4;
            at.cmd('AT+CIPSTATUS\r\n', 1000, cb);
          } else if(r) {
            callback('Error in CIPSHUT: ' + r);
          }
          break;
        case 4:
          if(r === 'OK') {
            return cb;
          } else if(r === 'STATE: IP INITIAL') {
            s = 5;
            at.cmd('AT+CIPMUX=1\r\n', 1000, cb);
          }
          else if(r) {
            callback('Error in CIPSTATUS: ' + r);
          }
          break;
        case 5:
          if (r&&r.substr(0,3)=="C: ") {
            return cb;
          } else if(r === 'OK') {
            s = 6;
            at.cmd('AT+CIPHEAD=1\r\n', 1000, cb);
          }  else if(r) {
            callback('Error in CIPMUX: ' + r);
          }
          break;
        case 6:
          if(r === 'OK') {
            return cb;
          } else if(r) {
             callback('Error in CIPHEAD: ' + r);
          } else {
            callback(null);
          }
          break;
      }
    };
    at.cmd("ATE0\r\n",3000,cb);
  },
  "reset": function(callback) {
    if (!rst) return gprsFuncs.init(callback);
    digitalPulse(rst, false, 200);
    setTimeout(function() {
      gprsFuncs.init(callback);
    }, 15000);
  },
  "getVersion": function(callback) {
    at.cmd("AT+GMR\r\n", 1000, function(d) {
      callback(null,d);
    });
  },
  "connect": function(apn, username, password, callback) {
    var s = 0;
    var cb = function(r) {
      switch(s) {
        case 0:
          if(r === 'OK') {
            s = 1;
            at.cmd('AT+CIICR\r\n', 2000, cb);
          } else if(r) {
            callback('Error in ' + s + ': ' + r);
          }
          break;
        case 1:
          if(r === 'OK') {
            return cb;
          }
          else if (r) {
            callback('Error in ' + s + ': ' + r);
          } else {
            callback(null);
          }
          break;
      }
    };
    at.cmd('AT+CSTT="' + apn + '", "' + username + '", "' + password + '"\r\n', 1000, cb);
  },
  "getIP": function(callback) {
    var ip;
    var cb = function(r) {
      if(r && r != 'ERROR' && r != 'OK') {
        ip = r;
        return cb;
      } else if(r === 'ERROR') {
        callback('CIFSR Error');
      } else if(!r) {
        callback(null, ip);
      }
    };
    at.cmd('AT+CIFSR\r\n', 2000, cb);
  }
};
exports.connect = function(usart, resetPin, connectedCallback) {
  rst = resetPin;
  gprsFuncs.at = at = require('AT').connect(usart);
  require("NetworkJS").create(netCallbacks);
  at.register("+RECEIVE", receiveHandler);
  at.register("+D", receiveHandler2);
  gprsFuncs.reset(connectedCallback);
  return gprsFuncs;
};
