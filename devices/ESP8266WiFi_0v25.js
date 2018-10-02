/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Library for interfacing to the EspressIF ESP8266. Uses the 'NetworkJS'
library to provide a JS endpoint for HTTP.

For EspressIF ESP8266 firmware 0.25

```
Serial2.setup(115200, { rx: A3, tx : A2 });

console.log("Connecting to ESP8266");
var wifi = require("ESP8266").connect(Serial2, function() {
  console.log("Connecting to WiFi");
  wifi.connect("SSID","key", function() {
    console.log("Connected");
    require("http").get("http://www.espruino.com", function(res) {
      console.log("Response: ",res);
      res.on('data', function(d) {
        console.log("--->"+d);
      });
    });
  });
});
```
*/

var at;
var socks = [];
var sockUDP = [];
var sockData = ["","","","",""];
var MAXSOCKETS = 5;
var ENCR_FLAGS = ["open","wep","wpa_psk","wpa2_psk","wpa_wpa2_psk"];

function udpToIPAndPort(data) {
  return {
    ip : data.charCodeAt(0)+"."+data.charCodeAt(1)+"."+data.charCodeAt(2)+"."+data.charCodeAt(3),
    port : data.charCodeAt(5)<<8 | data.charCodeAt(4),
    len : data.charCodeAt(7)<<8 | data.charCodeAt(6) // length of data
  };
}

/*
`socks` can have the following states:

undefined         : unused
true              : connected and ready
"DataClose"       : closed on esp8266, but with data still in sockData
"Wait"            : waiting for connection (client), or for data to be sent
"WaitClose"       : We asked to close it, but it hasn't been opened yet
"Accept"          : opened by server, waiting for 'accept' to be called
"UDP"             : reserved for UDP, but not yet opened
*/

