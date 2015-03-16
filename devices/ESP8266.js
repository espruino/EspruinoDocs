/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Library for interfacing to the EspressIF ESP8266. Uses the 'NetworkJS'
 * library to provide a JS endpoint for HTTP.
 * 
 * No server support yet */

var at;
var socks = [];
var sockData = [];

var netCallbacks = {
  create : function(host,port) {
    /* Create a socket and return its index, host is a string, port is an integer.
    If host isn't defined, create a server socket */    
    console.log("Create",host,port);
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
    at.cmd('AT+CIPCLOSE='+sckt,1000, function(d) {
      console.log("?"+JSON.stringify(d));
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
      var r = sockData[sckt];
      sockData[sckt] = "";
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
      console.log("?"+JSON.stringify(d));      
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
  //console.log("IPD",parms,JSON.stringify(line));
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
  "reset" : function(callback) {
    var cb = function(d) {
      console.log(">>>>>"+JSON.stringify(d));
      if (d=="ready") {
        if (callback) callback(d);
      } else return cb;
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
      console.log(">>>"+JSON.stringify(cwm));
      if (cwm!="no change" && cwm!="OK") throw new Error("CWMODE failed: "+d);
      at.cmd("AT+CWJAP="+JSON.stringify(ssid)+","+JSON.stringify(key)+"\r\n", 20000, function(d) {
        //console.log(">>>"+JSON.stringify(d));
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
  
  var cb = function(d) { // turn off echo    
    if (d=="ATE0\r") return cb;
    if (d=="OK") {
      at.cmd("AT+CIPMUX=1\r\n",1000,function(d) { // turn on multiple sockets
        if (d!="OK") throw Error("CIPMUX failed: "+d);
        connectedCallback();
      });
    }
    else throw Error("ATE0 failed: "+d);
  }
  at.cmd("ATE0\r\n",1000,cb);

  return wifiFuncs;
};


/*
Serial1.setup(115200);
var p = connect(Serial1);
//at.cmd("ATE0\r\n");
at.cmd("ATE0\r\n",100, function() {
  at.cmd("AT\r\n",100, function(d) { 
    console.log(">>>"+JSON.stringify(d)); 
  });
});


//getAPs(print);
//getConnectedAP(print);
//getIP(print);


//at.cmd("AT+CIPMUX=1\r\n");
function client() {
  at.cmd('AT+CIPSTART=4,"TCP","192.168.1.50",80\r\n',100, function(d) {
    if (d=="OK") {
      at.registerLine("Linked", function() {
        at.unregisterLine("Linked");
        var text = "GET / HTTP/1.0\r\n\r\n";
        at.cmd('AT+CIPSEND=4,'+text.length+'\r',100, function(d) {
          console.log("?"+d);          
          at.cmd(text, 500, function(d) {
            console.log("?"+d);
          });
        });
      });
      at.registerLine("Unlink", function() {
        at.unregisterLine("Unlink");
        console.log("DISCONNECTED");
      });
    }
  });
};
 */