/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 
Library for interfacing to the EspressIF ESP8266. Uses the 'NetworkJS'
library to provide a JS endpoint for HTTP.
 
No server support yet 
 
```
Serial2.setup(9600, { rx: A3, tx : A2 });

console.log("Connecting to ESP8266");
var wifi = require("ESP8266").connect(Serial2, function() {
  wifi.reset(function() {
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
});
```
*/

var at;
var socks = [];
var sockData = [];

var netCallbacks = {
  create : function(host,port) {
    /* Create a socket and return its index, host is a string, port is an integer.
    If host isn't defined, create a server socket */    
    var sckt = 0;
    while (socks[sckt]!==undefined) sckt++; // find free socket
    socks[sckt] = "Wait";
    sockData[sckt] = "";
    at.cmd('AT+CIPSTART='+sckt+',"TCP",'+JSON.stringify(host)+','+port+'\r\n',10000, function(d) {      
      if (d=="OK") {
        at.registerLine("Linked", function() {
          at.unregisterLine("Linked");        
          socks[sckt] = true;
        });
        at.registerLine("Unlink", function() {
          at.unregisterLine("Unlink");
          socks[sckt] = undefined;
        });        
      } else {
        socks[sckt] = undefined;
        throw new Error("CIPSTART failed");
      }
    });
    return sckt;
  },
  /* Close the socket. returns nothing */
  close : function(sckt) {    
    at.cmd('AT+CIPCLOSE='+sckt+"\r\n",1000, function(d) {
      //console.log("?"+JSON.stringify(d));
    });
  },
  /* Accept the connection on the server socket. Returns socket number or -1 if no connection */
  accept : function(sckt) {
    
    console.log("Accept",sckt);
    return -1;
  },
  /* Receive data. Returns a string (even if empty).
  If non-string returned, socket is then closed */
  recv : function(sckt, maxLen) {    
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
  send : function(sckt, data) {
    if (at.isBusy() || socks[sckt]=="Wait") return 0;
    if (!socks[sckt]) return -1; // error - close it
    //console.log("Send",sckt,data);
    var f = function(d) {
      // TODO: register for '>'
      //console.log("?"+JSON.stringify(d));      
      if (d=="> ") return f;
    };
    at.cmd('AT+CIPSEND='+sckt+','+data.length+'\r\n'+data, 10000, f);
    return data.length;
  }
};


//Handle +IPD input data from ESP8266
function ipdHandler(line) {
  var colon = line.indexOf(":");
  if (colon<0) return line; // not enough data here at the moment
  var parms = line.substring(5,colon).split(",");
  parms[1] = 0|parms[1];
  var len = line.length-(colon+1);
  if (len>=parms[1]) {
   // we have everything
   sockData[parms[0]] += line.substr(colon+1,parms[1]);
   return line.substr(colon+parms[1]+1); // return anything else
  } else { 
   // still some to get
   sockData[parms[0]] += line.substr(colon+1,len);
   return "+IPD,"+parms[0]+","+(parms[1]-len)+":"; // return IPD so we get called next time    
  }
}

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
    var cb = function(d) { // turn off echo    
      if (d=="ATE0") return cb;
      if (d=="OK") {
        at.cmd("AT+CIPMUX=1\r\n",1000,function(d) { // turn on multiple sockets
          if (d!="OK") throw Error("CIPMUX failed: "+d);
          if (callback) callback();
        });
      }
      else throw Error("ATE0 failed: "+d);
    }
    at.cmd("ATE0\r\n",1000,cb);
  },  
  "reset" : function(callback) {
    var cb = function(d) {
      //console.log(">>>>>"+JSON.stringify(d));
      if (d=="ready") wifiFuncs.init(callback);
      else if (d===undefined) throw new Error("No 'ready' after AT+RST");
      else return cb;
    }
    at.cmd("AT+RST\r\n", 10000, cb);
  },
  "getVersion" : function(callback) {
    at.cmd("AT+GMR\r\n", 1000, function(d) {
      callback(d);
    });
  },
  "connect" : function(ssid, key, callback) {
    at.cmd("AT+CWMODE=1\r\n", 1000, function(cwm) {
      if (cwm!="no change" && cwm!="OK") throw new Error("CWMODE failed: "+cwm);
      at.cmd("AT+CWJAP="+JSON.stringify(ssid)+","+JSON.stringify(key)+"\r\n", 20000, function(d) {
        if (d!="OK") throw new Error("WiFi connect failed: "+d);
        callback();        
      });
    });
  },
  "getAPs" : function (callback) {
    var aps = [];
    at.cmdReg("AT+CWLAP\r\n", 5000, "+CWLAP:",
              function(d) { aps.push(d.slice(8,-1).split(",")); },
              function(d) { callback(aps); });
  },
  "getConnectedAP" : function(callback) {
    var con;
    at.cmdReg("AT+CWJAP?\r\n", 1000, "+CWJAP:",
              function(d) { con=d.slice(7); },
              function(d) { callback(con); });
  },
  "getIP" : function(callback) {
     at.cmd("AT+CIFSR\r\n", 1000, function(d) {
       var ip = d;
       return function(d) {
         if (d!="OK") throw new Error("CIFSR failed: "+d); 
         return callback(ip);
       }
     });
   }
};


exports.connect = function(usart, connectedCallback) {
  wifiFuncs.at = at = require("AT").connect(usart);  
  require("NetworkJS").create(netCallbacks);
  
  at.register("+IPD", ipdHandler);
  
  wifiFuncs.reset(connectedCallback);

  return wifiFuncs;
};