// -----------------------------------------------------------------------------------
var netCallbacks = {
  create : function(host, port, type) {
    //console.log("CREATE ",arguments);
    if (!at) return -1; // disconnected
    /* Create a socket and return its index, host is a string, port is an integer.
    If host isn't defined, create a server socket */
    if (host===undefined && type!=2) {
      sckt = MAXSOCKETS;
      socks[sckt] = "Wait";
      sockData[sckt] = "";
      at.cmd("AT+CIPSERVER=1,"+port+"\r\n", 10000, function(d) {
        if (d=="OK") {
          socks[sckt] = true;
        } else {
          socks[sckt] = undefined;
          setTimeout(function() {
            throw new Error("CIPSERVER failed ("+(d?d:"Timeout")+")");
          }, 0);
        }
      });
      return MAXSOCKETS;
    } else {
      var sckt = 0;
      while (socks[sckt]!==undefined) sckt++; // find free socket
      if (sckt>=MAXSOCKETS) return -7; // SOCKET_ERR_MAX_SOCK
      sockData[sckt] = "";
      socks[sckt] = "Wait";
      var cmd;
      if (type==2) {
        // If there's a port specified, make a server now - otherwise reserve the socket and do it later
        if (port) cmd = 'AT+CIPSTART='+sckt+',"UDP","255.255.255.255",'+port+','+port+',2\r\n';
        else socks[sckt] = "UDP";
        sockUDP[sckt] = true;
      } else {
        cmd = 'AT+CIPSTART='+sckt+',"TCP",'+JSON.stringify(host)+','+port+'\r\n';
        delete sockUDP[sckt];
      }
      if (cmd) at.cmd(cmd,10000,function cb(d) {
        if (d!="OK") socks[sckt] = -6; // SOCKET_ERR_NOT_FOUND
      });
    }
    return sckt;
  },
  /* Close the socket. returns nothing */
  close : function(sckt) {
    //console.log("CLOSE ",arguments);
    if (socks[sckt]=="Wait")
      socks[sckt]="WaitClose";
    else if (socks[sckt]!==undefined) {
      // socket may already have been closed (eg. received 0,CLOSE)
      if (socks[sckt]<0 || socks[sckt]=="UDP")
        socks[sckt] = undefined;
      else
      // we need to a different command if we're closing a server
        at.cmd(((sckt==MAXSOCKETS) ? 'AT+CIPSERVER=0' : ('AT+CIPCLOSE='+sckt))+'\r\n',1000, function(d) {
          socks[sckt] = undefined;
        });
    }
  },
  /* Accept the connection on the server socket. Returns socket number or -1 if no connection */
  accept : function(sckt) {
    // console.log("Accept",sckt);
    for (var i=0;i<MAXSOCKETS;i++)
      if (socks[i]=="Accept") {
        //console.log("Socket accept "+i,JSON.stringify(sockData),JSON.stringify(socks));
        socks[i] = true;
        return i;
      }
    return -1;
  },
  /* Receive data. Returns a string (even if empty).
  If non-string returned, socket is then closed */
  recv : function(sckt, maxLen, type) {
    if (sockData[sckt]) {
      var r;
      if (sockData[sckt].length > maxLen) {
        r = sockData[sckt].substr(0,maxLen);
        sockData[sckt] = sockData[sckt].substr(maxLen);
      } else {
        r = sockData[sckt];
        sockData[sckt] = "";
        if (socks[sckt]=="DataClose")
          socks[sckt] = undefined;
      }
      return r;
    }
    if (socks[sckt]<0) return socks[sckt]; // report an error
    if (!socks[sckt]) return -1; // close it
    return "";
  },
  /* Send data. Returns the number of bytes sent - 0 is ok.
  Less than 0  */
  send : function(sckt, data, type) {
    if (!at) return -1; // disconnected
    if (at.isBusy() || socks[sckt]=="Wait") return 0;
    if (socks[sckt]<0) return socks[sckt]; // report an error
    if (!socks[sckt]) return -1; // close it
    //console.log("SEND ",arguments);
    if (socks[sckt]=="UDP") {
      var d = udpToIPAndPort(data);
      socks[sckt]="Wait";
      at.cmd('AT+CIPSTART='+sckt+',"UDP","'+d.ip+'",'+d.port+','+d.port+',2\r\n',10000,function(d) {
        if (d!="OK") socks[sckt] = -6; // SOCKET_ERR_NOT_FOUND
      });
      return 0;
    }
    //console.log("Send",sckt,data);
    var returnVal = data.length;
    var extra = "";
    if (type==2) { // UDP
      var d = udpToIPAndPort(data);
      extra = ',"'+d.ip+'",'+d.port;
      data = data.substr(8,d.len);
      returnVal = 8+d.len;
    }

    var cmd = 'AT+CIPSEND='+sckt+','+data.length+extra+'\r\n';
    at.cmd(cmd, 10000, function cb(d) {
      //console.log("SEND "+JSON.stringify(d));
      if (d=="OK") {
        at.register('> ', function(l) {
          at.unregister('> ');
          at.write(data);
          return l.substr(2);
        });
      } else if (d=="Recv "+data.length+" bytes" || d=="busy s...") {
        // all good, we expect this
        // Not sure why we get "busy s..." in this case (2 sends one after the other) but it all seems ok.
      } else if (d=="SEND OK") {
        // we're ready for more data now
        if (socks[sckt]=="WaitClose") netCallbacks.close(sckt);
        socks[sckt]=true;
        return;
      } else {
        socks[sckt]=undefined; // uh-oh. Error. If undefined it was probably a timeout
        at.unregister('> ');
        return;
      }
      return cb
    });
    // if we obey the above, we shouldn't get the 'busy p...' prompt
    socks[sckt]="Wait"; // wait for data to be sent
    return returnVal;
  }
};


