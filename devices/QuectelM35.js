var at;
var socks = [];
var sockData = ["","","","","",""];
var MAXSOCKETS = 6;
var rst;
var busy = false;

function dbg() {} // don't print anything by default. gprs.debug() enables it

var netCallbacks = {
  create: function(host, port) {
    var sckt = 0;
    function connect(host) {
        at.cmd(`AT+QIOPEN=${sckt},"TCP",${JSON.stringify(host)},${port}\r\n`,10000, function(d) {
          if (d=="OK") {
            // all good - wait for a `0, CONNECT OK` type of event (see socketHandler)
          } else {
            socks[sckt] = undefined;
            busy = false;
          }
        });
      }
    if (host===undefined) { // server socket
      // need QILPORT, QISERVER
      dbg("Server not implemented");
      return -1;
    } else { // client socket
      while (socks[sckt]!==undefined) sckt++; // find free socket
      if (sckt>=MAXSOCKETS) throw new Error('No free sockets.');
      socks[sckt] = "Wait";
      sockData[sckt] = "";
      busy = true;
      /* Seems the docs are wrong - we can't use a host name in QIOPEN, so
      we must manually look up any non-IPs first */
      if (host.match(/\d+.\d+.\d+.\d+/)) {
        connect(host);
      } else {
         dbg("Lookup host "+host);
         at.cmd(`AT+QIDNSGIP=${JSON.stringify(host)}\r\n`,10000,function cb(d) {
          if (d=="OK") return function(d) { connect(d); };
          socks[sckt] = undefined;
          busy=false;
          dbg("Host not found");
        });
      }
    }
    return sckt; // jshint ignore:line
  },
  /* Close the socket. returns nothing */
  close: function(sckt) {
    if(socks[sckt]) {
      // ,1 = 'fast' close
      at.cmd(`AT+QICLOSE=${sckt}\r\n`,1000,function(/*d*/) {
        socks[sckt] = undefined;
      });
    }
  },
  /* Accept the connection on the server socket. Returns socket number or -1 if no connection */
  accept: function(sckt) {
    // No server
    return -1;
  },
  /* Receive data. Returns a string (even if empty).
  If non-string returned, socket is then closed */
  recv: function(sckt, maxLen) {
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
    at.write(`AT+QISEND=${sckt},${data.length}\r\n`);
    setTimeout(function() {
      at.write(data);
      // now wait for a SEND OK, SEND FAIL (see socketHandler)
    }, 1000);
    return data.length;
  }
};

//Handle +RECEIVE input data
function receiveHandler(line) {
  var parms = line.substring(10).split(",");
  dbg(parms);
  at.getData(0|parms[1], function(data) { sockData[0|parms[0]] += data; });
}
function socketHandler(line) {
  dbg(line);
  var sckt = line[0];
  line = line.substr(3);
  if (line=="CONNECT OK") {
    socks[sckt] = true;
  } else  if (line=="CONNECT FAIL") {
    socks[sckt] = undefined;
  } else if (line=="CLOSED") {
    socks[sckt] = undefined;
  } else if (line=="SEND OK") {
    // all good!
  } else if (line=="SEND FAIL") {
    // send fail - close socket
    socks[sckt] = undefined;
  }
  busy = false;
  return "";
}

function atcmd(cmd,timeout) {
  return new Promise(function(resolve,reject) {
    var data = "";
    at.cmd(cmd+"\r\n",timeout||1000,function cb(d) {
      if (d===undefined || d=="ERROR") reject(cmd+": "+d?d:"TIMEOUT");
      else if (d=="OK") resolve(data);
      else { data+=(data?"\n":"")+d; return cb; }
    });
  });
}

var gprsFuncs = {
  "debug" : function(on) {
    if (on || on===undefined) dbg = function(t){print("[M35]",t);}
    else dbg = function(){};
    return {
      socks:socks,
      sockData:sockData
    };
  },
  "getVersion": function(callback) {
    atcmd("AT+GMR").then(function(v){callback(null,v);}).
    catch(function(err){callback(err);});
  },
  "getIP": function(callback) {
    at.cmd('AT+QILOCIP\r\n', 1000, function(d) {
      if (d=="ERROR") callback(d);
      else callback(null,d);
    });
  }
};

exports.connect = function(usart, options, callback) {
  options = options || {};
  usart.removeAllListeners();
  gprsFuncs.at = at = require('AT').connect(usart);
  // at.debug();
  require("NetworkJS").create(netCallbacks);
  at.registerLine("+RECEIVE", receiveHandler);
  for (var i=0;i<MAXSOCKETS;i++)
    at.registerLine(i+", ", socketHandler);
  at.registerLine("+CME ERROR", function(e) {
    console.log(e);
  });

  atcmd("ATE0").then(function() { // echo off
    return atcmd("AT+CREG?"); // Check GSM registered
  }).then(function(d) {
    var n = d.split(",")[1]; // 1=connected, 5=connected, roaming
    if (n!=1 && n!=5) throw new Error("GSM not registered, "+d);
    dbg("Forcing GPRS connect");
    return atcmd("AT+CGATT=1",10000); // attach to GPRS service
  }).then(function() {
    return atcmd("AT+CGREG?"); // Check GPRS registered
  }).then(function(d) {
    var n = d.split(",")[1]; // 1=connected, 2=connecting, 5=connected, roaming
    if (n==2) throw new Error("GPRS still connecting, "+d);
    if (n!=1 && n!=5) throw new Error("GPRS not registered, "+d);
    return atcmd("AT+COPS?"); // Operator
  }).then(function(d) {
    var op = d.split(",")[2];
    if (!op) throw new Error("No Operator, "+d);
    dbg("Operator "+op);
    return atcmd("AT+QIMUX=1"); // Multiple connections
  }).then(function() {
    return atcmd("AT+QIPROMPT=0"); // No send prompt of '>'
  }).then(function() {
    if (callback) callback(null);
  }).catch(function(e) {
    if (callback) callback(e);
  });
  return gprsFuncs;
};
