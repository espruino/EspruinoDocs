var at;
var socks = [];
var sockData = ["","","","","",""];
var MAXSOCKETS = 6; // this could be 12
var rst;
var busy = false;

function dbg() {} // don't print anything by default. gprs.debug() enables it

var netCallbacks = {
  create: function(host, port) {
    var sckt = 0;
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
      at.cmd(`AT+QIOPEN=1,${sckt},"TCP",${JSON.stringify(host)},${port},0,1\r\n`,10000, function(d) {
        if (d=="OK") {
          // all good - wait for a +QIOPEN message
        } else {
          socks[sckt] = undefined;
          busy = false;
        }
      });
    }
    return sckt; // jshint ignore:line
  },
  /* Close the socket. returns nothing */
  close: function(sckt) {
    if(socks[sckt]!==undefined) {
      sockData[sckt]=""; // clear socket data
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
      at.cmd(data,2000,function cb(d) {
        dbg("AT+QISEND response "+JSON.stringify(d));
        if (d=="> ") return cb;
        if (d=="SEND OK") busy = false;
        if (d=="SEND FAIL") socks[sckt] = null; // force socket close
      });
      // now wait for a SEND OK or SEND FAIL
    }, 500);
    return data.length;
  }
};

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
    if (on || on===undefined) dbg = function(t){print("[BG96]",t);}
    else dbg = function(){};
    return {
      socks:socks,
      sockData:sockData,
      busy:busy
    };
  },
  "getVersion": function(callback) {
    atcmd("AT+GMR").then(function(v){callback(null,v);}).
    catch(function(err){callback(err);});
  },
  "getIP": function(callback) {
    var ip;
    at.cmd('AT+QISTATE=0,1\r\n', 1000, function cb(d) {
      if (d=="OK") callback(null,ip);
      else if (d.startsWith("+QISTATE")) {
        ip = d.split(",")[2];
      } else callback(null,d);
    });
  }
};

/** Connect to the module:

options = {
lte : bool, Are we using LTE? This changes how we check if we're registered
apn : optional access point name.
username : optional username
password : optional password
} */
exports.connect = function(usart, options, callback) {
  options = options || {};
  usart.removeAllListeners();
  gprsFuncs.at = at = require('AT').connect(usart);
  // at.debug();
  require("NetworkJS").create(netCallbacks);
  // Handle +QIURC: “recv” input data
  at.registerLine('+QIURC: "recv"', function(line) {
    var parms = line.split(",");
    dbg(parms);
    at.getData(0|parms[2], function(data) { sockData[0|parms[1]] += data; });
  });
  // Close handler
  at.registerLine('+QIURC: "closed"', function(line) {
    socks[0|line.substr(17)] = null;
    // setting this to null forces send/recv to return -1, which then
    // causes Espruino to actually call close on the socket
    busy = false;
  });
  // Handle socket open (or handle errors)
  at.registerLine('+QIOPEN: ', function(l) {
    var a = l.substr(9).split(",");
    socks[0|a[0]] = (a[1]==0)?true:undefined;
    busy = false;
  });

  // Dump any CME errors
  at.registerLine("+CME ERROR", function(e) {
    console.log(e);
  });

  atcmd("ATE0").then(function() { // echo off
    return atcmd(options.lte?"AT+CEREG?":"AT+CREG?"); // Check if LTE or GSM registered
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
    return atcmd(`AT+QICSGP=1,1,${JSON.stringify(options.apn||"")},${JSON.stringify(options.username||"")},${JSON.stringify(options.password||"")}`,60000); // Set up context, IPv4
  }).then(function() {
    return atcmd("AT+QIACT=1",60000); // Activate context - can take 60s!
  }).then(function() {
    if (callback) callback(null);
  }).catch(function(e) {
    if (callback) callback(e);
  });
  return gprsFuncs;
};