//Handle +IPD input data from ESP8266
function ipdHandler(line) {
  var colon = line.indexOf(":");
  if (colon<0) return line; // not enough data here at the moment
  var parms = line.substring(5,colon).split(",");
  parms[1] = 0|parms[1];
  var len = line.length-(colon+1);
  var sckt = parms[0];
  if (sockUDP[sckt]) {
    var ip = (parms[2]||"0.0.0.0").split(".").map(function(x){return 0|x;});
    var p = 0|parms[3]; // port
    sockData[sckt] += String.fromCharCode(ip[0],ip[1],ip[2],ip[3],p&255,p>>8,len&255,len>>8);
  }
  if (len>=parms[1]) {
   // we have everything
   sockData[sckt] += line.substr(colon+1,parms[1]);
   return line.substr(colon+parms[1]+1); // return anything else
  } else {
   // still some to get - use getData to request a callback
   sockData[sckt] += line.substr(colon+1,len);
   at.getData(parms[1]-len, function(data) { sockData[sckt] += data; });
   return "";
  }
}
// -----------------------------------------------------------------------------------

var wifiFuncs = {
    ipdHandler:ipdHandler,
  "debug" : function() {
    return {
      socks:socks,
      sockData:sockData
    };
  },
  // initialise the ESP8266
  "init" : function(callback) {
    at.cmd("ATE0\r\n",1000,function cb(d) { // turn off echo
      if (d && d.trim()=="ATE0") return cb;
      if (d=="OK") {
        at.cmd("AT+CIPMUX=1\r\n",1000,function(d) { // turn on multiple sockets
          if (d!="OK") callback("CIPMUX failed: "+(d?d:"Timeout"));
          else at.cmd("AT+CIPDINFO=1\r\n",1000, function() { // Turn on UDP transmitter info
            callback(null); // we don't care if this succeeds or not
          });
        });
      }
      else callback("ATE0 failed: "+(d?d:"Timeout"));
    });
  },
  "reset" : function(callback) {
    at.cmd("\r\nAT+RST\r\n", 10000, function cb(d) {
      //console.log(">>>>>"+JSON.stringify(d));
      // 'ready' for 0.25, 'Ready.' for 0.50
      if (d=="ready" || d=="Ready.") setTimeout(function() { wifiFuncs.init(callback); }, 1000);
      else if (d===undefined) callback("No 'ready' after AT+RST");
      else return cb;
    });
  },
  "getVersion" : function(callback) {
    at.cmd("AT+GMR\r\n", 1000, function(d) {
      // works ok, but we could get more data
      callback(null,d);
    });
  },
  "connect" : function(ssid, key, callback) {
    at.cmd("AT+CWMODE=1\r\n", 1000, function(cwm) {
      if (cwm!="no change" && cwm!="OK") callback("CWMODE failed: "+(cwm?cwm:"Timeout"));
      else at.cmd("AT+CWJAP="+JSON.stringify(ssid)+","+JSON.stringify(key)+"\r\n", 20000, function cb(d) {
        if (["WIFI DISCONNECT","WIFI CONNECTED","WIFI GOT IP","+CWJAP:1"].indexOf(d)>=0) return cb;
        if (d!="OK") setTimeout(callback,0,"WiFi connect failed: "+(d?d:"Timeout"));
        else setTimeout(callback,0,null);
      });
    });
  },
  "getAPs" : function (callback) {
    var aps = [];
    at.cmdReg("AT+CWLAP\r\n", 5000, "+CWLAP:",
              function(d) {
                var ap = d.slice(8,-1).split(",");
                aps.push({ ssid : JSON.parse(ap[1]),
                           enc: ENCR_FLAGS[ap[0]],
                           signal: parseInt(ap[2]),
                           mac : JSON.parse(ap[3]) });
              },
              function(d) { callback(null, aps); });
  },
  "getConnectedAP" : function(callback) {
    var con;
    at.cmdReg("AT+CWJAP?\r\n", 1000, "+CWJAP:",
              function(d) { con=JSON.parse(d.slice(7)); },
              function(d) { callback(null, con); });
  },
  "createAP" : function(ssid, key, channel, enc, callback) {
    at.cmd("AT+CWMODE=2\r\n", 1000, function(cwm) {
      if (cwm!="no change" && cwm!="OK" && cwm!="WIFI DISCONNECT") callback("CWMODE failed: "+(cwm?cwm:"Timeout"));
      var encn = enc ? ENCR_FLAGS.indexOf(enc) : 0;
      if (encn<0) callback("Encryption type "+enc+" not known - "+ENCR_FLAGS);
      else at.cmd("AT+CWSAP="+JSON.stringify(ssid)+","+JSON.stringify(key)+","+channel+","+encn+"\r\n", 5000, function(cwm) {
        if (cwm!="OK") callback("CWSAP failed: "+(cwm?cwm:"Timeout"));
        else callback(null);
      });
    });
  },
  "getConnectedDevices" : function(callback) {
    var devs = [];
    this.at.cmd("AT+CWLIF\r\n",1000,function r(d) {
      if (d=="OK") callback(null, devs);
      else if (d===undefined || d=="ERROR") callback("Error");
      else {
        e = d.split(",");
        devs.push({ip:e[0], mac:e[1]});
        return r;
      }
    });
  },
  "getIP" : function(callback) {
    var ip;
    at.cmdReg("AT+CIFSR\r\n", 1000, "+CIFSR", function(d) {
      if (!ip && d.indexOf(',')>=0) ip=JSON.parse(d.slice(d.indexOf(',')+1));
    }, function(d) {
      if (d!="OK") callback("CIFSR failed: "+d);
      else callback(null, ip);
    });
  },
  /* Set the host name - so it can be accessed via DNS. */
  "setHostname" : function(hostname, callback) {
    turnOn(MODE.CLIENT, function(err) {
      if (err) return callback(err);
      at.cmd("AT+CWHOSTNAME="+JSON.stringify(hostname)+"\r\n",500,callback);
    });
  },
  /* Ping the given address. Callback is called with the ping time
  in milliseconds, or undefined if there is an error */
  "ping" : function(addr, callback) {
    var time;
    at.cmd('AT+PING="'+addr+'"\r\n',1000,function cb(d) {
      if (d && d[0]=="+") {
        time=d.substr(1);
        return cb;
      } else if (d=="OK") callback(time); else callback();
    });
  }
};

function sckOpen(ln) {
  //console.log("CONNECT", JSON.stringify(ln));
  socks[ln[0]] = socks[ln[0]]=="Wait" ? true : "Accept";
}
function sckClosed(ln) {
  //console.log("CLOSED", JSON.stringify(ln));
  socks[ln[0]] = sockData[ln[0]]!="" ? "DataClose" : undefined;
}

exports.connect = function(usart, connectedCallback) {
  wifiFuncs.at = at = require("AT").connect(usart);
  require("NetworkJS").create(netCallbacks);

  at.register("+IPD", ipdHandler);
  at.registerLine("0,CONNECT", sckOpen);
  at.registerLine("1,CONNECT", sckOpen);
  at.registerLine("2,CONNECT", sckOpen);
  at.registerLine("3,CONNECT", sckOpen);
  at.registerLine("4,CONNECT", sckOpen);
  at.registerLine("0,CLOSED", sckClosed);
  at.registerLine("1,CLOSED", sckClosed);
  at.registerLine("2,CLOSED", sckClosed);
  at.registerLine("3,CLOSED", sckClosed);
  at.registerLine("4,CLOSED", sckClosed);
  at.registerLine("WIFI CONNECTED", function() { exports.emit("associated"); });
  at.registerLine("WIFI GOT IP", function() { exports.emit("connected"); });
  at.registerLine("WIFI DISCONNECTED", function() { exports.emit("disconnected"); });

  wifiFuncs.reset(connectedCallback);

  return wifiFuncs;
};
